import { describe, it, expect, vi } from "vitest";
import { Renderer, createWebjsxRegistry } from "./index";

const registry = createWebjsxRegistry();

function mountSpec(spec, state = {}, opts = {}) {
  const c = document.createElement("div");
  const r = new Renderer({ spec, registry, state, ...opts });
  r.mount(c);
  return { container: c, renderer: r };
}

describe("Integration: form with state binding", () => {
  it("renders form with input bound to state", () => {
    const spec = {
      root: "form",
      elements: {
        form: {
          type: "Card",
          props: {
            title: "Login",
            description: null,
            maxWidth: "sm",
            centered: true,
          },
          children: ["emailInput", "submitBtn"],
        },
        emailInput: {
          type: "Input",
          props: {
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "you@ex.com",
            value: { $state: "/email" },
            checks: null,
            validateOn: null,
          },
          children: [],
        },
        submitBtn: {
          type: "Button",
          props: { label: "Submit", variant: "primary", disabled: false },
          children: [],
          on: {
            press: {
              action: "setState",
              params: { statePath: "/submitted", value: true },
            },
          },
        },
      },
    };
    const { container } = mountSpec(spec, {
      email: "test@test.com",
      submitted: false,
    });
    expect(container.querySelector("input")).toBeTruthy();
    expect(container.querySelector("button")).toBeTruthy();
    expect(container.textContent).toContain("Login");
    expect(container.textContent).toContain("Submit");
  });
});

describe("Integration: dashboard layout", () => {
  it("renders multi-component dashboard", () => {
    const spec = {
      root: "layout",
      elements: {
        layout: {
          type: "Stack",
          props: {
            direction: "vertical",
            gap: "lg",
            align: null,
            justify: null,
          },
          children: ["header", "stats", "content"],
        },
        header: {
          type: "Heading",
          props: { text: "Dashboard", level: "h1" },
          children: [],
        },
        stats: {
          type: "Grid",
          props: { columns: 3, gap: "md" },
          children: ["stat1", "stat2", "stat3"],
        },
        stat1: {
          type: "Card",
          props: {
            title: "Users",
            description: "1,234",
            maxWidth: null,
            centered: null,
          },
          children: [],
        },
        stat2: {
          type: "Card",
          props: {
            title: "Revenue",
            description: "$5,678",
            maxWidth: null,
            centered: null,
          },
          children: [],
        },
        stat3: {
          type: "Card",
          props: {
            title: "Orders",
            description: "42",
            maxWidth: null,
            centered: null,
          },
          children: [],
        },
        content: {
          type: "Table",
          props: {
            columns: ["Name", "Status"],
            rows: [
              ["Alice", "Active"],
              ["Bob", "Inactive"],
            ],
            caption: null,
          },
          children: [],
        },
      },
    };
    const { container } = mountSpec(spec);
    expect(container.querySelector("h1")?.textContent).toBe("Dashboard");
    expect(container.querySelector("table")).toBeTruthy();
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Revenue");
  });
});

describe("Integration: list with repeat", () => {
  it("renders repeated items from state", () => {
    const spec = {
      root: "list",
      elements: {
        list: {
          type: "Stack",
          props: {
            direction: "vertical",
            gap: "sm",
            align: null,
            justify: null,
          },
          children: ["todoItem"],
          repeat: { statePath: "/todos" },
        },
        todoItem: {
          type: "Text",
          props: { text: { $item: "title" }, variant: null },
          children: [],
        },
      },
    };
    const state = {
      todos: [
        { title: "Buy milk" },
        { title: "Write tests" },
        { title: "Ship it" },
      ],
    };
    const { container } = mountSpec(spec, state);
    expect(container.textContent).toContain("Buy milk");
    expect(container.textContent).toContain("Write tests");
    expect(container.textContent).toContain("Ship it");
  });
});

describe("Integration: visibility conditionals", () => {
  it("conditionally shows elements based on state", () => {
    const spec = {
      root: "wrapper",
      elements: {
        wrapper: {
          type: "Stack",
          props: {
            direction: "vertical",
            gap: "md",
            align: null,
            justify: null,
          },
          children: ["alert", "content"],
        },
        alert: {
          type: "Alert",
          props: {
            title: "Error",
            message: "Something went wrong",
            type: "error",
          },
          children: [],
          visible: { $state: "/hasError" },
        },
        content: {
          type: "Text",
          props: { text: "All good", variant: null },
          children: [],
          visible: { $not: { $state: "/hasError" } },
        },
      },
    };
    const { container: c1 } = mountSpec(spec, { hasError: true });
    expect(c1.textContent).toContain("Something went wrong");

    const { container: c2 } = mountSpec(spec, { hasError: false });
    expect(c2.textContent).toContain("All good");
  });
});

describe("Integration: custom handlers", () => {
  it("custom action handler gets called via event binding", () => {
    const handler = vi.fn();
    const spec = {
      root: "btn",
      elements: {
        btn: {
          type: "Button",
          props: { label: "Do it", variant: "primary", disabled: false },
          children: [],
          on: { press: { action: "customAction", params: { key: "val" } } },
        },
      },
    };
    const { container } = mountSpec(
      spec,
      {},
      { handlers: { customAction: handler } },
    );
    expect(container.querySelector("button")).toBeTruthy();
  });
});

describe("Integration: update triggers re-render", () => {
  it("spec swap replaces DOM content", () => {
    const spec1 = {
      root: "t",
      elements: {
        t: {
          type: "Text",
          props: { text: "Version 1", variant: null },
          children: [],
        },
      },
    };
    const spec2 = {
      root: "t",
      elements: {
        t: {
          type: "Text",
          props: { text: "Version 2", variant: null },
          children: [],
        },
      },
    };
    const c = document.createElement("div");
    const r = new Renderer({ spec: spec1, registry });
    r.mount(c);
    expect(c.textContent).toContain("Version 1");
    r.update({ spec: spec2 });
    expect(c.textContent).toContain("Version 2");
  });
});
