/**
 * The `sidebar-surface` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins. The tenant track widths stay
 * honest literals: no produced spacing rung rests at 17.5rem or 5.5rem and
 * the `--ds-sidebar-width` names are tenant-authored channels, not governed
 * roots, so `--ds-sidebar-surface-inline-size` (whose default arm chains the
 * rootless width) is deliberately not produced.
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
import { sidebarSurfaceChromeDeriver } from "..";

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

describeFamilyContract(sidebarSurfaceChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/sidebar-surface/index.css"),
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

const ROOTLESS = new Set([
  "--ds-sidebar-surface-width",
  "--ds-sidebar-surface-collapsed-width",
]);

describe("chrome/sidebar-surface", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = sidebarSurfaceChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...sidebarSurfaceChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (ROOTLESS.has(channel)) {
        expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [] });
        continue;
      }
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("rests the region rhythm on the spacing rungs the skin resolved to", () => {
    const derived = sidebarSurfaceChromeDeriver.derive(context(), {});
    expect(derived["--ds-sidebar-surface-gap"]).toBe(
      "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))"
    );
    expect(derived["--ds-sidebar-surface-stacked-gap"]).toBe(
      "calc(var(--ds-spacing-4, 16px) * var(--ds-rhythm-effective-scale, 1))"
    );
    expect(derived["--ds-sidebar-surface-panel-gap"]).toBe("var(--ds-spacing-4, 16px)");
    expect(derived["--ds-sidebar-surface-main-gap"]).toBe("var(--ds-spacing-4, 16px)");
  });

  it("produces the aside-inline-size at the default arm's value through the aside-width relation", () => {
    const derived = sidebarSurfaceChromeDeriver.derive(context(), {});
    expect(derived["--ds-sidebar-surface-aside-inline-size"]).toBe(
      "var(--ds-sidebar-surface-aside-width)"
    );
    expect(derived["--ds-sidebar-surface-aside-width"]).toBe("var(--ds-spacing-80, 320px)");
  });

  it("keeps the tenant track widths honest literals with no produced rung at their rest", () => {
    const derived = sidebarSurfaceChromeDeriver.derive(context(), {});
    expect(derived["--ds-sidebar-surface-width"]).toBe("var(--ds-sidebar-width, 17.5rem)");
    expect(derived["--ds-sidebar-surface-collapsed-width"]).toBe(
      "var(--ds-sidebar-collapsed-width, 5.5rem)"
    );
    /* The rootless default arm chains the rootless width, so the name stays
       unproduced: no chain from it lands on a produced root. */
    expect(derived["--ds-sidebar-surface-inline-size"]).toBeUndefined();
  });

  it("links the separator to the edge decision and the track change to the rearrange cadence", () => {
    const derived = sidebarSurfaceChromeDeriver.derive(context(), {});
    expect(derived["--ds-sidebar-surface-divider"]).toBe(
      "var(--ds-edge-standard-width) var(--ds-edge-standard-style) var(--ds-sidebar-border, var(--ds-color-border-subtle))"
    );
    expect(derived["--ds-sidebar-surface-motion-duration"]).toBe(
      "var(--ds-motion-rearrange, var(--ds-motion-normal))"
    );
    expect(derived["--ds-sidebar-surface-motion-easing"]).toBe("var(--ds-motion-ease-move)");
  });

  it("names only its own family namespace", () => {
    for (const channel of sidebarSurfaceChromeDeriver.produces) {
      expect(channel.startsWith("--ds-sidebar-surface-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(sidebarSurfaceChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: sidebarSurfaceChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [sidebarSurfaceChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
