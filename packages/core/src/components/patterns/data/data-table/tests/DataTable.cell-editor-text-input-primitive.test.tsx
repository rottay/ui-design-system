import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import postcss from "postcss";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PatternDataTable } from "..";
import type { ColumnDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps } from "../contracts";
import { renderWithEngine } from "@tests/support/engine";

const CSS = join(__dirname, "../../../../../foundation/tokens/css");
const modernSkin = readFileSync(join(CSS, "runtime/engines/modern/skin/data-table/index.css"), "utf8");
const mobileSkin = readFileSync(join(CSS, "presentation/components/skin/data-table-mobile/index.css"), "utf8");

interface Row { id: string; name: string; tier: string }
const ROWS: Row[] = [{ id: "r1", name: "Alpha", tier: "free" }, { id: "r2", name: "Bravo", tier: "pro" }];
const COLUMNS: ColumnDef<Row>[] = [
  { key: "id", header: "Id", accessorKey: "id" },
  { key: "name", header: "Name", accessorKey: "name", editable: { type: "text" } },
  { key: "tier", header: "Tier", accessorKey: "tier", editable: { type: "text" } },
];

function mount(props: Partial<DataTablePatternProps<Row>> = {}) {
  return renderWithEngine(
    <>
      <button type="button">outside</button>
      <PatternDataTable<Row> engine="modern" data={ROWS} rowKey="id" columns={COLUMNS} {...props} />
    </>,
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
  const input = await waitFor(() => {
    const el = container.querySelector<HTMLInputElement>('td[data-editing="true"] .ds-data-table__editor-control input');
    expect(el).not.toBeNull();
    expect(document.activeElement).toBe(el);
    return el!;
  });
  return { user, row, input };
}

describe("DataTable modern -- the text cell editor composes the chrome-less Input", () => {
  afterEach(cleanup);

  it("mounts the Input primitive with chrome='none' inside the editor shell, named after its column", async () => {
    const { container } = mount();
    const { input } = await openFirstEditor(container);
    expect(input).toHaveClass("ds-input-shell", "ds-input-shell--modern");
    expect(input.getAttribute("data-chrome")).toBe("none");
    expect(input.getAttribute("aria-label")).toBe("Name");
    expect(input.closest('.ds-input-field[data-chrome="none"].ds-data-table__editor-control')).not.toBeNull();
    expect(input.closest('[data-part="editor-shell"]')).not.toBeNull();
    expect(input.hasAttribute("data-part") && input.getAttribute("data-part") === "editor-input").toBe(false);
  });

  it("commits on Enter through the Input's submit intent and returns focus to the row", async () => {
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    const { user, row, input } = await openFirstEditor(container);
    await user.clear(input);
    await user.type(input, "Renamed{Enter}");
    await waitFor(() => expect(onCellEdit).toHaveBeenCalledWith(ROWS[0], "name", "Renamed", "Alpha"));
    await waitFor(() => expect(document.activeElement).toBe(row));
  });

  it("does not commit an Enter that confirms an IME candidate, and keeps it inside the cell", async () => {
    const onCellEdit = vi.fn();
    const onRowClick = vi.fn();
    const { container } = mount({ onCellEdit, onRowClick });
    const { input } = await openFirstEditor(container);
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(container.querySelector('td[data-editing="true"]')).not.toBeNull();
    expect(document.activeElement).toBe(input);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("cancels on Escape", async () => {
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    const { user, row } = await openFirstEditor(container);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(container.querySelector('td[data-editing="true"]')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(onCellEdit).not.toHaveBeenCalled();
  });

  it("paints only chrome properties on the Input and chooses its type and radius through the Input's channels (A1, H3)", () => {
    const CHROME = /^(padding|padding-.+|background|background-.+|border|border-(?!.*radius).+|color|min-block-size|block-size)$/;
    const hostRules: postcss.Rule[] = [];
    for (const css of [modernSkin, mobileSkin]) {
      postcss.parse(css).walkRules((rule) => {
        if (rule.selector.includes(".ds-data-table__editor-control")) hostRules.push(rule);
      });
    }
    const onControl = hostRules.filter((rule) => /\.ds-input-shell--modern\[data-chrome='none'\]/.test(rule.selector));
    expect(onControl.length).toBeGreaterThan(0);
    for (const rule of onControl) {
      rule.walkDecls((decl) => expect(decl.prop, `${rule.selector} { ${decl.prop} }`).toMatch(CHROME));
    }
    const wrapper = hostRules.find((rule) => rule.selector.trim().endsWith(".ds-data-table__editor-control"));
    const channels: Record<string, string> = {};
    wrapper!.walkDecls((decl) => {
      channels[decl.prop] = decl.value;
    });
    expect(Object.keys(channels).sort()).toEqual([
      "--ds-input-sm-font-size",
      "--ds-input-sm-line-height",
      "--ds-input-sm-radius",
      "--ds-select-radius",
      "--ds-select-trigger-sm-font-size",
      "--ds-select-trigger-sm-line-height",
    ]);
    expect(channels["--ds-input-sm-font-size"]).toContain("--ds-data-table-editor-input-font-size");
    expect(channels["--ds-input-sm-line-height"]).toContain("--ds-data-table-editor-input-line-height");
  });
});
