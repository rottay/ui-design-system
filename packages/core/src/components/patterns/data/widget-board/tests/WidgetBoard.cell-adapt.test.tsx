/**
 * Per-cell adapt: a Modern cell picks one of the app's named views from its OWN width through
 * the posture ladder, stamps that posture on the cell, and falls back to `content`. A cell that
 * declares neither stays exactly as before; the frozen engines always render `content`.
 */
import React from "react";
import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderWithEngineContext } from "@tests/support/engine";
import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import ModernWidgetBoard from "../engines/modern";
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
  remove: "Remove",
};

const ADAPTIVE: WidgetBoardItem = {
  id: "pipeline",
  size: "md",
  order: 0,
  visible: true,
  title: "Pipeline",
  accessibleTitle: "Pipeline",
  content: <span data-testid="view-content">content</span>,
  views: {
    number: <span data-testid="view-number">42</span>,
    chart: <span data-testid="view-chart">chart</span>,
  },
  adapt: { compact: { view: "number" }, expanded: { view: "chart" } },
};

const PLAIN: WidgetBoardItem = {
  id: "plain",
  size: "md",
  order: 1,
  visible: true,
  title: "Plain",
  accessibleTitle: "Plain",
  content: <span data-testid="plain-content">plain</span>,
};

type Listener = (entries: ResizeObserverEntry[]) => void;
const observed = new Map<Element, Set<Listener>>();
const original = globalThis.ResizeObserver;

beforeEach(() => {
  observed.clear();
  globalThis.ResizeObserver = class {
    private readonly targets = new Set<Element>();
    constructor(private readonly listener: Listener) {}
    observe(target: Element) {
      this.targets.add(target);
      if (!observed.has(target)) observed.set(target, new Set());
      observed.get(target)!.add(this.listener);
    }
    unobserve(target: Element) {
      observed.get(target)?.delete(this.listener);
    }
    disconnect() {
      for (const target of this.targets) observed.get(target)?.delete(this.listener);
    }
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = original;
});

function resize(target: Element, width: number): void {
  const entry = { target, contentRect: { width, height: 200 } } as unknown as ResizeObserverEntry;
  act(() => {
    for (const listener of observed.get(target) ?? []) listener([entry]);
  });
}

const cell = (root: HTMLElement, id: string) =>
  root.querySelector<HTMLElement>(`[data-part="card-shell"][data-widget-id="${id}"]`)!;
const shown = (root: HTMLElement, id: string) =>
  ["content", "number", "chart"].filter((name) => cell(root, id).querySelector(`[data-testid="view-${name}"]`));

describe("Modern WidgetBoard -- each cell adapts its own view to its own width", () => {
  it("switches number -> chart -> content as the CELL resizes, and stamps the cell's posture", async () => {
    const { container } = renderWithEngineContext(
      <ModernWidgetBoard labels={labels} items={[ADAPTIVE, PLAIN]} />,
      "modern"
    );
    const target = cell(container, "pipeline");
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["content"]));

    resize(target, 320);
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["number"]));
    expect(target.getAttribute("data-posture")).toMatch(/(^| )compact$/);

    resize(target, 1000);
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["chart"]));
    expect(target.getAttribute("data-posture")).toMatch(/(^| )expanded$/);

    resize(target, 700);
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["content"]));
    expect(target.getAttribute("data-posture")).toMatch(/(^| )regular$/);
  });

  it("the board's own width does not decide the view -- only the cell's does", async () => {
    const { container } = renderWithEngineContext(
      <ModernWidgetBoard labels={labels} items={[ADAPTIVE, PLAIN]} />,
      "modern"
    );
    resize(cell(container, "pipeline"), 320);
    resize(container.querySelector('[data-part="root"]')!, 1400);
    resize(container.querySelector('[data-part="grid"]')!, 1400);
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["number"]));
  });

  it("a cell that declares neither views nor adapt stamps nothing and renders content at any width", async () => {
    const { container } = renderWithEngineContext(
      <ModernWidgetBoard labels={labels} items={[ADAPTIVE, PLAIN]} />,
      "modern"
    );
    const plain = cell(container, "plain");
    for (const width of [320, 1000]) {
      resize(plain, width);
      expect(plain.hasAttribute("data-posture")).toBe(false);
      await waitFor(() => expect(plain.querySelector('[data-testid="plain-content"]')).not.toBeNull());
    }
  });

  it("the frozen engines render content and stamp no posture on any cell", async () => {
    const { container } = renderWithEngineContext(
      <WidgetBoardEngine labels={labels} items={[ADAPTIVE, PLAIN]} />,
      "classic"
    );
    const target = cell(container, "pipeline");
    resize(target, 320);
    await waitFor(() => expect(shown(container, "pipeline")).toEqual(["content"]));
    expect(target.hasAttribute("data-posture")).toBe(false);
    expect(cell(container, "plain").hasAttribute("data-posture")).toBe(false);
  });
});
