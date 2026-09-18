/**
 * The `dashboard-header` vocabulary at rest: every channel equals the one
 * fallback its Modern skin reads it with, so producing the name cannot move a
 * pixel, and any higher-ranked statement still wins.
 *
 * ADAPTED from the reference chrome tests (mobile-header, section-frame): this
 * deriver is deliberately NOT registered in FAMILY_DERIVERS yet -- the DT adds
 * the registration line at integration, serialized with the other sub-lot D
 * families -- so this suite asserts no registry membership and proves
 * precedence by running the deriver directly through runDerivation.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { dashboardHeaderChromeDeriver } from "..";

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/dashboard-header/index.css"),
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

describe("chrome/dashboard-header", () => {
  it("declares the family id and rank derived", () => {
    expect(dashboardHeaderChromeDeriver.family).toBe("dashboard-header");
    expect(dashboardHeaderChromeDeriver.rank).toBe("derived");
  });

  it("states every declared channel at the single resting value the skin reads it with", () => {
    const derived = dashboardHeaderChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...dashboardHeaderChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [normalise(value)] });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of dashboardHeaderChromeDeriver.produces) {
      expect(channel.startsWith("--ds-dashboard-header-")).toBe(true);
    }
  });

  it("repairs every unproduced name the skin used to read, in the family namespace", () => {
    for (const retired of [
      "--ds-dashboard-metric-bg",
      "--ds-dashboard-metric-border",
      "--ds-dashboard-metric-icon-color",
      "--ds-dashboard-metric-radius",
    ]) {
      expect(SKIN).not.toContain(retired);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(dashboardHeaderChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: dashboardHeaderChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [dashboardHeaderChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
