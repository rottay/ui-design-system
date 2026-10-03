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

interface SkinRule {
  readonly selector: string;
  readonly body: string;
}

const SKIN_RULES: readonly SkinRule[] = Array.from(
  SKIN.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g),
  (match) => ({
    selector: match[1].replace(/\s+/g, " ").trim(),
    body: match[2],
  })
);

/** Every skin rule that paints the tenant focus signature. */
const signatureRules = (): SkinRule[] =>
  SKIN_RULES.filter((rule) =>
    /box-shadow:\s*var\(\s*--ds-focus-ring\b/.test(rule.body)
  );

const CARRIER = /^(.*\[data-part="card-shell"\]):has\( > (.+) \)::after$/;

/** The card that hosts the carrier and the separator state that turns it on. */
function carrierAnatomy(): { card: string; separator: string } {
  const rules = signatureRules();
  expect(rules).toHaveLength(1);
  const parts = CARRIER.exec(rules[0].selector);
  if (!parts) throw new Error(`not a card carrier: ${rules[0].selector}`);
  expect(parts[2]).toContain(FOCUS_ARM);
  return {
    card: parts[1],
    separator: parts[2].replace(FOCUS_ARM, '[data-state~="focus-visible"]'),
  };
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

  it("hosts the signature on the card, which clips its separators, while one of them holds keyboard focus", () => {
    const { card, separator: stamped } = carrierAnatomy();

    const container = board();
    const cell = cellOf(container, "alpha");
    expect(cell.closest(".ds-pattern-widget-board")?.querySelector(card)).toBe(
      cell
    );
    const separators = Array.from(
      cell.querySelectorAll<HTMLElement>(
        '[data-part="resize-handle"][role="separator"]'
      )
    );
    expect(separators).toHaveLength(2);

    for (const separator of separators) {
      expect(separator.parentElement).toBe(cell);
      expect(separator.matches(stamped)).toBe(false);
      fireEvent.focus(separator);
      expect(separator.matches(stamped)).toBe(true);
      fireEvent.blur(separator);
      expect(separator.matches(stamped)).toBe(false);
    }
  });

  it("paints the carrier as an inert overlay inset by the signature's own reach", () => {
    const [carrier] = signatureRules();

    expect(carrier.body).toMatch(/position:\s*absolute/);
    expect(carrier.body).toMatch(
      /inset:\s*calc\(var\(--ds-focus-ring-offset\) \+ var\(--ds-focus-ring-width\)\)/
    );
    expect(carrier.body).toMatch(/pointer-events:\s*none/);
  });

  it("marks which separator holds focus with that separator's own rail and readout", () => {
    const marks = SKIN_RULES.filter(
      (rule) =>
        rule.selector.includes(":focus-visible") &&
        /\.ds-widget-board__resize-(rail|indicator)$/.test(rule.selector) &&
        /opacity:\s*1/.test(rule.body)
    ).map((rule) => rule.selector.split(" ").pop());

    expect(marks).toEqual(
      expect.arrayContaining([
        ".ds-widget-board__resize-rail",
        ".ds-widget-board__resize-indicator",
      ])
    );

    const cell = cellOf(board(), "alpha");
    for (const edge of ["inline-end", "block-end"]) {
      const separator = cell.querySelector<HTMLElement>(
        `[data-part="resize-handle"][data-edge="${edge}"]`
      );
      expect(
        separator?.querySelector(":scope > .ds-widget-board__resize-rail")
      ).not.toBeNull();
      expect(
        separator?.querySelector(":scope > .ds-widget-board__resize-indicator")
      ).not.toBeNull();
    }
  });

  it("never draws a separator's focus as a solid outline outside forced colors", () => {
    const outlines = SKIN_RULES.filter(
      (rule) =>
        rule.selector.includes("resize-handle") &&
        rule.selector.includes("focus-visible")
    ).flatMap((rule) =>
      Array.from(rule.body.matchAll(/outline:\s*([^;]+);/g), (match) =>
        match[1].trim()
      )
    );

    expect(outlines.length).toBeGreaterThan(0);
    for (const outline of outlines) {
      expect(outline).toMatch(/^none$|solid Highlight$/);
    }
    for (const rule of SKIN_RULES) {
      if (/__resize-handle\[data-part="resize-handle"\][^ ]*$/.test(rule.selector)) {
        expect(rule.body).not.toMatch(/box-shadow:\s*var\(\s*--ds-focus-ring\b/);
      }
    }
  });

  it("takes no signature from a pointer press", () => {
    const { separator: stamped } = carrierAnatomy();
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
