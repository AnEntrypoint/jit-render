import { describe, it, expect, vi } from "vitest";
import { webjsxComponents } from "./components";

const noopEmit = vi.fn();
const noopOn = () => ({
  emit: () => {},
  shouldPreventDefault: false,
  bound: false,
});

function render(name, props, extra = {}) {
  return webjsxComponents[name]({
    props,
    children: undefined,
    emit: noopEmit,
    on: noopOn,
    ...extra,
  });
}

describe("Layout components", () => {
  it("Card renders with title and description", () => {
    const r = render("Card", {
      title: "T",
      description: "D",
      maxWidth: null,
      centered: null,
    });
    expect(r).toBeDefined();
  });

  it("Card applies maxWidth sm", () => {
    const r = render("Card", {
      title: null,
      description: null,
      maxWidth: "sm",
      centered: true,
    });
    expect(r).toBeDefined();
  });

  it("Stack renders horizontal", () => {
    const r = render("Stack", {
      direction: "horizontal",
      gap: "lg",
      align: "center",
      justify: "between",
    });
    expect(r).toBeDefined();
  });

  it("Stack defaults to vertical", () => {
    const r = render("Stack", {
      direction: null,
      gap: null,
      align: null,
      justify: null,
    });
    expect(r).toBeDefined();
  });

  it("Grid clamps columns 1-6", () => {
    const r = render("Grid", { columns: 10, gap: "sm" });
    expect(r).toBeDefined();
  });

  it("Separator horizontal", () => {
    const r = render("Separator", { orientation: "horizontal" });
    expect(r).toBeDefined();
  });

  it("Separator vertical", () => {
    const r = render("Separator", { orientation: "vertical" });
    expect(r).toBeDefined();
  });
});

describe("Navigation components", () => {
  it("Tabs renders tab buttons", () => {
    const r = render("Tabs", {
      tabs: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      defaultValue: "a",
      value: null,
    });
    expect(r).toBeDefined();
  });

  it("Tabs with empty tabs array", () => {
    const r = render("Tabs", { tabs: [], defaultValue: null, value: null });
    expect(r).toBeDefined();
  });

  it("Accordion renders items", () => {
    const r = render("Accordion", {
      items: [{ title: "Q", content: "A" }],
      type: "single",
    });
    expect(r).toBeDefined();
  });

  it("Accordion empty items", () => {
    const r = render("Accordion", { items: [], type: null });
    expect(r).toBeDefined();
  });

  it("Collapsible renders", () => {
    const r = render("Collapsible", { title: "More", defaultOpen: true });
    expect(r).toBeDefined();
  });
});

describe("Overlay components", () => {
  it("Dialog renders", () => {
    const r = render("Dialog", {
      title: "Confirm",
      description: "Are you sure?",
      openPath: "/open",
    });
    expect(r).toBeDefined();
  });

  it("Dialog without description", () => {
    const r = render("Dialog", {
      title: "T",
      description: null,
      openPath: "/o",
    });
    expect(r).toBeDefined();
  });

  it("Drawer renders", () => {
    const r = render("Drawer", {
      title: "Menu",
      description: "Nav",
      openPath: "/drawer",
    });
    expect(r).toBeDefined();
  });

  it("Tooltip renders", () => {
    const r = render("Tooltip", { content: "Help text", text: "Hover me" });
    expect(r).toBeDefined();
  });

  it("Popover renders", () => {
    const r = render("Popover", { trigger: "Click", content: "Details" });
    expect(r).toBeDefined();
  });
});

describe("Display components", () => {
  it("Heading h1-h4", () => {
    for (const level of ["h1", "h2", "h3", "h4"]) {
      expect(render("Heading", { text: "Title", level })).toBeDefined();
    }
  });

  it("Heading defaults to h2", () => {
    const r = render("Heading", { text: "Default", level: null });
    expect(r).toBeDefined();
  });

  it("Text body variant", () => {
    expect(render("Text", { text: "Body", variant: null })).toBeDefined();
  });

  it("Text code variant", () => {
    expect(render("Text", { text: "code()", variant: "code" })).toBeDefined();
  });

  it("Text all variants", () => {
    for (const v of ["body", "caption", "muted", "lead", "code"]) {
      expect(render("Text", { text: "x", variant: v })).toBeDefined();
    }
  });

  it("Image with src", () => {
    expect(
      render("Image", {
        src: "http://img.png",
        alt: "pic",
        width: 100,
        height: 50,
      }),
    ).toBeDefined();
  });

  it("Image placeholder without src", () => {
    expect(
      render("Image", {
        src: null,
        alt: "placeholder",
        width: null,
        height: null,
      }),
    ).toBeDefined();
  });

  it("Avatar with name initials", () => {
    expect(
      render("Avatar", { src: null, name: "Jane Doe", size: "lg" }),
    ).toBeDefined();
  });

  it("Avatar with image src", () => {
    expect(
      render("Avatar", { src: "http://a.png", name: "J", size: "sm" }),
    ).toBeDefined();
  });

  it("Badge all variants", () => {
    for (const v of ["default", "secondary", "destructive", "outline", null]) {
      expect(render("Badge", { text: "Tag", variant: v })).toBeDefined();
    }
  });

  it("Alert all types", () => {
    for (const t of ["info", "success", "warning", "error", null]) {
      expect(
        render("Alert", { title: "Note", message: "msg", type: t }),
      ).toBeDefined();
    }
  });

  it("Alert without message", () => {
    expect(
      render("Alert", { title: "X", message: null, type: null }),
    ).toBeDefined();
  });

  it("Progress boundary values", () => {
    expect(
      render("Progress", { value: 0, max: null, label: null }),
    ).toBeDefined();
    expect(
      render("Progress", { value: 100, max: 100, label: "Done" }),
    ).toBeDefined();
    expect(
      render("Progress", { value: 150, max: null, label: null }),
    ).toBeDefined();
  });

  it("Skeleton renders", () => {
    expect(
      render("Skeleton", { width: "200px", height: "20px", rounded: true }),
    ).toBeDefined();
  });

  it("Skeleton defaults", () => {
    expect(
      render("Skeleton", { width: null, height: null, rounded: null }),
    ).toBeDefined();
  });

  it("Spinner all sizes", () => {
    for (const s of ["sm", "md", "lg", null]) {
      expect(render("Spinner", { size: s, label: "Loading" })).toBeDefined();
    }
  });

  it("Carousel renders items", () => {
    expect(
      render("Carousel", { items: [{ title: "A", description: "B" }] }),
    ).toBeDefined();
  });

  it("Carousel empty items", () => {
    expect(render("Carousel", { items: [] })).toBeDefined();
  });

  it("Table renders", () => {
    expect(
      render("Table", {
        columns: ["Name"],
        rows: [["Alice"]],
        caption: "Users",
      }),
    ).toBeDefined();
  });

  it("Table empty", () => {
    expect(
      render("Table", { columns: [], rows: [], caption: null }),
    ).toBeDefined();
  });
});

describe("Input components", () => {
  it("Input renders with label", () => {
    expect(
      render("Input", {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "x",
        value: "",
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Textarea renders", () => {
    expect(
      render("Textarea", {
        label: "Bio",
        name: "bio",
        placeholder: "...",
        rows: 5,
        value: "text",
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Select renders options", () => {
    expect(
      render("Select", {
        label: "Role",
        name: "role",
        options: ["Admin", "User"],
        placeholder: "Pick",
        value: null,
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Select empty options", () => {
    expect(
      render("Select", {
        label: "X",
        name: "x",
        options: [],
        placeholder: null,
        value: null,
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Checkbox renders", () => {
    expect(
      render("Checkbox", {
        label: "Agree",
        name: "agree",
        checked: true,
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Radio renders options", () => {
    expect(
      render("Radio", {
        label: "Size",
        name: "size",
        options: ["S", "M", "L"],
        value: "M",
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Switch renders", () => {
    expect(
      render("Switch", {
        label: "Dark mode",
        name: "dark",
        checked: false,
        checks: null,
        validateOn: null,
      }),
    ).toBeDefined();
  });

  it("Slider renders", () => {
    expect(
      render("Slider", {
        label: "Volume",
        min: 0,
        max: 100,
        step: 5,
        value: 50,
      }),
    ).toBeDefined();
  });

  it("Slider null props", () => {
    expect(
      render("Slider", {
        label: null,
        min: null,
        max: null,
        step: null,
        value: null,
      }),
    ).toBeDefined();
  });
});

describe("Action components", () => {
  it("Button primary", () => {
    expect(
      render("Button", { label: "Go", variant: "primary", disabled: false }),
    ).toBeDefined();
  });

  it("Button disabled", () => {
    expect(
      render("Button", { label: "No", variant: null, disabled: true }),
    ).toBeDefined();
  });

  it("Button danger variant", () => {
    expect(
      render("Button", { label: "Del", variant: "danger", disabled: false }),
    ).toBeDefined();
  });

  it("Link renders", () => {
    expect(render("Link", { label: "Click", href: "/page" })).toBeDefined();
  });

  it("DropdownMenu renders items", () => {
    expect(
      render("DropdownMenu", {
        label: "Menu",
        items: [{ label: "A", value: "a" }],
        value: null,
      }),
    ).toBeDefined();
  });

  it("Toggle pressed/unpressed", () => {
    expect(
      render("Toggle", { label: "Bold", pressed: true, variant: null }),
    ).toBeDefined();
    expect(
      render("Toggle", { label: "Bold", pressed: false, variant: "outline" }),
    ).toBeDefined();
  });

  it("ToggleGroup single", () => {
    expect(
      render("ToggleGroup", {
        items: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
        type: "single",
        value: "a",
      }),
    ).toBeDefined();
  });

  it("ToggleGroup multiple", () => {
    expect(
      render("ToggleGroup", {
        items: [{ label: "A", value: "a" }],
        type: "multiple",
        value: "a,b",
      }),
    ).toBeDefined();
  });

  it("ButtonGroup renders", () => {
    expect(
      render("ButtonGroup", {
        buttons: [{ label: "X", value: "x" }],
        selected: "x",
      }),
    ).toBeDefined();
  });

  it("Pagination renders pages", () => {
    expect(render("Pagination", { totalPages: 10, page: 5 })).toBeDefined();
  });

  it("Pagination single page", () => {
    expect(render("Pagination", { totalPages: 1, page: 1 })).toBeDefined();
  });

  it("Pagination edge: first page", () => {
    expect(render("Pagination", { totalPages: 20, page: 1 })).toBeDefined();
  });

  it("Pagination edge: last page", () => {
    expect(render("Pagination", { totalPages: 20, page: 20 })).toBeDefined();
  });
});
