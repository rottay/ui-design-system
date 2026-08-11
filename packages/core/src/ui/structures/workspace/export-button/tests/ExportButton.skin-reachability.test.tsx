import React from "react";

import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { ExportButton } from "../index";
import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";
import {
  readSkinRules,
  unreachableSelectors,
  waitForPortalContent,
} from "../../../../../tooling/testing/helpers/skin-reachability";

async function openPanel(): Promise<HTMLElement> {
  const { container } = renderWithEngine(
    <ExportButton
      data={[{ name: "a" }, { name: "b" }]}
      columns={[{ key: "name", header: "Name" }]}
      formats={["csv", "json", "clipboard"]}
    />,
    "modern"
  );
  const trigger = await waitFor(() => {
    const node = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(trigger);
  // The panel is portalled (`<Portal><PortalScope>`) AND gated on a measured
  // position, so it is neither in the container nor present on the same tick
  // as the click. Content-level gate, on `document`.
  await waitForPortalContent(
    waitFor,
    ".ds-export-button-panel",
    '[data-part="menu-item"]',
    1
  );
  return container;
}

/**
 * Excluded with reasons, never to make the sweep pass:
 *  - the toast: it renders only after a completed export, and this
 *    environment cannot supply one — `navigator.clipboard` is a getter-only
 *    property, so it cannot be stubbed ("Cannot set property clipboard of
 *    [object Object] which has only a getter"). Its 3 rules are therefore
 *    UNVERIFIED by this instrument, not proven live. The shared workspace
 *    contract test records the same gap.
 */
const EXEMPT = (selector: string): boolean => selector.includes('[data-part=\'toast\']');

describe("ExportButton skin reachability", () => {
  it("every authored selector matches a node the family actually renders", async () => {
    const container = await openPanel();
    // `document`, because the panel is portalled out of the container.
    expect(
      unreachableSelectors({
        rules: readSkinRules("export-button"),
        scopes: [container, document],
        exempt: EXEMPT,
      })
    ).toEqual([]);
  });

  it("panel rules are scoped to the panel's own class", () => {
    const rules = readSkinRules("export-button");
    const panelParts = rules.filter((rule) =>
      /\[data-part='(panel|menu-item)'\]/.test(rule.selector)
    );
    expect(panelParts.length).toBeGreaterThan(0);
    for (const rule of panelParts) {
      expect(rule.selector, rule.selector).toContain("ds-export-button-panel");
    }
  });
});
