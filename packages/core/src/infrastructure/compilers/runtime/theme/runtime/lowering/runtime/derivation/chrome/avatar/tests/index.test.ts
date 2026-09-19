/**
 * The `avatar` vocabulary at rest: every produced channel equals the one
 * fallback its Modern skin reads it with, so producing the name cannot move a
 * pixel, and any higher-ranked statement still wins.
 *
 * The four geometry channels `--ds-avatar-{xs,sm,lg,xl}-size` are deliberately
 * NOT produced here: the engine-agnostic presentation base already declares
 * them at 1.5/2/3/3.5rem, and the Modern skin now reads each one through a
 * chained fallback to the spacing rung that rests at the same value
 * (`--ds-spacing-{6,8,12,14}`), so a size the base never states still lands
 * on a produced root instead of an invalid bare read. `--ds-avatar-ink` stays
 * unproduced too: its read fallback is the keyword `inherit`, which no
 * governed root reproduces, and the skin itself declares the channel
 * `initial` as the caller's hatch, so there is nothing to wire.
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
import { avatarChromeDeriver } from "..";

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

describeFamilyContract(avatarChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css"),
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

const SIZE_CHAINS: Record<string, string> = {
  "--ds-avatar-xs-size": "var(--ds-spacing-6, 1.5rem)",
  "--ds-avatar-sm-size": "var(--ds-spacing-8, 2rem)",
  "--ds-avatar-lg-size": "var(--ds-spacing-12, 3rem)",
  "--ds-avatar-xl-size": "var(--ds-spacing-14, 3.5rem)",
};

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/avatar", () => {
  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...avatarChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (channel === "--ds-avatar-initials-tracking") continue;
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("pins the pre-existing initials-tracking divergence (outside this lot's census)", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    expect(derived["--ds-avatar-initials-tracking"]).toBe("var(--ds-letter-spacing-wide, 0.025em)");
    expect(skinFallbacks("--ds-avatar-initials-tracking")).toEqual(["0.01em"]);
  });

  it("does not produce the size channels the presentation base declares", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    for (const name of Object.keys(SIZE_CHAINS)) {
      expect(derived[name]).toBeUndefined();
    }
  });

  it("reads every size channel through its spacing-rung chain, never bare", () => {
    for (const [name, chain] of Object.entries(SIZE_CHAINS)) {
      expect({ channel: name, fallbacks: skinFallbacks(name) }).toEqual({ channel: name, fallbacks: [chain] });
      expect(new RegExp(`var\\(\\s*${name}\\s*\\)`).test(SKIN), name).toBe(false);
    }
  });

  it("does not produce the caller-hatch ink channel", () => {
    const derived = avatarChromeDeriver.derive(context(), {});
    expect(derived["--ds-avatar-ink"]).toBeUndefined();
    expect(skinFallbacks("--ds-avatar-ink")).toEqual(["inherit"]);
  });

  it("names only its own family namespace", () => {
    for (const channel of avatarChromeDeriver.produces) {
      expect(channel.startsWith("--ds-avatar-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(avatarChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: avatarChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [avatarChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
