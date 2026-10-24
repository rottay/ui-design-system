import React from "react";

import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { ExportButton } from "../index";
import { renderWithEngine, STABLE_ENGINES } from "@tests/support/engine";
import {
  readSkinRules,
  unreachableSelectors,
  waitForPortalContent,
} from "@tests/support/skin-reachability";

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
    '.ds-export-button-item',
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
// The class arms are paired with the same unmounted toast selectors above;
// they keep that state UNVERIFIED rather than proving copied feedback live.
const CLASS_TOAST_SELECTOR =
  ".ds-structure.ds-export-button.ds-export-button__root .ds-export-button__toast";
const EXEMPT = (selector: string): boolean =>
  selector.includes("[data-part='toast']") ||
  selector === CLASS_TOAST_SELECTOR ||
  selector === `${CLASS_TOAST_SELECTOR} .ds-export-button__toast-label`;

/** The Modern button answers to the `ds-` namespace; the frozen engines keep theirs. */
const buttonEngineClass = (engine: string) =>
  engine === "modern" ? "ds-button--modern" : `rottay-button--${engine}`;

describe("ExportButton skin reachability", () => {
  it("keeps the unverified toast exclusion within its exact owner arms", () => {
    for (const selector of [
      ".ds-structure.ds-export-button[data-part='root'] [data-part='toast']",
      ".ds-structure.ds-export-button[data-part='root'] [data-part='toast'] .ds-export-button__toast-label",
      CLASS_TOAST_SELECTOR,
      `${CLASS_TOAST_SELECTOR} .ds-export-button__toast-label`,
    ]) {
      expect(EXEMPT(selector), selector).toBe(true);
    }
    for (const selector of [
      ".ds-structure.ds-export-button.ds-export-button__other .ds-export-button__toast",
      ".ds-structure.ds-export-button.ds-export-button__root .ds-export-button__panel",
      `${CLASS_TOAST_SELECTOR} .ds-export-button__toast-label-extra`,
      ".ds-export-button__toast",
      `${CLASS_TOAST_SELECTOR} .foreign-label`,
    ]) {
      expect(EXEMPT(selector), selector).toBe(false);
    }
  });

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

  it.each(STABLE_ENGINES)(
    "renders in the active engine and keeps the item hook under %s",
    async (engine) => {
      // The family used to pass `engine="modern"` to its own controls — the
      // only such override in the structures tier — so an export control in a
      // classic or rustic app was the one modern-looking button in the
      // toolbar. It could not simply be dropped: `[data-part='menu-item']`
      // reaches the item under modern alone, so the class arm is what makes
      // the engine-agnostic rendering safe.
      const { container } = renderWithEngine(
        <ExportButton
          data={[{ name: "a" }]}
          columns={[{ key: "name", header: "Name" }]}
          formats={["csv", "json"]}
        />,
        engine
      );
      const trigger = await waitFor(() => {
        const node = container.querySelector(
          `.${buttonEngineClass(engine)}`
        ) as HTMLElement;
        expect(node).not.toBeNull();
        return node;
      });
      const foreign = STABLE_ENGINES.filter((other) => other !== engine).map((other) => `.${buttonEngineClass(other)}`);
      expect(container.querySelectorAll(foreign.join(', '))).toHaveLength(0);

      fireEvent.click(trigger);
      await waitForPortalContent(
        waitFor,
        ".ds-export-button-panel",
        ".ds-export-button-item",
        1
      );
      for (const item of document.querySelectorAll(".ds-export-button-item")) {
        expect(item.className).toContain(buttonEngineClass(engine));
      }
    }
  );

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
