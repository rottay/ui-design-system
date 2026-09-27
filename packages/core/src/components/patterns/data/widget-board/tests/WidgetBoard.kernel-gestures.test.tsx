/**
 * Modern drag and resize on the shared DnD kernel: pointer transport + grid resolver for the
 * move, the resize session for the edges, the delegated keyboard mode for the arrows, and the
 * ghost painted from the kernel's preview. The frozen engines keep their own sessions.
 */
import React from "react";
import { act, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithEngineContext } from "@tests/support/engine";
import type { WidgetBoardItem, WidgetBoardLabels, WidgetBoardProps } from "../contracts";
import ModernWidgetBoard from "../engines/modern";
import { WidgetBoardEngine } from "../engines/foundation";
import * as kernel from "../../../../primitives/runtime/collection/sortable";

vi.mock("../../../../primitives/runtime/collection/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../primitives/runtime/collection/sortable")>();
  return { ...actual, resolveGridSlot: vi.fn(actual.resolveGridSlot) };
});

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

function item(id: string, order: number, extra: Partial<WidgetBoardItem> = {}): WidgetBoardItem {
  return {
    id,
    size: "md",
    order,
    visible: true,
    title: id,
    accessibleTitle: id,
    content: <span>{id}</span>,
    ...extra,
  };
}

const ITEMS = [item("a", 0), item("b", 1), item("c", 2)];

function modern(props: Partial<WidgetBoardProps> = {}) {
  return renderWithEngineContext(
    <ModernWidgetBoard labels={labels} items={ITEMS} editable defaultEditing {...props} />,
    "modern"
  );
}

const findMove = (root: HTMLElement, title: string) => within(root).findByLabelText(`Move: ${title}`);

function domOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-part="card-shell"]')).map(
    (cell) => cell.dataset.widgetId ?? ""
  );
}

function rect(left: number, width: number, top = 0, height = 300): DOMRect {
  return {
    width,
    height,
    top,
    right: left + width,
    bottom: top + height,
    left,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

/* Fixed slots; each cell reports the rect of whatever slot it occupies right now. */
function measure(container: HTMLElement, widths: number[] = [300, 300, 300]): void {
  const grid = container.querySelector<HTMLElement>('[data-part="grid"]');
  if (grid) grid.getBoundingClientRect = () => rect(0, 1000);
  const lefts: number[] = [];
  let left = 0;
  for (const width of widths) {
    lefts.push(left);
    left += width + 20;
  }
  for (const cell of Array.from(container.querySelectorAll<HTMLElement>('[data-part="card-shell"]'))) {
    cell.getBoundingClientRect = () => {
      const order = Array.from(container.querySelectorAll<HTMLElement>('[data-part="card-shell"]'));
      const index = order.indexOf(cell);
      return rect(lefts[index] ?? 0, widths[index] ?? 300);
    };
  }
}

const ghost = (container: HTMLElement) => container.querySelector<HTMLElement>('.ds-widget-board__drag-ghost');
const ids = (next: WidgetBoardItem[]) =>
  next.filter((entry) => entry.visible).sort((x, y) => x.order - y.order).map((entry) => entry.id);

describe("Modern WidgetBoard -- pointer move on the kernel", () => {
  it("reorders on release, paints the ghost from the kernel preview during the session, and commits once", async () => {
    const onItemsChange = vi.fn();
    const onLayoutChange = vi.fn();
    const { container } = modern({ onItemsChange, onLayoutChange });
    const move = await findMove(container, "a");
    measure(container);
    expect(ghost(container)).toBeNull();

    fireEvent.pointerDown(move, { pointerId: 1, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 34, clientY: 22 });
    expect(ghost(container)).toBeNull();
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 700, clientY: 60 });

    await waitFor(() => expect(domOrder(container)).toEqual(["b", "c", "a"]));
    expect(vi.mocked(kernel.resolveGridSlot)).toHaveBeenCalled();
    const live = ghost(container)!;
    expect(live).not.toBeNull();
    expect(live.getAttribute("aria-hidden")).toBe("true");
    expect(live.style.getPropertyValue("--ds-widget-board-ghost-x")).toBe("670px");
    expect(live.style.getPropertyValue("--ds-widget-board-ghost-y")).toBe("40px");
    expect(live.style.getPropertyValue("--ds-widget-board-ghost-width")).toBe("300px");
    expect(live.style.getPropertyValue("--ds-widget-board-ghost-height")).toBe("300px");
    const root = container.querySelector('[data-part="root"]')!;
    expect(root.getAttribute("data-moving")).toBe("true");
    expect(container.querySelector('[data-widget-id="a"]')!.getAttribute("data-dragging")).toBe("true");
    expect(onItemsChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(window, { pointerId: 1, clientX: 700, clientY: 60 });

    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(ids(onItemsChange.mock.calls[0][0])).toEqual(["b", "c", "a"]);
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    expect(Object.keys(onLayoutChange.mock.calls[0][0])).toHaveLength(1);
    expect(ghost(container)).toBeNull();
    expect(root.getAttribute("data-moving")).toBe("false");
  });

  it("a press released inside the activation distance is a click: no ghost, no emission", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange });
    const move = await findMove(container, "a");
    measure(container);

    fireEvent.pointerDown(move, { pointerId: 2, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 2, clientX: 33, clientY: 22 });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 33, clientY: 22 });

    expect(ghost(container)).toBeNull();
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(domOrder(container)).toEqual(["a", "b", "c"]);
  });

  it("a release past a barrier is refused by the kernel and the preview reverts through the blocked event", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({
      onItemsChange,
      items: [item("a", 0), item("barrier", 1, { movable: false }), item("c", 2)],
    });
    const move = await findMove(container, "a");
    measure(container, [320, 320, 320]);

    fireEvent.pointerDown(move, { pointerId: 3, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 820, clientY: 100 });
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 820, clientY: 100 });

    await waitFor(() => expect(domOrder(container)).toEqual(["a", "barrier", "c"]));
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(ghost(container)).toBeNull();
  });

  it("a release far outside the grid reverts the live preview with no emission", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange });
    const move = await findMove(container, "a");
    measure(container);

    fireEvent.pointerDown(move, { pointerId: 4, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 4, clientX: 700, clientY: 60 });
    await waitFor(() => expect(domOrder(container)).toEqual(["b", "c", "a"]));
    fireEvent.pointerMove(window, { pointerId: 4, clientX: 700, clientY: 900 });
    fireEvent.pointerUp(window, { pointerId: 4, clientX: 700, clientY: 900 });

    await waitFor(() => expect(domOrder(container)).toEqual(["a", "b", "c"]));
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(ghost(container)).toBeNull();
  });

  it("Escape mid-drag cancels: the preview reverts and nothing is emitted", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange });
    const move = await findMove(container, "a");
    measure(container);

    fireEvent.pointerDown(move, { pointerId: 5, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 5, clientX: 700, clientY: 60 });
    await waitFor(() => expect(domOrder(container)).toEqual(["b", "c", "a"]));
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 5, clientX: 700, clientY: 60 });

    await waitFor(() => expect(domOrder(container)).toEqual(["a", "b", "c"]));
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(ghost(container)).toBeNull();
  });

  it("new items from the owner cancel a live drag without emitting", async () => {
    const onItemsChange = vi.fn();
    const { container, rerender } = modern({ onItemsChange });
    const move = await findMove(container, "a");
    measure(container);

    fireEvent.pointerDown(move, { pointerId: 6, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 6, clientX: 700, clientY: 60 });
    await waitFor(() => expect(ghost(container)).not.toBeNull());

    rerender(
      <ModernWidgetBoard
        labels={labels}
        items={[item("a", 0, { movable: false }), item("b", 1), item("c", 2)]}
        editable
        defaultEditing
        onItemsChange={onItemsChange}
      />
    );
    fireEvent.pointerUp(window, { pointerId: 6, clientX: 700, clientY: 60 });

    await waitFor(() => expect(ghost(container)).toBeNull());
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(domOrder(container)).toEqual(["a", "b", "c"]);
  });
});

describe("Modern WidgetBoard -- keyboard move through the kernel's delegated mode", () => {
  it("keeps the board's arrow semantics: right/down next, left/up previous, edges and barriers refused", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange });

    fireEvent.keyDown(await findMove(container, "a"), { key: "ArrowRight" });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(ids(onItemsChange.mock.calls[0][0])).toEqual(["b", "a", "c"]);

    fireEvent.keyDown(await findMove(container, "a"), { key: "ArrowUp" });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(2));
    expect(ids(onItemsChange.mock.calls[1][0])).toEqual(["a", "b", "c"]);

    fireEvent.keyDown(await findMove(container, "a"), { key: "ArrowLeft" });
    fireEvent.keyDown(await findMove(container, "c"), { key: "ArrowDown" });
    expect(onItemsChange).toHaveBeenCalledTimes(2);
    expect(ghost(container)).toBeNull();
  });

  it("refuses a keyboard move across a locked item", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({
      onItemsChange,
      items: [item("a", 0), item("barrier", 1, { movable: false }), item("c", 2)],
    });
    fireEvent.keyDown(await findMove(container, "c"), { key: "ArrowLeft" });
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("ArrowLeft still means previous under a right-to-left direction", async () => {
    const onItemsChange = vi.fn();
    const { container } = renderWithEngineContext(
      <div dir="rtl">
        <ModernWidgetBoard labels={labels} items={ITEMS} editable defaultEditing onItemsChange={onItemsChange} />
      </div>,
      "modern"
    );
    fireEvent.keyDown(await findMove(container, "b"), { key: "ArrowLeft" });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(ids(onItemsChange.mock.calls[0][0])).toEqual(["b", "a", "c"]);
  });
});

describe("Modern WidgetBoard -- resize on the kernel's resize session", () => {
  const edge = (container: HTMLElement, id: string, name: string) =>
    container.querySelector<HTMLElement>(`[data-widget-id="${id}"] [data-part="resize-handle"][data-edge="${name}"]`)!;

  it("previews whole grid columns while the pointer moves and commits once at release", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange, items: [item("a", 0, { size: "sm" }), item("b", 1)] });
    await findMove(container, "a");
    measure(container);
    const cell = container.querySelector<HTMLElement>('[data-widget-id="a"]')!;

    fireEvent.pointerDown(edge(container, "a", "inline-end"), { pointerId: 7, clientX: 250, clientY: 100 });
    expect(cell.getAttribute("data-resizing")).toBe("true");
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 510, clientY: 100 });
    await waitFor(() => expect(cell.getAttribute("data-size")).toBe("lg"));
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(ghost(container)).toBeNull();

    fireEvent.pointerUp(window, { pointerId: 7, clientX: 510, clientY: 100 });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(onItemsChange.mock.calls[0][0].find((entry: WidgetBoardItem) => entry.id === "a").size).toBe("lg");
    expect(cell.getAttribute("data-resizing")).toBe("false");
  });

  it("the block edge resizes in pixels and Escape abandons without emitting", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange, items: [item("a", 0), item("b", 1)] });
    await findMove(container, "a");
    measure(container);
    const cell = container.querySelector<HTMLElement>('[data-widget-id="a"]')!;

    fireEvent.pointerDown(edge(container, "a", "block-end"), { pointerId: 8, clientX: 100, clientY: 300 });
    fireEvent.pointerMove(window, { pointerId: 8, clientX: 100, clientY: 360 });
    await waitFor(() => expect(cell.getAttribute("data-height")).toBe("fixed"));
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 8, clientX: 100, clientY: 360 });

    await waitFor(() => expect(cell.getAttribute("data-resizing")).toBe("false"));
    expect(onItemsChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(edge(container, "a", "block-end"), { pointerId: 9, clientX: 100, clientY: 300 });
    fireEvent.pointerMove(window, { pointerId: 9, clientX: 100, clientY: 360 });
    fireEvent.pointerUp(window, { pointerId: 9, clientX: 100, clientY: 360 });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(onItemsChange.mock.calls[0][0].find((entry: WidgetBoardItem) => entry.id === "a").height).toBe(360);
  });

  it("reads the direction from the grid, not the provider: an rtl grid grows when the inline-end edge moves left", async () => {
    const onItemsChange = vi.fn();
    const { container } = modern({ onItemsChange, items: [item("a", 0, { size: "sm" }), item("b", 1)] });
    await findMove(container, "a");
    measure(container);
    const grid = container.querySelector<HTMLElement>('[data-part="grid"]')!;
    const computed = window.getComputedStyle;
    const spy = vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      const styles = computed(element, pseudo);
      if (element !== grid) return styles;
      return new Proxy(styles, {
        get: (target, key) => (key === "direction" ? "rtl" : Reflect.get(target, key)),
      });
    });
    try {
      fireEvent.pointerDown(edge(container, "a", "inline-end"), { pointerId: 10, clientX: 700, clientY: 100 });
      fireEvent.pointerMove(window, { pointerId: 10, clientX: 440, clientY: 100 });
      fireEvent.pointerUp(window, { pointerId: 10, clientX: 440, clientY: 100 });
    } finally {
      spy.mockRestore();
    }
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
    expect(onItemsChange.mock.calls[0][0].find((entry: WidgetBoardItem) => entry.id === "a").size).toBe("lg");
  });
});

describe("Frozen engines keep their own sessions", () => {
  it("the foundation engine without Modern pieces never paints a ghost and still reorders", async () => {
    const onItemsChange = vi.fn();
    const { container } = renderWithEngineContext(
      <WidgetBoardEngine labels={labels} items={ITEMS} editable defaultEditing onItemsChange={onItemsChange} />,
      "classic"
    );
    const move = await findMove(container, "a");
    measure(container);
    fireEvent.pointerDown(move, { pointerId: 11, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(window, { pointerId: 11, clientX: 700, clientY: 60 });
    await waitFor(() => expect(domOrder(container)).toEqual(["b", "c", "a"]));
    expect(ghost(container)).toBeNull();
    act(() => {
      fireEvent.pointerUp(window, { pointerId: 11, clientX: 700, clientY: 60 });
    });
    await waitFor(() => expect(onItemsChange).toHaveBeenCalledTimes(1));
  });
});
