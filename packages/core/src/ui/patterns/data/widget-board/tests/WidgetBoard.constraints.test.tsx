import React from "react";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import { WidgetBoardEngine } from "../engines/foundation";

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
  resizeWidth: "Resize width",
  resizeHeight: "Resize height",
  autoHeight: "Automatic height",
  remove: "Remove",
};

function item(
  id: string,
  order: number,
  constraints: Partial<WidgetBoardItem> = {}
): WidgetBoardItem {
  return {
    id,
    size: "md",
    order,
    visible: true,
    title: id,
    accessibleTitle: id,
    content: <span>{id}</span>,
    ...constraints,
  };
}

function board(
  items: WidgetBoardItem[],
  onItemsChange?: (next: WidgetBoardItem[]) => void
) {
  return render(
    <WidgetBoardEngine
      labels={labels}
      items={items}
      editable
      defaultEditing
      onItemsChange={onItemsChange}
    />
  );
}

/* The move control is an engine-routed lazy Button, so every read of it must be awaited. */
const findMove = (root: HTMLElement, title: string): Promise<HTMLElement> =>
  within(root).findByLabelText(`Move: ${title}`);
const queryMove = (root: HTMLElement, title: string): HTMLElement | null =>
  within(root).queryByLabelText(`Move: ${title}`);
const queryRemove = (root: HTMLElement, title: string): HTMLElement | null =>
  within(root).queryByLabelText(`Remove: ${title}`);

/* Button.Icon is synchronous but Stack content is not, so absence is only meaningful after a
   positive lazy signal from the same board has resolved. */
const findContent = (root: HTMLElement, title: string): Promise<HTMLElement> =>
  within(root).findByText(title);

function visibleOrder(next: WidgetBoardItem[]): string[] {
  return next
    .filter((entry) => entry.visible)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.id);
}

function domOrder(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-part="cell"]')
  ).map((cell) => cell.dataset.widgetId ?? "");
}

function rect(left: number, width: number): DOMRect {
  return {
    width,
    height: 300,
    top: 0,
    right: left + width,
    bottom: 300,
    left,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function measure(container: HTMLElement, widths: number[]): void {
  const grid = container.querySelector<HTMLElement>('[data-part="grid"]');
  const cells = Array.from(
    container.querySelectorAll<HTMLElement>('[data-part="cell"]')
  );
  if (grid) grid.getBoundingClientRect = () => rect(0, 1000);
  let left = 0;
  cells.forEach((cell, index) => {
    const width = widths[index] ?? 300;
    const at = left;
    cell.getBoundingClientRect = () => rect(at, width);
    left += width + 20;
  });
}

describe("WidgetBoard constraints -- defaults parity", () => {
  it("offers move, remove and resize handles when nothing is constrained", async () => {
    const { container } = board([item("a", 0), item("b", 1)]);

    expect(await findMove(container, "a")).toBeInTheDocument();
    expect(queryRemove(container, "a")).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-part="resize-handle"]').length
    ).toBeGreaterThan(0);
  });

  it("treats an explicit true exactly like an omitted field", async () => {
    const bare = board([item("a", 0)]);
    await findMove(bare.container, "a");
    const bareHandles = bare.container.querySelectorAll(
      '[data-part="resize-handle"]'
    ).length;
    /* Unmount before the second board mounts so neither can contaminate the other's queries. */
    bare.unmount();

    const explicit = render(
      <WidgetBoardEngine
        labels={labels}
        items={[
          item("z", 0, { movable: true, removable: true, resizable: true }),
        ]}
        editable
        defaultEditing
      />
    );

    expect(await findMove(explicit.container, "z")).toBeInTheDocument();
    expect(queryRemove(explicit.container, "z")).toBeInTheDocument();
    expect(
      explicit.container.querySelectorAll('[data-part="resize-handle"]').length
    ).toBe(bareHandles);
  });

  it("still reorders by keyboard when nothing is constrained", async () => {
    const onItemsChange = vi.fn();
    const { container } = board([item("a", 0), item("b", 1)], onItemsChange);

    fireEvent.keyDown(await findMove(container, "b"), { key: "ArrowLeft" });

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(visibleOrder(onItemsChange.mock.calls[0]![0])).toEqual(["b", "a"]);
  });

  it("still reorders by pointer when nothing is constrained", async () => {
    const onItemsChange = vi.fn();
    const { container } = board([item("a", 0), item("b", 1)], onItemsChange);
    const move = await findMove(container, "a");
    measure(container, [490, 490]);

    fireEvent.pointerDown(move, { pointerId: 21, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 21, clientX: 760, clientY: 100 });
    await waitFor(() => expect(domOrder(container)).toEqual(["b", "a"]));
    fireEvent.pointerUp(window, { pointerId: 21 });

    expect(onItemsChange).toHaveBeenCalled();
    expect(visibleOrder(onItemsChange.mock.calls.at(-1)![0])).toEqual([
      "b",
      "a",
    ]);
  });
});

describe("WidgetBoard constraints -- movable false locks position", () => {
  it("renders no move control, so no shortcut or focus target exists", async () => {
    const { container } = board([
      item("locked", 0, { movable: false }),
      item("free", 1),
    ]);

    /* Await the FREE sibling's lazy control first; only then is the locked one's absence real. */
    expect(await findMove(container, "free")).toBeInTheDocument();
    expect(queryMove(container, "locked")).toBeNull();
  });

  it("emits nothing when a keyboard move would displace a locked neighbour", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [item("locked", 0, { movable: false }), item("free", 1)],
      onItemsChange
    );

    fireEvent.keyDown(await findMove(container, "free"), { key: "ArrowLeft" });

    expect(onItemsChange).not.toHaveBeenCalled();
  });
});

describe("WidgetBoard constraints -- locked items are order barriers", () => {
  it("permits a keyboard reorder that stays inside one segment", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [
        item("a", 0),
        item("b", 1),
        item("barrier", 2, { movable: false }),
        item("c", 3),
      ],
      onItemsChange
    );

    fireEvent.keyDown(await findMove(container, "b"), { key: "ArrowLeft" });

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(visibleOrder(onItemsChange.mock.calls[0]![0])).toEqual([
      "b",
      "a",
      "barrier",
      "c",
    ]);
  });

  it("emits nothing at all when a keyboard reorder would cross a barrier", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [item("a", 0), item("barrier", 1, { movable: false }), item("c", 2)],
      onItemsChange
    );

    fireEvent.keyDown(await findMove(container, "c"), { key: "ArrowLeft" });

    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("refuses a real pointer drag that lands past a barrier, leaving order and emissions untouched", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [item("a", 0), item("barrier", 1, { movable: false }), item("c", 2)],
      onItemsChange
    );
    const move = await findMove(container, "a");
    measure(container, [320, 320, 320]);

    fireEvent.pointerDown(move, { pointerId: 31, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 31, clientX: 820, clientY: 100 });
    fireEvent.pointerUp(window, { pointerId: 31 });

    await waitFor(() =>
      expect(domOrder(container)).toEqual(["a", "barrier", "c"])
    );
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("refuses a pointer drag that would land ON the barrier itself", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [item("a", 0), item("barrier", 1, { movable: false })],
      onItemsChange
    );
    const move = await findMove(container, "a");
    measure(container, [490, 490]);

    fireEvent.pointerDown(move, { pointerId: 32, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 32, clientX: 700, clientY: 100 });
    fireEvent.pointerUp(window, { pointerId: 32 });

    await waitFor(() => expect(domOrder(container)).toEqual(["a", "barrier"]));
    expect(onItemsChange).not.toHaveBeenCalled();
  });
});

describe("WidgetBoard constraints -- external ownership cancels a live gesture", () => {
  it("emits nothing when the dragged item becomes locked before release", async () => {
    const onItemsChange = vi.fn();
    const { container, rerender } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("a", 0), item("b", 1)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    const move = await findMove(container, "a");
    measure(container, [490, 490]);

    fireEvent.pointerDown(move, { pointerId: 41, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 41, clientX: 760, clientY: 100 });

    rerender(
      <WidgetBoardEngine
        labels={labels}
        items={[item("a", 0, { movable: false }), item("b", 1)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    fireEvent.pointerUp(window, { pointerId: 41 });

    await waitFor(() => expect(domOrder(container)).toEqual(["a", "b"]));
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("emits nothing when the resized item becomes non-resizable before release", async () => {
    const onItemsChange = vi.fn();
    const { container, rerender } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("a", 0), item("b", 1)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    await findMove(container, "a");
    measure(container, [490, 490]);
    const handle = container.querySelector<HTMLElement>(
      '[data-widget-id="a"] [data-part="resize-handle"][data-edge="inline-end"]'
    );
    expect(handle).not.toBeNull();

    fireEvent.pointerDown(handle as HTMLElement, {
      pointerId: 51,
      clientX: 480,
      clientY: 150,
    });
    fireEvent.pointerMove(window, { pointerId: 51, clientX: 900, clientY: 150 });

    rerender(
      <WidgetBoardEngine
        labels={labels}
        items={[item("a", 0, { resizable: false }), item("b", 1)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    fireEvent.pointerUp(window, { pointerId: 51 });

    await waitFor(() =>
      expect(
        container.querySelectorAll(
          '[data-widget-id="a"] [data-part="resize-handle"]'
        )
      ).toHaveLength(0)
    );
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(
      container.querySelector<HTMLElement>('[data-widget-id="a"]')?.dataset.size
    ).toBe("md");
  });
});

describe("WidgetBoard constraints -- removable false", () => {
  it("renders no remove control for the locked item and keeps it for the free one", async () => {
    const { container } = board([
      item("pinned", 0, { removable: false }),
      item("free", 1),
    ]);

    expect(await findMove(container, "free")).toBeInTheDocument();
    expect(queryRemove(container, "free")).toBeInTheDocument();
    expect(queryRemove(container, "pinned")).toBeNull();
  });

  it("removes only the free item when its control is actually pressed", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [item("pinned", 0, { removable: false }), item("free", 1)],
      onItemsChange
    );
    await findMove(container, "free");

    fireEvent.click(queryRemove(container, "free") as HTMLElement);

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    const emitted = onItemsChange.mock.calls[0]![0] as WidgetBoardItem[];
    expect(visibleOrder(emitted)).toEqual(["pinned"]);
    expect(emitted.find((entry) => entry.id === "free")?.visible).toBe(false);
    expect(emitted.find((entry) => entry.id === "pinned")?.visible).toBe(true);
  });
});

describe("WidgetBoard constraints -- resizable", () => {
  it("renders no resize handle when resizable is false", async () => {
    const { container } = board([item("fixed", 0, { resizable: false })]);
    await findContent(container, "fixed");

    expect(
      container.querySelectorAll(
        '[data-widget-id="fixed"] [data-part="resize-handle"]'
      )
    ).toHaveLength(0);
  });

  it("keeps block edges and drops every inline edge when inline is locked", async () => {
    const { container } = board([
      item("blockOnly", 0, { resizable: { inline: false } }),
    ]);
    await findMove(container, "blockOnly");
    const edges = Array.from(
      container.querySelectorAll(
        '[data-widget-id="blockOnly"] [data-part="resize-handle"]'
      )
    ).map((node) => node.getAttribute("data-edge"));

    expect(edges).toContain("block-end");
    expect(edges.some((edge) => edge?.includes("inline"))).toBe(false);
  });

  it("keeps inline edges and drops every block edge when block is locked", async () => {
    const { container } = board([
      item("inlineOnly", 0, { resizable: { block: false } }),
    ]);
    await findMove(container, "inlineOnly");
    const edges = Array.from(
      container.querySelectorAll(
        '[data-widget-id="inlineOnly"] [data-part="resize-handle"]'
      )
    ).map((node) => node.getAttribute("data-edge"));

    expect(edges).toContain("inline-end");
    expect(edges.some((edge) => edge?.includes("block"))).toBe(false);
  });

  it("treats an omitted axis as permitted", async () => {
    const { container } = board([
      item("partial", 0, { resizable: { inline: true } }),
    ]);
    await findMove(container, "partial");
    const edges = Array.from(
      container.querySelectorAll(
        '[data-widget-id="partial"] [data-part="resize-handle"]'
      )
    ).map((node) => node.getAttribute("data-edge"));

    expect(edges).toContain("inline-end");
    expect(edges).toContain("block-end");
  });
});

describe("WidgetBoard constraints -- a fully locked band", () => {
  it("exposes no move, remove or resize affordance while keeping its content", async () => {
    const { container } = board([
      item("band", 0, {
        movable: false,
        removable: false,
        resizable: false,
      }),
    ]);

    /* No free sibling exists here, so the band's own lazy content is the readiness signal. */
    expect(await findContent(container, "band")).toBeInTheDocument();
    expect(queryMove(container, "band")).toBeNull();
    expect(queryRemove(container, "band")).toBeNull();
    expect(
      container.querySelectorAll(
        '[data-widget-id="band"] [data-part="resize-handle"]'
      )
    ).toHaveLength(0);
  });

  it("emits nothing while a free sibling still reorders around it", async () => {
    const onItemsChange = vi.fn();
    const { container } = board(
      [
        item("band", 0, {
          movable: false,
          removable: false,
          resizable: false,
        }),
        item("x", 1),
        item("y", 2),
      ],
      onItemsChange
    );

    fireEvent.keyDown(await findMove(container, "y"), { key: "ArrowLeft" });

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(visibleOrder(onItemsChange.mock.calls[0]![0])).toEqual([
      "band",
      "y",
      "x",
    ]);
  });
});
