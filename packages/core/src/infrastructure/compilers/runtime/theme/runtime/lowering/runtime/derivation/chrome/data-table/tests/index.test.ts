/**
 * The data-table family under the shared contract battery: generated from the
 * one template every family answers, never restated here in its own words.
 *
 * The cascade-wiring block below pins each wired channel to the exact chain
 * its Modern skin reads (produced === fallback === resting paint), the same
 * parity contract the form-sections wave lot asserts.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext } from "../../../../pipeline";
import { FAMILY_DERIVERS } from "../../..";
import { dataTableChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
  {
    label: "minimal under a tenant floor",
    theme: MINIMAL_THEME,
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(dataTableChromeDeriver, FIXTURES);

describe("chrome/data-table", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === dataTableChromeDeriver)
    ).toHaveLength(1);
    expect(dataTableChromeDeriver.family).toBe("data-table");
    expect(dataTableChromeDeriver.rank).toBe("derived");
  });
});

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css"
  ),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every distinct fallback the skin states for `channel`. */
function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 1; depth > 0; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () =>
  buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** Every wired channel: the exact chain the deriver produces and the skin reads. */
const WIRED: Record<string, string> = {
  "--ds-data-table-action-shadow": "var(--ds-elevation-0, none)",
  "--ds-data-table-control-size":
    "calc(var(--ds-spacing-8, 2rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-control-size-compact":
    "calc(var(--ds-spacing-7, 1.75rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-control-size-spacious":
    "calc(var(--ds-spacing-9, 2.25rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))",
  "--ds-data-table-editor-checkbox-size": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-editor-input-line-height":
    "var(--ds-line-height-normal, 1.5)",
  "--ds-data-table-editorial-header-padding-block": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-editorial-header-transform":
    "var(--ds-text-eyebrow-transform, uppercase)",
  "--ds-data-table-minimal-shadow": "var(--ds-elevation-0, none)",
  "--ds-data-table-resize-hit-size": "var(--ds-spacing-4, 1rem)",
  "--ds-data-table-touch-target": "var(--ds-spacing-11, 2.75rem)",
};

describe("chrome/data-table cascade wiring", () => {
  it("produces the exact chained string the Modern skin reads, for every wired channel", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect({ channel, fallbacks: skinFallbacks(channel) }, channel).toEqual({
        channel,
        fallbacks: [normalise(chain)],
      });
    }
  });

  it("wires the pinned insets at the read site without a produced statement", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    /* The engine stamps the measured sticky offset inline; nobody produces or
       declares the name on the scope root, so only the read fallback carries
       the chain. */
    expect(derived["--ds-data-table-pinned-inset-start"]).toBeUndefined();
    expect(derived["--ds-data-table-pinned-inset-end"]).toBeUndefined();
    expect(skinFallbacks("--ds-data-table-pinned-inset-start")).toEqual([
      "var(--ds-spacing-0, 0px)",
    ]);
    expect(skinFallbacks("--ds-data-table-pinned-inset-end")).toEqual([
      "var(--ds-spacing-0, 0px)",
    ]);
  });
});
