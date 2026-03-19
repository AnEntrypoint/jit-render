import {
  resolveElementProps,
  resolveBindings,
  resolveActionParam,
  evaluateVisibility,
  getByPath,
  createStateStore,
  type PropResolutionContext,
  type UIElement,
  type Spec,
  type Catalog,
  type SchemaDefinition,
  type ActionBinding,
  type ComputedFunction,
  type StateStore,
  type StateModel,
} from "@json-render/core";
import { applyDiff, createElement, Fragment } from "webjsx";
import type {
  EventHandle,
  SetState,
  CatalogHasActions,
  Components,
  Actions,
} from "./catalog-types";

export type ComponentRenderer<P = Record<string, unknown>> = (
  props: ComponentRenderProps<P>,
) => unknown;

export type ComponentRegistry = Record<string, ComponentRenderer<any>>;

export interface ComponentRenderProps<P = Record<string, unknown>> {
  element: UIElement<string, P>;
  children?: unknown;
  emit: (event: string) => void;
  on: (event: string) => EventHandle;
  bindings?: Record<string, string>;
  loading?: boolean;
}

export interface RendererOptions {
  spec: Spec | null;
  registry: ComponentRegistry;
  loading?: boolean;
  fallback?: ComponentRenderer;
  state?: Record<string, unknown>;
  store?: StateStore;
  handlers?: Record<string, (params: Record<string, unknown>) => unknown>;
  functions?: Record<string, ComputedFunction>;
  onStateChange?: (changes: Array<{ path: string; value: unknown }>) => void;
}

interface RepeatScope {
  item: unknown;
  index: number;
  basePath: string;
}

export class Renderer {
  private container: HTMLElement | null = null;
  private opts: RendererOptions;
  private store: StateStore;

  constructor(opts: RendererOptions) {
    this.opts = opts;
    this.store = opts.store ?? createStateStore(opts.state ?? (opts.spec?.state as StateModel) ?? {});
  }

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  update(opts: Partial<RendererOptions>): void {
    this.opts = { ...this.opts, ...opts };
    if (opts.store) this.store = opts.store;
    this.render();
  }

  private getState(): StateModel {
    return this.store.getSnapshot();
  }

  private setByStatePath(statePath: string, value: unknown): void {
    this.store.set(statePath, value);
    this.opts.onStateChange?.([{ path: statePath, value }]);
    this.render();
  }

  private makeEmit(element: UIElement, ctx: PropResolutionContext): (event: string) => void {
    return (eventName: string): void => {
      const binding = element.on?.[eventName];
      if (!binding) return;
      const bindings = Array.isArray(binding) ? binding : [binding];
      void (async () => {
        for (const b of bindings) await this.executeBinding(b, ctx);
      })();
    };
  }

  private makeOn(element: UIElement, emit: (event: string) => void): (event: string) => EventHandle {
    return (eventName: string): EventHandle => {
      const binding = element.on?.[eventName];
      if (!binding) return { emit: () => {}, shouldPreventDefault: false, bound: false };
      const bindings = Array.isArray(binding) ? binding : [binding];
      const shouldPreventDefault = bindings.some((b) => b.preventDefault);
      return { emit: () => emit(eventName), shouldPreventDefault, bound: true };
    };
  }

  private async executeBinding(b: ActionBinding, ctx: PropResolutionContext): Promise<void> {
    const liveCtx: PropResolutionContext = { ...ctx, stateModel: this.getState() };

    if (b.action === "setState") {
      const raw = this.resolveParams(b.params, liveCtx);
      const statePath = raw["statePath"] as string;
      if (statePath) this.setByStatePath(statePath, raw["value"]);
      return;
    }

    if (b.action === "pushState") {
      const raw = this.resolveParams(b.params, liveCtx);
      const statePath = raw["statePath"] as string;
      if (statePath) {
        const arr = (getByPath(this.getState(), statePath) as unknown[]) ?? [];
        this.setByStatePath(statePath, [...arr, raw["value"]]);
      }
      return;
    }

    if (b.action === "removeState") {
      const raw = this.resolveParams(b.params, liveCtx);
      const statePath = raw["statePath"] as string;
      const index = raw["index"] as number;
      if (statePath != null) {
        const arr = [...((getByPath(this.getState(), statePath) as unknown[]) ?? [])];
        arr.splice(index, 1);
        this.setByStatePath(statePath, arr);
      }
      return;
    }

    const resolved = this.resolveParams(b.params, liveCtx);
    const handler = this.opts.handlers?.[b.action];
    if (handler) {
      await handler(resolved);
      this.render();
    } else {
      console.warn(`[jit-render] No handler for action: ${b.action}`);
    }
  }

  private resolveParams(
    params: Record<string, unknown> | undefined,
    ctx: PropResolutionContext,
  ): Record<string, unknown> {
    if (!params) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
      out[k] = resolveActionParam(v, ctx);
    }
    return out;
  }

  private renderElement(
    element: UIElement,
    spec: Spec,
    scope?: RepeatScope,
    loading?: boolean,
  ): unknown {
    const state = this.getState();
    const baseCtx: PropResolutionContext = {
      stateModel: state,
      functions: this.opts.functions ?? {},
      ...(scope
        ? { repeatItem: scope.item, repeatIndex: scope.index, repeatBasePath: scope.basePath }
        : {}),
    };

    const isVisible =
      element.visible === undefined ? true : evaluateVisibility(element.visible, baseCtx);
    if (!isVisible) return null;

    const rawProps = element.props as Record<string, unknown>;
    const elementBindings = resolveBindings(rawProps, baseCtx);
    const resolvedProps = resolveElementProps(rawProps, baseCtx);
    const resolvedElement =
      resolvedProps !== element.props ? { ...element, props: resolvedProps } : element;

    const Component = this.opts.registry[resolvedElement.type] ?? this.opts.fallback;
    if (!Component) {
      console.warn(`[jit-render] No renderer for: ${resolvedElement.type}`);
      return null;
    }

    const emit = this.makeEmit(resolvedElement, baseCtx);
    const on = this.makeOn(resolvedElement, emit);

    let children: unknown;
    if (resolvedElement.repeat) {
      const items = (getByPath(state, resolvedElement.repeat.statePath) as unknown[]) ?? [];
      children = items.flatMap((item, index) => {
        const childScope: RepeatScope = {
          item,
          index,
          basePath: `${resolvedElement.repeat!.statePath}/${index}`,
        };
        return (resolvedElement.children ?? []).map((childKey) => {
          const childEl = spec.elements[childKey];
          if (!childEl) return null;
          return this.renderElement(childEl, spec, childScope, loading);
        });
      });
    } else {
      children = (resolvedElement.children ?? [])
        .map((childKey) => {
          const childEl = spec.elements[childKey];
          if (!childEl) {
            if (!loading) console.warn(`[jit-render] Missing element: "${childKey}"`);
            return null;
          }
          return this.renderElement(childEl, spec, scope, loading);
        })
        .filter(Boolean);
    }

    try {
      return Component({
        element: resolvedElement as UIElement<string, Record<string, unknown>>,
        children,
        emit,
        on,
        bindings: elementBindings,
        loading,
      });
    } catch (err) {
      console.error(`[jit-render] Render error in <${resolvedElement.type}>:`, err);
      return null;
    }
  }

  render(): void {
    if (!this.container) return;
    const { spec, loading } = this.opts;
    if (!spec?.root) {
      applyDiff(this.container, createElement(Fragment, null));
      return;
    }
    const rootEl = spec.elements[spec.root];
    if (!rootEl) {
      applyDiff(this.container, createElement(Fragment, null));
      return;
    }
    const vdom = this.renderElement(rootEl, spec, undefined, loading);
    applyDiff(this.container, createElement(Fragment, null, vdom as any));
  }
}

export interface DefineRegistryResult {
  registry: ComponentRegistry;
  handlers: (
    getSetState: () => SetState | undefined,
    getState: () => Record<string, unknown>,
  ) => Record<string, (params: Record<string, unknown>) => Promise<void>>;
  executeAction: (
    actionName: string,
    params: Record<string, unknown> | undefined,
    setState: SetState,
    state?: Record<string, unknown>,
  ) => Promise<void>;
}

type DefineRegistryComponentFn = (ctx: {
  props: unknown;
  children?: unknown;
  emit: (event: string) => void;
  on: (event: string) => EventHandle;
  bindings?: Record<string, string>;
  loading?: boolean;
}) => unknown;

type DefineRegistryActionFn = (
  params: Record<string, unknown> | undefined,
  setState: SetState,
  state: Record<string, unknown>,
) => Promise<void>;

type DefineRegistryOptions<C extends Catalog> = {
  components?: Components<C>;
} & (CatalogHasActions<C> extends true
  ? { actions: Actions<C> }
  : { actions?: Actions<C> });

export function defineRegistry<C extends Catalog>(
  _catalog: C,
  options: DefineRegistryOptions<C>,
): DefineRegistryResult {
  const registry: ComponentRegistry = {};
  if (options.components) {
    for (const [name, componentFn] of Object.entries(options.components)) {
      registry[name] = ({ element, children, emit, on, bindings, loading }: ComponentRenderProps) => {
        return (componentFn as DefineRegistryComponentFn)({
          props: element.props,
          children,
          emit,
          on,
          bindings,
          loading,
        });
      };
    }
  }

  const actionMap = options.actions
    ? (Object.entries(options.actions) as Array<[string, DefineRegistryActionFn]>)
    : [];

  const handlers = (
    getSetState: () => SetState | undefined,
    getState: () => Record<string, unknown>,
  ): Record<string, (params: Record<string, unknown>) => Promise<void>> => {
    const result: Record<string, (params: Record<string, unknown>) => Promise<void>> = {};
    for (const [name, actionFn] of actionMap) {
      result[name] = async (params) => {
        const setState = getSetState();
        const state = getState();
        if (setState) await actionFn(params, setState, state);
      };
    }
    return result;
  };

  const executeAction = async (
    actionName: string,
    params: Record<string, unknown> | undefined,
    setState: SetState,
    state: Record<string, unknown> = {},
  ): Promise<void> => {
    const entry = actionMap.find(([name]) => name === actionName);
    if (entry) await entry[1](params, setState, state);
    else console.warn(`Unknown action: ${actionName}`);
  };

  return { registry, handlers, executeAction };
}

export function createRenderer<
  TDef extends SchemaDefinition,
  TCatalog extends { components: Record<string, { props: unknown }> },
>(
  _catalog: Catalog<TDef, TCatalog>,
  components: Record<string, ComponentRenderer<any>>,
): (opts: Omit<RendererOptions, "registry">) => Renderer {
  return (opts) => new Renderer({ ...opts, registry: components });
}

export interface CreateRendererOptions extends Omit<RendererOptions, "registry"> {}
