# jit-render

A zero-dependency web renderer for [json-render](https://github.com/AnEntrypoint/jit-render) using [webjsx](https://webjsx.org). No React, no Tailwind, no Radix — just Web Standards.

```bash
npm install jit-render
```

## Quick Start

```typescript
import { Renderer, defineRegistry, webjsxComponents } from "jit-render";
import { webjsxComponentDefinitions } from "jit-render/catalog";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/core/schema";
import { z } from "zod";

const catalog = defineCatalog(schema, {
  components: {
    Card: webjsxComponentDefinitions.Card,
    Heading: webjsxComponentDefinitions.Heading,
    Button: webjsxComponentDefinitions.Button,
  },
  actions: {},
});

const { registry } = defineRegistry(catalog, {
  components: {
    Card: webjsxComponents.Card,
    Heading: webjsxComponents.Heading,
    Button: webjsxComponents.Button,
  },
});

const spec = {
  root: "card-1",
  elements: {
    "card-1": {
      type: "Card",
      props: { title: "Hello", description: null, maxWidth: null, centered: null },
      children: ["heading-1", "btn-1"],
    },
    "heading-1": {
      type: "Heading",
      props: { text: "Welcome", level: "h2" },
      children: [],
    },
    "btn-1": {
      type: "Button",
      props: { label: "Click me", variant: "primary", disabled: null },
      children: [],
      on: { press: { action: "setState", params: { statePath: "/clicked", value: true } } },
    },
  },
};

const renderer = new Renderer({ spec, registry });
renderer.mount(document.getElementById("app")!);
```

## Pre-built Components

Import all 36 components from the built-in catalog:

```typescript
import { createWebjsxRegistry } from "jit-render";
import { webjsxComponentDefinitions } from "jit-render/catalog";
import { defineCatalog } from "@json-render/core";

const catalog = defineCatalog(schema, {
  components: {
    Card: webjsxComponentDefinitions.Card,
    Stack: webjsxComponentDefinitions.Stack,
    Button: webjsxComponentDefinitions.Button,
    Table: webjsxComponentDefinitions.Table,
  },
  actions: {},
});

const registry = createWebjsxRegistry();

const renderer = new Renderer({ spec, registry });
renderer.mount(container);
```

## Components

| Category | Components |
|---|---|
| Layout | `Card`, `Stack`, `Grid`, `Separator`, `Tabs`, `Accordion`, `Collapsible`, `Dialog`, `Drawer`, `Carousel` |
| Display | `Heading`, `Text`, `Image`, `Avatar`, `Badge`, `Alert`, `Progress`, `Skeleton`, `Spinner`, `Tooltip`, `Popover`, `Table` |
| Input | `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider` |
| Actions | `Button`, `Link`, `DropdownMenu`, `Toggle`, `ToggleGroup`, `ButtonGroup`, `Pagination` |

## API

### `new Renderer(opts)`

| Option | Type | Description |
|---|---|---|
| `spec` | `Spec \| null` | The UI spec to render |
| `registry` | `ComponentRegistry` | Component implementations |
| `state` | `Record<string, unknown>` | Initial state |
| `store` | `StateStore` | External state store |
| `handlers` | `Record<string, Function>` | Custom action handlers |
| `functions` | `Record<string, Function>` | Computed value functions |
| `loading` | `boolean` | Loading state passed to components |
| `onStateChange` | `Function` | Called when state changes |

### `renderer.mount(container: HTMLElement)`

Renders into the given DOM element and subscribes to state changes for re-renders.

### `renderer.update(opts: Partial<RendererOptions>)`

Update options and re-render (e.g. when a new spec arrives from a stream).

### `defineRegistry(catalog, { components, actions? })`

Type-safe wrapper that returns `{ registry, handlers, executeAction }`.

### `createWebjsxRegistry(components?)`

Wraps `webjsxComponents` (or a subset) into a `ComponentRegistry`.

## State & Actions

```typescript
const renderer = new Renderer({
  spec,
  registry,
  state: { count: 0 },
  handlers: {
    increment: async ({ by }, setState) => {
      setState("/count", (prev) => (prev as number) + (by as number ?? 1));
    },
  },
});
```

Built-in actions available in specs without any handlers:

- `setState` — set a value at a state path
- `pushState` — append to an array at a state path
- `removeState` — remove an item by index from an array at a state path

## Streaming

Update the renderer as spec chunks arrive:

```typescript
import { createSpecStreamCompiler } from "@json-render/core";

const compiler = createSpecStreamCompiler();
const renderer = new Renderer({ spec: null, registry, loading: true });
renderer.mount(container);

for await (const chunk of stream) {
  const { result } = compiler.push(chunk);
  renderer.update({ spec: result, loading: false });
}
```

## License

Apache-2.0
