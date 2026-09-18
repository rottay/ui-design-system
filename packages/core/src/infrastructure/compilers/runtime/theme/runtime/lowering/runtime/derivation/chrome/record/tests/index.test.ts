/**
 * The `record` vocabulary at rest: every produced channel equals the one fallback
 * its Modern skin reads it with, so producing the name cannot move a pixel, and
 * any higher-ranked statement still wins. The grid-columns channel the skin
 * AUTHORS is asserted unread: an authored declaration is already a producer, and
 * a deriver statement of it would be a second authority.
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
import { recordChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/record/index.css"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

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

describeFamilyContract(recordChromeDeriver, FIXTURES);

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

describe("chrome/record", () => {
  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = recordChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...recordChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of recordChromeDeriver.produces) {
      expect(channel.startsWith("--ds-record-")).toBe(true);
    }
  });

  it("leaves the skin-authored grid-columns declaration the only authority over it", () => {
    // The skin DECLARES the channel (an authored declaration is a producer) and
    // must not also READ it — a var() read with no other producer is what this
    // deriver exists to retire.
    expect(SKIN).toContain("--ds-record-field-grid-columns:");
    expect(recordChromeDeriver.produces).not.toContain("--ds-record-field-grid-columns");
    expect(skinFallbacks("--ds-record-field-grid-columns")).toEqual([]);
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(recordChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: recordChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [recordChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
