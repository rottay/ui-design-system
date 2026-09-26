import React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithEngineContext } from "@tests/support/engine";

import type { WidgetBoardItem, WidgetBoardLabels, WidgetLayout } from "../contracts";
import ClassicWidgetBoard from "../engines/classic";
import ModernWidgetBoard from "../engines/modern";
import {
  createLayoutCommit,
  normalizeWidgetLayout,
  widgetItemsToLayout,
} from "../runtime/adaptive/policy";
import {
  normalizeWidgetLayout as rootNormalizeWidgetLayout,
  widgetItemsToLayout as rootWidgetItemsToLayout,
} from "../../../../../index";
import { normalizeWidgetLayout as doorNormalizeWidgetLayout } from "../../../../../entrypoints/public/patterns/widget-board";

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

const item = (id: string, order: number, extra: Partial<WidgetBoardItem> = {}): WidgetBoardItem => ({
  id,
  size: "md",
  order,
  visible: true,
  title: id,
  accessibleTitle: id,
  content: <span>{id}</span>,
  ...extra,
});

const LAYOUT: WidgetLayout = {
  compact: [
    { itemId: "kpi", order: 0, visible: true, spanHint: { cols: 1, rows: 4 } },
    { itemId: "chart", order: 1, visible: false, pinned: true },
  ],
  expanded: [
    { itemId: "chart", order: 0, visible: true, spanHint: { cols: 8 }, modeHint: "full" },
    { itemId: "kpi", order: 1, visible: true, spanHint: { cols: 4 } },
  ],
};

describe("WidgetLayout: a per-posture intent list in grid units, validated fail-closed", () => {
  it("round-trips through storage and the validator unchanged", () => {
    expect(normalizeWidgetLayout(JSON.parse(JSON.stringify(LAYOUT)))).toEqual(LAYOUT);
  });

  it("derives one posture's layout from the items: order, visibility, preferred columns, never px", () => {
    const layout = widgetItemsToLayout(
      [item("a", 0, { size: "wide", height: 320 }), item("b", 1, { visible: false, size: "sm" })],
      "regular"
    );
    expect(Object.keys(layout)).toEqual(["regular"]);
    expect(layout.regular).toEqual([
      { itemId: "a", order: 0, visible: true, spanHint: { cols: 12 } },
      { itemId: "b", order: 1, visible: false, spanHint: { cols: 3 } },
    ]);
    expect(JSON.stringify(layout)).not.toMatch(/height|320|px/);
    expect(normalizeWidgetLayout(layout)).toEqual(layout);
  });

  const expanded = (intent: Record<string, unknown>) => ({ expanded: [intent] });
  const ok = { itemId: "a", order: 0, visible: true };
  it.each([
    ["a string", "compact"],
    ["null", null],
    ["an array", [ok]],
    ["a posture outside the container vocabulary", { huge: [ok] }],
    ["a viewport posture", { desktop: [ok] }],
    ["a posture that is not a list", { expanded: ok }],
    ["a px height", expanded({ ...ok, height: 320 })],
    ["a px width", expanded({ ...ok, width: 480 })],
    ["an x/y position", expanded({ ...ok, x: 0, y: 0 })],
    ["an empty item id", expanded({ ...ok, itemId: "" })],
    ["a negative order", expanded({ ...ok, order: -1 })],
    ["a fractional order", expanded({ ...ok, order: 0.5 })],
    ["a non-boolean visibility", expanded({ ...ok, visible: "yes" })],
    ["a non-boolean pin", expanded({ ...ok, pinned: 1 })],
    ["a zero column span", expanded({ ...ok, spanHint: { cols: 0 } })],
    ["a fractional row span", expanded({ ...ok, spanHint: { cols: 2, rows: 1.5 } })],
    ["a px span field", expanded({ ...ok, spanHint: { cols: 2, px: 300 } })],
    ["a repeated item id", { expanded: [ok, { ...ok, order: 1 }] }],
  ])("refuses %s", (_name, stored) => {
    expect(normalizeWidgetLayout(stored)).toEqual({});
  });

  it("discards only the posture that fails, never part of it", () => {
    const stored = { compact: LAYOUT.compact, expanded: [...LAYOUT.expanded!, { itemId: "x", order: 2, visible: true, height: 90 }] };
    expect(normalizeWidgetLayout(stored)).toEqual({ compact: LAYOUT.compact });
  });

  it("is exported through the precedent's doors: the package root and the widget-board subpath", () => {
    expect(rootNormalizeWidgetLayout).toBe(normalizeWidgetLayout);
    expect(rootWidgetItemsToLayout).toBe(widgetItemsToLayout);
    expect(doorNormalizeWidgetLayout).toBe(normalizeWidgetLayout);
  });
});

describe("onLayoutChange: the commit tap keys every committed layout by its posture", () => {
  const before = [item("a", 0), item("b", 1)];
  const reordered = [item("a", 1), item("b", 0)];
  const resized = [item("a", 1, { size: "lg" }), item("b", 0)];

  it("fires on reorder, resize-commit and reset with the posture in force, and keeps the legacy path", () => {
    const onItemsChange = vi.fn();
    const onLayoutChange = vi.fn();
    let posture: "compact" | "regular" | "expanded" = "expanded";
    const commit = createLayoutCommit(onItemsChange, onLayoutChange, () => posture)!;

    commit(reordered);
    posture = "regular";
    commit(resized);
    posture = "compact";
    commit(before);

    expect(onItemsChange.mock.calls.map(([items]) => items)).toEqual([reordered, resized, before]);
    expect(onLayoutChange.mock.calls.map(([, key]) => key)).toEqual(["expanded", "regular", "compact"]);
    expect(onLayoutChange.mock.calls[0]![0]).toEqual(widgetItemsToLayout(reordered, "expanded"));
    expect(onLayoutChange.mock.calls[1]![0].regular[0]).toEqual({ itemId: "a", order: 1, visible: true, spanHint: { cols: 6 } });
    expect(Object.keys(onLayoutChange.mock.calls[2]![0])).toEqual(["compact"]);
  });

  it("changes nothing for a board with no layout listener", () => {
    const onItemsChange = vi.fn();
    expect(createLayoutCommit(onItemsChange, undefined, () => "expanded")).toBe(onItemsChange);
    expect(createLayoutCommit(undefined, undefined, () => "expanded")).toBeUndefined();
  });

  it("Modern: a reset emits the layout under the board's resolved posture", async () => {
    const onItemsChange = vi.fn();
    const onLayoutChange = vi.fn();
    const { container, unmount } = renderWithEngineContext(
      <ModernWidgetBoard items={before} labels={labels} editable defaultEditing onItemsChange={onItemsChange} onLayoutChange={onLayoutChange} />,
      "modern",
    );
    const reset = await waitFor(() => {
      const button = [...container.querySelectorAll("button")].find((node) => node.textContent === "Reset");
      if (!button) throw new Error("reset not rendered");
      return button;
    });
    fireEvent.click(reset);
    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange).toHaveBeenCalledTimes(1);
    const [layout, posture] = onLayoutChange.mock.calls[0]!;
    expect(["compact", "regular", "expanded"]).toContain(posture);
    expect(layout).toEqual(widgetItemsToLayout(before, posture));
    unmount();
  });

  it("the frozen engines see no API change: classic ignores onLayoutChange and keeps onItemsChange", async () => {
    const onItemsChange = vi.fn();
    const onLayoutChange = vi.fn();
    const { container, unmount } = renderWithEngineContext(
      <ClassicWidgetBoard items={before} labels={labels} editable defaultEditing onItemsChange={onItemsChange} onLayoutChange={onLayoutChange} />,
      "classic",
    );
    const reset = await waitFor(() => {
      const button = [...container.querySelectorAll("button")].find((node) => node.textContent === "Reset");
      if (!button) throw new Error("reset not rendered");
      return button;
    });
    fireEvent.click(reset);
    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onLayoutChange).not.toHaveBeenCalled();
    expect(container.innerHTML).not.toMatch(/onlayoutchange/i);
    unmount();
  });
});
