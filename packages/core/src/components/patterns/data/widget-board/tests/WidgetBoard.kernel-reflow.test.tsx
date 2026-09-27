/**
 * Modern reflows on the INV-08 motion kernel: a placement change plays the kernel's transform
 * invert (fill 'backwards'), never the board's own `--ds-widget-board-layout-x/y` FLIP, which
 * stays for the frozen engines only.
 */
import React from "react";
import { act } from "@testing-library/react";
import { renderWithEngineContext } from "@tests/support/engine";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import ModernWidgetBoard from "../engines/modern";
import { WidgetBoardEngine } from "../engines/foundation";

vi.mock("@/graphics/motion/react/runtime/layout/kernel/measure", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/graphics/motion/react/runtime/layout/kernel/measure")>();
  return {
    ...actual,
    readTiming: vi.fn((root: Element, durationVar: string, easingVar: string) => ({
      ...actual.readTiming(root, durationVar, easingVar),
      durationMs: 240,
    })),
  };
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
  remove: "Remove",
};

const item = (id: string, order: number): WidgetBoardItem => ({
  id,
  size: "sm",
  order,
  visible: true,
  title: id,
  accessibleTitle: id,
  content: <span>{id}</span>,
});

type AnimateCall = { target: string | null; properties: string[]; options: KeyframeAnimationOptions };
let calls: AnimateCall[] = [];
let originalRect: typeof HTMLElement.prototype.getBoundingClientRect;

beforeEach(() => {
  calls = [];
  Element.prototype.animate = function (this: Element, keyframes: unknown, options: unknown) {
    const frames = (keyframes as Keyframe[]) ?? [];
    calls.push({
      target: this.getAttribute("data-widget-id"),
      properties: [...new Set(frames.flatMap((frame) => Object.keys(frame)))].sort(),
      options: options as KeyframeAnimationOptions,
    });
    return {
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      finished: Promise.resolve(),
    } as unknown as Animation;
  } as typeof Element.prototype.animate;
  Element.prototype.getAnimations = () => [];
  originalRect = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const siblings = this.parentElement ? Array.from(this.parentElement.children) : [];
    const top = siblings.indexOf(this) * 100;
    return { left: 0, top, right: 100, bottom: top + 80, width: 100, height: 80, x: 0, y: top, toJSON() {} } as DOMRect;
  };
});

afterEach(() => {
  // @ts-expect-error -- removing the test-local WAAPI stubs installed above.
  delete Element.prototype.animate;
  // @ts-expect-error -- see above.
  delete Element.prototype.getAnimations;
  HTMLElement.prototype.getBoundingClientRect = originalRect;
});

const START = [item("a", 0), item("b", 1), item("c", 2)];
const REORDERED = [item("c", 0), item("b", 1), item("a", 2)];

describe("Modern WidgetBoard reflow on the motion kernel", () => {
  it("plays the kernel's transform invert with fill backwards, and never the layout-x/y FLIP", () => {
    const view = renderWithEngineContext(<ModernWidgetBoard items={START} labels={labels} />, "modern");
    expect(calls).toHaveLength(0);
    act(() => {
      view.rerender(<ModernWidgetBoard items={REORDERED} labels={labels} />);
    });

    expect(calls.map((call) => call.target).sort()).toEqual(["a", "c"]);
    for (const call of calls) {
      expect(call.properties).toEqual(["transform"]);
      expect(call.options.fill).toBe("backwards");
      expect(call.options.duration).toBe(240);
    }
  });

  it("a render that moves nothing plays nothing", () => {
    const view = renderWithEngineContext(<ModernWidgetBoard items={START} labels={labels} />, "modern");
    act(() => {
      view.rerender(<ModernWidgetBoard items={START.map((entry) => ({ ...entry }))} labels={labels} />);
    });
    expect(calls).toHaveLength(0);
  });

  it("the frozen engines keep their own FLIP on the layout-x/y channels", () => {
    const view = renderWithEngineContext(<WidgetBoardEngine items={START} labels={labels} />, "classic");
    act(() => {
      view.rerender(<WidgetBoardEngine items={REORDERED} labels={labels} />);
    });

    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.properties).toEqual(["--ds-widget-board-layout-x", "--ds-widget-board-layout-y"]);
    }
  });
});
