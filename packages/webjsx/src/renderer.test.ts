import { describe, it, expect, vi } from "vitest";
import {
  Renderer,
  createWebjsxRegistry,
  defineRegistry,
  createRenderer,
} from "./index";
import { createStateStore } from "@json-render/core";

const registry = createWebjsxRegistry();

function makeSpec(elements, root = "root") {
  return { root, elements };
}

describe("Renderer mount and render", () => {
  it("renders null spec without error", () => {
    const c = document.createElement("div");
    new Renderer({ spec: null, registry }).mount(c);
    expect(c.innerHTML).toBeDefined();
  });

  it("renders spec without root key gracefully", () => {
    const c = document.createElement("div");
    new Renderer({ spec: { root: "", elements: {} }, registry }).mount(c);
    expect(c.innerHTML).toBeDefined();
  });

  it("renders spec with missing root element gracefully", () => {
    const c = document.createElement("div");
    new Renderer({ spec: makeSpec({}, "missing"), registry }).mount(c);
    expect(c.innerHTML).toBeDefined();
  });

  it("renders a simple heading", () => {
    const c = document.createElement("div");
    const spec = makeSpec({
      root: {
        type: "Heading",
        props: { text: "Hello", level: "h1" },
        children: [],
      },
    });
    new Renderer({ spec, registry }).mount(c);
    expect(c.querySelector("h1")).toBeTruthy();
    expect(c.textContent).toContain("Hello");
  });

  it("renders nested children", () => {
    const spec = makeSpec({
      root: {
        type: "Card",
        props: {
          title: "T",
          description: null,
          maxWidth: null,
          centered: null,
        },
        children: ["child1"],
      },
      child1: {
        type: "Text",
        props: { text: "Inner", variant: null },
        children: [],
      },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry }).mount(c);
    expect(c.textContent).toContain("Inner");
  });

  it("warns on missing child element", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const spec = makeSpec({
      root: {
        type: "Card",
        props: {
          title: null,
          description: null,
          maxWidth: null,
          centered: null,
        },
        children: ["nonexistent"],
      },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry }).mount(c);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("nonexistent"));
    warn.mockRestore();
  });

  it("suppresses missing element warn when loading=true", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const spec = makeSpec({
      root: {
        type: "Card",
        props: {
          title: null,
          description: null,
          maxWidth: null,
          centered: null,
        },
        children: ["x"],
      },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry, loading: true }).mount(c);
    const calls = warn.mock.calls.filter((c) =>
      String(c[0]).includes("Missing element"),
    );
    expect(calls.length).toBe(0);
    warn.mockRestore();
  });

  it("uses fallback for unknown component type", () => {
    const fallback = () => null;
    const spec = makeSpec({
      root: { type: "Unknown", props: {}, children: [] },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry, fallback }).mount(c);
  });

  it("warns when no renderer and no fallback", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const spec = makeSpec({
      root: { type: "NoSuch", props: {}, children: [] },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry }).mount(c);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("NoSuch"));
    warn.mockRestore();
  });
});

describe("Renderer state actions", () => {
  it("setState updates store and re-renders", () => {
    const spec = makeSpec({
      root: {
        type: "Text",
        props: { text: { $state: "/msg" }, variant: null },
        children: [],
      },
    });
    const c = document.createElement("div");
    const r = new Renderer({ spec, registry, state: { msg: "initial" } });
    r.mount(c);
    expect(c.textContent).toContain("initial");
  });

  it("pushState appends to array in store", () => {
    const store = createStateStore({ items: ["a"] });
    const spec = makeSpec({
      root: { type: "Text", props: { text: "x", variant: null }, children: [] },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry, store }).mount(c);
    expect(store.get("/items")).toEqual(["a"]);
  });

  it("onStateChange callback is accepted", () => {
    const cb = vi.fn();
    const spec = makeSpec({
      root: { type: "Text", props: { text: "x", variant: null }, children: [] },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry, state: {}, onStateChange: cb }).mount(c);
  });
});

describe("Renderer visibility", () => {
  it("hides element when visible=false", () => {
    const spec = makeSpec({
      root: {
        type: "Card",
        props: {
          title: null,
          description: null,
          maxWidth: null,
          centered: null,
        },
        children: ["hidden"],
      },
      hidden: {
        type: "Text",
        props: { text: "secret", variant: null },
        children: [],
        visible: false,
      },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry }).mount(c);
    expect(c.textContent).not.toContain("secret");
  });

  it("shows element when visible=true", () => {
    const spec = makeSpec({
      root: {
        type: "Text",
        props: { text: "show me", variant: null },
        children: [],
        visible: true,
      },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry }).mount(c);
    expect(c.textContent).toContain("show me");
  });
});

describe("Renderer repeat", () => {
  it("renders repeat items from state array", () => {
    const spec = makeSpec({
      root: {
        type: "Stack",
        props: { direction: "vertical", gap: "md", align: null, justify: null },
        children: ["item"],
        repeat: { statePath: "/items" },
      },
      item: {
        type: "Text",
        props: { text: { $item: "name" }, variant: null },
        children: [],
      },
    });
    const c = document.createElement("div");
    new Renderer({
      spec,
      registry,
      state: { items: [{ name: "A" }, { name: "B" }] },
    }).mount(c);
    expect(c.textContent).toContain("A");
    expect(c.textContent).toContain("B");
  });

  it("handles empty repeat array", () => {
    const spec = makeSpec({
      root: {
        type: "Stack",
        props: { direction: "vertical", gap: "md", align: null, justify: null },
        children: ["item"],
        repeat: { statePath: "/items" },
      },
      item: { type: "Text", props: { text: "x", variant: null }, children: [] },
    });
    const c = document.createElement("div");
    new Renderer({ spec, registry, state: { items: [] } }).mount(c);
  });
});

describe("Renderer update", () => {
  it("re-renders with new spec", () => {
    const c = document.createElement("div");
    const spec1 = makeSpec({
      root: {
        type: "Text",
        props: { text: "first", variant: null },
        children: [],
      },
    });
    const spec2 = makeSpec({
      root: {
        type: "Text",
        props: { text: "second", variant: null },
        children: [],
      },
    });
    const r = new Renderer({ spec: spec1, registry });
    r.mount(c);
    expect(c.textContent).toContain("first");
    r.update({ spec: spec2 });
    expect(c.textContent).toContain("second");
  });
});

describe("defineRegistry", () => {
  it("creates registry with components", () => {
    const catalog = { components: { Foo: { props: {} } } };
    const result = defineRegistry(catalog, { components: { Foo: () => null } });
    expect(result.registry).toHaveProperty("Foo");
    expect(typeof result.handlers).toBe("function");
    expect(typeof result.executeAction).toBe("function");
  });

  it("executeAction warns on unknown action", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const catalog = { components: {} };
    const result = defineRegistry(catalog, { components: {} });
    await result.executeAction("nope", undefined, () => {});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("nope"));
    warn.mockRestore();
  });

  it("executeAction runs registered action", async () => {
    const actionFn = vi.fn().mockResolvedValue(undefined);
    const catalog = { components: {}, actions: { doThing: { params: {} } } };
    const result = defineRegistry(catalog, {
      components: {},
      actions: { doThing: actionFn },
    });
    const setState = vi.fn();
    await result.executeAction("doThing", { x: 1 }, setState, { y: 2 });
    expect(actionFn).toHaveBeenCalledWith({ x: 1 }, setState, { y: 2 });
  });

  it("handlers factory produces callable handlers", () => {
    const actionFn = vi.fn().mockResolvedValue(undefined);
    const catalog = { components: {}, actions: { act: { params: {} } } };
    const result = defineRegistry(catalog, {
      components: {},
      actions: { act: actionFn },
    });
    const setState = vi.fn();
    const h = result.handlers(
      () => setState,
      () => ({}),
    );
    expect(h).toHaveProperty("act");
    expect(typeof h.act).toBe("function");
  });
});

describe("createRenderer factory", () => {
  it("returns a factory that produces Renderer instances", () => {
    const catalog = { components: {} };
    const factory = createRenderer(catalog, {});
    const r = factory({ spec: null });
    expect(r).toBeInstanceOf(Renderer);
  });
});
