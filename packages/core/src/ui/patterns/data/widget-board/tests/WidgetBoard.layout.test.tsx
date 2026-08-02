import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import { WidgetBoardEngine } from "../engines/foundation";

const labels: WidgetBoardLabels = {
  context: "Role workspace",
  heading: "Decision cockpit",
  customize: "Customize",
  done: "Done",
  addWidget: "Add widget",
  reset: "Reset",
  emptyCatalog: "Empty",
  editHint: "Editing",
  readHint: "Reading",
  move: "Move",
  resize: "Resize",
  resizeWidth: "Resize width",
  resizeHeight: "Resize height",
  autoHeight: "Automatic height",
  remove: "Remove",
};

function item(
  id: string,
  size: WidgetBoardItem["size"],
  order: number
): WidgetBoardItem {
  return {
    id,
    size,
    order,
    visible: true,
    title: id,
    accessibleTitle: id,
    content: <span>{id}</span>,
  };
}

describe("WidgetBoard product layout", () => {
  it("renders a localized board header with semantic icon and actions", () => {
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("one", "md", 0)]}
        editable
      />
    );

    expect(
      container.querySelector('[data-part="toolbar"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-part="toolbar-icon"] svg')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-part="toolbar-context"]')
    ).toHaveTextContent("Role workspace");
    expect(
      container.querySelector('[data-part="toolbar-title"]')
    ).toHaveTextContent("Decision cockpit");
    expect(
      container.querySelector('[data-part="toolbar-actions"]')
    ).toBeInTheDocument();
  });

  it("owns a consistent optional header anatomy without constraining custom content", () => {
    const headed = {
      ...item("decision", "md", 0),
      title: "Decision readiness",
      header: {
        eyebrow: "Intelligence",
        icon: <span data-testid="widget-icon">I</span>,
        supporting: "Nine sources verified",
        accessory: <span data-testid="widget-accessory">92</span>,
      },
    } satisfies WidgetBoardItem;
    const plain = item("plain", "md", 1);

    const { container, getByTestId } = render(
      <WidgetBoardEngine labels={labels} items={[headed, plain]} />
    );

    const headers = container.querySelectorAll('[data-part="item-header"]');
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("Intelligence");
    expect(headers[0]).toHaveTextContent("Decision readiness");
    expect(headers[0]).toHaveTextContent("Nine sources verified");
    expect(getByTestId("widget-icon")).toBeInTheDocument();
    expect(getByTestId("widget-accessory")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-part="cell"]')).toHaveLength(2);
  });

  it("keeps stored widget sizes honest instead of silently stretching the last cell", () => {
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[
          item("large", "lg", 0),
          item("medium", "md", 1),
          item("small", "sm", 2),
        ]}
      />
    );

    const cells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="cell"]')
    );
    // C2b deliberate re-pin: the retired inline packer wrapped the sm to a
    // new row, stranding columns 11-12 forever (defect d). The shared solver
    // bends the trailing widget INSIDE its declared min/max range
    // (shrink-to-min policy, reason-coded) so the row completes.
    expect(cells.map((cell) => cell.style.gridColumn)).toEqual([
      "1 / span 6",
      "7 / span 4",
      "11 / span 2",
    ]);
  });

  it("keeps four small widgets in one balanced 3/3/3/3 row", () => {
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[
          item("one", "sm", 0),
          item("two", "sm", 1),
          item("three", "sm", 2),
          item("four", "sm", 3),
        ]}
      />
    );

    const cells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="cell"]')
    );
    expect(cells.map((cell) => cell.style.gridColumn)).toEqual([
      "1 / span 3",
      "4 / span 3",
      "7 / span 3",
      "10 / span 3",
    ]);
  });

  it("completes rows in DOM order instead of backfilling a later widget above its predecessors", () => {
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[
          item("priority", "lg", 0),
          item("pipeline", "wide", 1),
          item("queue", "lg", 2),
        ]}
      />
    );

    const cells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="cell"]')
    );
    // C2b deliberate re-pin (reviewed, not silent): the legacy packer
    // floated `queue` ABOVE `pipeline` visually (visual ≠ DOM/focus order —
    // defect c). The solver keeps strict reading order: `pipeline` (wide,
    // min 6) shrinks within its range to complete row 1 beside `priority`,
    // and `queue` grows alone on row 2 — zero dead space, zero reorder.
    expect(cells.map((cell) => cell.style.gridColumn)).toEqual([
      "1 / span 6",
      "7 / span 6",
      "1 / span 8",
    ]);
    expect(cells.map((cell) => cell.style.gridRow)).toEqual([
      "1 / span 1",
      "1 / span 1",
      "2 / span 1",
    ]);
  });

  it("lets the narrow CSS contract own the single-column layout", () => {
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("one", "lg", 0)]}
        narrow
      />
    );

    expect(container.querySelector('[data-part="grid"]')).toHaveAttribute(
      "data-narrow",
      "true"
    );
    expect(
      container.querySelector<HTMLElement>('[data-part="cell"]')?.style
        .gridColumn
    ).toBe("");
  });

  it("offers a rich add catalog and a keyboard-operable edge resize handle", async () => {
    const onItemsChange = vi.fn();
    const visible = item("pipeline", "lg", 0);
    const hidden = {
      ...item("velocity", "md", 1),
      visible: false,
      catalog: {
        category: "Intelligence",
        description: "Shows pipeline velocity and delayed transitions.",
        preview: <span>4.2 days</span>,
        recommended: true,
      },
    } satisfies WidgetBoardItem;
    const richLabels: WidgetBoardLabels = {
      ...labels,
      catalogHeading: "Add an operational widget",
      catalogDescription: "Choose the view that improves this workspace.",
      recommended: "Recommended",
      sizeNames: {
        sm: "Compact",
        md: "Medium",
        lg: "Half width",
        wide: "Full width",
      },
    };
    const { container, findByRole, findByText } = render(
      <WidgetBoardEngine
        labels={richLabels}
        items={[visible, hidden]}
        editable
        defaultEditing
        defaultCatalogOpen
        onItemsChange={onItemsChange}
      />
    );

    // The editing cell carries a tooltip-wrapped control whose locale observer
    // reacts to the board's own post-mount layout mutations; those deliveries
    // are microtasks, so each one is drained inside act right after the render
    // or interaction that queued it, before any query flips the act flag.
    await act(async () => {});

    expect(
      await findByText(richLabels.catalogHeading as string)
    ).toBeInTheDocument();
    expect(
      await findByText("Shows pipeline velocity and delayed transitions.")
    ).toBeInTheDocument();
    expect(await findByText("4.2 days")).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-part="resize-handle"]')
    ).toHaveLength(8);

    const resizeHandle = await findByRole("separator", {
      name: `${labels.resizeWidth}: pipeline`,
    });
    expect(resizeHandle).toHaveAttribute("aria-orientation", "vertical");
    expect(resizeHandle).toHaveAttribute("aria-valuemin", "0");
    expect(resizeHandle).toHaveAttribute("aria-valuemax", "3");
    expect(resizeHandle).toHaveAttribute("aria-valuenow", "2");
    fireEvent.keyDown(resizeHandle, { key: "ArrowLeft" });
    await act(async () => {});
    expect(onItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "pipeline", size: "md" }),
      ])
    );

    const heightHandle = await findByRole("separator", {
      name: `${labels.resizeHeight}: pipeline`,
    });
    expect(heightHandle).toHaveAttribute("aria-orientation", "horizontal");
    fireEvent.keyDown(heightHandle, { key: "ArrowUp" });
    await act(async () => {});
    expect(onItemsChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "pipeline", height: 220 }),
      ])
    );
  });

  it("resizes width and height together from a physical corner", async () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("pipeline", "lg", 0)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    const grid = container.querySelector<HTMLElement>('[data-part="grid"]');
    const cell = container.querySelector<HTMLElement>('[data-part="cell"]');
    const corner = container.querySelector<HTMLElement>(
      '[data-edge="block-end-inline-end"]'
    );
    // The six pointer-only edges stay out of the accessibility tree; width and
    // height keep their own keyboard-operable separators.
    expect(corner).toHaveAttribute("aria-hidden", "true");
    expect(corner).not.toHaveAttribute("role");
    expect(grid).not.toBeNull();
    expect(cell).not.toBeNull();
    expect(corner).not.toBeNull();
    if (!grid || !cell || !corner) return;

    grid.getBoundingClientRect = () =>
      ({
        width: 1200,
        height: 800,
        top: 0,
        right: 1200,
        bottom: 800,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    cell.getBoundingClientRect = () =>
      ({
        width: 600,
        height: 240,
        top: 0,
        right: 600,
        bottom: 240,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

    fireEvent.pointerDown(corner, {
      pointerId: 7,
      clientX: 600,
      clientY: 240,
    });
    fireEvent.pointerMove(window, {
      pointerId: 7,
      clientX: 1000,
      clientY: 360,
    });
    fireEvent.pointerUp(window, {
      pointerId: 7,
      clientX: 1000,
      clientY: 360,
    });

    await waitFor(() =>
      expect(onItemsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "pipeline",
            size: "wide",
            height: 360,
          }),
        ])
      )
    );
  });

  it("previews neighbouring reflow from the full pointer drag surface and persists on release", async () => {
    const onItemsChange = vi.fn();
    const { container, getByRole } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("one", "lg", 0), item("two", "lg", 1)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    const move = getByRole("button", { name: `${labels.move}: one` });
    const grid = container.querySelector<HTMLElement>('[data-part="grid"]');
    const initialCells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-part="cell"]')
    );
    expect(grid).not.toBeNull();
    expect(initialCells).toHaveLength(2);
    if (!grid || initialCells.length !== 2) return;

    grid.getBoundingClientRect = () =>
      ({
        width: 1000,
        height: 320,
        top: 0,
        right: 1000,
        bottom: 320,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    initialCells[0].getBoundingClientRect = () =>
      ({
        width: 490,
        height: 300,
        top: 0,
        right: 490,
        bottom: 300,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    initialCells[1].getBoundingClientRect = () =>
      ({
        width: 490,
        height: 300,
        top: 0,
        right: 1000,
        bottom: 300,
        left: 510,
        x: 510,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);

    fireEvent.pointerDown(move, {
      pointerId: 13,
      clientX: 32,
      clientY: 20,
    });
    fireEvent.pointerMove(window, {
      pointerId: 13,
      clientX: 760,
      clientY: 100,
    });

    await waitFor(() => {
      const cells = Array.from(
        container.querySelectorAll<HTMLElement>('[data-part="cell"]')
      );
      expect(cells.map((cell) => cell.dataset.widgetId)).toEqual([
        "two",
        "one",
      ]);
    });
    expect(onItemsChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(window, {
      pointerId: 13,
      clientX: 760,
      clientY: 100,
    });
    expect(onItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "two", order: 0 }),
        expect.objectContaining({ id: "one", order: 1 }),
      ])
    );
  });

  it("marks the region busy while loading so assistive tech hears the state", () => {
    const { container, getByRole } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("one", "md", 0)]}
        editable
        loading
      />
    );

    const root = container.querySelector('[data-part="root"]');
    expect(root).toHaveAttribute("data-loading", "true");
    expect(root).toHaveAttribute("aria-busy", "true");
    // The heading gives the region its accessible name.
    expect(
      getByRole("region", { name: "Decision cockpit" })
    ).toBeInTheDocument();
  });

  it("renders the consumer empty state when no widget is visible", () => {
    const { container, getByText } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[{ ...item("one", "md", 0), visible: false }]}
        emptyState={<span>No widgets yet</span>}
      />
    );

    expect(
      container.querySelector('[data-part="empty-state"]')
    ).toBeInTheDocument();
    expect(getByText("No widgets yet")).toBeInTheDocument();
    expect(container.querySelector('[data-part="grid"]')).toBeNull();
  });

  it("drops pointer-only chrome in the narrow mobile composition", () => {
    const { container, queryByRole } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("one", "lg", 0)]}
        editable
        defaultEditing
        narrow
      />
    );

    // The move control stays (it is the keyboard/pointer reorder channel)
    // but the eight edge resize handles are a wide-board affordance.
    expect(
      container.querySelectorAll('[data-part="resize-handle"]')
    ).toHaveLength(0);
    expect(queryByRole("separator")).toBeNull();
    expect(container.querySelector('[data-part="grid"]')).toHaveAttribute(
      "data-narrow",
      "true"
    );
  });
});
