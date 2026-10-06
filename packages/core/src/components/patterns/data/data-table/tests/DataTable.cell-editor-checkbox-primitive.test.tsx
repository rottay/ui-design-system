import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PatternDataTable } from "..";
import type { ColumnDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps } from "../contracts";
import { renderWithEngine } from "@tests/support/engine";

const CSS = join(__dirname, "../../../../../foundation/tokens/css");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const modernSkin = stripComments(readFileSync(join(CSS, "runtime/engines/modern/skin/data-table/index.css"), "utf8"));
const mobileSkin = stripComments(readFileSync(join(CSS, "presentation/components/skin/data-table-mobile/index.css"), "utf8"));

interface Row { id: string; active: boolean; tier: string }
const ROWS: Row[] = [
  { id: "r1", active: false, tier: "free" },
  { id: "r2", active: true, tier: "pro" },
];
const COLUMNS: ColumnDef<Row>[] = [
  { key: "id", header: "Id", accessorKey: "id" },
  { key: "active", header: "Active", accessorKey: "active", editable: { type: "checkbox" } },
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

async function bodyRow(container: HTMLElement) {
  return waitFor(() => {
    const row = container.querySelector<HTMLTableRowElement>('[data-part="body-row"]');
    expect(row).not.toBeNull();
    return row!;
  });
}

async function focusRow(user: ReturnType<typeof userEvent.setup>, row: HTMLTableRowElement) {
  for (let presses = 0; presses < 20 && document.activeElement !== row; presses += 1) await user.tab();
  expect(document.activeElement).toBe(row);
}

async function focusedCheckbox(container: HTMLElement) {
  return waitFor(() => {
    const box = container.querySelector<HTMLInputElement>('td[data-editing="true"] input[type="checkbox"]');
    expect(box).not.toBeNull();
    expect(document.activeElement).toBe(box);
    return box!;
  });
}

describe("DataTable modern -- the checkbox cell editor composes the Checkbox primitive", () => {
  afterEach(cleanup);

  it("opens on F2 with focus on the primitive's control, named after its column", async () => {
    const user = userEvent.setup();
    const { container } = mount();
    await focusRow(user, await bodyRow(container));

    await user.keyboard("{F2}");
    const box = await focusedCheckbox(container);

    expect(box.getAttribute("aria-label")).toBe("Active");
    expect(box.closest(".ds-checkbox.ds-checkbox--modern")).not.toBeNull();
    expect(box.closest(".ds-data-table__editor-checkbox")).not.toBeNull();
    expect(box.closest('[data-part="editor-shell"]')).not.toBeNull();
    expect(container.querySelector('[data-part="editor-checkbox"]')).toBeNull();
  });

  it("toggles with Space and saves the new value", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    await focusRow(user, await bodyRow(container));
    await user.keyboard("{F2}");
    await focusedCheckbox(container);

    await user.keyboard(" ");

    await waitFor(() => expect(onCellEdit).toHaveBeenCalledWith(ROWS[0], "active", true, false));
  });

  it("cancels on Escape and returns focus to the row", async () => {
    const user = userEvent.setup();
    const { container } = mount();
    const row = await bodyRow(container);
    await focusRow(user, row);
    await user.keyboard("{F2}");
    await focusedCheckbox(container);

    await user.keyboard("{Escape}");

    await waitFor(() => expect(container.querySelector('td[data-editing="true"]')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(row));
  });

  it("moves to the next editable cell on Tab", async () => {
    const user = userEvent.setup();
    const { container } = mount();
    await focusRow(user, await bodyRow(container));
    await user.keyboard("{F2}");
    await focusedCheckbox(container);

    await user.keyboard("{Tab}");

    await waitFor(() => {
      const editor = container.querySelector<HTMLInputElement>('td[data-editing="true"] [data-part="editor-input"]');
      expect(editor).not.toBeNull();
      expect(editor!.value).toBe("free");
    });
  });

  it("hands the table's governed checkbox size to the primitive's size channel at the className landing", () => {
    expect(modernSkin).toMatch(
      /\.ds-pattern-data-table\.ds-engine-modern \.ds-data-table__editor-checkbox \{[^}]*--ds-checkbox-sm-size: calc\(var\(--ds-data-table-editor-checkbox-size, var\(--ds-spacing-4, 1rem\)\) \/ var\(--ds-density-effective-scale, 1\)\);/,
    );
    for (const skin of [modernSkin, mobileSkin]) {
      expect(skin).not.toMatch(/editor-checkbox"/);
    }
  });
});
