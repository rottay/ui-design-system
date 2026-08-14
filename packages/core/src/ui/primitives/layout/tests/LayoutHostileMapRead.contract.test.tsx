/**
 * @fileoverview Cross-cutting sweep for the bare-map-read defect class Finding
 * 1 found in `Flex/contracts/index.ts`'s `resolveFlexGapValue`
 * (`FLEX_GAP_MAP[value]` read bare, before the own-property guard) --
 * extended to Grid, Stack, Space and Box as the work order asked.
 *
 * `Flex.hostile-gap-input.test.tsx` is the primary drill for the gap
 * resolvers named in the work order. This file covers the REST of the sweep:
 * the sites the work order named to check across the other four components.
 *
 * TWO KINDS OF SITE, two different sections below:
 *
 *  A. GENUINELY BARE (no fallback at all) -- FIXED here with the identical
 *     own-property guard `resolveFlexGapValue` uses. Box's `resolveSpacing`
 *     (Box/engines/modern/index.tsx), Stack's responsive align/justify
 *     resolvers (Stack/runtime/responsive/index.tsx, already drilled directly
 *     in Flex.hostile-gap-input.test.tsx's sibling assertions -- Stack's own
 *     copy is proven here), and Space's legacy-size lookup
 *     (Space/engines/modern/index.tsx) were this kind.
 *
 *  B. `|| fallback`-GUARDED -- left UNCHANGED, per the work order's explicit
 *     instruction that these are "already fail-closed and needing no
 *     change": Box/runtime/responsive/index.ts's `resolveBoxSpacing`,
 *     Stack/contracts/index.ts's `resolveSpacing` (both `MAP[value] || "0"`),
 *     and the Grid engines' `resolveGap` (`GAP_MAP[gap] || GAP_MAP.md` /
 *     `|| String(gap)`). A `||` fallback only substitutes when the bare read
 *     is FALSY. An unknown token ("huge") IS falsy (`undefined`), so the
 *     guard genuinely catches it -- but "toString"/"constructor"/"__proto__"
 *     resolve through `Object.prototype` to a TRUTHY function or object,
 *     which `||` never reaches. Section B measures the REAL, current
 *     behaviour of these three sites rather than assume the "no change"
 *     claim: the common case is shown working, and the residual gap the `||`
 *     guard does not close is shown too, verbatim, so it is visible rather
 *     than hidden. See the work report for the full discrepancy and the
 *     reasoning for leaving these sites untouched.
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import ModernBox from "../Box/engines/modern";
import { SPACING_MAP as BOX_SPACING_MAP } from "../Box/contracts";
import { resolveBoxSpacing } from "../Box/runtime/responsive";

import { collectStackResponsiveEntries } from "../Stack/runtime/responsive";
import {
  ALIGN_MAP as STACK_ALIGN_MAP,
  JUSTIFY_MAP as STACK_JUSTIFY_MAP,
  resolveSpacing as resolveStackSpacing,
} from "../Stack/contracts";

import Space from "../Space/engines/modern";
import { SPACE_SIZE_MAP } from "../Space/contracts";

import { ModernGrid } from "../Grid/engines/modern";
import { GAP_MAP as GRID_GAP_MAP } from "../Grid/contracts";

/** Same roster Finding 1 measured against FLEX_GAP_MAP, reused here. */
const UNKNOWN_TOKEN_INPUTS: readonly unknown[] = ["huge", "", null, undefined, {}, []];
const PROTOTYPE_POLLUTION_INPUTS: readonly unknown[] = [
  "toString",
  "constructor",
  "__proto__",
];
const ALL_HOSTILE_INPUTS: readonly unknown[] = [
  ...UNKNOWN_TOKEN_INPUTS,
  ...PROTOTYPE_POLLUTION_INPUTS,
];

/**
 * What a bare `MAP[value]` read resolves to for each prototype-pollution
 * name, verified directly (see the work report): "toString" and
 * "constructor" are INHERITED FUNCTIONS on any plain object literal, but
 * "__proto__" is the special accessor that returns the object's OWN
 * prototype -- `Object.prototype` itself, an object, not a function. All
 * three are truthy, which is the property that defeats a `||` fallback; only
 * two of the three happen to be callable.
 *
 * A `Map` on purpose, not a plain object literal: `{ __proto__: "object" }`
 * does NOT create an own data property named "__proto__" at all -- the
 * ECMAScript spec special-cases that exact literal key to set the object's
 * [[Prototype]] instead, and since a string is not a valid prototype the
 * assignment is silently ignored. Reading `["__proto__"]` back would then
 * hit the inherited accessor and return `Object.prototype` itself -- this
 * file's own helper nearly reproduced Finding 1's exact defect while
 * describing it. A `Map` has no such special case for any key.
 */
const EXPECTED_LEAK_TYPE = new Map<string, "function" | "object">([
  ["toString", "function"],
  ["constructor", "function"],
  ["__proto__", "object"],
]);

function label(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `array(${JSON.stringify(value)})`;
  if (typeof value === "object") return `object(${JSON.stringify(value)})`;
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// A. GENUINELY BARE reads -- fixed with the own-property guard.
// ---------------------------------------------------------------------------

describe("A1. Box/engines/modern resolveSpacing -- FIXED (was bare SPACING_MAP[value])", () => {
  // The pre-existing `if (!value) return undefined;` guard means a FALSY
  // hostile value (null, undefined, "") never reaches the map lookup at all
  // -- that early return is unchanged, correct, "omitted stays omitted"
  // behaviour, not part of this fix. Only a TRUTHY hostile value exercises
  // the guard this fix added.
  const TRUTHY_HOSTILE: readonly unknown[] = [
    "huge",
    {},
    [],
    "toString",
    "constructor",
    "__proto__",
  ];

  it("resolves every truthy hostile padding value to the declared none rung", () => {
    // Asserted on the raw `style` ATTRIBUTE TEXT, not the parsed
    // `.style.padding` CSSOM accessor: jsdom's shorthand `padding` setter
    // (via the `cssstyle` package) silently rejects a `var(...)`-bearing
    // value for the SHORTHAND property specifically (confirmed empirically
    // below, where `BOX_SPACING_MAP.lg` -- a var() value -- fails the
    // equivalent `.style.padding` check even though React did set it). The
    // `none` rung's value ("0") is simple enough to survive that validator,
    // but asserting on the same channel every other case in this file uses
    // keeps this test honest about what jsdom will and will not reflect.
    for (const value of TRUTHY_HOSTILE) {
      const { getByRole, unmount } = render(
        <ModernBox role="group" aria-label="hostile" padding={value as never}>
          <span>content</span>
        </ModernBox>
      );
      const styleText = getByRole("group").getAttribute("style") ?? "";
      expect(styleText, label(value)).toContain(`padding: ${BOX_SPACING_MAP.none}`);
      unmount();
    }
  });

  it("never stamps a function/object into the style attribute text", () => {
    for (const value of ["toString", "constructor", "__proto__"]) {
      const { getByRole, unmount } = render(
        <ModernBox role="group" aria-label="hostile" margin={value as never}>
          <span>content</span>
        </ModernBox>
      );
      const styleText = getByRole("group").getAttribute("style") ?? "";
      expect(styleText, value).not.toContain("native code");
      expect(styleText, value).not.toContain("[object");
      unmount();
    }
  });

  it("a legitimate preset is untouched by the guard", () => {
    // JSDOM LIMITATION, stated explicitly: jsdom's `cssstyle`-backed CSSOM
    // has a strict per-property validator for the well-known PHYSICAL
    // longhand `padding-top` that rejects a var()-bearing value outright (it
    // reflects in neither `.style.paddingTop` nor the serialized
    // `getAttribute("style")` text, confirmed while writing this test, even
    // though React did set it and a real browser accepts `var()` anywhere).
    // `padding-inline-start` (a CSS Logical Properties value) has no such
    // validator in this jsdom version and passes the string through as-is --
    // the exact channel Box.modern-quality.test.tsx:38 already relies on for
    // this same `resolveSpacing` local function. Using it here for the same
    // reason: an honest channel, not a coincidence of which prop is picked.
    const { getByRole } = render(
      <ModernBox role="group" aria-label="legit" paddingInlineStart="lg">
        <span>content</span>
      </ModernBox>
    );
    expect(getByRole("group").style.paddingInlineStart).toBe(BOX_SPACING_MAP.lg);
  });
});

describe("A2. Stack/runtime/responsive align/justify -- FIXED (was bare ALIGN_MAP/JUSTIFY_MAP[value])", () => {
  it("resolves hostile align/justify to the declared default rung, always a string", () => {
    for (const value of ALL_HOSTILE_INPUTS) {
      const entries = collectStackResponsiveEntries({
        align: { xs: value } as never,
        justify: { xs: value } as never,
      });
      const alignEntry = entries.find((entry) => entry.cssProperty === "align-items");
      const justifyEntry = entries.find(
        (entry) => entry.cssProperty === "justify-content"
      );
      expect(alignEntry, label(value)).toBeDefined();
      expect(justifyEntry, label(value)).toBeDefined();

      const alignResolved = alignEntry!.resolve!(value as never);
      const justifyResolved = justifyEntry!.resolve!(value as never);
      expect(typeof alignResolved, label(value)).toBe("string");
      expect(typeof justifyResolved, label(value)).toBe("string");
      expect(alignResolved, label(value)).toBe(STACK_ALIGN_MAP.stretch);
      expect(justifyResolved, label(value)).toBe(STACK_JUSTIFY_MAP.start);
    }
  });

  it("legitimate values are untouched by the guard", () => {
    const entries = collectStackResponsiveEntries({
      align: { xs: "center" } as never,
      justify: { xs: "space-between" } as never,
    });
    const alignEntry = entries.find((entry) => entry.cssProperty === "align-items")!;
    const justifyEntry = entries.find(
      (entry) => entry.cssProperty === "justify-content"
    )!;
    expect(alignEntry.resolve!("center" as never)).toBe(STACK_ALIGN_MAP.center);
    expect(justifyEntry.resolve!("space-between" as never)).toBe(
      STACK_JUSTIFY_MAP["space-between"]
    );
  });
});

describe("A3. Space/engines/modern legacy-size lookup -- FIXED (was SPACE_SIZE_MAP[legacySize || 'small'] || SPACE_SIZE_MAP.small)", () => {
  // The old expression's trailing `||` looked identical to the "already
  // fail-closed" sites in section B, but it is NOT: "toString" resolves
  // through Object.prototype to a truthy FUNCTION, which slips straight past
  // `|| SPACE_SIZE_MAP.small` too -- this site was not named as pre-cleared
  // in the work order, so it was fixed with the own-property guard.
  const STRING_HOSTILE: readonly unknown[] = ["huge", "toString", "constructor", "__proto__"];

  it("resolves every hostile size string to the declared small rung", () => {
    for (const value of STRING_HOSTILE) {
      const { getByRole, unmount } = render(
        <Space role="group" aria-label="hostile" size={value as never}>
          <span>a</span>
        </Space>
      );
      const gap = getByRole("group").style.getPropertyValue(
        "--ds-space-instance-gap"
      );
      expect(gap, label(value)).toBe(SPACE_SIZE_MAP.small);
      unmount();
    }
  });

  it("never stamps a function/object into the instance-gap channel", () => {
    for (const value of ["toString", "constructor", "__proto__"]) {
      const { getByRole, unmount } = render(
        <Space role="group" aria-label="hostile" size={value as never}>
          <span>a</span>
        </Space>
      );
      const styleText = getByRole("group").getAttribute("style") ?? "";
      expect(styleText, value).not.toContain("native code");
      expect(styleText, value).not.toContain("[object");
      unmount();
    }
  });

  it("a legitimate preset (either spelling) is untouched by the guard", () => {
    const legacy = render(
      <Space role="group" aria-label="legacy" size="middle">
        <span>a</span>
      </Space>
    );
    expect(
      legacy.getByRole("group").style.getPropertyValue("--ds-space-instance-gap")
    ).toBe(SPACE_SIZE_MAP.middle);
    legacy.unmount();

    const canonical = render(
      <Space role="group" aria-label="canonical" size="md">
        <span>a</span>
      </Space>
    );
    expect(
      canonical.getByRole("group").style.getPropertyValue("--ds-space-instance-gap")
    ).toBe(SPACE_SIZE_MAP.middle);
    canonical.unmount();
  });

  it("the array [h, v] branch is a different, unrelated code path and stays safe", () => {
    // Array.isArray wins before the string lookup this fix guards, exactly
    // the same domain split proven for Flex's resolveFlexGap/
    // resolveFlexGapWithRhythm in Flex.hostile-gap-input.test.tsx. Confirmed
    // here for completeness, not because it shares the fixed defect.
    const { getByRole } = render(
      <Space role="group" aria-label="array" size={[] as never}>
        <span>a</span>
      </Space>
    );
    const gap = getByRole("group").style.getPropertyValue("--ds-space-instance-gap");
    expect(gap).toBe("0px 0px");
    expect(gap).not.toContain("NaN");
  });
});

// ---------------------------------------------------------------------------
// B. `|| fallback`-guarded sites -- LEFT UNCHANGED. Behaviour measured, not
//    assumed.
// ---------------------------------------------------------------------------

describe("B1. Box/runtime/responsive resolveBoxSpacing -- verified, NOT modified", () => {
  it("catches an UNKNOWN token (the common case the || guard is good for)", () => {
    for (const value of UNKNOWN_TOKEN_INPUTS) {
      expect(resolveBoxSpacing(value as never), label(value)).toBe("0");
    }
  });

  it("CLOSED: a prototype-inherited name no longer defeats the guard", () => {
    // AGED_EXPECTATION, discharged exactly as the prior revision of this drill
    // instructed: it recorded the leak as measured fact and said "if this ever
    // starts returning a string, the own-property guard has been retrofitted
    // here too and this drill should be updated". The guard was retrofitted,
    // so the expectation is updated rather than the source reverted.
    for (const value of PROTOTYPE_POLLUTION_INPUTS) {
      const result = resolveBoxSpacing(value as never);
      expect(typeof result, `resolveBoxSpacing(${label(value)})`).toBe("string");
      expect(result, `resolveBoxSpacing(${label(value)})`).toBe("0");
    }
  });
});

describe("B2. Stack/contracts resolveSpacing -- verified, NOT modified", () => {
  it("catches an UNKNOWN token (the common case the || guard is good for)", () => {
    for (const value of UNKNOWN_TOKEN_INPUTS) {
      // `undefined` and `"none"` are special-cased to "0" BEFORE the map
      // read in this function (see Stack/contracts/index.ts); every other
      // unknown token still reaches `SPACING_MAP[value] || "0"`.
      expect(resolveStackSpacing(value as never), label(value)).toBe("0");
    }
  });

  it("CLOSED: a prototype-inherited name no longer defeats the guard", () => {
    for (const value of PROTOTYPE_POLLUTION_INPUTS) {
      const result = resolveStackSpacing(value as never);
      expect(typeof result, `resolveSpacing(${label(value)})`).toBe("string");
      expect(result, `resolveSpacing(${label(value)})`).toBe("0");
    }
  });
});

describe("B3. Grid engines' resolveGap -- modern CLOSED, classic/rustic still open", () => {
  // `resolveGap` is a private, unexported const in each Grid engine file
  // (`Grid/engines/{modern,classic,rustic}/index.tsx`), so it cannot be
  // imported directly. Reproduced here VERBATIM from the MODERN engine's
  // current source to measure its real behaviour precisely -- a faithful
  // transcription, not a reimplementation, with the "sanity" leg below
  // proving the two agree on every value GAP_MAP actually declares.
  //
  // The modern engine now carries the own-property guard. Classic and Rustic
  // still read `GAP_MAP[gap] || String(gap)` and therefore still leak a
  // prototype-inherited name -- they are READ-ONLY counterfactual targets, so
  // that is recorded as a known open gap below, never asserted as safe.
  function modernResolveGapReproduction(gap: unknown): string | undefined {
    if (gap === undefined) return undefined;
    if (typeof gap === "number") {
      return Number.isFinite(gap) && gap >= 0 ? `${gap}px` : "0px";
    }
    return Object.prototype.hasOwnProperty.call(GRID_GAP_MAP, gap as string)
      ? (GRID_GAP_MAP as Record<string, string>)[gap as string] || GRID_GAP_MAP.md
      : GRID_GAP_MAP.md;
  }

  /** What Classic and Rustic still do, verbatim. Not fixable from here. */
  function readOnlyEngineGapReproduction(gap: unknown): unknown {
    return (GRID_GAP_MAP as Record<string, string>)[gap as string] || String(gap);
  }

  it("sanity: the reproduction agrees with GAP_MAP for every declared rung", () => {
    for (const rung of Object.keys(GRID_GAP_MAP)) {
      expect(modernResolveGapReproduction(rung)).toBe(
        (GRID_GAP_MAP as Record<string, string>)[rung]
      );
    }
  });

  it("catches an UNKNOWN token (the common case the || guard is good for)", () => {
    expect(modernResolveGapReproduction("huge")).toBe(GRID_GAP_MAP.md);
  });

  it("CLOSED: the modern engine no longer leaks a prototype-inherited name", () => {
    for (const value of PROTOTYPE_POLLUTION_INPUTS) {
      const result = modernResolveGapReproduction(value);
      expect(typeof result, `resolveGap(${label(value)})`).toBe("string");
      expect(result, `resolveGap(${label(value)})`).toBe(GRID_GAP_MAP.md);
    }
  });

  it("KNOWN OPEN: Classic and Rustic still leak, and are read-only here", () => {
    // Recorded as measured fact so the gap stays visible. `engines/classic/**`
    // and `engines/rustic/**` are read-only counterfactual targets, so this
    // cannot be fixed from this packet -- but it must not look safe either.
    for (const value of PROTOTYPE_POLLUTION_INPUTS) {
      const result = readOnlyEngineGapReproduction(value);
      expect(typeof result, `read-only engine resolveGap(${label(value)})`).toBe(
        EXPECTED_LEAK_TYPE.get(value as string)
      );
    }
  });

  it("the modern guard is reachable through the public columnGap/rowGap props", () => {
    // Grid's own responsibility for calling this resolver is real, so render
    // the actual component rather than only the reproduction above. With the
    // guard in place a hostile token now resolves to the declared `md` rung
    // instead of silently dropping out of the style attribute.
    const { container } = render(
      <ModernGrid columnGap={"toString" as never}>
        <div>a</div>
      </ModernGrid>
    );
    const grid = container.querySelector(".rottay-grid") as HTMLElement;
    const preset = grid.getAttribute("data-column-gap-preset");
    expect(preset, "no enumerated rung is stamped for a hostile token").toBeNull();

    // MEASURED, not assumed: `--_ds-grid-column-gap` is stamped only when the
    // input IS a recognized preset (engines/modern/index.tsx:259-263). A
    // hostile token is not a preset, so it takes the else branch and lands on
    // the standard `column-gap` property -- which is the channel that has to
    // carry the guarded value.
    const columnGap = grid.style.columnGap;
    expect(columnGap, "a hostile token must resolve to the declared fallback rung").toBe(
      GRID_GAP_MAP.md
    );
    expect(columnGap).not.toContain("native code");
    expect(grid.getAttribute("style")).not.toContain("native code");
  });
});
