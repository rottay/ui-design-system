/**
 * The `pagination` vocabulary at rest: every channel the Modern skin used to
 * read unwired now chains its skin fallback to a produced root, and the
 * deriver produces exactly the chained string the skin reads — so producing
 * the name cannot move a pixel, and any higher-ranked statement still wins.
 *
 * `--ds-pagination-nav-inline-size` chains through the produced
 * `--ds-pagination-md-height` relation (the default size arm's resting
 * height, itself landed on the `--ds-spacing-9` root) while keeping the
 * skin's private `--_ds-pagination-current-height` tail byte-identical: the
 * `[data-size]` arms redeclare that name on the root element, so the tail
 * still defers to the per-size arm wherever the relation is unstated.
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
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { paginationChromeDeriver } from "..";

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

describeFamilyContract(paginationChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/pagination/index.css"),
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

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** Every channel the cascade-wiring lot chained, and the exact chain it reads. */
const WIRED: Record<string, string> = {
  "--ds-pagination-gap": "var(--ds-spacing-3)",
  "--ds-pagination-row-gap": "var(--ds-spacing-2)",
  "--ds-pagination-simple-gap": "var(--ds-spacing-2)",
  "--ds-pagination-controls-bleed": "var(--ds-spacing-1)",
  "--ds-pagination-motion-duration": "var(--ds-motion-feedback)",
  "--ds-pagination-motion-easing": "var(--ds-motion-ease-standard)",
  "--ds-pagination-item-bg-hover":
    "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-card-bg, var(--ds-surface-card)))",
  "--ds-pagination-item-bg-active":
    "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-bg, var(--ds-surface-card)))",
  "--ds-pagination-jumper-width": "calc(var(--ds-spacing-14) + var(--ds-spacing-0))",
  "--ds-pagination-nav-inline-size":
    "var(--ds-pagination-md-height, var(--_ds-pagination-current-height))",
};

describe("chrome/pagination", () => {
  it("produces exactly the chain each wired skin read falls back to", () => {
    const derived = paginationChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...paginationChromeDeriver.produces].sort());
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [chain],
      });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of paginationChromeDeriver.produces) {
      expect(channel.startsWith("--ds-pagination-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(paginationChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: paginationChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [paginationChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
