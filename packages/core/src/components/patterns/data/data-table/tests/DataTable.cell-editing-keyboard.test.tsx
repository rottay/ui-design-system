import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PatternDataTable } from "..";
import type { ColumnDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import type { DataTablePatternProps } from "../contracts";
import { renderWithEngine } from "@tests/support/engine";

// Inline cell editing is operable from the keyboard: F2 on the focused row
// opens the editor, and an editor that closes while it holds focus hands focus
// back to its row instead of dropping it on <body>.

interface Row {
  id: string;
  name: string;
  tier: string;
  note: string;
}

const ROWS: Row[] = [
  { id: "r1", name: "Alpha", tier: "free", note: "first" },
  { id: "r2", name: "Bravo", tier: "pro", note: "second" },
];

const EDITABLE: ColumnDef<Row>[] = [
  { key: "id", header: "Id", accessorKey: "id" },
  { key: "name", header: "Name", accessorKey: "name", editable: { type: "text" } },
  { key: "tier", header: "Tier", accessorKey: "tier", editable: { type: "text" } },
  { key: "note", header: "Note", accessorKey: "note" },
];

const READ_ONLY: ColumnDef<Row>[] = EDITABLE.map(({ editable: _editable, ...column }) => column);

function mount(props: Partial<DataTablePatternProps<Row>> = {}, columns = EDITABLE) {
  return renderWithEngine(
    <>
      <button type="button">outside</button>
      <PatternDataTable<Row> engine="modern" data={ROWS} rowKey="id" columns={columns} {...props} />
    </>,
    "modern",
  );
}

async function bodyRow(container: HTMLElement, index = 0): Promise<HTMLTableRowElement> {
  return waitFor(() => {
    const row = container.querySelectorAll<HTMLTableRowElement>('[data-part="body-row"]')[index];
    expect(row).toBeDefined();
    return row!;
  });
}

async function focusRowByKeyboard(
  user: ReturnType<typeof userEvent.setup>,
  row: HTMLTableRowElement,
): Promise<void> {
  for (let presses = 0; presses < 20 && document.activeElement !== row; presses += 1) {
    await user.tab();
  }
  expect(document.activeElement).toBe(row);
}

async function focusedEditor(container: HTMLElement): Promise<HTMLInputElement> {
  return waitFor(() => {
    const editor = container.querySelector<HTMLInputElement>('td[data-editing="true"] .ds-data-table__editor-control input');
    expect(editor).not.toBeNull();
    expect(document.activeElement).toBe(editor);
    return editor!;
  });
}

async function editorClosed(container: HTMLElement): Promise<void> {
  await waitFor(() => expect(container.querySelector('td[data-editing="true"]')).toBeNull());
}

function editingColumn(container: HTMLElement): string | undefined {
  const cell = container.querySelector('td[data-editing="true"]');
  const index = cell ? Number(cell.getAttribute("aria-colindex")) - 1 : -1;
  return EDITABLE[index]?.key;
}

describe("DataTable modern -- inline cell editing from the keyboard", () => {
  afterEach(cleanup);

  it("opens the editor of the row's first editable cell on F2 and focuses its control", async () => {
    const user = userEvent.setup();
    const onCellEditStart = vi.fn();
    const { container } = mount({ onCellEditStart });
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);

    await user.keyboard("{F2}");
    const editor = await focusedEditor(container);

    expect(editor.value).toBe("Alpha");
    expect(editingColumn(container)).toBe("name");
    expect(onCellEditStart).toHaveBeenCalledWith(ROWS[0], "name");
  });

  it("skips a cell the row may not edit and opens the next editable one", async () => {
    const user = userEvent.setup();
    const columns = EDITABLE.map((column) =>
      column.key === "name" ? { ...column, editable: { type: "text" as const, canEdit: () => false } } : column,
    );
    const { container } = mount({}, columns);
    await focusRowByKeyboard(user, await bodyRow(container));

    await user.keyboard("{F2}");
    await focusedEditor(container);

    expect(editingColumn(container)).toBe("tier");
  });

  it("commits on Enter and returns focus to the row, stamped as the focused node", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);
    await user.keyboard("{F2}");
    const editor = await focusedEditor(container);

    await user.clear(editor);
    await user.type(editor, "Renamed{Enter}");
    await editorClosed(container);

    expect(onCellEdit).toHaveBeenCalledWith(ROWS[0], "name", "Renamed", "Alpha");
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(document.activeElement).not.toBe(document.body);
    expect(row.getAttribute("data-state")?.split(" ")).toEqual(
      expect.arrayContaining(["focused", "focus-visible"]),
    );
  });

  it("cancels on Escape and returns focus to the row", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    const onCellEditCancel = vi.fn();
    const { container } = mount({ onCellEdit, onCellEditCancel });
    const row = await bodyRow(container, 1);
    await focusRowByKeyboard(user, await bodyRow(container));
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(row));
    await user.keyboard("{F2}");
    await focusedEditor(container);

    await user.keyboard("{Escape}");
    await editorClosed(container);

    expect(onCellEdit).not.toHaveBeenCalled();
    expect(onCellEditCancel).toHaveBeenCalledWith(ROWS[1], "name");
    await waitFor(() => expect(document.activeElement).toBe(row));
    expect(row.getAttribute("data-state")?.split(" ")).toEqual(
      expect.arrayContaining(["focused", "focus-visible"]),
    );
    expect((await bodyRow(container)).getAttribute("data-state") ?? "").not.toContain("focus");
  });

  it("moves to the next editable cell on Tab, and past the last one commits and returns to the row", async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    const { container } = mount({ onCellEdit });
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);
    await user.keyboard("{F2}");
    await focusedEditor(container);

    await user.keyboard("{Tab}");
    await waitFor(() => expect(editingColumn(container)).toBe("tier"));
    const second = await focusedEditor(container);
    expect(second.value).toBe("free");

    await user.keyboard("{Tab}");
    await editorClosed(container);

    expect(onCellEdit).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(document.activeElement).toBe(row));
  });

  it("returns focus to the row in the controlled mode too", async () => {
    const user = userEvent.setup();
    function Controlled(): React.ReactElement {
      const [editingCell, setEditingCell] = React.useState<{ rowKey: string; columnKey: string } | null>(null);
      return (
        <PatternDataTable<Row>
          engine="modern"
          data={ROWS}
          rowKey="id"
          columns={EDITABLE}
          editingCell={editingCell}
          onCellEditStart={(row, columnKey) => setEditingCell({ rowKey: row.id, columnKey })}
          onCellEditCancel={() => setEditingCell(null)}
        />
      );
    }
    const { container } = renderWithEngine(<Controlled />, "modern");
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);
    await user.keyboard("{F2}");
    await focusedEditor(container);

    await user.keyboard("{Escape}");
    await editorClosed(container);

    await waitFor(() => expect(document.activeElement).toBe(row));
  });

  it("ignores F2 on a row with no editable cell", async () => {
    const user = userEvent.setup();
    const { container } = mount({}, READ_ONLY);
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);

    const allowed = fireEvent.keyDown(row, { key: "F2" });

    expect(allowed).toBe(true);
    expect(container.querySelector('[data-part="editor-shell"]')).toBeNull();
    expect(document.activeElement).toBe(row);
  });

  it("ignores F2 that comes from a control inside the row", async () => {
    const { container } = mount({ selectable: true, onSelectionChange: () => undefined });
    const row = await bodyRow(container);
    const checkbox = await waitFor(() => {
      const input = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
      expect(input).not.toBeNull();
      return input!;
    });
    act(() => checkbox.focus());

    fireEvent.keyDown(checkbox, { key: "F2" });

    expect(container.querySelector('[data-part="editor-shell"]')).toBeNull();
  });

  it("keeps Enter on a focused row as the row action and never as an edit trigger", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const { container } = mount({ onRowClick });
    const row = await bodyRow(container);
    await focusRowByKeyboard(user, row);

    await user.keyboard("{Enter}");

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0], 0);
    expect(container.querySelector('[data-part="editor-shell"]')).toBeNull();
    cleanup();

    const plain = mount();
    const plainRow = await bodyRow(plain.container);
    await focusRowByKeyboard(user, plainRow);
    await user.keyboard("{Enter}");
    expect(plain.container.querySelector('[data-part="editor-shell"]')).toBeNull();
  });

  it("does not pull focus back when the edit ends after focus already left the editor", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = mount();
    const cell = await waitFor(() => {
      const editable = container.querySelector<HTMLElement>('td[data-editable="true"]');
      expect(editable).not.toBeNull();
      return editable!;
    });
    await user.dblClick(cell);
    await focusedEditor(container);

    const outside = getByRole("button", { name: "outside" });
    await user.click(outside);
    expect(document.activeElement).toBe(outside);
    const otherRow = await bodyRow(container, 1);
    fireEvent.doubleClick(otherRow.querySelector("td:not([data-editable])") as HTMLElement);
    await editorClosed(container);

    expect(document.activeElement).toBe(outside);
  });
});
