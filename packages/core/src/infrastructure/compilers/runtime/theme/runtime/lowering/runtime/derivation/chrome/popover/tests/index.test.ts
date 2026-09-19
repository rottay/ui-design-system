/**
 * The `popover` vocabulary at rest: the six per-recipe title inline paddings
 * the Modern skin used to read bare now state the exact chain the deriver
 * produces for each — the tenant override surfaces, then the density spacing
 * step the recipe rests on — so producing the name cannot move a pixel, the
 * read reaches a produced root even where nothing states the channel, and any
 * higher-ranked statement still wins. Each chain's terminal step is itself a
 * produced root, so the cascade lands without a new relation being invented.
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
import { popoverChromeDeriver } from "..";

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

describeFamilyContract(popoverChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/popover/index.css"),
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

/** Every bare read of `channel` (no fallback) the skin states. */
function skinBareReads(channel: string): number {
  const pattern = new RegExp(`var\\(\\s*${channel.replace(/-/g, "\\-")}\\s*\\)`, "g");
  return [...SKIN.matchAll(pattern)].length;
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

/** The chained fallback both the deriver and the skin must state byte-for-byte. */
const WIRED: Record<string, string> = {
  "--ds-popover-bordered-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-bordered-padding-inline, var(--ds-spacing-md)))",
  "--ds-popover-minimal-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-minimal-padding-inline, var(--ds-spacing-sm)))",
  "--ds-popover-rich-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-rich-padding-inline, var(--ds-spacing-lg)))",
  "--ds-popover-compact-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-compact-padding-inline, var(--ds-spacing-sm)))",
  "--ds-popover-comfortable-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-comfortable-padding-inline, var(--ds-spacing-md)))",
  "--ds-popover-spacious-title-padding-inline":
    "var(--ds-popover-title-padding-inline, var(--ds-popover-spacious-padding-inline, var(--ds-spacing-lg)))",
};

describe("chrome/popover", () => {
  it("states every declared channel at the single value the skin reads it with", () => {
    const derived = popoverChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...popoverChromeDeriver.produces].sort());
  });

  it("produces each wired title padding as exactly the chained fallback the skin reads it with", () => {
    const derived = popoverChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [chain] });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads: 0 });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of popoverChromeDeriver.produces) {
      expect(channel.startsWith("--ds-popover-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(popoverChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: popoverChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [popoverChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
