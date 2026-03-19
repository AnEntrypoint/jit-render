import { createElement, Fragment } from "webjsx";
import type { BaseComponentProps } from "./catalog-types";
import type { WebjsxProps } from "./catalog";

const css = {
  card: "background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);",
  cardTitle: "font-size:1.1rem;font-weight:600;margin:0 0 4px;",
  cardDesc: "font-size:.875rem;color:#64748b;margin:0 0 12px;",
  stack: (dir: string, gap: string) =>
    `display:flex;flex-direction:${dir};gap:${gap};flex-wrap:${dir === "row" ? "wrap" : "nowrap"};`,
  grid: (cols: number, gap: string) =>
    `display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};`,
  sep: (vert: boolean) =>
    vert
      ? "width:1px;background:#e2e8f0;align-self:stretch;margin:0 8px;"
      : "height:1px;background:#e2e8f0;margin:12px 0;",
  heading: (level: string) => {
    const sz = level === "h1" ? "1.5rem" : level === "h3" ? "1rem" : level === "h4" ? ".875rem" : "1.25rem";
    return `font-size:${sz};font-weight:${level === "h4" ? "600" : "700"};margin:0;`;
  },
  text: (variant: string | null) => {
    if (variant === "caption") return "font-size:.75rem;margin:0;";
    if (variant === "muted") return "font-size:.875rem;color:#64748b;margin:0;";
    if (variant === "lead") return "font-size:1.1rem;color:#64748b;margin:0;";
    if (variant === "code") return "font-family:monospace;font-size:.875rem;background:#f1f5f9;padding:2px 6px;border-radius:4px;";
    return "font-size:.875rem;margin:0;";
  },
  badge: (variant: string | null) => {
    const bg = variant === "secondary" ? "#f1f5f9" : variant === "destructive" ? "#fee2e2" : variant === "outline" ? "transparent" : "#0f172a";
    const color = variant === "secondary" ? "#475569" : variant === "destructive" ? "#b91c1c" : variant === "outline" ? "#0f172a" : "white";
    const border = variant === "outline" ? "1px solid #e2e8f0" : "none";
    return `display:inline-block;padding:2px 8px;border-radius:9999px;font-size:.75rem;font-weight:500;background:${bg};color:${color};border:${border};`;
  },
  alert: (type: string | null) => {
    const bg = type === "success" ? "#f0fdf4" : type === "warning" ? "#fffbeb" : type === "error" ? "#fef2f2" : "#eff6ff";
    const border = type === "success" ? "#86efac" : type === "warning" ? "#fde68a" : type === "error" ? "#fca5a5" : "#93c5fd";
    const color = type === "success" ? "#166534" : type === "warning" ? "#92400e" : type === "error" ? "#991b1b" : "#1e40af";
    return `background:${bg};border:1px solid ${border};color:${color};border-radius:8px;padding:12px 16px;`;
  },
  btn: (variant: string | null, disabled: boolean) => {
    const bg = disabled ? "#e2e8f0" : variant === "secondary" ? "#f1f5f9" : variant === "danger" ? "#ef4444" : "#0f172a";
    const color = disabled ? "#94a3b8" : variant === "secondary" ? "#0f172a" : "white";
    return `padding:8px 16px;border-radius:6px;border:none;font-size:.875rem;font-weight:500;cursor:${disabled ? "not-allowed" : "pointer"};background:${bg};color:${color};transition:opacity .15s;`;
  },
  input: "width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:.875rem;box-sizing:border-box;outline:none;",
  label: "display:block;font-size:.875rem;font-weight:500;margin-bottom:4px;color:#374151;",
  fieldWrap: "display:flex;flex-direction:column;gap:4px;",
  error: "font-size:.75rem;color:#ef4444;",
  table: "width:100%;border-collapse:collapse;font-size:.875rem;",
  th: "text-align:left;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:600;color:#374151;",
  td: "padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#374151;",
  tab: (active: boolean) =>
    `padding:6px 14px;border:none;background:${active ? "white" : "transparent"};font-size:.875rem;font-weight:${active ? "600" : "400"};cursor:pointer;border-radius:4px;box-shadow:${active ? "0 1px 3px rgba(0,0,0,.1)" : "none"};`,
  tabBar: "display:inline-flex;background:#f1f5f9;border-radius:6px;padding:2px;gap:2px;margin-bottom:12px;",
  progress: (pct: number) => `height:8px;background:#0f172a;border-radius:9999px;width:${pct}%;transition:width .3s;`,
  progressTrack: "height:8px;background:#e2e8f0;border-radius:9999px;overflow:hidden;",
  avatar: (size: string | null) => {
    const dim = size === "lg" ? "48px" : size === "sm" ? "32px" : "40px";
    return `width:${dim};height:${dim};border-radius:50%;background:#0f172a;color:white;display:flex;align-items:center;justify-center;font-size:.75rem;font-weight:600;overflow:hidden;`;
  },
  spinner: (size: string | null) => {
    const dim = size === "lg" ? "32px" : size === "sm" ? "16px" : "24px";
    return `width:${dim};height:${dim};border:2px solid #e2e8f0;border-top-color:#0f172a;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;`;
  },
  link: "color:#0f172a;text-decoration:underline;font-size:.875rem;cursor:pointer;",
  skeleton: (w: string, h: string, rounded: boolean) =>
    `display:block;background:#e2e8f0;width:${w};height:${h};border-radius:${rounded ? "9999px" : "4px"};animation:pulse 1.5s ease-in-out infinite;`,
  select: "width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:.875rem;background:white;box-sizing:border-box;",
  checkbox: "width:16px;height:16px;cursor:pointer;accent-color:#0f172a;",
  checkRow: "display:flex;align-items:center;gap:8px;",
  slider: "width:100%;accent-color:#0f172a;",
  paginationWrap: "display:flex;align-items:center;gap:4px;",
  pageBtn: (active: boolean, disabled?: boolean) =>
    `padding:4px 10px;border:1px solid #e2e8f0;border-radius:4px;font-size:.875rem;cursor:${disabled ? "not-allowed" : "pointer"};background:${active ? "#0f172a" : "white"};color:${active ? "white" : "#374151"};`,
  dropdown: "position:relative;display:inline-block;",
  dropdownMenu: "position:absolute;top:100%;left:0;background:white;border:1px solid #e2e8f0;border-radius:6px;min-width:160px;z-index:50;box-shadow:0 4px 12px rgba(0,0,0,.1);",
  dropdownItem: "padding:8px 12px;font-size:.875rem;cursor:pointer;display:block;width:100%;background:none;border:none;text-align:left;",
};

const gapMap: Record<string, string> = { none: "0", sm: "8px", md: "12px", lg: "16px" };

function getPaginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "ellipsis"> = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export const webjsxComponents = {
  Card: ({ props, children }: BaseComponentProps<WebjsxProps<"Card">>) => {
    const maxW = props.maxWidth === "sm" ? "280px" : props.maxWidth === "md" ? "320px" : props.maxWidth === "lg" ? "360px" : "100%";
    const margin = props.centered ? "0 auto" : "0";
    return (
      <div style={`${css.card}max-width:${maxW};margin:${margin};`}>
        {(props.title || props.description) && (
          <div>
            {props.title && <h3 style={css.cardTitle}>{props.title}</h3>}
            {props.description && <p style={css.cardDesc}>{props.description}</p>}
          </div>
        )}
        <div style="display:flex;flex-direction:column;gap:12px;">{children as any}</div>
      </div>
    );
  },

  Stack: ({ props, children }: BaseComponentProps<WebjsxProps<"Stack">>) => {
    const dir = props.direction === "horizontal" ? "row" : "column";
    const gap = gapMap[props.gap ?? "md"] ?? "12px";
    const alignMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch" };
    const justifyMap: Record<string, string> = { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" };
    const align = alignMap[props.align ?? "start"] ?? "flex-start";
    const justify = justifyMap[props.justify ?? "start"] ?? "flex-start";
    return <div style={`${css.stack(dir, gap)}align-items:${align};justify-content:${justify};`}>{children as any}</div>;
  },

  Grid: ({ props, children }: BaseComponentProps<WebjsxProps<"Grid">>) => {
    const cols = Math.max(1, Math.min(6, props.columns ?? 1));
    const gap = gapMap[props.gap ?? "md"] ?? "12px";
    return <div style={css.grid(cols, gap)}>{children as any}</div>;
  },

  Separator: ({ props }: BaseComponentProps<WebjsxProps<"Separator">>) => {
    const vert = props.orientation === "vertical";
    return <div role="separator" style={css.sep(vert)} />;
  },

  Tabs: ({ props, children, emit, bindings }: BaseComponentProps<WebjsxProps<"Tabs">>) => {
    const tabs = props.tabs ?? [];
    const value = (props.value as string | null) ?? props.defaultValue ?? tabs[0]?.value ?? "";
    return (
      <div>
        <div style={css.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              style={css.tab(value === tab.value)}
              onclick={(e: Event) => {
                e.preventDefault();
                const el = e.currentTarget as HTMLElement;
                el.closest("[data-tabs]")?.querySelectorAll("[data-tab-value]").forEach((btn) => {
                  (btn as HTMLElement).style.cssText = css.tab(false);
                });
                (el as HTMLElement).style.cssText = css.tab(true);
                emit("change");
              }}
              data-tab-value={tab.value}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div data-tabs="true">{children as any}</div>
      </div>
    );
  },

  Accordion: ({ props }: BaseComponentProps<WebjsxProps<"Accordion">>) => {
    const items = props.items ?? [];
    return (
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        {items.map((item, i) => (
          <details key={i} style={i > 0 ? "border-top:1px solid #e2e8f0;" : ""}>
            <summary style="padding:12px 16px;font-size:.875rem;font-weight:500;cursor:pointer;list-style:none;display:flex;justify-content:space-between;">
              {item.title}
              <span>&#8964;</span>
            </summary>
            <div style="padding:0 16px 12px;font-size:.875rem;color:#64748b;">{item.content}</div>
          </details>
        ))}
      </div>
    );
  },

  Collapsible: ({ props, children }: BaseComponentProps<WebjsxProps<"Collapsible">>) => (
    <details style="border:1px solid #e2e8f0;border-radius:6px;" open={props.defaultOpen ?? false}>
      <summary style="padding:10px 14px;font-size:.875rem;font-weight:500;cursor:pointer;list-style:none;">
        {props.title}
      </summary>
      <div style="padding:8px 14px 12px;">{children as any}</div>
    </details>
  ),

  Dialog: ({ props, children }: BaseComponentProps<WebjsxProps<"Dialog">>) => (
    <dialog open style="border:1px solid #e2e8f0;border-radius:8px;padding:24px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.2);">
      <h2 style="font-size:1.1rem;font-weight:600;margin:0 0 8px;">{props.title}</h2>
      {props.description && <p style="font-size:.875rem;color:#64748b;margin:0 0 16px;">{props.description}</p>}
      {children as any}
    </dialog>
  ),

  Drawer: ({ props, children }: BaseComponentProps<WebjsxProps<"Drawer">>) => (
    <div style="position:fixed;bottom:0;left:0;right:0;background:white;border-top:1px solid #e2e8f0;border-radius:12px 12px 0 0;padding:24px;box-shadow:0 -8px 24px rgba(0,0,0,.1);z-index:50;">
      <div style="width:40px;height:4px;background:#e2e8f0;border-radius:9999px;margin:0 auto 16px;" />
      <h2 style="font-size:1.1rem;font-weight:600;margin:0 0 8px;">{props.title}</h2>
      {props.description && <p style="font-size:.875rem;color:#64748b;margin:0 0 16px;">{props.description}</p>}
      {children as any}
    </div>
  ),

  Carousel: ({ props }: BaseComponentProps<WebjsxProps<"Carousel">>) => {
    const items = props.items ?? [];
    return (
      <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;">
        {items.map((item, i) => (
          <div key={i} style="min-width:200px;border:1px solid #e2e8f0;border-radius:8px;padding:16px;flex-shrink:0;">
            {item.title && <h4 style="font-size:.875rem;font-weight:600;margin:0 0 4px;">{item.title}</h4>}
            {item.description && <p style="font-size:.8rem;color:#64748b;margin:0;">{item.description}</p>}
          </div>
        ))}
      </div>
    );
  },

  Table: ({ props }: BaseComponentProps<WebjsxProps<"Table">>) => {
    const columns = props.columns ?? [];
    const rows = (props.rows ?? []).map((row) => row.map(String));
    return (
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <table style={css.table}>
          {props.caption && <caption style="font-size:.75rem;color:#64748b;padding:8px;">{props.caption}</caption>}
          <thead>
            <tr>{columns.map((col) => <th key={col} style={css.th}>{col}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j} style={css.td}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  Heading: ({ props }: BaseComponentProps<WebjsxProps<"Heading">>) => {
    const level = props.level ?? "h2";
    const style = css.heading(level);
    if (level === "h1") return <h1 style={style}>{props.text}</h1>;
    if (level === "h3") return <h3 style={style}>{props.text}</h3>;
    if (level === "h4") return <h4 style={style}>{props.text}</h4>;
    return <h2 style={style}>{props.text}</h2>;
  },

  Text: ({ props }: BaseComponentProps<WebjsxProps<"Text">>) => {
    const style = css.text(props.variant ?? null);
    if (props.variant === "code") return <code style={style}>{props.text}</code>;
    return <p style={style}>{props.text}</p>;
  },

  Image: ({ props }: BaseComponentProps<WebjsxProps<"Image">>) => {
    if (props.src) {
      return <img src={props.src} alt={props.alt ?? ""} width={props.width ?? undefined} height={props.height ?? undefined} style="max-width:100%;border-radius:4px;" />;
    }
    return (
      <div style={`background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#94a3b8;width:${props.width ?? 80}px;height:${props.height ?? 60}px;`}>
        {props.alt || "img"}
      </div>
    );
  },

  Avatar: ({ props }: BaseComponentProps<WebjsxProps<"Avatar">>) => {
    const name = props.name || "?";
    const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div style={css.avatar(props.size ?? null)}>
        {props.src
          ? <img src={props.src} alt={name} style="width:100%;height:100%;object-fit:cover;" />
          : <span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">{initials}</span>}
      </div>
    );
  },

  Badge: ({ props }: BaseComponentProps<WebjsxProps<"Badge">>) => (
    <span style={css.badge(props.variant ?? null)}>{props.text}</span>
  ),

  Alert: ({ props }: BaseComponentProps<WebjsxProps<"Alert">>) => (
    <div role="alert" style={css.alert(props.type ?? null)}>
      <strong style="font-size:.875rem;font-weight:600;">{props.title}</strong>
      {props.message && <p style="font-size:.875rem;margin:4px 0 0;">{props.message}</p>}
    </div>
  ),

  Progress: ({ props }: BaseComponentProps<WebjsxProps<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <div>
        {props.label && <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:.75rem;color:#64748b;">{props.label}</span><span style="font-size:.75rem;color:#64748b;">{value}%</span></div>}
        <div style={css.progressTrack}><div style={css.progress(value)} /></div>
      </div>
    );
  },

  Skeleton: ({ props }: BaseComponentProps<WebjsxProps<"Skeleton">>) => (
    <div style={css.skeleton(props.width ?? "100%", props.height ?? "1.25rem", props.rounded ?? false)} />
  ),

  Spinner: ({ props }: BaseComponentProps<WebjsxProps<"Spinner">>) => (
    <div style="display:flex;align-items:center;gap:8px;">
      <div style={css.spinner(props.size ?? null)} />
      {props.label && <span style="font-size:.875rem;color:#64748b;">{props.label}</span>}
    </div>
  ),

  Tooltip: ({ props }: BaseComponentProps<WebjsxProps<"Tooltip">>) => (
    <span title={props.content} style="text-decoration:underline dotted;cursor:help;font-size:.875rem;">{props.text}</span>
  ),

  Popover: ({ props }: BaseComponentProps<WebjsxProps<"Popover">>) => (
    <details style="display:inline-block;position:relative;">
      <summary style={`${css.btn(null, false)}list-style:none;display:inline-block;`}>{props.trigger}</summary>
      <div style="position:absolute;top:100%;left:0;background:white;border:1px solid #e2e8f0;border-radius:6px;padding:12px;min-width:200px;z-index:50;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:.875rem;">
        {props.content}
      </div>
    </details>
  ),

  Input: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Input">>) => (
    <div style={css.fieldWrap}>
      {props.label && <label style={css.label}>{props.label}</label>}
      <input
        style={css.input}
        type={props.type ?? "text"}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        value={props.value ?? ""}
        oninput={(e: Event) => {
          const val = (e.target as HTMLInputElement).value;
          if (bindings?.value) emit("_bind:value:" + val);
        }}
        onkeydown={(e: KeyboardEvent) => { if (e.key === "Enter") emit("submit"); }}
        onfocus={() => emit("focus")}
        onblur={() => emit("blur")}
      />
    </div>
  ),

  Textarea: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Textarea">>) => (
    <div style={css.fieldWrap}>
      {props.label && <label style={css.label}>{props.label}</label>}
      <textarea
        style={`${css.input}resize:vertical;min-height:${(props.rows ?? 3) * 24}px;`}
        name={props.name ?? undefined}
        placeholder={props.placeholder ?? ""}
        oninput={(e: Event) => {
          const val = (e.target as HTMLTextAreaElement).value;
          if (bindings?.value) emit("_bind:value:" + val);
        }}
      >{props.value ?? ""}</textarea>
    </div>
  ),

  Select: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Select">>) => {
    const options = (props.options ?? []).map((o: unknown) => typeof o === "string" ? o : String(o ?? ""));
    return (
      <div style={css.fieldWrap}>
        {props.label && <label style={css.label}>{props.label}</label>}
        <select
          style={css.select}
          name={props.name ?? undefined}
          value={props.value ?? ""}
          onchange={(e: Event) => {
            const val = (e.target as HTMLSelectElement).value;
            if (bindings?.value) emit("_bind:value:" + val);
            emit("change");
          }}
        >
          {props.placeholder && <option value="">{props.placeholder}</option>}
          {options.map((opt: string, idx: number) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  },

  Checkbox: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Checkbox">>) => (
    <div style={css.fieldWrap}>
      <div style={css.checkRow}>
        <input
          type="checkbox"
          style={css.checkbox}
          id={props.name ?? undefined}
          name={props.name ?? undefined}
          checked={props.checked ?? false}
          onchange={(e: Event) => {
            const val = (e.target as HTMLInputElement).checked;
            if (bindings?.checked) emit("_bind:checked:" + val);
            emit("change");
          }}
        />
        <label style="font-size:.875rem;cursor:pointer;" for={props.name ?? ""}>{props.label}</label>
      </div>
    </div>
  ),

  Radio: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Radio">>) => {
    const options = (props.options ?? []).map((o: unknown) => typeof o === "string" ? o : String(o ?? ""));
    return (
      <div style={css.fieldWrap}>
        {props.label && <label style={css.label}>{props.label}</label>}
        <div style="display:flex;flex-direction:column;gap:8px;">
          {options.map((opt: string, idx: number) => (
            <div key={idx} style={css.checkRow}>
              <input
                type="radio"
                style={css.checkbox}
                id={`${props.name}-${idx}`}
                name={props.name ?? ""}
                value={opt}
                checked={props.value === opt}
                onchange={() => {
                  if (bindings?.value) emit("_bind:value:" + opt);
                  emit("change");
                }}
              />
              <label style="font-size:.875rem;cursor:pointer;" for={`${props.name}-${idx}`}>{opt}</label>
            </div>
          ))}
        </div>
      </div>
    );
  },

  Switch: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Switch">>) => (
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <label style={css.label}>{props.label}</label>
      <input
        type="checkbox"
        role="switch"
        style={css.checkbox}
        id={props.name ?? undefined}
        name={props.name ?? undefined}
        checked={props.checked ?? false}
        onchange={(e: Event) => {
          const val = (e.target as HTMLInputElement).checked;
          if (bindings?.checked) emit("_bind:checked:" + val);
          emit("change");
        }}
      />
    </div>
  ),

  Slider: ({ props, emit, bindings }: BaseComponentProps<WebjsxProps<"Slider">>) => (
    <div style={css.fieldWrap}>
      {props.label && (
        <div style="display:flex;justify-content:space-between;">
          <label style={css.label}>{props.label}</label>
          <span style="font-size:.875rem;color:#64748b;">{props.value ?? props.min ?? 0}</span>
        </div>
      )}
      <input
        type="range"
        style={css.slider}
        min={String(props.min ?? 0)}
        max={String(props.max ?? 100)}
        step={String(props.step ?? 1)}
        value={String(props.value ?? props.min ?? 0)}
        oninput={(e: Event) => {
          const val = Number((e.target as HTMLInputElement).value);
          if (bindings?.value) emit("_bind:value:" + val);
          emit("change");
        }}
      />
    </div>
  ),

  Button: ({ props, emit }: BaseComponentProps<WebjsxProps<"Button">>) => (
    <button
      style={css.btn(props.variant ?? null, props.disabled ?? false)}
      disabled={props.disabled ?? false}
      onclick={() => emit("press")}
    >
      {props.label}
    </button>
  ),

  Link: ({ props, on }: BaseComponentProps<WebjsxProps<"Link">>) => (
    <a
      href={props.href}
      style={css.link}
      onclick={(e: MouseEvent) => {
        const press = on("press");
        if (press.shouldPreventDefault) e.preventDefault();
        press.emit();
      }}
    >
      {props.label}
    </a>
  ),

  DropdownMenu: ({ props, emit }: BaseComponentProps<WebjsxProps<"DropdownMenu">>) => {
    const items = props.items ?? [];
    return (
      <details style={css.dropdown}>
        <summary style={`${css.btn(null, false)}list-style:none;display:inline-block;`}>{props.label}</summary>
        <div style={css.dropdownMenu}>
          {items.map((item) => (
            <button
              key={item.value}
              style={css.dropdownItem}
              onclick={() => emit("select")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>
    );
  },

  Toggle: ({ props, emit }: BaseComponentProps<WebjsxProps<"Toggle">>) => {
    const pressed = props.pressed ?? false;
    const bg = pressed ? "#0f172a" : props.variant === "outline" ? "transparent" : "#f1f5f9";
    const color = pressed ? "white" : "#0f172a";
    const border = props.variant === "outline" ? "1px solid #e2e8f0" : "none";
    return (
      <button
        aria-pressed={pressed}
        style={`padding:6px 12px;border-radius:6px;border:${border};background:${bg};color:${color};font-size:.875rem;cursor:pointer;`}
        onclick={() => emit("change")}
      >
        {props.label}
      </button>
    );
  },

  ToggleGroup: ({ props, emit }: BaseComponentProps<WebjsxProps<"ToggleGroup">>) => {
    const items = props.items ?? [];
    const value = props.value ?? "";
    return (
      <div style="display:inline-flex;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        {items.map((item, i) => {
          const active = value === item.value || (props.type === "multiple" && value.split(",").includes(item.value));
          return (
            <button
              key={item.value}
              style={`padding:6px 14px;border:none;${i > 0 ? "border-left:1px solid #e2e8f0;" : ""}background:${active ? "#0f172a" : "white"};color:${active ? "white" : "#374151"};font-size:.875rem;cursor:pointer;`}
              onclick={() => emit("change")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  },

  ButtonGroup: ({ props, emit }: BaseComponentProps<WebjsxProps<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    const selected = props.selected ?? "";
    return (
      <div style="display:inline-flex;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        {buttons.map((btn, i) => (
          <button
            key={btn.value}
            style={`padding:6px 14px;border:none;${i > 0 ? "border-left:1px solid #e2e8f0;" : ""}background:${selected === btn.value ? "#0f172a" : "white"};color:${selected === btn.value ? "white" : "#374151"};font-size:.875rem;cursor:pointer;`}
            onclick={() => emit("change")}
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  },

  Pagination: ({ props, emit }: BaseComponentProps<WebjsxProps<"Pagination">>) => {
    const currentPage = (props.page as number | null) ?? 1;
    const totalPages = props.totalPages ?? 1;
    const pages = getPaginationRange(currentPage, totalPages);
    return (
      <nav aria-label="Pagination" style={css.paginationWrap}>
        <button style={css.pageBtn(false, currentPage <= 1)} disabled={currentPage <= 1} onclick={() => emit("change")}>&#8249;</button>
        {pages.map((page, idx) =>
          page === "ellipsis"
            ? <span key={`e${idx}`} style="padding:4px 6px;font-size:.875rem;color:#94a3b8;">&#8230;</span>
            : <button key={page} style={css.pageBtn(page === currentPage)} onclick={() => emit("change")}>{page}</button>
        )}
        <button style={css.pageBtn(false, currentPage >= totalPages)} disabled={currentPage >= totalPages} onclick={() => emit("change")}>&#8250;</button>
      </nav>
    );
  },
};
