import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import postcss from "postcss";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PatternDataTable } from "..";
import { InlineCellEditor } from "../engines/modern/cell-editor";
import type { ColumnDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps } from "../contracts";
import { renderWithEngine } from "@tests/support/engine";

const CSS = join(__dirname, "../../../../../foundation/tokens/css");
const modernSkin = readFileSync(join(CSS, "runtime/engines/modern/skin/data-table/index.css"), "utf8");
const mobileSkin = readFileSync(join(CSS, "presentation/components/skin/data-table-mobile/index.css"), "utf8");
const selectSkin = readFileSync(join(CSS, "runtime/engines/modern/skin/select/index.css"), "utf8");
const ROSTER = JSON.parse(
  readFileSync(join(__dirname, "../../../../../../scripts/check/tokens/cascade/chrome-none/roster/index.json"), "utf8"),
);

interface Row { id: string; name: string; tier: string }
const ROWS: Row[] = [{ id: "r1", name: "Alpha", tier: "free" }, { id: "r2", name: "Bravo", tier: "pro" }];
const TIERS = [{ label: "Free", value: "free" }, { label: "Pro", value: "pro" }];
const COLUMNS: ColumnDef<Row>[] = [
  { key: "id", header: "Id", accessorKey: "id" },
  { key: "tier", header: "Tier", accessorKey: "tier", editable: { type: "select", options: TIERS } },
];
const HOST_ON_TRIGGER = /select\[data-chrome='none'\]/;
const ABOVE_NEUTRALISER = ".ds-pattern-data-table.ds-engine-modern .ds-data-table__editor-control.ds-select-shell--modern > select[data-chrome='none']";

function mount(props: Partial<DataTablePatternProps<Row>> = {}) {
  return renderWithEngine(
    <PatternDataTable<Row> engine="modern" data={ROWS} rowKey="id" columns={COLUMNS} {...props} />,
    "modern",
  );
}
async function openFirstEditor(container: HTMLElement) {
  const user = userEvent.setup();
  const row = await waitFor(() => {
    const r = container.querySelector<HTMLTableRowElement>('[data-part="body-row"]');
    expect(r).not.toBeNull();
    return r!;
  });
  for (let i = 0; i < 20 && document.activeElement !== row; i += 1) await user.tab();
  await user.keyboard("{F2}");
  const select = await waitFor(() => {
    const el = container.querySelector<HTMLSelectElement>('td[data-editing="true"] .ds-data-table__editor-control select');
    expect(el).not.toBeNull();
    expect(document.activeElement).toBe(el);
    return el!;
  });
  return { user, row, select };
}
function hostRules() {
  const found: postcss.Rule[] = [];
  for (const css of [modernSkin, mobileSkin]) {
    postcss.parse(css).walkRules((rule) => {
      if (HOST_ON_TRIGGER.test(rule.selector)) found.push(rule);
    });
  }
  return found;
}
const inForced = (rule: postcss.Rule) => rule.parent?.type === "atrule" && /forced-colors: active/.test((rule.parent as postcss.AtRule).params);

describe("DataTable modern -- the select cell editor composes the chrome-less Select", () => {
  afterEach(cleanup);

  it("mounts the Select primitive with chrome='none' on its native trigger, named after its column", async () => {
    const { container } = mount();
    const { select } = await openFirstEditor(container);
    expect(select.getAttribute("data-part")).toBe("trigger");
    expect(select.getAttribute("data-chrome")).toBe("none");
    expect(select.getAttribute("aria-label")).toBe("Tier");
    expect(select).toHaveValue("free");
    expect(select.closest(".ds-select-shell.ds-select-shell--modern.ds-data-table__editor-control")).not.toBeNull();
    expect(select.closest('[data-part="editor-shell"]')).not.toBeNull();
    expect(container.querySelector('[data-part="editor-input"]')).toBeNull();
  });

  it("commits the picked option on Enter and returns focus to the row", async () => {
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    const { select, row } = await openFirstEditor(container);
    fireEvent.change(select, { target: { value: "pro" } });
    fireEvent.keyDown(select, { key: "Enter" });
    await waitFor(() => expect(onCellEdit).toHaveBeenCalledWith(ROWS[0], "tier", "pro", "free"));
    await waitFor(() => expect(document.activeElement).toBe(row));
  });

  it("cancels on Escape without saving, and keeps the key inside the cell", async () => {
    const onCellEdit = vi.fn();
    const onRowClick = vi.fn();
    const { container } = mount({ onCellEdit, onRowClick });
    const { select, row } = await openFirstEditor(container);
    fireEvent.change(select, { target: { value: "pro" } });
    fireEvent.keyDown(select, { key: "Escape" });
    await waitFor(() => expect(container.querySelector('td[data-editing="true"]')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("is the markup the chrome-none gate measures as the editor host", () => {
    const host = ROSTER.hosts.find((entry: { id: string }) => entry.id === "data-table-editor-select");
    const { container } = render(
      <InlineCellEditor value="a" row={{}} columnKey="status" columnLabel="Status" config={{ type: "select", options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }] }} onSave={() => {}} onCancel={() => {}} />,
    );
    expect(container.innerHTML).toBe(host.markup);
  });

  it("paints only chrome on the trigger, above the bridge neutraliser, with no focus channel (A1, H2, H3)", () => {
    const CHROME = /^(padding|padding-.+|background|background-.+|border|border-(?!.*radius).+|color)$/;
    const rules = hostRules();
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.selector.startsWith(ABOVE_NEUTRALISER), rule.selector).toBe(true);
      rule.walkDecls((decl) => expect(decl.prop, `${rule.selector} { ${decl.prop} }`).toMatch(CHROME));
    }
    const frame = rules.find((rule) => rule.selector === ABOVE_NEUTRALISER);
    expect(frame?.nodes.some((node) => node.type === "decl" && node.prop === "border")).toBe(true);
    expect(mobileSkin).not.toMatch(/select\[data-chrome='none'\]/);
    expect(modernSkin).not.toMatch(/\[data-part='trigger'\]/);
    const wrapper = postcss.parse(modernSkin).nodes.find(
      (node): node is postcss.Rule => node.type === "rule" && node.selector.trim().endsWith(".ds-data-table__editor-control"),
    )!;
    const channels = new Map<string, string>();
    wrapper.walkDecls((decl) => {
      channels.set(decl.prop, decl.value);
    });
    expect(channels.get("--ds-select-trigger-sm-font-size")).toContain("--ds-data-table-editor-input-font-size");
    expect(channels.get("--ds-select-trigger-sm-line-height")).toContain("--ds-data-table-editor-input-line-height");
    expect(channels.get("--ds-select-radius")).toBe("var(--ds-radius-sm, 6px)");
  });

  it("restates the Select's forced-colours state arms it outranks: the 2px error edge and the disabled system ink (H6)", () => {
    const forced = hostRules().filter(inForced);
    const value = (state: string, prop: string) =>
      forced.find((rule) => rule.selector.endsWith(state))?.nodes.find((node): node is postcss.Declaration => node.type === "decl" && node.prop === prop)?.value;
    const kept = (selector: string, prop: string) => {
      let found: string | undefined;
      postcss.parse(selectSkin).walkRules((rule) => {
        if (inForced(rule) && rule.selectors.includes(selector)) rule.walkDecls(prop, (decl) => { found = decl.value; });
      });
      return found;
    };
    const root = ".ds-select-shell.ds-select-shell--modern[data-part='root']";
    expect(value("[data-status='error']", "border-width")).toBe(kept(`${root} [data-part='trigger'][data-status='error']`, "border-width"));
    expect(value("[data-disabled='true']", "color")).toBe(kept(`${root} [data-part='trigger'][data-disabled='true']`, "color"));
    expect(value("[data-disabled='true']", "border-color")).toBe(kept(`${root} [data-part='trigger'][data-disabled='true']`, "border-color"));
    expect(value("[data-status='error']", "border-width")).toBe("2px");
  });
});
