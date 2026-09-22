/**
 * The token document contract: closed rosters, frozen bounds, and the two
 * shapes that would let a defect through if either were open.
 */

import { describe, expect, it } from "vitest";

import {
  CSS_TYPED_LEAF_REASONS,
  TOKEN_EMISSION_BOUNDS,
  UNRESOLVED_TOKEN_REASONS,
  type ThemeTokenDocument,
  type ThemeTokenLeaf,
  type TokenChannelName,
  type TokenEmissionEnvironment,
  type UnresolvedToken,
} from "..";

describe("token emission contract", () => {
  it("the CSS-typed reason roster is closed and frozen", () => {
    expect(Object.isFrozen(CSS_TYPED_LEAF_REASONS)).toBe(true);
    expect([...CSS_TYPED_LEAF_REASONS].sort()).toEqual([
      "filter",
      "font-family-stack",
      "gradient",
      "shadow-list",
      "transform",
      "transition-shorthand",
    ]);
    expect(new Set(CSS_TYPED_LEAF_REASONS).size).toBe(CSS_TYPED_LEAF_REASONS.length);
  });

  it("every refusal reason is declared, so a refusal cannot be invented", () => {
    expect(Object.isFrozen(UNRESOLVED_TOKEN_REASONS)).toBe(true);
    expect([...UNRESOLVED_TOKEN_REASONS].sort()).toEqual([
      "cycle",
      "depth",
      "guaranteed-invalid",
      "missing",
      "unevaluable",
      "unit-mix",
    ]);
    const reason: UnresolvedToken["reason"] = UNRESOLVED_TOKEN_REASONS[0];
    expect(UNRESOLVED_TOKEN_REASONS).toContain(reason);
  });

  it("the bounds are frozen, and the colour tolerances live inside them", () => {
    expect(Object.isFrozen(TOKEN_EMISSION_BOUNDS)).toBe(true);
    expect(TOKEN_EMISSION_BOUNDS.maxResolutionDepth).toBe(32);
    // sRGB mixes are exact after rounding; no tolerance is granted there.
    expect(TOKEN_EMISSION_BOUNDS.srgbChannelTolerance).toBe(0);
    // The oklab arm rides the colour owner's gamut mapping, which is a mapping
    // rather than an identity, so it gets exactly one 8-bit step.
    expect(TOKEN_EMISSION_BOUNDS.oklabSrgbChannelTolerance).toBeCloseTo(1 / 255, 12);
    // Pinned from the emitter's first green run across the three verticals
    // (max measured 0.1117), rounded up to the next 0.005. Decrease-only.
    expect(TOKEN_EMISSION_BOUNDS.maxCssTypedLeafRatio).toBe(0.115);
    expect(TOKEN_EMISSION_BOUNDS.maxCssTypedLeafRatio).toBeGreaterThan(0);
    expect(TOKEN_EMISSION_BOUNDS.maxCssTypedLeafRatio).toBeLessThan(1);
  });

  it("the environment names the two axes that move a root document, and no third", () => {
    const environment: TokenEmissionEnvironment = { mode: "dark", rootFontSizePx: 16 };
    expect(Object.keys(environment).sort()).toEqual(["mode", "rootFontSizePx"]);
    // @ts-expect-error density is deliberately NOT an axis: the effective scale
    // is determined by compiled channels at :root, so a per-density document
    // would report values the browser never paints.
    const withDensity: TokenEmissionEnvironment = { ...environment, density: "compact" };
    expect(withDensity.mode).toBe("dark");
  });

  it("a channel name is the template literal, not a bare string", () => {
    const named: TokenChannelName = "--ds-color-primary";
    expect(named.startsWith("--ds-")).toBe(true);
    // @ts-expect-error a name outside the prefix is not a channel
    const foreign: TokenChannelName = "--other-primary";
    expect(foreign).toBe("--other-primary");
  });

  it("every leaf kind carries numbers, never CSS text, except the declared one", () => {
    const leaves: ThemeTokenLeaf[] = [
      { kind: "color", srgb: [0, 0, 0], alpha: 1 },
      { kind: "length", value: 4, unit: "px" },
      { kind: "time", ms: 120 },
      { kind: "number", value: 1.5 },
      { kind: "angle", deg: 90 },
      { kind: "keyword", value: "auto" },
      { kind: "css", css: "0 1px 2px rgba(0,0,0,0.1)", reason: "shadow-list" },
    ];
    const kinds = leaves.map((leaf) => leaf.kind);
    expect(new Set(kinds).size).toBe(leaves.length);
    for (const leaf of leaves) {
      if (leaf.kind === "css") {
        expect(CSS_TYPED_LEAF_REASONS).toContain(leaf.reason);
        continue;
      }
      expect(JSON.stringify(leaf)).not.toContain("var(");
    }
  });

  it("the document is a projection of a compile, and carries the identity a compile cannot", () => {
    const document: ThemeTokenDocument = {
      formatVersion: 1,
      vertical: "bithire",
      slug: "bithire",
      engine: "modern",
      environment: { mode: "light", rootFontSizePx: 16 },
      compilerVersion: "contract-suite",
      digest: "deadbeef",
      tokens: { "--ds-spacing-1": { kind: "length", value: 4, unit: "px" } },
      unresolved: [{ channel: "--ds-missing", reason: "missing", cause: "--ds-cause" }],
    };
    expect(document.formatVersion).toBe(1);
    // It carries CHANNELS, which the compile's own non-CSS projection does not,
    // and no personality, overrides or profile names, which that one does.
    expect(Object.keys(document)).not.toContain("personality");
    expect(Object.keys(document)).not.toContain("tokenOverrides");
    expect(Object.keys(document.tokens)).toHaveLength(1);
  });
});
