/**
 * The `surface-chrome` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { buildRecipeManifest } from "@/infrastructure/runtime/foundation/recipes/manifest";
import {
  SECTION_CARD_CHANNEL_PREFIX,
  SECTION_CARD_PUBLISHED_CHANNELS,
} from "@/infrastructure/runtime/foundation/recipes/contracts/families";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { surfaceChromeChromeDeriver } from "..";

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
];

describeFamilyContract(surfaceChromeChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/surface-section-card/index.css"
  ),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

const normalise = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

function skinFallbacks(channel: string): string[] {
  const found = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-[a-z0-9-]+)\s*,/g)) {
    if (match[1] !== channel) continue;
    const start = (match.index ?? 0) + match[0].length;
    let end = start;
    for (let depth = 1; depth > 0 && end < SKIN.length; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(SKIN.length);
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/surface-chrome", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = surfaceChromeChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...surfaceChromeChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names the namespace the governed recipe manifest already publishes", () => {
    // The family id is `surface-chrome`; the spelling is the recipe's, and the
    // recipe is public API. That is why the rename is refused.
    const section = buildRecipeManifest().families.find(
      (entry) => entry.name === "sectionCard"
    );
    expect(section?.customPropertyPrefix).toBe(SECTION_CARD_CHANNEL_PREFIX);
    for (const channel of surfaceChromeChromeDeriver.produces) {
      expect(channel.startsWith(SECTION_CARD_CHANNEL_PREFIX)).toBe(true);
    }
  });

  it("produces exactly the band the recipe owner declares", () => {
    // The family-namespace law admits `SECTION_CARD_PUBLISHED_CHANNELS`, not
    // the prefix. If this family states a fifth name under it, the law has to
    // see a stray rather than an exemption nobody wrote down.
    expect([...surfaceChromeChromeDeriver.produces].sort()).toEqual(
      [...SECTION_CARD_PUBLISHED_CHANNELS].sort()
    );
    expect(
      Object.keys(surfaceChromeChromeDeriver.derive(context(), {})).sort()
    ).toEqual([...SECTION_CARD_PUBLISHED_CHANNELS].sort());
  });

  it("leaves the shared workspace-card tile group to its own owner", () => {
    const derived = surfaceChromeChromeDeriver.derive(context(), {});
    for (const channel of [
      "--ds-workspace-card-icon-bg",
      "--ds-workspace-card-icon-border",
      "--ds-workspace-card-icon-color",
    ]) {
      expect(derived[channel]).toBeUndefined();
      expect(skinFallbacks(channel)).toHaveLength(1);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(surfaceChromeChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: surfaceChromeChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [surfaceChromeChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
      }
    }
  });
});
