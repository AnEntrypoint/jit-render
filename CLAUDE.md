# json-render / jit-render monorepo

## Repository

GitHub: https://github.com/AnEntrypoint/jit-render
npm: `jit-render` (new), `@json-render/*` (existing packages)

## Package overview

| Package | npm name | Description |
|---|---|---|
| packages/core | @json-render/core | Zero-UI framework core: Spec types, prop resolution, state store, streaming |
| packages/react | @json-render/react | React renderer |
| packages/shadcn | @json-render/shadcn | shadcn/ui + Radix + Tailwind component catalog for React |
| packages/webjsx | jit-render | WebJSX renderer — no React, no Tailwind, Web Standards only |

## jit-render architecture

- Uses `webjsx@^0.0.73`: two-function library (`createElement` + `applyDiff`)
- JSX configured via `jsxImportSource: "webjsx"` in tsconfig and tsup esbuildOptions
- `Renderer` class: instantiate with `{ spec, registry, state?, handlers?, functions? }`, call `mount(container)` to render
- `createWebjsxRegistry()`: wraps `webjsxComponents` (BaseComponentProps functions) into a ComponentRegistry (ComponentRenderProps functions). Always use this to build the registry — do not pass `webjsxComponents` directly as registry.
- `webjsxComponents`: 36 components using plain JSX + inline styles. No Tailwind, no Radix.
- `webjsxComponentDefinitions`: Zod schemas for all 36 components — same API as `@json-render/shadcn`'s `shadcnComponentDefinitions`
- State management: `StateStore` from `@json-render/core` — use `.get(path)`, `.set(path, value)`, `.getSnapshot()`, `.subscribe(listener)`

## Dual publish strategy

- `@json-render/*` packages: versioned via changesets (`changeset version` + `changeset publish`)
- `jit-render` package: auto-published via `.github/workflows/jit-publish.yml` on every push to main with auto patch bump
- The two publish strategies are independent and do not conflict

## Build system

- Monorepo: pnpm workspaces + Turborepo
- Each package uses `tsup` for building (CJS + ESM + DTS)
- `jit-render` tsup config sets `esbuildOptions` with `jsx: "automatic"` and `jsxImportSource: "webjsx"`
- esbuild version must be `^0.27.0` (required by tsup@8.5.x)

## Key constraints

- `@json-render/core` StateStore API: uses `.get()`, `.set()`, `.update()`, `.getSnapshot()`, `.subscribe()` — no `.setState()` method
- webjsx JSX files must use `.tsx` extension for esbuild to apply JSX transform
- Import paths in TypeScript source must omit file extensions (no `.tsx` in import statements)
- `children` prop in webjsx components is typed `unknown` — cast to `any` when used as JSX children: `{children as any}`
- HTML numeric attributes (min, max, step, value on input[type=range]) must be `String(...)` for webjsx's JSX types
