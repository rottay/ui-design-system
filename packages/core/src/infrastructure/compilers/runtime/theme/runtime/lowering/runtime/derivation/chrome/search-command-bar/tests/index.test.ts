/**
 * The `search-command-bar` vocabulary at rest.
 *
 * This family had NO namespace before the cut: its skin read twenty-two root
 * tokens and nothing of its own. The suite therefore asserts both directions --
 * every produced channel equals the single fallback the skin reads it with, AND
 * the skin reads no `--ds-search-command-bar-*` name this deriver does not
 * produce, so the namespace cannot grow a shadow channel again.
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
import { searchCommandBarChromeDeriver } from "..";

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

describeFamilyContract(searchCommandBarChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/search-command-bar/index.css"
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

/** Every `--ds-search-command-bar-*` name the skin reads. */
function skinReads(): string[] {
  const names = new Set<string>();
  for (const match of SKIN.matchAll(/var\(\s*(--ds-search-command-bar-[a-z0-9-]+)\s*,/g)) {
    names.add(match[1]!);
  }
  return [...names].sort();
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/search-command-bar", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = searchCommandBarChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual(
      [...searchCommandBarChromeDeriver.produces].sort()
    );
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(value)],
      });
    }
  });

  it("covers the namespace exactly: no channel is read without a producer here", () => {
    expect(skinReads()).toEqual([...searchCommandBarChromeDeriver.produces].sort());
  });

  it("names only its own family namespace", () => {
    for (const channel of searchCommandBarChromeDeriver.produces) {
      expect(channel.startsWith("--ds-search-command-bar-")).toBe(true);
    }
  });

  it("rests the two canonicalised literals on the cascade, not on a number", () => {
    const derived = searchCommandBarChromeDeriver.derive(context(), {});
    expect(derived["--ds-search-command-bar-badge-radius"]).toBe(
      "var(--ds-radius-full, 9999px)"
    );
    expect(derived["--ds-search-command-bar-slot-touch-target"]).toBe(
      "var(--ds-touch-target-min, 44px)"
    );
  });

  it("leaves the ring recipe ungated: the composed Button decides when it draws", () => {
    // The channel is stated unconditionally; the family owns no `:focus-visible`
    // decision of its own, which is why the skin has no bare state pseudo left.
    expect(SKIN).toContain("--ds-search-command-bar-focus-ring");
    expect(SKIN).not.toContain(":focus-visible");
  });

  it("rests the ring on the tenant's focus signature, never on a recipe of its own", () => {
    for (const fixture of FIXTURES) {
      const derived = searchCommandBarChromeDeriver.derive(
        buildLoweringContext({ theme: fixture.theme, tenant: fixture.tenant }),
        {}
      );
      expect(derived["--ds-search-command-bar-focus-ring"], fixture.label).toBe(
        "var(--ds-focus-ring)"
      );
    }
    expect(skinFallbacks("--ds-search-command-bar-focus-ring")).toEqual(["var(--ds-focus-ring)"]);
    // A ring rebuilt from the width or colour operands is one fixed shape under every signature.
    expect(SKIN).not.toMatch(/--ds-focus-ring-(?:width|color|offset)/);
  });

  it("lets a tenant statement of the ring outrank the signature reference", () => {
    const tenant: FamilyDeriver = {
      family: "stated-tenant-ring",
      rank: "tenant",
      consumes: ["chrome.*"],
      produces: ["--ds-search-command-bar-focus-ring"],
      derive: () => ({ "--ds-search-command-bar-focus-ring": "0 0 0 3px currentColor" }),
    };
    const result = runDerivation(context(), [searchCommandBarChromeDeriver, tenant]);
    expect(result.channels["--ds-search-command-bar-focus-ring"]).toBe("0 0 0 3px currentColor");
    expect(result.provenance.get("--ds-search-command-bar-focus-ring")?.rank).toBe("tenant");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(searchCommandBarChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: searchCommandBarChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [searchCommandBarChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
