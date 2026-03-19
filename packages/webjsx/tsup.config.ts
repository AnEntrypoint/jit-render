import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/catalog.ts", "src/components.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["@json-render/core", "webjsx", "zod"],
  esbuildOptions(options) {
    options.jsxImportSource = "webjsx";
    options.jsx = "automatic";
  },
});
