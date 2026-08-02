/**
 * @fileoverview The Flex preset/numeric split that lets layout rhythm reach a
 * rung without ever touching a caller's measurement.
 *
 * WHY THIS CONTRACT EXISTS. `--ds-flex-gap` carries both kinds of value: a
 * preset resolves to `var(--ds-spacing-4, 1rem)`, a number to `16px`. One
 * channel, two meanings, and CSS could not tell them apart -- so for one wave
 * Flex was the single layout primitive rhythm could not reach. The contract now
 * stamps the preset SPELLING per axis and only for rungs; the stylesheet keys
 * on those spellings with `:where()`, exactly as Space does for `data-size`.
 *
 * The three legs below are the whole law: a rung SCALES, a measurement NEVER
 * does, and neither changes direction, wrapping or logical-property behaviour.
 * The CSS legs read the stylesheet source because jsdom does not apply author
 * stylesheets -- an assertion on `getComputedStyle` here would pass against a
 * file with no rules in it at all.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernFlex from "../engines/modern";
import { FLEX_GAP_RHYTHM_PRESETS, flexGapPresetSpelling } from "../contracts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAYOUT_PRIMITIVES = resolve(
  HERE,
  "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives.css"
);
const CSS = readFileSync(LAYOUT_PRIMITIVES, "utf8");
const RHYTHM = "--ds-rhythm-effective-scale";

describe("leg 1 -- a preset rung scales with rhythm", () => {
  it("stamps the spelling for every rung the contract enumerates", () => {
    for (const rung of FLEX_GAP_RHYTHM_PRESETS) {
      const { getByRole, unmount } = render(
        <ModernFlex role="group" aria-label="rung" gap={rung} engine="modern">
          <span>a</span>
        </ModernFlex>
      );
      expect(getByRole("group"), rung).toHaveAttribute("data-gap-preset", rung);
      unmount();
    }
  });

  it("routes the rung through the channel the scaled rule multiplies", () => {
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="md" gap="md" engine="modern">
        <span>a</span>
      </ModernFlex>
    );
    expect(getByRole("group").getAttribute("style")).toContain(
      "--ds-flex-gap: var(--ds-spacing-4"
    );
  });

  it("the stylesheet scales that channel once, for every enumerated rung", () => {
    for (const rung of FLEX_GAP_RHYTHM_PRESETS) {
      expect(CSS, rung).toContain(`[data-gap-preset="${rung}"]`);
    }
    expect(CSS).toContain(
      `gap: calc(var(--ds-flex-gap) * var(${RHYTHM}, 1))`
    );
    // Split axes are separate rules: [column, row] may mix a rung with a number.
    expect(CSS).toContain(
      `column-gap: calc(var(--ds-flex-column-gap) * var(${RHYTHM}, 1))`
    );
    expect(CSS).toContain(
      `row-gap: calc(var(--ds-flex-row-gap) * var(${RHYTHM}, 1))`
    );
  });

  it("holds the scaled rules at the base rules' specificity via :where()", () => {
    // Escalating instead would make the preset rule beat a later consumer
    // stylesheet, which is the opposite of the unlayered contract this file
    // declares. Source order, not weight, decides.
    expect(CSS).toContain('.rottay-flex[data-gap="uniform"]:where(');
    expect(CSS).toContain('.rottay-flex[data-gap="split"]:where(');
  });
});

describe("leg 2 -- a numeric gap is exact geometry and NEVER scales", () => {
  it("stamps no preset spelling for a number, so no scaled rule can match", () => {
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="numeric" gap={16} engine="modern">
        <span>a</span>
      </ModernFlex>
    );
    const flex = getByRole("group");
    expect(flex).toHaveAttribute("data-gap", "uniform");
    expect(flex).not.toHaveAttribute("data-gap-preset");
    expect(flex.getAttribute("style")).toContain("--ds-flex-gap: 16px");
  });

  it("stamps nothing for `none` either -- zero has no room to scale", () => {
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="none" gap="none" engine="modern">
        <span>a</span>
      </ModernFlex>
    );
    expect(getByRole("group")).not.toHaveAttribute("data-gap-preset");
    expect(flexGapPresetSpelling("none")).toBeUndefined();
  });

  it("marks only the rung axis when a split gap mixes a rung with a number", () => {
    const { getByRole } = render(
      <ModernFlex role="group" aria-label="mixed" gap={["lg", 12]} engine="modern">
        <span>a</span>
      </ModernFlex>
    );
    const flex = getByRole("group");
    expect(flex).toHaveAttribute("data-gap", "split");
    expect(flex).toHaveAttribute("data-column-gap-preset", "lg");
    expect(flex).not.toHaveAttribute("data-row-gap-preset");
    expect(flex.getAttribute("style")).toContain("--ds-flex-row-gap: 12px");
  });

  it("POSITIVE CONTROL: the same assertions catch a rung being missed", () => {
    // Without this the three negatives above would also pass against a build
    // where the contract stamped nothing at all.
    expect(flexGapPresetSpelling("lg")).toBe("lg");
    expect(flexGapPresetSpelling(12)).toBeUndefined();
  });

  it("never multiplies rhythm twice in one declaration", () => {
    const scaled = CSS.split("\n").filter((line) => line.includes(RHYTHM));
    expect(scaled.length).toBeGreaterThan(0);
    for (const line of scaled) {
      expect(line.split(RHYTHM).length - 1, line.trim()).toBe(1);
    }
  });
});

describe("leg 3 -- direction, wrapping and logical properties are untouched", () => {
  it("keeps RTL, wrap and direction projections exactly as before", () => {
    const { getByRole } = render(
      <ModernFlex
        role="group"
        aria-label="rtl"
        dir="rtl"
        lang="ar"
        gap={["sm", "lg"]}
        wrap="wrap"
        direction="column"
        engine="modern"
      >
        <span>أ</span>
      </ModernFlex>
    );
    const flex = getByRole("group");
    expect(flex).toHaveAttribute("dir", "rtl");
    expect(flex).toHaveAttribute("data-wrap", "wrap");
    expect(flex).toHaveAttribute("data-direction", "column");
    expect(flex).toHaveAttribute("data-gap", "split");
  });

  it("scales only axis-relative gap properties, never a physical side", () => {
    // `gap`/`column-gap`/`row-gap` follow the writing mode, so a scaled rung
    // behaves identically in LTR and RTL. A physical margin would not.
    const scaledDeclarations = CSS.split("\n")
      .filter((line) => line.includes(RHYTHM) && line.includes(".rottay-flex"))
      .concat(
        CSS.split("\n").filter(
          (line) => line.includes(RHYTHM) && /^\s*(row-|column-)?gap:/.test(line)
        )
      );
    for (const line of scaledDeclarations) {
      expect(line, line.trim()).not.toMatch(/(margin|padding)-(left|right)/);
    }
  });
});
