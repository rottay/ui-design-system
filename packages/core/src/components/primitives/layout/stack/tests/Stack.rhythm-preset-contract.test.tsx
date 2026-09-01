/**
 * @fileoverview The Stack preset/numeric split for layout rhythm, on the path
 * a root attribute cannot describe: the RESPONSIVE projection.
 *
 * WHY THIS CONTRACT EXISTS. A scalar `spacing="md"` stamps `data-spacing="md"`
 * and layout-primitives.css assigns
 * `--_ds-stack-gap-current: calc(var(--ds-spacing-4) * rhythm)`, so the rung
 * and the divider centering that mirrors it both breathe with the tenant axis.
 * A RESPONSIVE spacing takes a different value per breakpoint, so no single
 * attribute can describe it: `resolveStackPresentation` stamps nothing, the
 * generated breakpoint rule matches none of the `[data-spacing="..."]`
 * selectors, and rhythm reached the scalar rung while the responsive one stayed
 * flat. The rung therefore carries its own `calc()` in the generated rule.
 *
 * These legs assert the emitted CSS TEXT. jsdom applies no author stylesheet,
 * so `getComputedStyle` here would report the same thing against a stylesheet
 * with no rules in it; the `<style>` element the engine emits IS the artifact.
 *
 * MODERN ONLY. `collectStackResponsiveEntries` is the single projection for all
 * three engines and Classic/Rustic are read-only, so the opt-in lives at the
 * Modern call site and every scenario below is rendered through the other two
 * engines and pinned to the exact text they emitted before this wave.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernStack from "../engines/modern";
import ClassicStack from "../engines/classic";
import RusticStack from "../engines/rustic";
import {
  resolveSpacing,
  stackSpacingPresetSpelling,
  SPACING_MAP,
} from "../contracts";
import type { StackSpacing } from "../contracts";
import { resolveFlexGapValue } from "../../flex/contracts";
import {
  collectStackResponsiveEntries,
  resolveStackSpacingWithRhythm,
} from "../runtime/responsive";
import { TENANT_THEME_RHYTHM_FACTORS } from "../../../../../foundation/contracts/composition/tenants/themes/tenant-theme";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAYOUT_PRIMITIVES = resolve(
  HERE,
  "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives/index.css"
);
/**
 * The SHARED stylesheet's raw source, read ONLY for the "SCALAR path" and
 * "tri-stop rhythm law" legs below. Every other leg in this file tests the
 * JS-GENERATED responsive `<style>` text via `emittedCSS`, which is a
 * separate mechanism from this file (see that leg's own doc comment).
 */
const CSS = readFileSync(LAYOUT_PRIMITIVES, "utf8");

const RHYTHM_CHANNEL = "--ds-rhythm-effective-scale";
const RHYTHM_READ = `var(${RHYTHM_CHANNEL}, 1)`;
const SELECTOR = '[data-responsive-id="stack-ID"]';

type ResponsiveSpacing = Record<string, StackSpacing>;

/** The emitted scoped CSS, with the per-render element id normalized away. */
function emittedCSS(ui: React.ReactElement): string {
  const { container, unmount } = render(ui);
  const css = container.querySelector("style")?.textContent ?? "";
  unmount();
  return css.replace(/"stack-[^"]*"/g, '"stack-ID"');
}

/**
 * The generator's own output shape. Stack projects TWO declarations per
 * breakpoint: the structural `gap` and the private `--_ds-stack-gap-current`
 * the divider centers on. They must resolve identically, or the hairline would
 * center itself in a rhythm the stack is no longer using.
 */
function block(base: string, media?: readonly [number, string]): string {
  const head = `${SELECTOR} {\n  gap: ${base};\n  --_ds-stack-gap-current: ${base};\n}\n`;
  if (!media) return head;
  return `${head}@media (min-width: ${media[0]}px) {\n  ${SELECTOR} {\n    gap: ${media[1]};\n    --_ds-stack-gap-current: ${media[1]};\n  }\n}\n`;
}

interface ResponsiveScenario {
  readonly name: string;
  readonly spacing: ResponsiveSpacing;
  /** Exactly what Classic and Rustic emit -- unchanged by this wave. */
  readonly unscaled: string;
  /** Exactly what Modern emits: the same text, rungs wrapped once. */
  readonly scaled: string;
}

const SCENARIOS: readonly ResponsiveScenario[] = [
  {
    name: "preset rungs scale at every breakpoint",
    spacing: { xs: "sm", lg: "xl" },
    unscaled: block("var(--ds-spacing-2, 0.5rem)", [
      1024,
      "var(--ds-spacing-8, 2rem)",
    ]),
    scaled: block(`calc(var(--ds-spacing-2, 0.5rem) * ${RHYTHM_READ})`, [
      1024,
      `calc(var(--ds-spacing-8, 2rem) * ${RHYTHM_READ})`,
    ]),
  },
  {
    name: "numeric spacing stays exact px, unwrapped and unscaled",
    spacing: { xs: 8, lg: 24 },
    unscaled: block("8px", [1024, "24px"]),
    scaled: block("8px", [1024, "24px"]),
  },
  {
    name: "`none` stays zero -- zero has no room to scale",
    spacing: { xs: "none", lg: "md" },
    unscaled: block("0", [1024, "var(--ds-spacing-4, 1rem)"]),
    scaled: block("0", [
      1024,
      `calc(var(--ds-spacing-4, 1rem) * ${RHYTHM_READ})`,
    ]),
  },
];

describe("rhythm reaches the RESPONSIVE preset rung under Modern", () => {
  it.each(SCENARIOS)("Modern: $name", ({ spacing, scaled }) => {
    expect(emittedCSS(<ModernStack spacing={spacing} />)).toBe(scaled);
  });

  it("scales the `gap` and the divider mirror to the SAME value", () => {
    // The mirror exists so a hairline centers itself inside the governed
    // rhythm. If only one of the two carried the scale, a responsive stack
    // with a divider would show a doubled or collapsed seam.
    const css = emittedCSS(<ModernStack spacing={{ xs: "md" }} divider />);
    const scaledRung = `calc(var(--ds-spacing-4, 1rem) * ${RHYTHM_READ})`;
    expect(css).toContain(`gap: ${scaledRung};`);
    expect(css).toContain(`--_ds-stack-gap-current: ${scaledRung};`);
  });

  it("POSITIVE CONTROL: the pinned Modern text really does carry the axis", () => {
    // Without this, every scenario above would also pass against a build where
    // the fix was reverted and the pins were quietly rewritten to match.
    expect(SCENARIOS[0].scaled.split(RHYTHM_READ).length - 1).toBe(4);
    expect(SCENARIOS[1].scaled).not.toContain(RHYTHM_READ);
  });

  it("never multiplies the scale twice in one declaration", () => {
    for (const { scaled } of SCENARIOS) {
      for (const line of scaled.split("\n")) {
        if (!line.includes(RHYTHM_CHANNEL)) continue;
        expect(line.split(RHYTHM_CHANNEL).length - 1, line).toBe(1);
      }
    }
  });

  it("an invalid numeric spacing never acquires a rhythm calc", () => {
    const spacing: ResponsiveSpacing = {
      xs: -8,
      md: Number.NaN,
      xl: Number.POSITIVE_INFINITY,
    };
    const modern = emittedCSS(<ModernStack spacing={spacing} />);
    expect(modern).not.toContain(RHYTHM_CHANNEL);
    expect(modern).not.toContain("calc(");
    expect(modern).toBe(emittedCSS(<ClassicStack spacing={spacing} />));
    expect(modern).toBe(emittedCSS(<RusticStack spacing={spacing} />));
  });
});

/**
 * The numeric-safety half of the same manifest cell
 * (`axisDispositions[axis="numeric-scalar-or-responsive"]`,
 * `DEFECT_OPEN_FOR_INVALID_VALUES`). Rhythm's negative control is "a caller's
 * measurement stays exact", which presumes the measurement is a value CSS can
 * use at all. Flex has always collapsed an unsafe number to `0px`; Stack
 * emitted `-8px`, `NaNpx` and `Infinitypx` -- declarations a browser discards,
 * so the gap silently fell back to whatever the cascade said instead of to the
 * zero the caller's arithmetic implied.
 *
 * This closure is engine-agnostic ON PURPOSE: it is a normalization defect, not
 * a rhythm one, so the guard lives in the single contract-level resolver that
 * all three engines already share. The safety argument is that no VALID value
 * moves, which the first leg proves over the range rather than at one point.
 */
describe("unsafe numeric spacing normalizes to 0px, in every engine", () => {
  const VALID = [0, -0, 0.5, 1, 2, 4, 7.5, 8, 12, 16, 24, 32, 64, 1000, 99999];
  const UNSAFE = [
    -0.5,
    -1,
    -8,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  it("SAFETY: every finite non-negative number keeps its exact px string", () => {
    // Asserted against the ORIGINAL expression rather than a hand-copied
    // table, so this cannot drift into blessing whatever the resolver does.
    for (const value of VALID) {
      expect(resolveSpacing(value), String(value)).toBe(`${value}px`);
    }
  });

  it("normalizes negative, NaN and Infinity to 0px", () => {
    for (const value of UNSAFE) {
      expect(resolveSpacing(value), String(value)).toBe("0px");
    }
  });

  it("matches Flex exactly -- one group, one meaning for an unsafe number", () => {
    for (const value of [...VALID, ...UNSAFE]) {
      expect(resolveSpacing(value), String(value)).toBe(
        resolveFlexGapValue(value)
      );
    }
  });

  it("an unsafe value stamps NO preset spelling, so no rhythm rule can match", () => {
    for (const value of UNSAFE) {
      expect(stackSpacingPresetSpelling(value), String(value)).toBeUndefined();
    }
    // POSITIVE CONTROL: the spelling probe is not simply always undefined.
    expect(stackSpacingPresetSpelling("lg")).toBe("lg");
  });

  it("SCALAR path: the channel carries 0px and the non-preset spelling", () => {
    for (const engine of [ModernStack, ClassicStack, RusticStack]) {
      for (const value of UNSAFE) {
        const { container, unmount } = render(
          React.createElement(engine, { spacing: value })
        );
        // `.rottay-stack` is the one root marker all three engines share;
        // `data-component` is stamped by Modern only.
        const stack = container.querySelector(".rottay-stack") as HTMLElement;
        expect(stack.style.getPropertyValue("--ds-stack-gap"), String(value)).toBe(
          "0px"
        );
        expect(stack.getAttribute("data-spacing")).toBe("custom");
        expect(stack.getAttribute("style") ?? "").not.toMatch(/NaN|Infinity/);
        unmount();
      }
    }
  });

  it("SCALAR path: a valid measurement is untouched", () => {
    // The counterfactual that stops the leg above from passing against a
    // resolver that zeroed everything.
    const { container } = render(<ModernStack spacing={12} />);
    const stack = container.querySelector(".rottay-stack") as HTMLElement;
    expect(stack.style.getPropertyValue("--ds-stack-gap")).toBe("12px");
  });

  it("RESPONSIVE path: gap and the divider mirror both carry 0px", () => {
    for (const engine of [ModernStack, ClassicStack, RusticStack]) {
      for (const value of UNSAFE) {
        const css = emittedCSS(
          React.createElement(engine, { spacing: { xs: value } })
        );
        expect(css, String(value)).toBe(
          `${SELECTOR} {\n  gap: 0px;\n  --_ds-stack-gap-current: 0px;\n}\n`
        );
      }
    }
  });
});

describe("CLASSIC/RUSTIC INVARIANCE (the counterfactual control)", () => {
  it.each(SCENARIOS)(
    "Classic is byte-identical for: $name",
    ({ spacing, unscaled }) => {
      expect(emittedCSS(<ClassicStack spacing={spacing} />)).toBe(unscaled);
    }
  );

  it.each(SCENARIOS)(
    "Rustic is byte-identical for: $name",
    ({ spacing, unscaled }) => {
      expect(emittedCSS(<RusticStack spacing={spacing} />)).toBe(unscaled);
    }
  );

  it("the read-only engines never emit the rhythm channel at all", () => {
    for (const { spacing } of SCENARIOS) {
      expect(emittedCSS(<ClassicStack spacing={spacing} />)).not.toContain(
        RHYTHM_CHANNEL
      );
      expect(emittedCSS(<RusticStack spacing={spacing} />)).not.toContain(
        RHYTHM_CHANNEL
      );
    }
  });

  it("POSITIVE CONTROL: Modern and Classic genuinely diverge on a rung", () => {
    // Proves the blocks above compare a real difference rather than three
    // engines that all lost the axis together.
    const rung = SCENARIOS[0].spacing;
    expect(emittedCSS(<ModernStack spacing={rung} />)).not.toBe(
      emittedCSS(<ClassicStack spacing={rung} />)
    );
    // ...and that they still AGREE wherever the law says nothing may change.
    const numeric = SCENARIOS[1].spacing;
    expect(emittedCSS(<ModernStack spacing={numeric} />)).toBe(
      emittedCSS(<ClassicStack spacing={numeric} />)
    );
  });

  it("the `gap` alias resolves through the same law as `spacing`", () => {
    // `gap` is the documented alias; a fix that only reached one spelling
    // would leave half the callers flat.
    const viaGap = emittedCSS(<ModernStack gap={{ xs: "sm", lg: "xl" }} />);
    expect(viaGap).toBe(SCENARIOS[0].scaled);
    expect(emittedCSS(<RusticStack gap={{ xs: "sm", lg: "xl" }} />)).toBe(
      SCENARIOS[0].unscaled
    );
  });
});

/**
 * leg -- the SCALAR path is Modern-only too (Finding 3).
 *
 * All the invariance above covers the RESPONSIVE path (the generated
 * per-breakpoint `<style>` tag). The SCALAR path is a different mechanism --
 * the SHARED, globally-loaded `layout-primitives.css` -- and it was NOT
 * provably Modern-only until this wave: `resolveStackPresentation` is the
 * single scalar projection all three engines call, so Classic and Rustic
 * stamp the identical `data-spacing="md"` attribute (or NONE at all, for the
 * unspecified-default case) on the identical shared `.rottay-stack` class the
 * scaled CSS rules match on -- INCLUDING the root rule's own default, which
 * has no attribute gate whatsoever. Every rung below was therefore split into
 * an unscaled base (what every engine reads) plus a second rule scoped by a
 * zero-specificity `:where(.rottay-stack--modern)` clause, without touching
 * either read-only engine file.
 */
describe("leg -- the SCALAR path is Modern-only too (Finding 3)", () => {
  const RUNGS = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

  it("PRECONDITION: Classic and Rustic share the exact attribute/class the scaled rules key on", () => {
    for (const Engine of [ClassicStack, RusticStack]) {
      const explicit = render(
        <Engine role="group" aria-label="explicit" spacing="lg">
          <span>a</span>
        </Engine>
      );
      const explicitStack = explicit.getByRole("group");
      expect(explicitStack).toHaveAttribute("data-spacing", "lg");
      expect(explicitStack.className).toMatch(/(^|\s)rottay-stack(\s|$)/);
      explicit.unmount();

      // The unspecified-default case matches ONLY the root rule -- no
      // data-spacing attribute is stamped at all, which is exactly why the
      // root rule's own rhythm multiplication had to be split too, not just
      // the per-rung overrides.
      const defaulted = render(
        <Engine role="group" aria-label="default">
          <span>a</span>
        </Engine>
      );
      const defaultedStack = defaulted.getByRole("group");
      expect(defaultedStack).not.toHaveAttribute("data-spacing");
      expect(defaultedStack.className).toMatch(/(^|\s)rottay-stack(\s|$)/);
      defaulted.unmount();
    }
  });

  it("the root default and every rung's override are gated on the modern-only class", () => {
    expect(CSS).toContain(".rottay-stack:where(.rottay-stack--modern) {");
    for (const rung of RUNGS) {
      expect(CSS, rung).toContain(
        `.rottay-stack[data-spacing="${rung}"]:where(.rottay-stack--modern) {`
      );
    }
  });

  it("each pair's unscaled base carries the identical magnitude the old single rule declared", () => {
    // The fix must not change WHICH token a rung resolves to -- only WHETHER
    // rhythm multiplies it. Same law leg "unsafe numeric spacing..." already
    // pins for the numeric case; this is the preset-rung half.
    const EXPECTED_BASE: Record<(typeof RUNGS)[number], string> = {
      xs: "var(--ds-spacing-1)",
      sm: "var(--ds-spacing-2)",
      md: "var(--ds-spacing-4)",
      lg: "var(--ds-spacing-6)",
      xl: "var(--ds-spacing-8)",
      "2xl": "var(--ds-spacing-10)",
      "3xl": "var(--ds-spacing-12)",
      "4xl": "var(--ds-spacing-16)",
    };
    for (const rung of RUNGS) {
      expect(CSS, rung).toContain(
        `.rottay-stack[data-spacing="${rung}"] {\n  --_ds-stack-gap-current: ${EXPECTED_BASE[rung]};\n}`
      );
      expect(CSS, rung).toContain(
        `--_ds-stack-gap-current: calc(${EXPECTED_BASE[rung]} * var(${RHYTHM_CHANNEL}, 1));`
      );
    }
  });

  it("Modern stamps the --modern class; Classic and Rustic never do", () => {
    const modern = render(
      <ModernStack role="group" aria-label="modern" spacing="md">
        <span>a</span>
      </ModernStack>
    );
    expect(modern.getByRole("group").className).toMatch(
      /(^|\s)rottay-stack--modern(\s|$)/
    );
    modern.unmount();

    for (const Engine of [ClassicStack, RusticStack]) {
      const { getByRole, unmount } = render(
        <Engine role="group" aria-label="not-modern" spacing="md">
          <span>a</span>
        </Engine>
      );
      expect(getByRole("group").className).not.toMatch(/rottay-stack--modern/);
      unmount();
    }
  });

  it("byte-identical across all THREE rhythm stops: Classic/Rustic never consume the channel at all", () => {
    // jsdom applies no author stylesheet, so the scaled calc() this file's
    // CSS-source legs pin can never execute here regardless of engine --
    // stated, not worked around. `resolveStackPresentation` is a pure
    // function of props, so an ambient `--ds-rhythm-effective-scale` at each
    // of the three canonical stops cannot change what Classic/Rustic stamp:
    // there is no code path in either that reads that channel.
    for (const [stopName, factor] of Object.entries({ tight: 0.85, normal: 1, airy: 1.2 })) {
      const wrapperStyle = { "--ds-rhythm-effective-scale": String(factor) } as React.CSSProperties;
      for (const Engine of [ClassicStack, RusticStack]) {
        const { container, unmount } = render(
          <div style={wrapperStyle}>
            <Engine role="group" aria-label={stopName} spacing="lg">
              <span>a</span>
            </Engine>
          </div>
        );
        const stack = container.querySelector('[role="group"]') as HTMLElement;
        expect(stack.getAttribute("data-spacing"), stopName).toBe("lg");
        expect(stack.getAttribute("style") ?? "", stopName).not.toContain(
          RHYTHM_CHANNEL
        );
        unmount();
      }
    }
  });
});

/**
 * leg -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact
 * removal. Mirrors Space.rhythm-preset-contract.test.tsx's leg 5 and
 * Flex.rhythm-preset-contract.test.tsx's leg 7 for the same canonical factor
 * table; see either for the full jsdom-limitation reasoning.
 */
describe("leg -- the tri-stop rhythm law: 0.85 / 1 / 1.2, monotonicity, exact removal", () => {
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
    expect(CSS).toContain(`var(${RHYTHM_CHANNEL}, 1)`);
  });

  it("EXACT REMOVAL: the unscaled base rule IS what calc(base * 1) evaluates to", () => {
    // Unlike Flex (whose CSS multiplies a JS-resolved intermediate channel),
    // Stack's CSS encodes the base token directly with no JS indirection for
    // a preset rung -- so "exact removal" is a claim about the STYLESHEET,
    // not the scalar resolver. For every rung this wave split, the unscaled
    // base rule's value is textually the SAME operand the paired scaled
    // rule's `calc(BASE * ...)` multiplies -- exactly what that calc()
    // evaluates to when the factor is the identity, 1. Classic/Rustic get
    // ONLY the unscaled rule, by construction of the Modern-only gate (leg
    // "Modern stamps the --modern class..." above), which is the strongest
    // form of "exact removal": not a value that happens to equal the
    // pre-rhythm one when unset, but the ONE rule that ever applies to them.
    const BASE: Record<string, string> = {
      xs: "var(--ds-spacing-1)",
      md: "var(--ds-spacing-4)",
      "4xl": "var(--ds-spacing-16)",
    };
    for (const [rung, base] of Object.entries(BASE)) {
      expect(CSS, rung).toContain(
        `.rottay-stack[data-spacing="${rung}"] {\n  --_ds-stack-gap-current: ${base};\n}`
      );
      expect(CSS, rung).toContain(
        `.rottay-stack[data-spacing="${rung}"]:where(.rottay-stack--modern) {\n  --_ds-stack-gap-current: calc(${base} * var(${RHYTHM_CHANNEL}, 1));\n}`
      );
    }
  });
});

/**
 * leg -- the prototype-pollution guard on `stackSpacingPresetSpelling`,
 * proven where it actually bites: the RESPONSIVE rhythm resolver.
 *
 * `stackSpacingPresetSpelling` used to read `value in SPACING_MAP`. `in`
 * walks the WHOLE prototype chain, so `"toString" in SPACING_MAP` is `true`
 * -- `SPACING_MAP` is a plain object literal and inherits every
 * `Object.prototype` member name. The MAGNITUDE stayed safe on its own the
 * whole time: `resolveSpacing` (this file's "unsafe numeric spacing..."
 * describe block, and `resolveStackSpacing` which just delegates to it) already
 * own-property-guards the same map and falls back to `"0"` for any
 * unrecognized key, hostile or not. That is exactly why this defect was
 * invisible at the SPACING layer alone and needs a COMBINED drill: it only
 * surfaces where `resolveStackSpacingWithRhythm` asks
 * `stackSpacingPresetSpelling(value) === undefined` to decide whether to wrap
 * that already-safe magnitude in `calc(... * var(--ds-rhythm-effective-scale,
 * 1))`. The polluted guard answered "yes, this is a rung" for a hostile
 * string that is not one of the eight `SPACING_MAP` declares, so the safe "0"
 * got wrapped into `calc(0 * var(--ds-rhythm-effective-scale, 1))` -- a
 * hostile string masquerading as a scalable rung, and a live break of this
 * file's own stated law ("a caller's measurement is exact geometry under
 * rhythm exactly as under density"). Two independently-safe functions
 * combined into an unsafe one; testing either alone would have stayed green.
 */
describe("leg -- prototype-pollution guard on stackSpacingPresetSpelling (combined spacing + rhythm)", () => {
  const HOSTILE_KEYS = [
    "toString",
    "constructor",
    "hasOwnProperty",
    "__proto__",
  ] as const;

  it("never mistakes an inherited Object.prototype member name for a declared rung", () => {
    for (const value of HOSTILE_KEYS) {
      expect(
        stackSpacingPresetSpelling(value as StackSpacing),
        value
      ).toBeUndefined();
    }
    // POSITIVE CONTROL: the probe is not simply always undefined.
    expect(stackSpacingPresetSpelling("lg")).toBe("lg");
  });

  it("COMBINED: the already-safe magnitude stays UNSCALED for a hostile string -- no calc() wrapper", () => {
    for (const value of HOSTILE_KEYS) {
      const magnitude = resolveSpacing(value as StackSpacing);
      expect(magnitude, value).toBe("0"); // safe on its own -- proven first
      const withRhythm = resolveStackSpacingWithRhythm(value as StackSpacing);
      expect(withRhythm, value).toBe(magnitude); // must be UNTOUCHED
      expect(withRhythm, value).not.toContain("calc(");
      expect(withRhythm, value).not.toContain(RHYTHM_CHANNEL);
    }
  });

  it("RESPONSIVE path: a hostile breakpoint value resolves unscaled through the real collector", () => {
    for (const value of HOSTILE_KEYS) {
      const entries = collectStackResponsiveEntries(
        { spacing: { xs: value } as never },
        { rhythm: true }
      );
      const gapEntry = entries.find((entry) => entry.cssProperty === "gap");
      expect(gapEntry, value).toBeDefined();
      const resolved = gapEntry!.resolve!(value as never);
      expect(resolved, value).toBe("0");
      expect(resolved, value).not.toContain("calc(");
    }
  });

  it("RENDERED: ModernStack emits the exact unscaled block for a hostile responsive spacing value", () => {
    for (const value of HOSTILE_KEYS) {
      const css = emittedCSS(<ModernStack spacing={{ xs: value } as never} />);
      expect(css, value).toBe(block("0"));
      expect(css, value).not.toContain(RHYTHM_CHANNEL);
      expect(css, value).not.toContain("calc(");
    }
  });

  it("COUNTERFACTUAL: the OLD `in`-operator read really did misclassify every hostile key", () => {
    // Reproduced INLINE (not imported) against the REAL `SPACING_MAP`, so this
    // pair of legs is proven load-bearing: it exercises a difference that
    // genuinely existed, not a property every conceivable implementation
    // would share.
    function oldSpellingRead(value: string): string | undefined {
      return value in SPACING_MAP ? value : undefined;
    }
    for (const value of HOSTILE_KEYS) {
      expect(oldSpellingRead(value), value).toBe(value);
    }
    // An unenumerated, non-inherited token was already correctly rejected by
    // the old `in` read too -- this defect was specifically about the
    // PROTOTYPE CHAIN, not about unknown tokens in general.
    expect(oldSpellingRead("totally-unknown-token")).toBeUndefined();
    // The FIX genuinely diverges from the old behaviour on every hostile key.
    for (const value of HOSTILE_KEYS) {
      expect(
        stackSpacingPresetSpelling(value as StackSpacing),
        value
      ).not.toBe(oldSpellingRead(value));
    }
  });
});
