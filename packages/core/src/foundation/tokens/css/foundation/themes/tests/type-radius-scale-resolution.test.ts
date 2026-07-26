/**
 * Resolution contract for the calc()-wrapped type-scale and radius-scale ramps
 * (W4-B1, design section 3.2).
 *
 * Each public --ds-font-size-* / --ds-radius-{sm,md,lg,xl} is now
 * calc(var(--ds-<step>-base) * var(--ds-<axis>-scale, 1)). This test pins two
 * invariants:
 *
 *   1. With the axis absent, every step resolves to its EXACT pre-change px
 *      (the var() fallback of 1 makes the wrap byte-identical at rest). The
 *      BEFORE ledgers below are the zero-visual-change contract and must never
 *      be regenerated from the css they verify.
 *   2. With the axis present, every step scales by the axis value at the one
 *      definition site (the whole point of the ramp wrap).
 *
 * The winning cascade is honoured: foundation/base/typography.css is imported
 * first in the rottay-tokens layer and foundation/themes/default.css last, so
 * default.css wins for the steps it redefines (xs..6xl, all radii) and
 * typography.css provides the steps only it defines (md, 7xl..9xl). The merge
 * order below (typography first, default second) reproduces that.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DEFAULT_CSS = resolve(
  process.cwd(),
  "src/foundation/tokens/css/foundation/themes/default.css"
);
const TYPOGRAPHY_CSS = resolve(
  process.cwd(),
  "src/foundation/tokens/css/foundation/base/typography.css"
);
const DARK_SELECTOR = ":root[data-theme='dark']";

function parseDeclarations(section: string): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const match of section.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    declarations.set(match[1], match[2].replace(/\s+/g, " ").trim());
  }
  return declarations;
}

/** Light-mode :root of default.css (everything before the dark override block). */
function defaultLightScope(): Map<string, string> {
  const css = readFileSync(DEFAULT_CSS, "utf8");
  const darkStart = css.indexOf(DARK_SELECTOR);
  if (darkStart < 0) throw new Error("Dark theme block not found");
  return parseDeclarations(css.slice(0, darkStart));
}

function typographyScope(): Map<string, string> {
  return parseDeclarations(readFileSync(TYPOGRAPHY_CSS, "utf8"));
}

/**
 * Combined foundation scope honouring the cascade: typography.css first, then
 * default.css overrides. Optional axis overrides (e.g. --ds-type-scale) seed the
 * scope so a resolved var() picks them up instead of its fallback.
 */
function combinedScope(
  overrides: Record<string, string> = {}
): Map<string, string> {
  const scope = new Map<string, string>();
  for (const [k, v] of typographyScope()) scope.set(k, v);
  for (const [k, v] of defaultLightScope()) scope.set(k, v);
  for (const [k, v] of Object.entries(overrides)) scope.set(k, v);
  return scope;
}

/** Recursively substitute var(--name, fallback) using the scope; throw on a
 * dangling reference that also lacks a fallback. */
function substituteVars(
  value: string,
  scope: Map<string, string>,
  depth = 0
): string {
  if (depth > 24) throw new Error(`var() cycle in: ${value}`);
  return value.replace(
    /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]*))?\)/gi,
    (_m, name: string, fallback: string | undefined) => {
      if (scope.has(name)) return substituteVars(scope.get(name)!, scope, depth + 1);
      if (fallback !== undefined) return substituteVars(fallback.trim(), scope, depth + 1);
      throw new Error(`Unresolved var ${name}`);
    }
  );
}

function lengthToPx(token: string): number {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(token.trim());
  if (!m) throw new Error(`Not a length: ${token}`);
  const n = Number(m[1]);
  const unit = m[2] ?? "";
  if (unit === "rem" || unit === "em") return n * 16;
  return n; // px or unitless
}

/** Evaluate the resolved ramp expression: either a bare length or
 * calc(<length> * <number>). Returns px. */
function evalToPx(expr: string): number {
  const flat = expr.replace(/\s+/g, " ").trim();
  const calc = /^calc\(\s*(\S+)\s*\*\s*([\d.]+)\s*\)$/.exec(flat);
  if (calc) return lengthToPx(calc[1]) * Number(calc[2]);
  return lengthToPx(flat);
}

function resolvePx(token: string, overrides: Record<string, string> = {}): number {
  const scope = combinedScope(overrides);
  const raw = scope.get(token);
  if (raw === undefined) throw new Error(`Unknown token ${token}`);
  return evalToPx(substituteVars(raw, scope));
}

// The zero-visual-change ledger: resolved px of each public step BEFORE the
// calc wrap (winning cascade). NEVER regenerate from the css under test.
const FONT_SIZE_BEFORE_PX: Record<string, number> = {
  "--ds-font-size-xs": 12,
  "--ds-font-size-sm": 14,
  "--ds-font-size-base": 15,
  "--ds-font-size-md": 16,
  "--ds-font-size-lg": 16,
  "--ds-font-size-xl": 18,
  "--ds-font-size-2xl": 20,
  "--ds-font-size-3xl": 24,
  "--ds-font-size-4xl": 32,
  "--ds-font-size-5xl": 40,
  "--ds-font-size-6xl": 48,
  "--ds-font-size-7xl": 72,
  "--ds-font-size-8xl": 96,
  "--ds-font-size-9xl": 128,
};

const RADIUS_BEFORE_PX: Record<string, number> = {
  "--ds-radius-sm": 6,
  "--ds-radius-md": 8,
  "--ds-radius-lg": 12,
  "--ds-radius-xl": 16,
};

describe("type-scale + radius-scale calc ramp resolution (W4-B1)", () => {
  it("resolves every font-size step to its exact pre-change px when --ds-type-scale is absent", () => {
    for (const [token, px] of Object.entries(FONT_SIZE_BEFORE_PX)) {
      expect(resolvePx(token), token).toBeCloseTo(px, 6);
    }
  });

  it("resolves every wrapped radius step to its exact pre-change px when --ds-radius-scale is absent", () => {
    for (const [token, px] of Object.entries(RADIUS_BEFORE_PX)) {
      expect(resolvePx(token), token).toBeCloseTo(px, 6);
    }
  });

  it("scales the whole font-size ramp by --ds-type-scale at the definition site", () => {
    const scale = 1.08;
    for (const [token, px] of Object.entries(FONT_SIZE_BEFORE_PX)) {
      expect(
        resolvePx(token, { "--ds-type-scale": String(scale) }),
        token
      ).toBeCloseTo(px * scale, 6);
    }
  });

  it("scales the wrapped radius steps by --ds-radius-scale at the definition site", () => {
    const scale = 1.25;
    for (const [token, px] of Object.entries(RADIUS_BEFORE_PX)) {
      expect(
        resolvePx(token, { "--ds-radius-scale": String(scale) }),
        token
      ).toBeCloseTo(px * scale, 6);
    }
  });

  it("leaves non-dial radius steps (none/xs/2xl/3xl/full) as literals, unscaled", () => {
    const scope = combinedScope({ "--ds-radius-scale": "2" });
    for (const [token, expected] of [
      ["--ds-radius-none", "0"],
      ["--ds-radius-xs", "3px"],
      ["--ds-radius-2xl", "20px"],
      ["--ds-radius-3xl", "24px"],
      ["--ds-radius-full", "9999px"],
    ] as const) {
      expect(scope.get(token), token).toBe(expected);
    }
  });

  // The contract is the shape -- one private -base literal, one multiplication,
  // one axis var whose fallback is 1 -- not the formatting. Whitespace inside
  // calc() is inert in CSS and each definition site wraps the expression as it
  // sees fit (typography.css wraps, default.css does not), so the anchors below
  // tolerate it exactly as evalToPx() above already does.
  it("keeps each public step defined as a calc over a private -base literal", () => {
    const scope = combinedScope();
    for (const token of Object.keys(FONT_SIZE_BEFORE_PX)) {
      expect(scope.get(token), token).toMatch(
        /^calc\(\s*var\(--ds-font-size-[a-z0-9]+-base\)\s*\*\s*var\(--ds-type-scale,\s*1\)\s*\)$/
      );
    }
    for (const token of Object.keys(RADIUS_BEFORE_PX)) {
      expect(scope.get(token), token).toMatch(
        /^calc\(\s*var\(--ds-radius-[a-z]+-base\)\s*\*\s*var\(--ds-radius-scale,\s*1\)\s*\)$/
      );
    }
  });
});
