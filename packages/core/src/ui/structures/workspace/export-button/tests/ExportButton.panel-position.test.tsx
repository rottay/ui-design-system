/**
 * The panel is portaled and `position: fixed`, so its `top`/`left` are VIEWPORT
 * coordinates. Measuring them once at open is the defect this file pins: any
 * scroll or resize while the menu is open moves the trigger and leaves the menu
 * behind, floating over unrelated content.
 *
 * happy-dom returns a zeroed rect for everything, so the trigger's own
 * `getBoundingClientRect` is replaced by a movable one. That is the measurement
 * under test — nothing here asserts painted geometry.
 *
 * Stated rather than implied: the scroll and resize cases fail against the
 * pre-fix component and the reopen case does not. Dropping the measurement on
 * close removes a single stale frame at reopen, and a one-frame paint is not
 * observable here — that half of the repair is UNVERIFIED by this instrument,
 * not proven. The reopen case below is a regression guard, not a control.
 */

import React from "react";

import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { ExportButton } from "../index";
import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";
import { waitForPortalContent } from "../../../../../tooling/testing/helpers/skin-reachability";

const PANEL = ".ds-export-button-panel";

interface Placed {
  container: HTMLElement;
  /** Moves the trigger, as a scroll or a layout change would. */
  moveTrigger: (bottom: number, right: number) => void;
  panel: () => HTMLElement;
}

async function openPanel(): Promise<Placed> {
  const { container } = renderWithEngine(
    <ExportButton
      data={[{ name: "a" }]}
      columns={[{ key: "name", header: "Name" }]}
      formats={["csv", "json"]}
    />,
    "modern"
  );

  const root = await waitFor(() => {
    const node = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });

  let rect = { bottom: 100, right: 200 };
  const moveTrigger = (bottom: number, right: number) => {
    rect = { bottom, right };
  };
  root.getBoundingClientRect = () =>
    ({ ...rect, top: 0, left: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;

  fireEvent.click(container.querySelector('[data-part="trigger"]') as HTMLElement);
  await waitForPortalContent(waitFor, PANEL, '[data-part="menu-item"]', 1);

  return {
    container,
    moveTrigger,
    panel: () => document.querySelector(PANEL) as HTMLElement,
  };
}

describe("ExportButton panel position", () => {
  it("measures the trigger when the menu opens", async () => {
    const { panel } = await openPanel();
    expect(panel().style.top).toBe("104px");
    expect(panel().style.left).toBe("200px");
  });

  it("follows the trigger when an ancestor scrolls", async () => {
    const { container, moveTrigger, panel } = await openPanel();
    moveTrigger(40, 200);
    // Dispatched on a descendant on purpose: scroll does not bubble, so a
    // listener that is not registered in the capture phase never sees a
    // scrolling ancestor move the trigger.
    fireEvent.scroll(container.querySelector('[data-part="root"]') as HTMLElement);
    await waitFor(() => expect(panel().style.top).toBe("44px"));
  });

  it("follows the trigger on resize", async () => {
    const { moveTrigger, panel } = await openPanel();
    moveTrigger(100, 640);
    fireEvent(window, new Event("resize"));
    await waitFor(() => expect(panel().style.left).toBe("640px"));
  });

  it("measures the trigger's current position on reopen", async () => {
    const { container, moveTrigger, panel } = await openPanel();
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;

    fireEvent.click(trigger);
    await waitFor(() => expect(document.querySelector(PANEL)).toBeNull());

    moveTrigger(300, 200);
    fireEvent.click(trigger);
    await waitForPortalContent(waitFor, PANEL, '[data-part="menu-item"]', 1);
    expect(panel().style.top).toBe("304px");
  });
});
