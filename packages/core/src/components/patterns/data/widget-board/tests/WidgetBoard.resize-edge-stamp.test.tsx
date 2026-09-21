/**
 * The resize edges take their hover / press / focus state from the shared
 * `ResizeHandle` itself. The family used to wrap every edge in a
 * `display: contents` host that ran its own kernel and handed the serialized
 * state back through `anatomy`; the primitive now holds the pointer and the
 * tab stop, so the host is gone and the edge carries exactly one decider.
 * The family's own vocabulary -- the part, the edge and the active flag --
 * still has the last word, and at rest nothing is serialized at all.
 */
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithEngineContext } from "@tests/support/engine";
import { describe, expect, it } from "vitest";

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

function board() {
  return renderWithEngineContext(
    <WidgetBoardEngine
      labels={labels}
      items={[item("alpha", 0), item("beta", 1)]}
      editable
      defaultEditing
      onItemsChange={() => {}}
    />,
    "classic"
  );
}

const edges = (container: HTMLElement): HTMLElement[] =>
  Array.from(
    container.querySelectorAll<HTMLElement>("[data-part='resize-handle']")
  );

describe("the resize edge is stamped by the shared primitive", () => {
  it("serializes nothing at rest and carries the family's own vocabulary", () => {
    const { container } = board();
    const found = edges(container);
    expect(found.length).toBeGreaterThan(0);
    for (const edge of found) {
      expect(edge).not.toHaveAttribute("data-state");
      expect(edge).toHaveAttribute("data-edge");
      expect(edge).toHaveAttribute("data-active", "false");
    }
  });

  it("runs the hover / press / focus triad on the handle itself", () => {
    const { container } = board();
    const edge = edges(container)[0];

    fireEvent.pointerEnter(edge);
    expect(edge).toHaveAttribute("data-state", "hovered");
    fireEvent.pointerDown(edge);
    expect(edge).toHaveAttribute("data-state", "hovered pressed");
    fireEvent.pointerUp(edge);
    expect(edge).toHaveAttribute("data-state", "hovered");
    fireEvent.pointerLeave(edge);
    expect(edge).not.toHaveAttribute("data-state");

    fireEvent.focus(edge);
    expect(edge).toHaveAttribute("data-state", "focused focus-visible");
    fireEvent.blur(edge);
    expect(edge).not.toHaveAttribute("data-state");
  });

  it("stamps a pointer-only corner as well as a keyboard-operable edge", () => {
    const { container } = board();
    const found = edges(container);
    const operable = found.filter(
      (edge) => edge.getAttribute("role") === "separator"
    );
    const hitArea = found.filter(
      (edge) => edge.getAttribute("role") !== "separator"
    );
    expect(operable.length).toBeGreaterThan(0);
    expect(hitArea.length).toBeGreaterThan(0);
    for (const edge of [operable[0], hitArea[0]]) {
      fireEvent.pointerEnter(edge);
      expect(edge).toHaveAttribute("data-state", "hovered");
      fireEvent.pointerLeave(edge);
    }
  });

  it("keeps no state host between the card and the edge", () => {
    const { container } = board();
    expect(container.querySelector(".ds-widget-board__resize-edge")).toBeNull();
    for (const edge of edges(container)) {
      expect(edge.parentElement?.getAttribute("data-part")).toBe("card-shell");
    }
  });
});
