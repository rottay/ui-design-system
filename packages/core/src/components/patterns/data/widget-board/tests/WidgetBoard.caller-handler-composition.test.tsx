/**
 * The four stateful parts compose the caller's handler bag with the kernel's
 * instead of spreading one over the other. B8 composed only `onPointerDown` on
 * the cell controls and left the other five latent: `{...rest} {...handlers}`
 * REPLACES a colliding caller handler, so any caller press, release or focus on
 * those props disappeared silently. Every one of the six must survive, and the
 * press that starts a drag must keep BOTH the kernel's state and the caller's
 * gesture -- `beginMove` calls `preventDefault()`, which is why the kernel is
 * the first of that one pair.
 */
import React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithEngineContext } from "@tests/support/engine";
import { describe, expect, it } from "vitest";

import type { WidgetBoardItem, WidgetBoardLabels } from "../contracts";
import { WidgetBoardEngine } from "../engines/foundation";

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, "classic");

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
  return render(
    <WidgetBoardEngine
      labels={labels}
      items={[item("alpha", 0), item("beta", 1)]}
      editable
      defaultEditing
      onItemsChange={() => {}}
    />
  );
}

/** Every one of the six kernel handlers still reaches the part's state. */
function expectKernelRoundTrip(element: HTMLElement): void {
  expect(element).not.toHaveAttribute("data-state");
  fireEvent.pointerEnter(element);
  expect(element).toHaveAttribute("data-state", "hovered");
  fireEvent.pointerDown(element);
  expect(element).toHaveAttribute("data-state", "hovered pressed");
  fireEvent.pointerUp(element);
  expect(element).toHaveAttribute("data-state", "hovered");
  fireEvent.pointerLeave(element);
  expect(element).not.toHaveAttribute("data-state");
  fireEvent.focus(element);
  expect(element).toHaveAttribute("data-state", "focused focus-visible");
  fireEvent.blur(element);
  expect(element).not.toHaveAttribute("data-state");
}

describe("the composed handler bag keeps every kernel handler", () => {
  it("routes hover, press and focus on the edit toolbar", () => {
    const { container } = board();
    expectKernelRoundTrip(
      container.querySelector('[data-part="toolbar"]') as HTMLElement
    );
  });

  it("routes hover, press and focus on a card shell", () => {
    const { container } = board();
    expectKernelRoundTrip(
      container.querySelector('[data-part="card-shell"]') as HTMLElement
    );
  });

  it("routes hover, press and focus on the cell controls", () => {
    const { container } = board();
    expectKernelRoundTrip(
      container.querySelector('[data-part="cell-controls"]') as HTMLElement
    );
  });

  it("routes hover, press and focus on a catalog item", async () => {
    const { findByText } = render(
      <WidgetBoardEngine
        labels={labels}
        items={[item("alpha", 0), { ...item("beta", 1), visible: false }]}
        editable
        defaultEditing
        defaultCatalogOpen
        onItemsChange={() => {}}
      />
    );
    /* The catalog rides a lazy Sheet in a portal, so the item lands outside the
       render container and only after the Sheet resolves. */
    await findByText("beta");
    expectKernelRoundTrip(
      document.querySelector('[data-part="catalog-item"]') as HTMLElement
    );
  });

  it("keeps the kernel press AND the caller's drag on the same pointerdown", () => {
    const { container } = board();
    const controls = container.querySelector(
      '[data-part="cell-controls"]'
    ) as HTMLElement;

    /* `fireEvent` returns false when a handler prevented the default, which is
       the observable signature of the caller's `beginMove`. */
    const notPrevented = fireEvent.pointerDown(controls, {
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      cancelable: true,
    });
    expect(notPrevented).toBe(false);
    /* ...and the kernel's own handler ran too, on the one prop both wanted. */
    expect(controls).toHaveAttribute("data-state", "pressed");
  });
});
