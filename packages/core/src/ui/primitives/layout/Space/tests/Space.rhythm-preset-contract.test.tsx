/**
 * @fileoverview The Space focal rhythm contract -- Space's counterpart to
 * Flex/Grid/Stack.rhythm-preset-contract.test.tsx, written to close the gap
 * Finding 2 named: Space had no rhythm-preset test at all.
 *
 * SPACE'S SHAPE DIFFERS FROM ITS SISTERS IN ONE STRUCTURAL WAY: there is no
 * `Space/runtime/responsive/` folder, and `SpaceProps.size` is typed
 * `SpaceSize | LegacySpaceSize | number | [number, number]` -- NOT wrapped in
 * `ResponsiveValue<>` the way every other layout primitive's spacing prop is.
 * Space has no responsive path to test; leg 4 proves that structurally rather
 * than silently skipping the "scalar vs responsive" requirement.
 *
 * Space also already carries BOTH density and rhythm scaling in the same
 * `calc()` (`presentation/components/skin/layout-primitives.css`,
 * `.rottay-space.rottay-space--modern[data-part="root"]:where([data-size=...])`),
 * and that rule already chains `.rottay-space.rottay-space--modern` -- unlike
 * Flex and Stack's scalar rules before this wave, Space's preset-gap rule was
 * ALREADY Modern-only. Leg 6 proves that with the same counterfactual
 * technique Flex/Stack/Grid use, rather than asserting it from prose alone.
 *
 * Legs 1-3 pin CSS SOURCE TEXT and DOM ATTRIBUTES/CHANNELS, never a jsdom
 * `getComputedStyle` result: jsdom applies no author stylesheet, so a
 * computed-style assertion here would pass identically against a stylesheet
 * with no rules in it at all -- the same limitation every sibling contract
 * file in this directory already documents.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernSpace from "../engines/modern";
import { Space as ClassicSpace } from "../engines/classic";
import { Space as RusticSpace } from "../engines/rustic";
import { SPACE_SIZE_MAP, type SpaceProps } from "../contracts";
import { TENANT_THEME_RHYTHM_FACTORS } from "../../../../../foundation/contracts/composition/tenants/themes/tenant-theme";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAYOUT_PRIMITIVES = resolve(
  HERE,
  "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives.css"
);
const CSS = readFileSync(LAYOUT_PRIMITIVES, "utf8");
const RHYTHM = "--ds-rhythm-effective-scale";

/**
 * The full preset vocabulary the CSS `:where()` list keys on: the legacy
 * spelling `SPACE_SIZE_MAP` declares, plus the canonical `sm|md|lg` spelling
 * the modern/rustic engines accept and stamp verbatim on `data-size` (the
 * engine stamps whatever the caller passed, unnormalized -- see
 * `Space/engines/modern/index.tsx`'s `data-size={... : size}`). Space has no
 * exported enumeration array the way Flex has `FLEX_GAP_RHYTHM_PRESETS`; this
 * IS the enumeration the CSS and the caller-facing type must agree on.
 */
const PRESET_SPELLINGS = ["small", "middle", "large", "sm", "md", "lg"] as const;

describe("leg 1 -- a preset rung scales with rhythm", () => {
  it("stamps the raw size spelling on data-size for every enumerated preset", () => {
    for (const size of PRESET_SPELLINGS) {
      const { getByRole, unmount } = render(
        <ModernSpace role="group" aria-label="rung" size={size}>
          <span>a</span>
        </ModernSpace>
      );
      expect(getByRole("group"), size).toHaveAttribute("data-size", size);
      unmount();
    }
  });

  it("routes the preset through the instance-gap channel the scaled rule multiplies", () => {
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="md" size="md">
        <span>a</span>
      </ModernSpace>
    );
    expect(getByRole("group").getAttribute("style")).toContain(
      "--ds-space-instance-gap: var(--ds-space-middle-size)"
    );
  });

  it("the stylesheet scales that channel once, for every enumerated preset spelling", () => {
    for (const size of PRESET_SPELLINGS) {
      expect(CSS, size).toContain(`[data-size="${size}"]`);
    }
    expect(CSS).toContain(
      `* var(--ds-density-effective-scale) * var(${RHYTHM}, 1))`
    );
  });

  it("holds the scaled rule at the root rule's specificity via :where()", () => {
    // Same law as Flex/Grid/Stack: source order, not escalation, decides.
    expect(CSS).toContain(
      '.rottay-space.rottay-space--modern[data-part="root"]:where('
    );
  });
});

describe("leg 2 -- a numeric or [h, v] size is exact geometry and NEVER scales", () => {
  it("stamps a data-size the scaled selector cannot match, for a raw number", () => {
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="numeric" size={16}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "16");
    for (const preset of PRESET_SPELLINGS) {
      expect(space.getAttribute("data-size"), preset).not.toBe(preset);
    }
    expect(space.getAttribute("style")).toContain("--ds-space-instance-gap: 16px");
  });

  it("stamps a joined, still-unmatchable data-size for an [h, v] tuple", () => {
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="tuple" size={[8, 24]}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "8:24");
    // CSS shorthand order is row-gap column-gap: [h, v] -> "24px 8px".
    expect(space.getAttribute("style")).toContain(
      "--ds-space-instance-gap: 24px 8px"
    );
  });

  it("POSITIVE CONTROL: the scaled selector really is an exact enumerated list", () => {
    // Without this, the two legs above would also pass against a build where
    // the selector matched everything (e.g. an attribute-presence selector).
    expect(CSS).not.toContain('[data-size="16"]');
    expect(CSS).not.toContain('[data-size="8:24"]');
    for (const size of PRESET_SPELLINGS) {
      expect(CSS, size).toContain(`[data-size="${size}"]`);
    }
  });
});

describe("leg 3 -- direction, wrap, align and split are untouched", () => {
  it("keeps direction/wrap/align projections exactly as before, alongside a preset gap", () => {
    const { getByRole } = render(
      <ModernSpace
        role="group"
        aria-label="full"
        direction="vertical"
        wrap
        align="start"
        size="lg"
        dir="rtl"
        lang="ar"
      >
        <span>أ</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("dir", "rtl");
    expect(space).toHaveAttribute("data-direction", "vertical");
    expect(space).toHaveAttribute("data-wrap", "true");
    expect(space).toHaveAttribute("data-align", "start");
    expect(space).toHaveAttribute("data-size", "lg");
  });

  it("scales only the gap channel, never a physical side", () => {
    // Matched by DECLARATION shape (leading `gap:`), not by a selector-line
    // substring: the selector and the declaration that carries RHYTHM sit on
    // different source lines, so a selector-text filter alone finds nothing
    // -- the same two-part technique Flex's leg 3 uses.
    const scaledDeclarations = CSS.split("\n").filter(
      (line) => line.includes(RHYTHM) && /^\s*gap:/.test(line)
    );
    expect(scaledDeclarations.length).toBeGreaterThan(0);
    for (const line of scaledDeclarations) {
      expect(line, line.trim()).not.toMatch(/(margin|padding)-(left|right)/);
    }
  });
});

describe("leg 4 -- Space has NO responsive path (structural, not a jsdom gap)", () => {
  it("SpaceProps.size is not a ResponsiveValue -- a breakpoint object is not special-cased", () => {
    // Passed as a caller-side type violation on purpose (cast through
    // `unknown`): Space's `else` branch treats anything that is not a number
    // and not an array as a legacy-size STRING lookup. A breakpoint object
    // stringifies to "[object Object]", which is not an own key of
    // SPACE_SIZE_MAP, so the own-property guard (Finding 1's fix to this
    // exact function) falls back to the declared `small` rung -- proving
    // Space does not detect or branch on a responsive-shaped value at all.
    const responsiveShaped = { xs: "sm", lg: "xl" } as unknown as SpaceProps["size"];
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="responsive-shaped" size={responsiveShaped}>
        <span>a</span>
      </ModernSpace>
    );
    const space = getByRole("group");
    expect(space).toHaveAttribute("data-size", "[object Object]");
    expect(space.getAttribute("style")).toContain(
      `--ds-space-instance-gap: ${SPACE_SIZE_MAP.small}`
    );
  });

  it("there is no Space/runtime/responsive collector to opt rhythm into", () => {
    // Documented as a structural fact, verified by the absence of an import
    // rather than asserted from prose: every sibling primitive's Modern
    // engine imports a `collectXResponsiveEntries` from its own
    // `runtime/responsive`; Space's modern engine has no such import at all
    // (see Space/engines/modern/index.tsx's import list), because there is
    // no Space/runtime/ directory in the first place.
    const modernEngineSource = readFileSync(
      resolve(HERE, "../engines/modern/index.tsx"),
      "utf8"
    );
    expect(modernEngineSource).not.toContain("collectSpaceResponsiveEntries");
    expect(modernEngineSource).not.toContain("runtime/responsive");
    expect(modernEngineSource).not.toContain("generateResponsiveCSS");
  });
});

describe("leg 5 -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact removal", () => {
  // jsdom evaluates neither CSS custom properties nor calc(), so the three
  // named stops cannot be read back as computed pixel values here (every
  // sibling contract file in this directory states the identical
  // limitation). What CAN be proven honestly, and is:
  //
  //   (i)   the canonical factor table -- the SINGLE source of the three
  //         numbers every compiler/lowering path reads, per its own doc
  //         comment in tenant-theme/index.ts -- really does declare
  //         tight=0.85, normal=1, airy=1.2;
  //   (ii)  those three factors are monotonically increasing, which is the
  //         property that makes "tight < normal < airy for the same rung"
  //         true: the CSS formula multiplies a fixed positive BASE magnitude
  //         by exactly one of these factors (`base * scale`), and
  //         multiplying a positive constant by a larger factor yields a
  //         larger result -- an algebraic entailment, not a jsdom-computed
  //         one;
  //   (iii) "exact removal" -- an unset tenant rhythm restores the
  //         byte-identical pre-rhythm value -- holds because the formula's
  //         own fallback is the identity factor: `var(--ds-rhythm-scale, 1)`
  //         literally defaults to `1`, so `calc(base * 1)` is `base`, and
  //         `normal` (factor 1) is pinned to be that same identity in (i).
  it("pins the canonical tri-stop factor table", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS).toEqual({
      tight: 0.85,
      normal: 1,
      airy: 1.2,
    });
  });

  it("the three factors are strictly monotonically increasing", () => {
    const { tight, normal, airy } = TENANT_THEME_RHYTHM_FACTORS;
    expect(tight).toBeLessThan(normal);
    expect(normal).toBeLessThan(airy);
  });

  it("`normal` is the identity factor -- the same 1 the CSS fallback defaults to", () => {
    expect(TENANT_THEME_RHYTHM_FACTORS.normal).toBe(1);
    expect(CSS).toContain(`var(${RHYTHM}, 1)`);
  });

  it("EXACT REMOVAL: the scaled formula wraps the identical base magnitude the unscaled channel carries", () => {
    // The base magnitude a caller's preset resolves to is untouched by the
    // rhythm feature -- only WRAPPED. Proven by construction: the engine
    // projects the SAME `--ds-space-instance-gap` value regardless of
    // rhythm, and the CSS multiplies that one channel by the identity
    // fallback when unset.
    const { getByRole } = render(
      <ModernSpace role="group" aria-label="md" size="md">
        <span>a</span>
      </ModernSpace>
    );
    const instanceGap = getByRole("group")
      .getAttribute("style")
      ?.match(/--ds-space-instance-gap: ([^;]+);/)?.[1];
    expect(instanceGap).toBe(SPACE_SIZE_MAP.middle);
    expect(CSS).toContain(
      `gap: calc(var(--ds-space-instance-gap, var(--ds-space-small-size, var(--ds-spacing-2))) * var(--ds-density-effective-scale) * var(${RHYTHM}, 1));`
    );
  });
});

describe("leg 6 -- CLASSIC/RUSTIC INVARIANCE (the counterfactual control)", () => {
  // Unlike Flex and Stack (Finding 3), Space's scaled rule was ALREADY
  // correctly scoped: `.rottay-space.rottay-space--modern[data-part="root"]`
  // chains BOTH classes, and neither Classic (a thin AntSpace wrapper) nor
  // Rustic (inline styles only) ever renders that class pair or a `data-size`
  // attribute at all -- confirmed structurally below, not just by selector
  // text. NO CSS SCOPING CHANGE WAS NEEDED for Space.
  it("Classic never renders the rottay-space class or a data-size attribute", () => {
    const { container } = render(
      <ClassicSpace size="lg">
        <span>a</span>
      </ClassicSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/rottay-space/);
    expect(root.getAttribute("data-size")).toBeNull();
  });

  it("Rustic never renders the rottay-space class or a data-size attribute", () => {
    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/rottay-space/);
    expect(root.getAttribute("data-size")).toBeNull();
  });

  it("Classic and Rustic resolve gap ENTIRELY inline -- no external stylesheet channel to scope", () => {
    // Classic delegates to AntSpace's own `size` prop (no DS gap value
    // emitted by this codebase at all); Rustic computes a literal px/token
    // string and writes it straight to `style.gap`. Neither reads or could
    // be reached by `--ds-rhythm-effective-scale`.
    //
    // Rustic's own (pre-existing, unrelated, read-only) code appends a
    // literal "px" suffix unconditionally -- `${SPACE_SIZE_MAP[...]}px` in
    // Space/engines/rustic/index.tsx -- even though the value is a `var()`
    // token, not a number. That quirk predates this work and is reproduced
    // here verbatim rather than "corrected" in the expectation.
    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gap).toBe(`${SPACE_SIZE_MAP.large}px`);
    expect(root.getAttribute("style") ?? "").not.toContain(RHYTHM);
  });

  it("byte-identical across all THREE rhythm stops: the read-only engines never consume the channel at all", () => {
    // The strongest honest proof jsdom allows: since Classic/Rustic's JS
    // never reads --ds-rhythm-effective-scale (previous leg) and this
    // component tree is a pure function of props, rendering under an
    // ambient wrapper that sets the channel to each of the three canonical
    // stops cannot change what these two engines emit -- there is no code
    // path for it to reach. Asserted for all three stops explicitly rather
    // than inferred from "it does not read the variable" alone.
    for (const factor of Object.values(TENANT_THEME_RHYTHM_FACTORS)) {
      const wrapperStyle = { "--ds-rhythm-effective-scale": String(factor) } as React.CSSProperties;
      const classicRender = render(
        <div style={wrapperStyle}>
          <ClassicSpace size="lg">
            <span>a</span>
          </ClassicSpace>
        </div>
      );
      const rusticRender = render(
        <div style={wrapperStyle}>
          <RusticSpace size="lg">
            <span>a</span>
          </RusticSpace>
        </div>
      );
      // Same reliable reference the earlier legs in this describe use: the
      // wrapper div's first child is the engine's own root (AntSpace for
      // Classic, a plain div for Rustic) -- no selector guess needed.
      const classicRoot = classicRender.container.firstElementChild
        ?.firstElementChild as HTMLElement;
      const rusticRoot = rusticRender.container.firstElementChild
        ?.firstElementChild as HTMLElement;
      expect(rusticRoot.style.gap, String(factor)).toBe(`${SPACE_SIZE_MAP.large}px`);
      expect(classicRoot.getAttribute("style") ?? "", String(factor)).not.toContain(
        RHYTHM
      );
      classicRender.unmount();
      rusticRender.unmount();
    }
  });

  it("POSITIVE CONTROL: Modern genuinely differs from Classic/Rustic on the same preset", () => {
    const { getByRole: modernQuery, unmount: unmountModern } = render(
      <ModernSpace role="group" aria-label="modern" size="lg">
        <span>a</span>
      </ModernSpace>
    );
    const modernStyle = modernQuery("group").getAttribute("style") ?? "";
    expect(modernStyle).toContain("--ds-space-instance-gap");
    // A boundary-anchored check: "gap:" alone is also a substring of
    // "--ds-space-instance-gap:", which Modern DOES (correctly) emit.
    expect(modernStyle).not.toMatch(/(^|;)\s*gap:/);
    unmountModern();

    const { container } = render(
      <RusticSpace size="lg">
        <span>a</span>
      </RusticSpace>
    );
    const rusticRoot = container.firstElementChild as HTMLElement;
    // Rustic writes the resolved gap directly; Modern writes only the
    // instance channel and lets the (Modern-scoped) stylesheet compose it.
    expect(rusticRoot.getAttribute("style") ?? "").not.toContain(
      "--ds-space-instance-gap"
    );
  });
});
