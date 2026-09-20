/**
 * The `command-palette` vocabulary at rest: every wired channel equals the one
 * fallback its Modern skin reads it with, so producing the name cannot move a
 * pixel, and any higher-ranked statement still wins.
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
import { commandPaletteChromeDeriver } from "..";

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

describeFamilyContract(commandPaletteChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/command-palette/index.css"
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

/** The three tenant-authored names the palette adopts but does not produce. */
const ADOPTED_NOT_PRODUCED = [
  "--ds-command-palette-border",
  "--ds-search-category-color",
];

/**
 * The five `chrome.search.commandPalette` names this family refuses, with the
 * owner each one's paint actually belongs to. Pinned so a later lot cannot
 * quietly wire one without re-reading why.
 */
const REFUSED = [
  "--ds-command-palette-bg",
  "--ds-command-palette-shadow",
  "--ds-command-palette-backdrop",
  "--ds-command-palette-empty-color",
  "--ds-command-palette-item-hover-bg",
];

describe("chrome/command-palette", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = commandPaletteChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual(
      [...commandPaletteChromeDeriver.produces].sort()
    );
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(value)],
      });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of commandPaletteChromeDeriver.produces) {
      expect(channel.startsWith("--ds-command-palette-")).toBe(true);
    }
  });

  it("lands the tenant's own palette border and category ink without producing either", () => {
    const derived = commandPaletteChromeDeriver.derive(context(), {});
    for (const channel of ADOPTED_NOT_PRODUCED) {
      expect(derived[channel]).toBeUndefined();
      // Read by the skin, produced by the theme root: the cascade arrives.
      expect(SKIN.includes(channel)).toBe(true);
    }
    expect(derived["--ds-command-palette-search-rule"]).toBe(
      "var(--ds-edge-hairline-width, 1px) solid var(--ds-command-palette-border, var(--ds-color-border))"
    );
    expect(derived["--ds-command-palette-footer-rule"]).toBe(
      derived["--ds-command-palette-search-rule"]
    );
  });

  it("refuses the five names whose paint belongs to a composed primitive", () => {
    const derived = commandPaletteChromeDeriver.derive(context(), {});
    for (const channel of REFUSED) {
      expect(derived[channel]).toBeUndefined();
      expect(SKIN.includes(channel)).toBe(false);
    }
  });

  it("draws no skeleton of its own: the loading surface is the shared renderer's", () => {
    expect(/skeleton|shimmer/i.test(SKIN)).toBe(false);
  });

  it("pairs the pointer hover with the kernel state rather than deciding it twice", () => {
    expect(SKIN).toContain("[data-state~='hovered'], :hover");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(commandPaletteChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: commandPaletteChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [commandPaletteChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
