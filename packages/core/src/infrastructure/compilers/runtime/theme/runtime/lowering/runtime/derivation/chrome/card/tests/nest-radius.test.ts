/** The card's nest radius under the spacing-rhythm gate: concentric only when it derives from the padding its
 *  own rule paints; restating the scaled padding inline, or scaling the radius, reds both legs. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

const SKIN_PATH = resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css");
const SKIN = readFileSync(SKIN_PATH, "utf8");
const NEST_READ = "var(--_ds-card-padding-current),";
const INLINE_PADDING =
  "var(--ds-card-instance-padding, calc(var(--ds-card-padding-md, var(--ds-card-padding-base)) * var(--ds-rhythm-effective-scale, 1))),";

type Finding = { property: string; classification: string; via?: string[] };
type Analysis = {
  violations: Finding[];
  indirectViolations: Finding[];
  indirectUnclassified: Finding[];
  concentricChannels: string[];
};
let analyze: (css: string) => Analysis;

beforeAll(async () => {
  const gate = await import(
    pathToFileURL(resolve(process.cwd(), "scripts/check/tokens/contracts/spacing-rhythm/index.mjs")).href
  );
  analyze = (css) => gate.analyzeRhythmStylesheets([{ file: SKIN_PATH, css }]);
});

const rows = (result: Analysis) =>
  [...result.violations, ...result.indirectViolations, ...result.indirectUnclassified]
    .map((finding) => `${finding.property} ${finding.classification}`)
    .sort();

describe("card nest radius", () => {
  it("derives from the padding its own rule paints, so the gate licenses it as concentric", () => {
    expect(SKIN.split(NEST_READ)).toHaveLength(2);
    const result = analyze(SKIN);
    expect(rows(result)).toEqual([]);
    expect(result.concentricChannels).toContain("--_ds-card-nest-radius");
  });

  it("RED on both legs when the scaled padding is restated inside the radius", () => {
    const result = analyze(SKIN.replace(NEST_READ, INLINE_PADDING));
    expect(result.violations.map((finding) => finding.property)).toEqual(["--_ds-card-nest-radius"]);
    expect(result.indirectViolations.map((finding) => `${finding.property} ${finding.classification}`)).toEqual([
      "border-radius FORBIDDEN_OUTER_RADIUS",
      "border-radius FORBIDDEN_OUTER_RADIUS",
    ]);
    expect(result.concentricChannels).not.toContain("--_ds-card-nest-radius");
  });

  it("RED when the radius scales with the padding instead of subtracting it", () => {
    const scaled = SKIN.replace(
      /--_ds-card-nest-radius: max\([\s\S]*?\n {2}\);/u,
      "--_ds-card-nest-radius: calc(var(--_ds-card-radius-current, var(--ds-card-radius)) * var(--_ds-card-padding-current));"
    );
    expect(scaled).not.toBe(SKIN);
    const result = analyze(scaled);
    expect(result.concentricChannels).not.toContain("--_ds-card-nest-radius");
    expect(rows(result)).toContain("border-radius FORBIDDEN_OUTER_RADIUS");
  });
});
