export {
  Renderer,
  createRenderer,
  defineRegistry,
  type ComponentRegistry,
  type ComponentRenderProps,
  type ComponentRenderer,
  type RendererOptions,
  type CreateRendererOptions,
  type DefineRegistryResult,
} from "./renderer";

export {
  type EventHandle,
  type BaseComponentProps,
  type ComponentFn,
  type Components,
  type ActionFn,
  type Actions,
  type SetState,
  type StateModel,
  type CatalogHasActions,
} from "./catalog-types";

export { webjsxComponents } from "./components";

export type { StateStore, Spec } from "@json-render/core";
export { createStateStore } from "@json-render/core";

import { webjsxComponents } from "./components";
import type { ComponentRegistry, ComponentRenderProps } from "./renderer";

export function createWebjsxRegistry(
  components: Partial<typeof webjsxComponents> = webjsxComponents,
): ComponentRegistry {
  const registry: ComponentRegistry = {};
  for (const [name, fn] of Object.entries(components)) {
    registry[name] = ({ element, children, emit, on, bindings, loading }: ComponentRenderProps) =>
      (fn as any)({ props: element.props, children, emit, on, bindings, loading });
  }
  return registry;
}
