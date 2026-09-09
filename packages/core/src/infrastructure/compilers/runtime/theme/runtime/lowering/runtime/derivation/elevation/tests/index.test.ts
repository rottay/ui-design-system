/**
 * The elevation family: one ladder per posture, one stacking scale.
 *
 * The bands are declared twice by necessity -- once in TypeScript so the
 * compiler can emit them per tenant, once in CSS so an untenanted document
 * still stacks. This pins the pair, which is what keeps two declarations from
 * becoming two authorities.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { buildLoweringContext } from "../../../pipeline";
import { deriveElevationLadder } from "../ladder";
import { Z_INDEX_BANDS, deriveZIndexBands } from "../z-index";

const Z_INDEX_CSS = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/foundation/base/z-index/index.css"
  ),
  "utf8"
);

/**
 * The BANDS only. Everything after the component header is an alias onto a
 * band -- `--ds-z-index-affix: 100` included -- and an alias is not a step of
 * the scale.
 */
const Z_INDEX_SCALE = Z_INDEX_CSS.slice(
  Z_INDEX_CSS.indexOf("THE SCALE"),
  Z_INDEX_CSS.indexOf("COMPONENT-SPECIFIC Z-INDEX")
);

const theme = (surfaces: BrandTheme["surfaces"]): BrandTheme => ({
  id: "t",
  name: "T",
  surfaces,
});

const ladderFor = (surfaces: BrandTheme["surfaces"]): Record<string, string> => {
  const bt = theme(surfaces);
  return deriveElevationLadder(bt, buildLoweringContext({ theme: bt }).expressive.expansion);
};

describe("elevation/z-index", () => {
  it("emits every band the CSS scale declares, at the same number", () => {
    const emitted = deriveZIndexBands();
    for (const [band, value] of Object.entries(Z_INDEX_BANDS)) {
      expect(emitted[`--ds-z-index-${band}`]).toBe(String(value));
      expect(Z_INDEX_SCALE).toContain(`--ds-z-index-${band}: ${value};`);
    }
  });

  it("declares no band the CSS scale does not name, and vice versa", () => {
    const inCss = [...Z_INDEX_SCALE.matchAll(/--ds-z-index-([a-z]+): (\d+);/g)]
      .map((match) => match[1])
      .sort();
    expect(inCss).toEqual(Object.keys(Z_INDEX_BANDS).sort());
  });
});

describe("elevation/ladder", () => {
  const ladderOf = (posture: "flat" | "soft" | "elevated") =>
    ladderFor({ elevation: posture });

  it("states all seven roles and the border weight for a non-identity posture", () => {
    for (const posture of ["flat", "elevated"] as const) {
      const ladder = ladderOf(posture);
      for (const role of [0, 1, 2, 3, 4, 5, 6]) {
        expect(ladder[`--ds-elevation-${role}`], `${posture}/${role}`).toBeDefined();
      }
      expect(ladder["--ds-elevation-border-style"]).toBeDefined();
    }
  });

  it("states nothing at all for the identity posture", () => {
    expect(ladderOf("soft")).toEqual({});
  });

  it("lets an authored ladder refine the posture it sits on", () => {
    const refined = ladderFor({
      elevation: "flat",
      elevations: { level2: "0 0 0 1px hotpink" },
    });
    expect(refined["--ds-elevation-2"]).toBe("0 0 0 1px hotpink");
    expect(refined["--ds-elevation-1"]).toBe(ladderOf("flat")["--ds-elevation-1"]);
  });
});
