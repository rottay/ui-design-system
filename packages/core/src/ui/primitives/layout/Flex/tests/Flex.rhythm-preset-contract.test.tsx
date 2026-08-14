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
import { Flex as ClassicFlex } from "../engines/classic";
import { Flex as RusticFlex } from "../engines/rustic";
import {
  FLEX_GAP_RHYTHM_PRESETS,
  flexGapPresetSpelling,
  resolveFlexGapValue,
  type FlexProps,
} from "../contracts";
import { TENANT_THEME_RHYTHM_FACTORS } from "../../../../../foundation/contracts/composition/tenants/themes/tenant-theme";

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

/**
 * leg 4 -- the RESPONSIVE projection.
 *
 * The three legs above are the SCALAR path, where the rung is stamped on the
 * root and layout-primitives.css does the multiplying. A responsive gap can
 * take a different value at every breakpoint, so no single root attribute can
 * describe it: `resolveFlexAttributes` stamps nothing and the generated
 * breakpoint rule matches none of the scaled selectors. Rhythm did not reach it
 * at all -- Flex was elevated on the scalar path and silently flat on the
 * responsive one.
 *
 * These legs assert the generated CSS TEXT, not a computed value: jsdom applies
 * no author stylesheet, so `getComputedStyle` here would report the same thing
 * against a file with no rules in it. The `<style>` element the engine emits IS
 * the artifact under test.
 *
 * The counterfactual that keeps the fix Modern-only is structural rather than
 * rhetorical: the collector is shared by all three engines, so every scenario
 * is rendered through Classic and Rustic too and pinned to the exact text they
 * emitted before this wave.
 */
const RHYTHM_READ = "var(--ds-rhythm-effective-scale, 1)";

/** The emitted scoped CSS, with the per-render element id normalized away. */
function emittedCSS(ui: React.ReactElement): string {
  const { container, unmount } = render(ui);
  const css = container.querySelector("style")?.textContent ?? "";
  unmount();
  return css.replace(/"flex-[^"]*"/g, '"flex-ID"');
}

interface ResponsiveScenario {
  readonly name: string;
  readonly gap: NonNullable<FlexProps["gap"]>;
  /** Exactly what Classic and Rustic emit -- unchanged by this wave. */
  readonly unscaled: string;
  /** Exactly what Modern emits: the same text, rungs wrapped once. */
  readonly scaled: string;
}

const SELECTOR = '[data-responsive-id="flex-ID"]';

/** Builds the generator's own output shape without re-deriving its values. */
function block(base: string, media?: readonly [number, string]): string {
  const head = `${SELECTOR} {\n  gap: ${base};\n}\n`;
  if (!media) return head;
  return `${head}@media (min-width: ${media[0]}px) {\n  ${SELECTOR} {\n    gap: ${media[1]};\n  }\n}\n`;
}

const SCENARIOS: readonly ResponsiveScenario[] = [
  {
    name: "preset rungs scale at every breakpoint",
    gap: { xs: "md", lg: "2xl" },
    unscaled: block("var(--ds-spacing-4, 1rem)", [
      1024,
      "var(--ds-spacing-10, 2.5rem)",
    ]),
    scaled: block(`calc(var(--ds-spacing-4, 1rem) * ${RHYTHM_READ})`, [
      1024,
      `calc(var(--ds-spacing-10, 2.5rem) * ${RHYTHM_READ})`,
    ]),
  },
  {
    name: "numeric gaps stay exact px, unwrapped and unscaled",
    gap: { xs: 8, lg: 24 },
    unscaled: block("8px", [1024, "24px"]),
    scaled: block("8px", [1024, "24px"]),
  },
  {
    name: "a mixed tuple scales the rung axis and leaves the measurement",
    // Public order is [column, row]; CSS shorthand is `row column`. With
    // column=8 and row="md" the rung must land FIRST and keep the 8px exact.
    gap: { xs: [8, "md"] },
    unscaled: block("var(--ds-spacing-4, 1rem) 8px"),
    scaled: block(`calc(var(--ds-spacing-4, 1rem) * ${RHYTHM_READ}) 8px`),
  },
  {
    name: "`none` stays zero -- zero has no room to scale",
    gap: { xs: "none", lg: "md" },
    unscaled: block("0", [1024, "var(--ds-spacing-4, 1rem)"]),
    scaled: block("0", [
      1024,
      `calc(var(--ds-spacing-4, 1rem) * ${RHYTHM_READ})`,
    ]),
  },
  {
    name: "negative, NaN and Infinity normalize to 0px and never acquire a calc",
    gap: {
      xs: -8,
      md: Number.NaN,
      xl: Number.POSITIVE_INFINITY,
    },
    unscaled: `${SELECTOR} {\n  gap: 0px;\n}\n@media (min-width: 768px) {\n  ${SELECTOR} {\n    gap: 0px;\n  }\n}\n@media (min-width: 1280px) {\n  ${SELECTOR} {\n    gap: 0px;\n  }\n}\n`,
    scaled: `${SELECTOR} {\n  gap: 0px;\n}\n@media (min-width: 768px) {\n  ${SELECTOR} {\n    gap: 0px;\n  }\n}\n@media (min-width: 1280px) {\n  ${SELECTOR} {\n    gap: 0px;\n  }\n}\n`,
  },
];

describe("leg 4 -- rhythm reaches the RESPONSIVE preset gap under Modern", () => {
  it.each(SCENARIOS)("Modern: $name", ({ gap, scaled }) => {
    expect(emittedCSS(<ModernFlex gap={gap} />)).toBe(scaled);
  });

  it("POSITIVE CONTROL: the pinned Modern text really does carry the axis", () => {
    // Without this, every scenario above would also pass against a build where
    // the fix was reverted and the pins were quietly rewritten to match.
    const preset = SCENARIOS[0].scaled;
    expect(preset.split(RHYTHM_READ).length - 1).toBe(2);
    expect(SCENARIOS[1].scaled).not.toContain(RHYTHM_READ);
  });

  it("never multiplies the scale twice in one declaration", () => {
    for (const { scaled } of SCENARIOS) {
      for (const line of scaled.split("\n")) {
        if (!line.includes(RHYTHM_READ)) continue;
        expect(line.split("--ds-rhythm-effective-scale").length - 1, line).toBe(
          1
        );
      }
    }
  });
});

describe("leg 5 -- CLASSIC/RUSTIC INVARIANCE (the counterfactual control)", () => {
  it.each(SCENARIOS)("Classic is byte-identical for: $name", ({ gap, unscaled }) => {
    expect(emittedCSS(<ClassicFlex gap={gap} />)).toBe(unscaled);
  });

  it.each(SCENARIOS)("Rustic is byte-identical for: $name", ({ gap, unscaled }) => {
    expect(emittedCSS(<RusticFlex gap={gap} />)).toBe(unscaled);
  });

  it("the read-only engines never emit the rhythm channel at all", () => {
    for (const { gap } of SCENARIOS) {
      expect(emittedCSS(<ClassicFlex gap={gap} />)).not.toContain(
        "--ds-rhythm-effective-scale"
      );
      expect(emittedCSS(<RusticFlex gap={gap} />)).not.toContain(
        "--ds-rhythm-effective-scale"
      );
    }
  });

  it("POSITIVE CONTROL: Modern and Classic genuinely diverge on a rung", () => {
    // Proves the two blocks above are comparing a real difference rather than
    // three engines that all lost the axis together.
    const gap = SCENARIOS[0].gap;
    expect(emittedCSS(<ModernFlex gap={gap} />)).not.toBe(
      emittedCSS(<ClassicFlex gap={gap} />)
    );
    // ...and that they still AGREE wherever the law says nothing may change.
    const numeric = SCENARIOS[1].gap;
    expect(emittedCSS(<ModernFlex gap={numeric} />)).toBe(
      emittedCSS(<ClassicFlex gap={numeric} />)
    );
  });
});

/**
 * leg 6 -- the SCALAR path is Modern-only too (Finding 3).
 *
 * Legs 1-5 above prove the RESPONSIVE path (the generated per-breakpoint
 * `<style>` tag) never reached Classic/Rustic. The SCALAR path is a DIFFERENT
 * mechanism -- the SHARED, globally-loaded `layout-primitives.css` -- and it
 * was NOT provably Modern-only until this wave: `resolveFlexAttributes` is
 * the single scalar projection all three engines call, so Classic and Rustic
 * stamp the identical `data-gap="uniform"`/`data-gap-preset="md"` attributes
 * on the identical shared `.rottay-flex` class the scaled CSS rule matches
 * on. Proven below in two parts: the vulnerability's PRECONDITION really
 * holds (both attribute and class are genuinely shared), and the FIX (a
 * chained `:where(.rottay-flex--modern)` clause) closes it without touching
 * either read-only engine file.
 */
describe("leg 6 -- the SCALAR path is Modern-only too (Finding 3)", () => {
  it("PRECONDITION: Classic and Rustic share the exact attributes/class the scaled rule keys on", () => {
    // If this fails, the vulnerability leg 6 exists to close was never real
    // for this codebase, and the fix below would be solving a non-problem.
    for (const Engine of [ClassicFlex, RusticFlex]) {
      const { getByRole, unmount } = render(
        <Engine role="group" aria-label="shared" gap="md">
          <span>a</span>
        </Engine>
      );
      const flex = getByRole("group");
      expect(flex).toHaveAttribute("data-gap", "uniform");
      expect(flex).toHaveAttribute("data-gap-preset", "md");
      expect(flex.className).toMatch(/(^|\s)rottay-flex(\s|$)/);
      unmount();
    }
  });

  it("the scaled rule's selector requires the modern-only class, chained via a second zero-specificity :where()", () => {
    expect(CSS).toContain(
      '.rottay-flex[data-gap="uniform"]:where(.rottay-flex--modern):where('
    );
    expect(CSS).toContain(
      '.rottay-flex[data-gap="split"]:where(.rottay-flex--modern):where('
    );
  });

  it("Modern stamps the --modern class; Classic and Rustic never do", () => {
    const { getByRole: modernQuery, unmount: unmountModern } = render(
      <ModernFlex role="group" aria-label="modern" gap="md">
        <span>a</span>
      </ModernFlex>
    );
    expect(modernQuery("group").className).toMatch(/(^|\s)rottay-flex--modern(\s|$)/);
    unmountModern();

    for (const Engine of [ClassicFlex, RusticFlex]) {
      const { getByRole, unmount } = render(
        <Engine role="group" aria-label="not-modern" gap="md">
          <span>a</span>
        </Engine>
      );
      expect(getByRole("group").className).not.toMatch(/rottay-flex--modern/);
      unmount();
    }
  });

  it("byte-identical across all THREE rhythm stops: Classic/Rustic never consume the channel at all", () => {
    // jsdom applies no author stylesheet, so the scaled `calc()` this leg's
    // sibling legs pin as CSS SOURCE TEXT can never execute here regardless
    // of engine -- that limitation is stated, not worked around. What CAN be
    // proven honestly: `resolveFlexAttributes` (the shared scalar resolver)
    // is a pure function of props, so wrapping the SAME render in an ambient
    // `--ds-rhythm-effective-scale` at each of the three canonical stops
    // cannot change what it stamps, because there is no code path in
    // Classic/Rustic that reads that channel at all.
    for (const [stopName, factor] of Object.entries({ tight: 0.85, normal: 1, airy: 1.2 })) {
      const wrapperStyle = { "--ds-rhythm-effective-scale": String(factor) } as React.CSSProperties;
      for (const Engine of [ClassicFlex, RusticFlex]) {
        const { container, unmount } = render(
          <div style={wrapperStyle}>
            <Engine role="group" aria-label={stopName} gap="md">
              <span>a</span>
            </Engine>
          </div>
        );
        const flex = container.querySelector('[role="group"]') as HTMLElement;
        expect(flex.getAttribute("data-gap-preset"), stopName).toBe("md");
        expect(flex.getAttribute("style") ?? "", stopName).not.toContain(
          "--ds-rhythm-effective-scale"
        );
        unmount();
      }
    }
  });
});

/**
 * leg 7 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact
 * removal. Mirrors Space.rhythm-preset-contract.test.tsx's leg 5 for the
 * same canonical factor table; see that file for the full jsdom-limitation
 * reasoning (calc() cannot be evaluated here, so the proof is algebraic --
 * base * larger-factor is larger for a positive base -- plus the identity
 * fallback, not a computed pixel comparison).
 */
describe("leg 7 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact removal", () => {
  it("pins the canonical tri-stop factor table", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS).toEqual({ tight: 0.85, normal: 1, airy: 1.2 });
  });

  it("the three factors are strictly monotonically increasing", () => {
    const { tight, normal, airy } = TENANT_THEME_RHYTHM_FACTORS;
    expect(tight).toBeLessThan(normal);
    expect(normal).toBeLessThan(airy);
  });

  it("EXACT REMOVAL: `normal` is the identity factor the CSS fallback already defaults to", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS.normal).toBe(1);
    expect(CSS).toContain(`gap: calc(var(--ds-flex-gap) * var(${RHYTHM}, 1))`);
    // The base magnitude a caller's rung resolves to is untouched by rhythm
    // -- only wrapped. resolveFlexGapValue (leg 1's own channel source) and
    // the calc() wrapper's operand are the SAME text.
    expect(resolveFlexGapValue("md")).toBe("var(--ds-spacing-4, 1rem)");
  });
});
