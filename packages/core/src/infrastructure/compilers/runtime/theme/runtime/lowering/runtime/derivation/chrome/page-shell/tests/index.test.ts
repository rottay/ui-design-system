/**
 * The `page-shell` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins.
 *
 * The four names the family reads and deliberately does NOT produce are
 * drilled here too, because "we left it unproduced" is only evidence when the
 * reason is executable.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { collectionHeaderChromeDeriver } from "../../collection-header";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { pageShellChromeDeriver } from "..";

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

describeFamilyContract(pageShellChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/page-shell/index.css"
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
    // Bounded on the file length: an unbalanced value is a broken skin, and a
    // broken skin has to fail this suite rather than spin it forever.
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

describe("chrome/page-shell", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = pageShellChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...pageShellChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only the family's own namespace", () => {
    // Sub-lot C closed the second spelling: the six panel channels the family
    // used to state as `--ds-page-header-*` had one reader, its own skin, so
    // they moved. The prefix is still READ here, and it still belongs to the
    // cross-owner group `collection-header` and three sibling skins share.
    for (const channel of pageShellChromeDeriver.produces) {
      expect(channel.startsWith("--ds-page-shell-")).toBe(true);
    }
  });

  it("leaves the four page-header names collection-header reads through at a second rest", () => {
    const derived = pageShellChromeDeriver.derive(context(), {});
    const sibling = collectionHeaderChromeDeriver.derive(context(), {});

    // One name, two correct rests. The page panel wants the first value; the
    // hero card reads the same name through to the second. A produced rest
    // would silently repaint whichever family it is not.
    const twoRests: [string, string, string][] = [
      ["--ds-page-header-eyebrow-size", "10px", "var(--ds-font-size-xs, 12px)"],
      ["--ds-page-header-eyebrow-tracking", "0.11em", "0.13em"],
      ["--ds-page-header-title-max-width", "32ch", "35rem"],
    ];
    const siblingSkin = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/skin/collection-header/index.css"
      ),
      "utf8"
    );
    for (const [channel, here, there] of twoRests) {
      expect(derived[channel]).toBeUndefined();
      expect(skinFallbacks(channel)).toEqual([here]);
      expect(
        Object.values(sibling).some((value) => value === `var(${channel}, ${there})`)
      ).toBe(true);
    }

    // The fourth is read straight from the sibling SKIN rather than through a
    // channel of its own, at 45rem against this family's 72ch.
    expect(derived["--ds-page-header-subtitle-max-width"]).toBeUndefined();
    expect(skinFallbacks("--ds-page-header-subtitle-max-width")).toEqual(["72ch"]);
    expect(siblingSkin).toContain("var(--ds-page-header-subtitle-max-width, 45rem)");
  });

  it("leaves the panel ground to the expressive motif that already authors it", () => {
    // `--ds-page-header-bg` is written by the `contour` motif at `profile`
    // rank. `derived` outranks `profile`, so producing it would retire the
    // motif's page-header treatment without saying so.
    const derived = pageShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-page-header-bg"]).toBeUndefined();

    const motif: FamilyDeriver = {
      family: "stated-profile",
      rank: "profile",
      consumes: ["expressive.*"],
      produces: ["--ds-page-header-bg"],
      derive: () => ({ "--ds-page-header-bg": "motif" }),
    };
    const result = runDerivation(context(), [pageShellChromeDeriver, motif]);
    expect(result.channels["--ds-page-header-bg"]).toBe("motif");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(pageShellChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: pageShellChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [pageShellChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
