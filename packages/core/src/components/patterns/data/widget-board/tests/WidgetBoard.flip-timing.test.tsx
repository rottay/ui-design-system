import React from "react";
import { act } from "@testing-library/react";
import { renderWithEngineContext } from "@tests/support/engine";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import { WidgetBoardEngine } from "../engines/foundation";

const measure = vi.hoisted(() => ({ durationMs: 336 }));

vi.mock("@/graphics/motion/react/runtime/layout/kernel/measure", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/graphics/motion/react/runtime/layout/kernel/measure")
  >();
  return {
    ...actual,
    readTiming: vi.fn((root: Element, durationVar: string, easingVar: string) => ({
      ...actual.readTiming(root, durationVar, easingVar),
      durationMs: measure.durationMs,
    })),
  };
});

const { readTiming } = await import("@/graphics/motion/react/runtime/layout/kernel/measure");

const EMITTED_REARRANGE =
  "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))";

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

function item(id: string, order: number): WidgetBoardItem {
  return {
    id,
    size: "sm",
    order,
    visible: true,
    title: id,
    accessibleTitle: id,
    content: <span>{id}</span>,
  };
}

type AnimateCall = { options: KeyframeAnimationOptions };
let calls: AnimateCall[] = [];
let originalRect: typeof HTMLElement.prototype.getBoundingClientRect;

beforeEach(() => {
  calls = [];
  vi.mocked(readTiming).mockClear();
  Element.prototype.animate = function (_keyframes: unknown, options: unknown) {
    calls.push({ options: options as KeyframeAnimationOptions });
    return {
      cancel: vi.fn(),
      addEventListener: vi.fn(),
    } as unknown as Animation;
  } as typeof Element.prototype.animate;
  originalRect = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const siblings = this.parentElement ? Array.from(this.parentElement.children) : [];
    const top = siblings.indexOf(this) * 100;
    return { left: 0, top, right: 100, bottom: top + 80, width: 100, height: 80, x: 0, y: top, toJSON() {} } as DOMRect;
  };
});

afterEach(() => {
  // @ts-expect-error -- removing the test-local WAAPI stub installed above.
  delete Element.prototype.animate;
  HTMLElement.prototype.getBoundingClientRect = originalRect;
});

function mountAndReorder(channels: Record<string, string>): HTMLElement {
  const board = (items: WidgetBoardItem[]) => (
    <WidgetBoardEngine items={items} labels={labels} />
  );
  const view = renderWithEngineContext(board([item("a", 0), item("b", 1), item("c", 2)]), "classic");
  const grid = view.container.querySelector<HTMLElement>('[data-part="grid"]');
  if (!grid) throw new Error("widget-board grid part not found");
  for (const [name, value] of Object.entries(channels)) grid.style.setProperty(name, value);
  act(() => {
    view.rerender(board([item("c", 0), item("b", 1), item("a", 2)]));
  });
  return grid;
}

describe("WidgetBoard FLIP timing source", () => {
  it("takes the duration the kernel resolves from the emitted calc() channel, not a parsed literal", () => {
    const grid = mountAndReorder({ "--ds-motion-rearrange": EMITTED_REARRANGE });

    expect(readTiming).toHaveBeenCalledWith(grid, "--ds-motion-rearrange", "--ds-motion-ease-move");
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call.options.duration).toBe(measure.durationMs);
  });

  it("falls back to the normal channel when rearrange is absent", () => {
    const grid = mountAndReorder({ "--ds-motion-normal": EMITTED_REARRANGE });

    expect(readTiming).toHaveBeenCalledWith(grid, "--ds-motion-normal", "--ds-motion-ease-move");
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call.options.duration).toBe(measure.durationMs);
  });

  it("keeps the 200ms default only when neither channel is declared", () => {
    mountAndReorder({});

    expect(readTiming).not.toHaveBeenCalled();
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call.options.duration).toBe(200);
  });

  it("does not animate when the channel resolves to zero", () => {
    measure.durationMs = 0;
    try {
      mountAndReorder({ "--ds-motion-rearrange": "0s" });
    } finally {
      measure.durationMs = 336;
    }

    expect(readTiming).toHaveBeenCalled();
    expect(calls).toHaveLength(0);
  });
});
