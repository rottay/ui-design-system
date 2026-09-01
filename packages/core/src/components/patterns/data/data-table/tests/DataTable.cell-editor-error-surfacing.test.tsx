import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";

import { PatternDataTable } from "..";
import type { ColumnDef } from "../../../../../foundation/contracts/runtime/components/patterns/core";
import { renderWithEngine } from "@tests/support/engine";

// Every InlineCellEditor type shares one error contract: a rejected save must
// render `[data-part="editor-error"]`, and a new value must clear a stale one.

interface Row {
  id: string;
  name: string;
  enabled: boolean;
  tier: string;
}

const ROWS: Row[] = [
  { id: "r1", name: "Alpha", enabled: false, tier: "free" },
  { id: "r2", name: "Bravo", enabled: false, tier: "free" },
];

async function openEditor(
  container: HTMLElement,
  part: string,
): Promise<HTMLElement> {
  const cell = await waitFor(() => {
    const el = container.querySelector('td[data-editable="true"]');
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
  fireEvent.doubleClick(cell);
  return await waitFor(() => {
    const el = container.querySelector(`[data-part="${part}"]`);
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
}

describe("InlineCellEditor error surfacing (modern)", () => {
  afterEach(cleanup);

  it("renders the rejected checkbox save as an announced editor-error", async () => {
    const columns: ColumnDef<Row>[] = [
      {
        key: "enabled",
        header: "Enabled",
        accessorKey: "enabled",
        editable: {
          type: "checkbox",
          validate: (value) =>
            value === true ? "Cannot enable this row" : null,
        },
      },
      { key: "name", header: "Name", accessorKey: "name" },
    ];

    const { container } = renderWithEngine(
      <PatternDataTable<Row>
        engine="modern"
        data={ROWS}
        rowKey="id"
        columns={columns}
      />,
      "modern",
    );

    const checkbox = (await openEditor(
      container,
      "editor-checkbox",
    )) as HTMLInputElement;
    expect(container.querySelector('[data-part="editor-error"]')).toBeNull();
    expect(checkbox.getAttribute("aria-invalid")).toBeNull();

    fireEvent.click(checkbox);

    // Before the fix the validation error was set in state and never rendered:
    // the toggle appeared to succeed and nothing reached assistive tech.
    const alert = await waitFor(() => {
      const el = container.querySelector('[data-part="editor-error"]');
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.textContent).toBe("Cannot enable this row");
    expect(checkbox.getAttribute("aria-invalid")).toBe("true");
  });

  it("clears a stale select validation error when another option is picked", async () => {
    const columns: ColumnDef<Row>[] = [
      {
        key: "tier",
        header: "Tier",
        accessorKey: "tier",
        editable: {
          type: "select",
          options: [
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
          ],
          validate: (value) => (value === "pro" ? "Pro is unavailable" : null),
        },
      },
      { key: "name", header: "Name", accessorKey: "name" },
    ];

    const { container } = renderWithEngine(
      <PatternDataTable<Row>
        engine="modern"
        data={ROWS}
        rowKey="id"
        columns={columns}
      />,
      "modern",
    );

    const select = (await openEditor(
      container,
      "editor-input",
    )) as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "pro" } });
    fireEvent.keyDown(select, { key: "Enter" });

    await waitFor(() => {
      expect(
        container.querySelector('[data-part="editor-error"]')?.textContent,
      ).toBe("Pro is unavailable");
    });
    expect(select.getAttribute("data-invalid")).toBe("true");

    // Before the fix the select's onChange left the error mounted, so the
    // message and aria-invalid described a value the user had already replaced.
    fireEvent.change(select, { target: { value: "free" } });

    await waitFor(() => {
      expect(container.querySelector('[data-part="editor-error"]')).toBeNull();
    });
    expect(select.getAttribute("data-invalid")).toBe("false");
    expect(select.getAttribute("aria-invalid")).toBeNull();
  });
});
