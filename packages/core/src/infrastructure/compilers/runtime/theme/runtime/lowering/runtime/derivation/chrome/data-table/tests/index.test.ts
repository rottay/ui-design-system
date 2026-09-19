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
      "0px",
    ]);
    expect(skinFallbacks("--ds-data-table-pinned-inset-end")).toEqual(["0px"]);
  });
});

/** The four skins this family paints from, in the order the family declares them. */
const FAMILY_SKINS = [
  "src/foundation/tokens/css/presentation/components/skin/data-table-actions/index.css",
  "src/foundation/tokens/css/presentation/components/skin/data-table-interactions/index.css",
  "src/foundation/tokens/css/presentation/components/skin/data-table-mobile/index.css",
  "src/foundation/tokens/css/runtime/engines/modern/skin/data-table/index.css",
].map((path) =>
  readFileSync(resolve(process.cwd(), path), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  )
);

/** Every distinct fallback any of the family's skins states for `channel`. */
function familyFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const text of FAMILY_SKINS) {
    for (const match of text.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
      if (match[1] !== channel) continue;
      const start = (match.index ?? 0) + match[0].length;
      let end = start;
      for (let depth = 1; depth > 0; end += 1) {
        if (text[end] === "(") depth += 1;
        else if (text[end] === ")") depth -= 1;
      }
      found.add(normalise(text.slice(start, end - 1)));
    }
  }
  return [...found];
}

/**
 * The channels drained out of the `--ds-table-` spelling nobody produced: the
 * skins now read the family's own name and the deriver produces it at the same
 * byte-identical fallback, so the resting paint is unchanged.
 */
const DRAINED: Record<string, string> = {
  "--ds-data-table-action-gap": "var(--ds-spacing-2, 0.5rem)",
  "--ds-data-table-drag-grip-size":
    "calc(var(--ds-modern-table-control-size) - 0.375rem)",
  "--ds-data-table-drop-indicator-radius":
    "var(--ds-modern-table-control-radius)",
  "--ds-data-table-editorial-mobile-title-size": "1rem",
  "--ds-data-table-mobile-actions-padding-block": "0.625rem",
  "--ds-data-table-mobile-bulk-padding": "0.625rem 0.75rem",
  "--ds-data-table-mobile-card-focus-ring":
    "0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 42%, transparent), var(--ds-collection-card-shadow-hover, var(--ds-premium-card-shadow-hover, var(--ds-elevation-2)))",
  "--ds-data-table-mobile-card-hover-lift": "-1px",
  "--ds-data-table-mobile-control-size": "2.25rem",
  "--ds-data-table-mobile-pagination-padding": "0.625rem 0.75rem",
  "--ds-data-table-mobile-selected-outline-offset": "2px",
  "--ds-data-table-mobile-state-min-height": "8rem",
  "--ds-data-table-mobile-state-padding": "2rem 1.25rem",
  "--ds-data-table-mobile-state-radius":
    "var(--ds-table-radius, var(--ds-radius-lg))",
  "--ds-data-table-mobile-summary-divider":
    "color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)",
  "--ds-data-table-mobile-summary-min-height": "2rem",
  "--ds-data-table-mobile-summary-padding-block": "0.375rem",
  "--ds-data-table-mobile-summary-padding-inline": "0.125rem",
  "--ds-data-table-resize-bar-height-active": "74%",
  "--ds-data-table-resize-bar-width-active": "0.1875rem",
  "--ds-data-table-ruled-mobile-radius": "var(--ds-radius-md, 0.5rem)",
  "--ds-data-table-ruled-mobile-shadow": "none",
};

/** The three names this family reads that no honest single value can produce. */
const DIVERGENT = [
  "--ds-table-cell-line-height",
  "--ds-table-control-radius",
  "--ds-table-shadow",
];

describe("chrome/data-table drained channels", () => {
  it("produces each one at the single fallback its skins state", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const [channel, rest] of Object.entries(DRAINED)) {
      expect(derived[channel], channel).toBe(rest);
      expect({ channel, fallbacks: familyFallbacks(channel) }, channel).toEqual(
        {
          channel,
          fallbacks: [normalise(rest)],
        }
      );
    }
  });

  it("rests the drag grip's margin at the declaration that wins the cascade", () => {
    /* Two rules state `margin-inline-end` on the SAME selector; the later one
       carries `0`, so `0` is what the grip paints whether or not the channel
       is produced. */
    const skin = FAMILY_SKINS[FAMILY_SKINS.length - 1]!;
    const sites = [
      ...skin.matchAll(
        /([^}]*?)\{[^}]*?margin-inline-end:\s*var\(--ds-data-table-drag-grip-offset,\s*([^)]*)\)/g
      ),
    ];
    expect(sites).toHaveLength(2);
    expect(sites.map((site) => normalise(site[1]!))).toEqual([
      '.ds-pattern-data-table.ds-engine-modern [data-part="drag-grip"]',
      '.ds-pattern-data-table.ds-engine-modern [data-part="drag-grip"]',
    ]);
    expect(sites.map((site) => site[2]!.trim())).toEqual(["0.125rem", "0"]);
    expect(
      dataTableChromeDeriver.derive(context(), {})[
        "--ds-data-table-drag-grip-offset"
      ]
    ).toBe("0");
  });

  it("leaves the three divergent reads unproduced, with their divergence measured", () => {
    const derived = dataTableChromeDeriver.derive(context(), {});
    for (const channel of DIVERGENT) {
      expect(derived[channel], channel).toBeUndefined();
      expect(
        familyFallbacks(channel).length,
        `${channel}: one resting value would repaint the other read sites`
      ).toBeGreaterThan(1);
    }
    expect(familyFallbacks("--ds-table-cell-line-height").sort()).toEqual([
      "1.25",
      "1.35",
      "1.55",
    ]);
    expect(familyFallbacks("--ds-table-control-radius").sort()).toEqual([
      "var(--ds-radius-full, 9999px)",
      "var(--ds-radius-md, 0.5rem)",
    ]);
    expect(familyFallbacks("--ds-table-shadow").sort()).toEqual([
      "var(--ds-elevation-1)",
      "var(--ds-workspace-card-shadow, var(--ds-elevation-1))",
    ]);
  });
});
