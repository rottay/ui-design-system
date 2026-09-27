/**
 * The Modern catalog grid is one component type for every preset: a posture-driven minItem
 * change re-renders the catalog in place, so focus and local state inside it survive.
 */
import React, { useState } from "react";
import { fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithEngineContext } from "@tests/support/engine";
import type { WidgetBoardItem, WidgetBoardLabels, WidgetBoardProps } from "../contracts";
import ModernWidgetBoard from "../engines/modern";

const labels: WidgetBoardLabels = {
  customize: "Customize",
  done: "Done",
  addWidget: "Add widget",
  reset: "Reset",
  emptyCatalog: "Empty",
  editHint: "Editing",
  readHint: "Reading",
  move: "Move",
  resize: "Resize",
  remove: "Remove",
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-testid="counter" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}

const ITEMS: WidgetBoardItem[] = [
  { id: "shown", size: "md", order: 0, visible: true, title: "shown", accessibleTitle: "shown", content: <span>shown</span> },
  {
    id: "hidden",
    size: "md",
    order: 1,
    visible: false,
    title: "hidden",
    accessibleTitle: "hidden",
    content: <span>hidden</span>,
    catalog: { preview: <Counter /> },
  },
];

const board = (props: Partial<WidgetBoardProps>) => (
  <ModernWidgetBoard labels={labels} items={ITEMS} editable defaultEditing defaultCatalogOpen {...props} />
);

describe("Modern WidgetBoard catalog -- stable identity across an adaptive preset change", () => {
  it("keeps the grid node, the focused control and local state when adapt moves minItem", async () => {
    const { rerender } = renderWithEngineContext(board({}), "modern");
    const grid = await waitFor(() => {
      const node = document.body.querySelector<HTMLElement>("[data-part='catalog-grid']");
      if (!node) throw new Error("catalog grid not found");
      return node;
    });
    expect(grid.getAttribute("data-min-item")).toBe("md");

    const counter = within(grid).getByTestId("counter");
    fireEvent.click(counter);
    fireEvent.click(counter);
    const add = within(grid).getByRole("button", { name: "Add widget: hidden" });
    add.focus();
    expect(document.activeElement).toBe(add);

    const every = { catalogMinItem: "xl" } as const;
    rerender(board({ adapt: { phone: every, tablet: every, desktop: every } }));

    await waitFor(() => expect(grid.getAttribute("data-min-item")).toBe("xl"));
    expect(document.body.querySelector("[data-part='catalog-grid']")).toBe(grid);
    expect(grid.isConnected).toBe(true);
    expect(within(grid).getByTestId("counter")).toBe(counter);
    expect(counter.textContent).toBe("2");
    expect(document.activeElement).toBe(add);
  });
});
