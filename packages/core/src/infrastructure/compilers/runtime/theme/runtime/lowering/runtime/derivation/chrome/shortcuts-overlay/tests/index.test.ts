/**
 * The `shortcuts-overlay` vocabulary at rest: every wired channel equals the
 * one fallback its Modern skin reads it with, so producing the name cannot
 * move a pixel, and any higher-ranked statement still wins.
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
import { shortcutsOverlayChromeDeriver } from "..";

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

describeFamilyContract(shortcutsOverlayChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/shortcuts-overlay/index.css"
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

describe("chrome/shortcuts-overlay", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = shortcutsOverlayChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual(
      [...shortcutsOverlayChromeDeriver.produces].sort()
    );
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(value)],
      });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of shortcutsOverlayChromeDeriver.produces) {
      expect(channel.startsWith("--ds-shortcuts-overlay-")).toBe(true);
    }
  });

  it("stacks the frame on the sanctioned modal rung, never on a hand-picked z", () => {
    const derived = shortcutsOverlayChromeDeriver.derive(context(), {});
    expect(derived["--ds-shortcuts-overlay-z-index"]).toBe("var(--ds-z-modal, 1500)");
  });

  it("leaves WHICH motion the overlay performs to the motion vocabulary", () => {
    // A tenant may retime the entrance; it may not name a different keyframe.
    expect(SKIN).toContain("animation: ds-foundation-fade-in-down");
    for (const channel of shortcutsOverlayChromeDeriver.produces) {
      expect(channel).not.toContain("keyframes");
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(shortcutsOverlayChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: shortcutsOverlayChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [shortcutsOverlayChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
