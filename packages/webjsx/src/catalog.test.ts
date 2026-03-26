import { describe, it, expect } from "vitest";
import { webjsxComponentDefinitions } from "./catalog";
import { createWebjsxRegistry, webjsxComponents } from "./index";

const componentNames = Object.keys(webjsxComponentDefinitions);

describe("webjsxComponentDefinitions schemas", () => {
  it("defines exactly 36 components", () => {
    expect(componentNames.length).toBe(36);
  });

  it("each definition has props, description", () => {
    for (const name of componentNames) {
      const def = webjsxComponentDefinitions[name];
      expect(def.props, name + " missing props").toBeDefined();
      expect(def.description, name + " missing description").toBeTruthy();
    }
  });

  it("validates example props with nullable fields filled", () => {
    for (const name of componentNames) {
      const def = webjsxComponentDefinitions[name];
      if (!def.example) continue;
      const shape = def.props._zod?.def?.shape;
      if (!shape) continue;
      const full = { ...def.example };
      for (const [key, schema] of Object.entries(shape)) {
        if (!(key in full)) full[key] = null;
      }
      const result = def.props.safeParse(full);
      expect(
        result.success,
        name + " example failed: " + JSON.stringify(result),
      ).toBe(true);
    }
  });

  it("Card schema rejects invalid maxWidth", () => {
    const result = webjsxComponentDefinitions.Card.props.safeParse({
      title: "T",
      description: null,
      maxWidth: "xxl",
      centered: null,
    });
    expect(result.success).toBe(false);
  });

  it("Button schema rejects invalid variant", () => {
    const result = webjsxComponentDefinitions.Button.props.safeParse({
      label: "Go",
      variant: "nope",
      disabled: false,
    });
    expect(result.success).toBe(false);
  });

  it("Input schema validates full props", () => {
    const result = webjsxComponentDefinitions.Input.props.safeParse({
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "x",
      value: "test@test.com",
      checks: [{ type: "required", message: "Required" }],
      validateOn: "blur",
    });
    expect(result.success).toBe(true);
  });

  it("Table schema validates example", () => {
    const result = webjsxComponentDefinitions.Table.props.safeParse({
      columns: ["Name", "Role"],
      rows: [["Alice", "Admin"]],
      caption: null,
    });
    expect(result.success).toBe(true);
  });

  it("Slider schema accepts all-null optional fields", () => {
    const result = webjsxComponentDefinitions.Slider.props.safeParse({
      label: null,
      min: null,
      max: null,
      step: null,
      value: null,
    });
    expect(result.success).toBe(true);
  });

  it("components with events list their events", () => {
    const withEvents = [
      "Tabs",
      "Select",
      "Checkbox",
      "Radio",
      "Switch",
      "Slider",
      "Button",
      "DropdownMenu",
      "Toggle",
      "ToggleGroup",
      "ButtonGroup",
      "Pagination",
      "Input",
    ];
    for (const name of withEvents) {
      const def = webjsxComponentDefinitions[name];
      expect(def.events, name + " missing events").toBeDefined();
      expect(def.events.length).toBeGreaterThan(0);
    }
  });
});

describe("createWebjsxRegistry", () => {
  it("returns registry with all 36 components", () => {
    const registry = createWebjsxRegistry();
    expect(Object.keys(registry).length).toBe(36);
    for (const name of componentNames) {
      expect(typeof registry[name], name + " not a function").toBe("function");
    }
  });

  it("accepts partial component map", () => {
    const partial = {
      Card: webjsxComponents.Card,
      Button: webjsxComponents.Button,
    };
    const registry = createWebjsxRegistry(partial);
    expect(Object.keys(registry).length).toBe(2);
    expect(registry).toHaveProperty("Card");
    expect(registry).toHaveProperty("Button");
  });

  it("registry functions accept ComponentRenderProps shape", () => {
    const registry = createWebjsxRegistry();
    const result = registry.Heading({
      element: {
        type: "Heading",
        props: { text: "Test", level: "h1" },
        children: [],
      },
      children: undefined,
      emit: () => {},
      on: () => ({ emit: () => {}, shouldPreventDefault: false, bound: false }),
    });
    expect(result).toBeDefined();
  });
});
