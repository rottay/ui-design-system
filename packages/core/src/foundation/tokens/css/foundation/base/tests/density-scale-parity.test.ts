/**
 * Parity contract for the density axis (W4-D, design section 7c).
 *
 * Two code paths carry the same three density factors and must never drift:
 *  - CSS: foundation/base/density.css maps data-density="<mode>" to a local
 *    --ds-density-scale, which the spacing ramp multiplies at its definition
 *    site.
 *  - JS: the useTokens token graph derives an appearanceDensityFactor from
 *    appearance.general.density for its JS consumers.
 *
 * This test reads BOTH sources and asserts the per-mode factor is byte-equal, so
 * a change to either factor without the other fails here. It parses source (no
 * React render, no DOM) exactly like the neutral-derivation contract test.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DENSITY_CSS_PATH = resolve(
  process.cwd(),
  "src/foundation/tokens/css/foundation/base/density.css",
);
const USE_TOKENS_PATH = resolve(
  process.cwd(),
  "src/infrastructure/runtime/theming/composition/react/tokens/index.ts",
);

/** compact/comfortable/spacious -> factor, parsed from the CSS attribute rules. */
function parseCssFactors(css: string): Record<string, number> {
  const factors: Record<string, number> = {};
  const rule =
    /\[data-density=['"](compact|comfortable|spacious)['"]\]\s*\{[^}]*?--ds-density-scale:\s*([\d.]+)\s*;?[^}]*\}/g;
  for (const match of css.matchAll(rule)) {
    factors[match[1]] = Number(match[2]);
  }
  return factors;
}

/**
 * compact/spacious/comfortable -> factor, parsed from the appearanceDensityFactor
 * assignment. compact and spacious read their explicit ternary arms; comfortable
 * is the trailing default arm (the last numeric literal in the expression).
 */
function parseJsFactors(source: string): Record<string, number> {
  const assignment = source.match(
    /appearanceDensityFactor\s*=\s*([\s\S]*?);/,
  );
  if (!assignment) {
    throw new Error("appearanceDensityFactor assignment not found in useTokens");
  }
  const expr = assignment[1];
  const compact = expr.match(/'compact'\s*\?\s*([\d.]+)/);
  const spacious = expr.match(/'spacious'\s*\?\s*([\d.]+)/);
  const literals = expr.match(/[\d.]+/g);
  if (!compact || !spacious || !literals || literals.length === 0) {
    throw new Error("Could not parse density factors from useTokens ternary");
  }
  return {
    compact: Number(compact[1]),
    spacious: Number(spacious[1]),
    // The default arm is the final `: <n>` literal of the ternary chain.
    comfortable: Number(literals[literals.length - 1]),
  };
}

const cssFactors = parseCssFactors(readFileSync(DENSITY_CSS_PATH, "utf8"));
const jsFactors = parseJsFactors(readFileSync(USE_TOKENS_PATH, "utf8"));

describe("density-scale css/js parity", () => {
  it("parses all three named modes from the CSS attribute rules", () => {
    expect(Object.keys(cssFactors).sort()).toEqual([
      "comfortable",
      "compact",
      "spacious",
    ]);
  });

  it("parses all three factors from the JS useTokens graph", () => {
    expect(jsFactors.compact).toBeTypeOf("number");
    expect(jsFactors.comfortable).toBeTypeOf("number");
    expect(jsFactors.spacious).toBeTypeOf("number");
  });

  it.each(["compact", "comfortable", "spacious"] as const)(
    "css --ds-density-scale for %s equals the js appearanceDensityFactor",
    (mode) => {
      expect(cssFactors[mode]).toBe(jsFactors[mode]);
    },
  );

  it("keeps the density axis identity at rest (comfortable === 1)", () => {
    // A comfortable container must be byte-stable against the ramp's calc
    // fallback of 1, or every default surface would silently reflow.
    expect(cssFactors.comfortable).toBe(1);
    expect(jsFactors.comfortable).toBe(1);
  });
});
