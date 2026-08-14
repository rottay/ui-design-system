/**
 * @fileoverview Hostile-input drills for the Flex gap resolvers.
 *
 * THE DEFECT THIS FILE PROVES CLOSED. `resolveFlexGapValue` used to read
 * `FLEX_GAP_MAP[value]` bare -- a lookup on a plain object literal, which
 * answers for names the map never declared:
 *
 *   - an unknown rung ("huge", "", null, undefined, {}, []) returned
 *     `undefined`, which the caller interpolated straight into `gap:
 *     undefined;` (a declaration the browser drops) and, inside the
 *     `[column, row]` shorthand, into `"var(--ds-spacing-4, 1rem) undefined"`
 *     -- invalidating BOTH axes, not just the unresolved one;
 *   - an INHERITED member name resolved through `Object.prototype`, so
 *     "toString" returned a FUNCTION, "constructor" the `Object` constructor
 *     function, and "__proto__" an object. The declared `string` return type
 *     was simply false, and the value stamped into a style attribute (or,
 *     on the responsive path, interpolated into generated CSS text) was a
 *     function body.
 *
 * An own-property guard (`Object.prototype.hasOwnProperty.call`) closed both
 * halves: an unrecognized token now resolves to the exact output the
 * declared `none` rung produces, on EVERY path that touches a gap value.
 *
 * Every drill below is run against the REAL exports, and section 5 reproduces
 * the OLD bare-bracket read inline and asserts it truly does misbehave --
 * proof that these drills are load-bearing (they would have caught the
 * original defect) rather than green against any implementation whatsoever.
 */
import { describe, expect, it } from "vitest";

import {
  FLEX_ALIGN_MAP,
  FLEX_GAP_MAP,
  FLEX_JUSTIFY_MAP,
  flexGapPresetSpelling,
  resolveFlexGap,
  resolveFlexGapValue,
  resolveFlexGapWithRhythm,
  type FlexGapValue,
} from "../contracts";
import { collectFlexResponsiveEntries } from "../runtime/responsive";

/**
 * The roster Finding 1 measured. Split into the two failure MODES the
 * original bug produced, so a drill can name which half it is proving:
 * "unknown token" (bare read -> `undefined`) and "prototype pollution"
 * (bare read -> a truthy inherited member).
 */
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
 * `[]` is excluded from the cross-function SCALAR comparisons below (but not
 * from the single-function drills above). `resolveFlexGap`/
 * `resolveFlexGapWithRhythm` accept the wider `FlexGap` union (scalar OR
 * `[column, row]` tuple) and check `Array.isArray` FIRST, by design; an empty
 * array is syntactically a (malformed) tuple, so it takes the TUPLE branch
 * there and independently defaults each missing axis to "0", yielding "0 0".
 * `resolveFlexGapValue`'s contract is scalar-only and has no such branch, so
 * the SAME `[]` resolves to a lone "0". Two different, individually-correct
 * answers for two functions with different domains -- not a parity break.
 * Proven explicitly in its own describe block below.
 */
const SCALAR_HOSTILE_INPUTS = ALL_HOSTILE_INPUTS.filter((v) => !Array.isArray(v));

/** Stable, readable label for a hostile value in a per-iteration assertion message. */
function label(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `array(${JSON.stringify(value)})`;
  if (typeof value === "object") return `object(${JSON.stringify(value)})`;
  return JSON.stringify(value);
}

/**
 * The whole safety contract in one assertion: always a string, never the
 * literal text a leaked function/object/NaN/undefined would produce once
 * interpolated into a CSS declaration or a `dangerouslySetInnerHTML` style
 * block.
 */
function assertSafeCSSText(actual: unknown, context: string): void {
  expect(typeof actual, context).toBe("string");
  const text = actual as string;
  expect(text, context).not.toContain("native code");
  expect(text, context).not.toContain("[object");
  expect(text, context).not.toContain("NaN");
  expect(text, context).not.toContain("undefined");
}

describe("SCALAR path -- resolveFlexGapValue never leaks a bare-read artifact", () => {
  it("resolves every hostile input to the declared `none` rung, as a string", () => {
    for (const value of ALL_HOSTILE_INPUTS) {
      const resolved = resolveFlexGapValue(value as FlexGapValue);
      assertSafeCSSText(resolved, label(value));
      expect(resolved, label(value)).toBe(FLEX_GAP_MAP.none);
      expect(resolved, label(value)).toBe("0");
    }
  });

  it("never returns a function, even for an inherited Object.prototype member name", () => {
    for (const value of PROTOTYPE_POLLUTION_INPUTS) {
      const resolved = resolveFlexGapValue(value as FlexGapValue);
      expect(typeof resolved, label(value)).not.toBe("function");
      expect(typeof resolved, label(value)).not.toBe("object");
    }
  });

  it("resolves the [column, row] shorthand without corrupting the OTHER axis", () => {
    // The original bug's worst failure mode: one bad axis produced
    // "var(--ds-spacing-4, 1rem) undefined", invalidating the WHOLE shorthand.
    for (const hostile of ALL_HOSTILE_INPUTS) {
      const hostileColumn = resolveFlexGap([hostile as FlexGapValue, "md"]);
      assertSafeCSSText(hostileColumn, `column=${label(hostile)}`);
      expect(hostileColumn, `column=${label(hostile)}`).toBe(
        `var(--ds-spacing-4, 1rem) ${FLEX_GAP_MAP.none}`
      );

      const hostileRow = resolveFlexGap(["md", hostile as FlexGapValue]);
      assertSafeCSSText(hostileRow, `row=${label(hostile)}`);
      expect(hostileRow, `row=${label(hostile)}`).toBe(
        `${FLEX_GAP_MAP.none} var(--ds-spacing-4, 1rem)`
      );
    }
  });

  it("flexGapPresetSpelling never mistakes a hostile input for a rung", () => {
    for (const value of ALL_HOSTILE_INPUTS) {
      expect(
        flexGapPresetSpelling(value as FlexGapValue),
        label(value)
      ).toBeUndefined();
    }
    // POSITIVE CONTROL: the probe is not simply always undefined.
    expect(flexGapPresetSpelling("lg")).toBe("lg");
  });

  it("resolveFlexGapWithRhythm matches the plain resolution for hostile input", () => {
    // None of these are a recognized preset spelling, so the rhythm-aware
    // resolver must take the SAME unscaled branch as the plain one -- no
    // calc() wrapper for a value that was never a rung to begin with.
    // `[]` is excluded here -- see SCALAR_HOSTILE_INPUTS' doc comment; its own
    // divergence is proven in the "tuple-vs-scalar domain" block below.
    for (const value of SCALAR_HOSTILE_INPUTS) {
      const plain = resolveFlexGapValue(value as FlexGapValue);
      const rhythm = resolveFlexGapWithRhythm(value as FlexGapValue);
      assertSafeCSSText(rhythm, label(value));
      expect(rhythm, label(value)).toBe(plain);
      expect(rhythm, label(value)).not.toContain("calc(");
    }
  });

  it("[] diverges from a lone hostile scalar exactly because it satisfies Array.isArray", () => {
    assertSafeCSSText(resolveFlexGapValue([] as never), "[] via resolveFlexGapValue");
    assertSafeCSSText(resolveFlexGapWithRhythm([] as never), "[] via resolveFlexGapWithRhythm");
    expect(resolveFlexGapValue([] as never)).toBe("0");
    expect(resolveFlexGapWithRhythm([] as never)).toBe("0 0");
    // Still safe either way: never undefined, never a leaked prototype member.
  });
});

describe("RESPONSIVE path -- the generated <style> text stays safe for hostile input", () => {
  it("the collected entry's resolver never leaks a function/object into CSS text", () => {
    const entries = collectFlexResponsiveEntries({
      gap: { xs: "md" } as never,
    });
    const gapEntry = entries.find((entry) => entry.cssProperty === "gap");
    expect(gapEntry, "gap entry must exist for a responsive gap prop").toBeDefined();
    const resolve = gapEntry!.resolve!;

    for (const value of ALL_HOSTILE_INPUTS) {
      const resolved = resolve(value as never);
      assertSafeCSSText(resolved, label(value));
    }
  });

  it("holds under rhythm: true too -- the Modern-only collector option", () => {
    const entries = collectFlexResponsiveEntries(
      { gap: { xs: "md" } as never },
      { rhythm: true }
    );
    const gapEntry = entries.find((entry) => entry.cssProperty === "gap");
    const resolve = gapEntry!.resolve!;

    for (const value of ALL_HOSTILE_INPUTS) {
      const resolved = resolve(value as never);
      assertSafeCSSText(resolved, label(value));
      // Not a rung, so rhythm has nothing to scale even with the option on.
      expect(resolved, label(value)).not.toContain("calc(");
    }
  });

  it("justify/align responsive resolvers also fail closed for hostile input", () => {
    // The SAME bare-map-read class was found and fixed in FLEX_JUSTIFY_MAP and
    // FLEX_ALIGN_MAP's responsive resolution (Flex/runtime/responsive/index.ts),
    // not just the gap maps. Proven here rather than left implicit.
    const entries = collectFlexResponsiveEntries({
      justify: { xs: "start" } as never,
      align: { xs: "stretch" } as never,
    });
    const justifyEntry = entries.find((entry) => entry.cssProperty === "justify-content");
    const alignEntry = entries.find((entry) => entry.cssProperty === "align-items");
    expect(justifyEntry).toBeDefined();
    expect(alignEntry).toBeDefined();

    for (const value of ALL_HOSTILE_INPUTS) {
      const justifyResolved = justifyEntry!.resolve!(value as never);
      const alignResolved = alignEntry!.resolve!(value as never);
      assertSafeCSSText(justifyResolved, `justify ${label(value)}`);
      assertSafeCSSText(alignResolved, `align ${label(value)}`);
      expect(justifyResolved, label(value)).toBe(FLEX_JUSTIFY_MAP.start);
      expect(alignResolved, label(value)).toBe(FLEX_ALIGN_MAP.stretch);
    }
  });
});

describe("HAND-STAMPING PARITY -- scalar and responsive resolve the same input identically", () => {
  // "Modulo the documented calc(... * var(--ds-rhythm-effective-scale, 1))
  // wrapper that only the responsive path adds for a preset rung" -- proven
  // by construction, since resolveFlexGapWithRhythm and the responsive
  // collector's rhythm-mode resolver both delegate to resolveFlexGapValue
  // for the base magnitude. This is also the "EXACT REMOVAL" leg: the base
  // magnitude a caller gets is untouched by the rhythm feature, and the
  // wrapper's own `, 1` fallback is the identity multiplier, so an unset
  // tenant rhythm restores the byte-identical pre-rhythm value structurally,
  // not just numerically (jsdom cannot evaluate `calc()` to confirm the
  // arithmetic itself -- see the CSS-source legs in
  // Flex.rhythm-preset-contract.test.tsx for the pinned formula text).
  const RHYTHM_READ = "var(--ds-rhythm-effective-scale, 1)";
  const REPRESENTATIVE_VALUES: readonly FlexGapValue[] = [
    "none",
    "xs",
    "md",
    "4xl",
    0,
    16,
    -8,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ];

  it("non-rhythm responsive resolution is byte-identical to the scalar resolver", () => {
    const entries = collectFlexResponsiveEntries({ gap: { xs: "md" } as never });
    const resolve = entries.find((e) => e.cssProperty === "gap")!.resolve!;
    for (const value of REPRESENTATIVE_VALUES) {
      expect(resolve(value as never), String(value)).toBe(resolveFlexGapValue(value));
    }
  });

  it("rhythm responsive resolution equals the scalar resolver, wrapped once for a rung only", () => {
    const entries = collectFlexResponsiveEntries(
      { gap: { xs: "md" } as never },
      { rhythm: true }
    );
    const resolve = entries.find((e) => e.cssProperty === "gap")!.resolve!;
    for (const value of REPRESENTATIVE_VALUES) {
      const base = resolveFlexGapValue(value);
      const viaResponsive = resolve(value as never);
      const isRung = flexGapPresetSpelling(value) !== undefined;
      expect(viaResponsive, String(value)).toBe(
        isRung ? `calc(${base} * ${RHYTHM_READ})` : base
      );
    }
  });

  it("hostile input takes the SAME (unscaled) branch on both paths", () => {
    // `[]` excluded -- see SCALAR_HOSTILE_INPUTS' doc comment above.
    for (const value of SCALAR_HOSTILE_INPUTS) {
      const scalar = resolveFlexGapValue(value as FlexGapValue);
      const scalarWithRhythm = resolveFlexGapWithRhythm(value as FlexGapValue);
      const entries = collectFlexResponsiveEntries(
        { gap: { xs: value } as never },
        { rhythm: true }
      );
      const responsiveResolved = entries
        .find((e) => e.cssProperty === "gap")!
        .resolve!(value as never);
      expect(scalarWithRhythm, label(value)).toBe(scalar);
      expect(responsiveResolved, label(value)).toBe(scalar);
    }
  });

  it("[] still takes the identical (tuple) branch on the responsive path as the scalar one", () => {
    const responsiveEntries = collectFlexResponsiveEntries(
      { gap: { xs: [] as never } },
      { rhythm: true }
    );
    const responsiveResolved = responsiveEntries
      .find((e) => e.cssProperty === "gap")!
      .resolve!([] as never);
    expect(responsiveResolved).toBe(resolveFlexGapWithRhythm([] as never));
    expect(responsiveResolved).toBe("0 0");
  });
});

describe("COUNTERFACTUAL -- the OLD bare-bracket read really did misbehave", () => {
  // Reproduced INLINE (not imported) so this section proves the drills above
  // are load-bearing: they exercise a difference that genuinely existed, not
  // a property every conceivable implementation would share.
  function oldBareRead(value: unknown): string {
    return (FLEX_GAP_MAP as Record<string, string>)[value as string];
  }

  it("returned `undefined` for an unknown token, not a stated zero", () => {
    for (const value of UNKNOWN_TOKEN_INPUTS) {
      expect(oldBareRead(value), label(value)).toBeUndefined();
    }
  });

  it("returned a FUNCTION for 'toString' -- the declared string return type was false", () => {
    const result = oldBareRead("toString");
    expect(typeof result).toBe("function");
    expect(String(result)).toContain("native code");
  });

  it("returned the Object constructor function for 'constructor'", () => {
    const result = oldBareRead("constructor");
    expect(typeof result).toBe("function");
    expect(result).toBe(Object);
  });

  it("returned an object for '__proto__'", () => {
    const result = oldBareRead("__proto__");
    expect(typeof result).toBe("object");
    expect(result).not.toBeNull();
  });

  it("the FIX genuinely diverges from the old behaviour on every hostile input", () => {
    // If resolveFlexGapValue still just called the bare read, this would fail
    // and the earlier "fails closed" assertions would be proving nothing.
    for (const value of ALL_HOSTILE_INPUTS) {
      const fixed = resolveFlexGapValue(value as FlexGapValue);
      const old = oldBareRead(value);
      expect(fixed, label(value)).not.toBe(old);
    }
  });

  it("interpolating the old result into a CSS declaration text reproduces the exact regression", () => {
    // What the responsive generator's template literal actually produced:
    // `  gap: ${resolve(rawValue)};` -- shown here against the OLD resolver.
    const oldDeclaration = `  gap: ${oldBareRead("toString")};`;
    expect(oldDeclaration).toContain("native code");
    const unknownDeclaration = `  gap: ${oldBareRead("huge")};`;
    expect(unknownDeclaration).toBe("  gap: undefined;");
  });
});
