/**
 * The `table` vocabulary at rest: the four runtime-geometry channels the Modern
 * skin reads with a literal or bare fallback now chain to a produced root whose
 * resting value equals the literal the family painted, so producing the name
 * cannot move a pixel, and any higher-ranked statement still wins. The three
 * zero offsets ride the spacing ramp's zero rung and the truncating cap rides
 * the 20rem rung; the skin declares each of them at the family root and the
 * TSX re-stamps them per element, so those statements outrank these derived
 * ones for the whole subtree. The remaining reads (the container's 100% inline
 * size, the column's auto width, the uncapped scroll axis) are keyword values
 * no governed root shares and stay byte-unchanged.
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
import { tableChromeDeriver } from "..";

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

describeFamilyContract(tableChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/table/index.css"),
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
  "--ds-table-col-min-width": "var(--ds-spacing-0, 0)",
  "--ds-table-sticky-top": "var(--ds-spacing-0, 0)",
  "--ds-table-virtual-spacer": "var(--ds-spacing-0, 0)",
  "--ds-table-cell-ellipsis-max-width": "var(--ds-spacing-80, 320px)",
};

describe("chrome/table", () => {
  it("states every declared channel at the single value the skin reads it with", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...tableChromeDeriver.produces].sort());
  });

  it("produces each wired channel as exactly the chained fallback the skin reads it with", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: chain });
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [chain] });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads: 0 });
    }
  });

  it("measures the keyword reads as rootless: not produced, still literal or bare", () => {
    const derived = tableChromeDeriver.derive(context(), {});
    expect({ channel: "--ds-table-scroll-x", produced: derived["--ds-table-scroll-x"] }).toEqual({
      channel: "--ds-table-scroll-x",
      produced: undefined,
    });
    expect({ fallbacks: skinFallbacks("--ds-table-scroll-x") }).toEqual({ fallbacks: ["100%"] });
    for (const channel of ["--ds-table-col-width", "--ds-table-scroll-y"]) {
      expect({ channel, produced: derived[channel] }).toEqual({ channel, produced: undefined });
      expect({ channel, bareReads: skinBareReads(channel) }).toEqual({ channel, bareReads: 1 });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of tableChromeDeriver.produces) {
      expect(channel.startsWith("--ds-table-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(tableChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: tableChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [tableChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
