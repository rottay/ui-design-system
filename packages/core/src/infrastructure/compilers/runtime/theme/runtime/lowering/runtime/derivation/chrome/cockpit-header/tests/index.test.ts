/**
 * The `cockpit-header` vocabulary at rest: every channel equals the one fallback its
 * Modern skin reads it with, so producing the name cannot move a pixel, and any
 * higher-ranked statement still wins.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { FAMILY_DERIVERS } from "../../..";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { cockpitHeaderChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/runtime/engines/modern/skin/cockpit-header/index.css"
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
    for (let depth = 1; depth > 0; end += 1) {
      if (SKIN[end] === "(") depth += 1;
      else if (SKIN[end] === ")") depth -= 1;
    }
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/cockpit-header", () => {
  it("is registered once, at rank derived", () => {
    expect(
      FAMILY_DERIVERS.filter((deriver) => deriver === cockpitHeaderChromeDeriver)
    ).toHaveLength(1);
    expect(cockpitHeaderChromeDeriver.family).toBe("cockpit-header");
    expect(cockpitHeaderChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = cockpitHeaderChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...cockpitHeaderChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of cockpitHeaderChromeDeriver.produces) {
      expect(channel.startsWith("--ds-cockpit-header-")).toBe(true);
    }
  });

  it("leaves the sticky offset unproduced, because the emission door would drop it in silence", async () => {
    // Its only honest value is the safe-area inset, and `env` is not an admitted
    // value function. A deriver that stated it would delete the notch inset with
    // no error anywhere, so the skin keeps stating it as its own fallback.
    const { ALLOWED_VALUE_FUNCTIONS } = await import(
      "@/infrastructure/compilers/kernel/foundation/css/value-safety"
    );
    expect(ALLOWED_VALUE_FUNCTIONS.has("env")).toBe(false);
    expect([...cockpitHeaderChromeDeriver.produces]).not.toContain(
      "--ds-cockpit-header-sticky-top"
    );
    expect(skinFallbacks("--ds-cockpit-header-sticky-top")).toEqual([
      "env(safe-area-inset-top, 0px)",
    ]);
  });

  it("leaves the retired skeleton radius unproduced: the shared renderer owns its own bones", () => {
    expect([...cockpitHeaderChromeDeriver.produces]).not.toContain(
      "--ds-cockpit-header-skeleton-radius"
    );
    expect(SKIN).not.toContain("--ds-cockpit-header-skeleton-radius");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(cockpitHeaderChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: cockpitHeaderChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [...FAMILY_DERIVERS, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
