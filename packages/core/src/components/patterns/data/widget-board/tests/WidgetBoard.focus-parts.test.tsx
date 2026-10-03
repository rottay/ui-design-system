import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent } from "@testing-library/react";
import { renderWithEngineContext } from "@tests/support/engine";
import { describe, expect, it } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import ModernWidgetBoard from "../engines/modern";

const SKIN = readFileSync(
  resolve(
    __dirname,
    "../../../../../foundation/tokens/css/presentation/components/skin/widget-board/index.css"
  ),
  "utf8"
);

const FOCUS_ARM = ':is([data-state~="focus-visible"], :focus-visible)';

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

function item(id: string, order: number): WidgetBoardItem {
  return {
    id,
    size: "md",
    order,
    visible: true,
    title: id,
    accessibleTitle: id,
    content: <span>{id}</span>,
  };
}

function board(): HTMLElement {
  const { container } = renderWithEngineContext(
    <ModernWidgetBoard
      labels={labels}
      items={[item("alpha", 0), item("beta", 1)]}
      editable
      defaultEditing
      onItemsChange={() => {}}
    />,
    "modern"
  );
  return container;
}

const cellOf = (container: HTMLElement, id: string): HTMLElement => {
  const cell = container.querySelector<HTMLElement>(
    `[data-part="card-shell"][data-widget-id="${id}"]`
  );
  if (!cell) throw new Error(`no cell for ${id}`);
  return cell;
};

const tabStops = (scope: HTMLElement): HTMLElement[] =>
  Array.from(
    scope.querySelectorAll<HTMLElement>(
      "button, a[href], input, select, textarea, [tabindex]"
    )
  ).filter((node) => node.tabIndex >= 0);

/** The selectors of every skin rule that paints the tenant focus signature. */
function signatureSelectors(): string[] {
  const found: string[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of SKIN.matchAll(rule)) {
    if (/box-shadow:\s*var\(\s*--ds-focus-ring\b/.test(match[2])) {
      found.push(match[1].replace(/\s+/g, " ").trim());
    }
  }
  return found;
}

describe("the widget board's own keyboard focus targets", () => {
  it("paints exactly two tab stops per widget itself: the width and height separators", () => {
    const cell = cellOf(board(), "alpha");
    const own = tabStops(cell).filter((node) => !node.closest(".ds-button"));

    expect(own.map((node) => node.getAttribute("data-edge"))).toEqual([
      "inline-end",
      "block-end",
    ]);
    for (const node of own) {
      expect(node).toHaveAttribute("data-part", "resize-handle");
      expect(node).toHaveAttribute("role", "separator");
      expect(node).toHaveClass("ds-widget-board__resize-handle");
      expect(node).toHaveAccessibleName();
    }
  });

  it("leaves the move and remove controls to the composed Button", () => {
    const cell = cellOf(board(), "alpha");
    const composed = tabStops(cell).filter((node) => node.closest(".ds-button"));

    expect(composed.map((node) => node.getAttribute("aria-label"))).toEqual([
      "Move: alpha",
      "Remove: alpha",
    ]);
    for (const node of composed) {
      expect(node).not.toHaveAttribute("data-part", "resize-handle");
    }
  });

  it("keeps the card, its edit bar and the pointer-only edges out of the tab order", () => {
    const cell = cellOf(board(), "alpha");
    const bar = cell.querySelector<HTMLElement>('[data-part="cell-controls"]');

    expect(cell).not.toHaveAttribute("tabindex");
    expect(bar).not.toBeNull();
    expect(bar).not.toHaveAttribute("tabindex");

    const pointerOnly = Array.from(
      cell.querySelectorAll<HTMLElement>('[data-part="resize-handle"]')
    ).filter((node) => node.getAttribute("role") !== "separator");
    expect(pointerOnly).toHaveLength(6);
    for (const node of pointerOnly) {
      expect(node).toHaveAttribute("tabindex", "-1");
      expect(node).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("stamps a keyboard-focused separator with the anatomy the skin's signature rule selects", () => {
    const selectors = signatureSelectors();
    expect(selectors).toHaveLength(1);
    expect(selectors[0]).toContain(FOCUS_ARM);
    const stamped = selectors[0].replace(FOCUS_ARM, '[data-state~="focus-visible"]');

    const container = board();
    const separators = Array.from(
      cellOf(container, "alpha").querySelectorAll<HTMLElement>(
        '[data-part="resize-handle"][role="separator"]'
      )
    );
    expect(separators).toHaveLength(2);

    for (const separator of separators) {
      expect(separator.matches(stamped)).toBe(false);
      fireEvent.focus(separator);
      expect(separator.matches(stamped)).toBe(true);
      fireEvent.blur(separator);
      expect(separator.matches(stamped)).toBe(false);
    }
  });

  it("takes no signature from a pointer press", () => {
    const stamped = signatureSelectors()[0].replace(
      FOCUS_ARM,
      '[data-state~="focus-visible"]'
    );
    const separator = cellOf(board(), "alpha").querySelector<HTMLElement>(
      '[data-part="resize-handle"][data-edge="inline-end"]'
    );
    if (!separator) throw new Error("no inline-end separator");

    fireEvent.pointerDown(separator);
    fireEvent.focus(separator);
    expect(separator).toHaveAttribute("data-state");
    expect(separator.matches(stamped)).toBe(false);
  });

  it("does not read the fixed foundation wash ahead of the tenant signature", () => {
    expect(SKIN).not.toMatch(/box-shadow:\s*var\(\s*--ds-shadow-focus-ring\b/);
  });
});
