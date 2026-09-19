/**
 * The `app-shell` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins.
 *
 * The four geometry tracks are also read from TypeScript — the shell resolves
 * its insets before the deriver is registered, and inside the Sheet portal,
 * where the shell root's own stamps do not reach — so their derived values are
 * pinned against `SHELL_GEOMETRY_READS` as well as against the skin.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { SHELL_GEOMETRY_READS } from "@/components/structures/shell/contracts";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import type { FamilyDeriver } from "../../../../../foundation/contract";
import { buildLoweringContext, runDerivation } from "../../../../pipeline";
import { appShellChromeDeriver } from "..";

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

describeFamilyContract(appShellChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/app-shell/index.css"
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

/**
 * The two channels whose only reader is the structure, not the skin: the
 * Sheet engine writes the drawer body's padding inline, so the shell restates
 * it through the sanctioned `bodyStyle` prop, and the collapsed track is read
 * only where the inline-start inset is resolved. Both are pinned against
 * `SHELL_GEOMETRY_READS` and the structure's own suite instead.
 */
const READ_OUTSIDE_THE_SKIN = new Set([
  "--ds-shell-navigation-drawer-body-padding",
  "--ds-shell-sidebar-collapsed-width",
]);

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/app-shell", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = appShellChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual([...appShellChromeDeriver.produces].sort());
    for (const [channel, value] of Object.entries(derived)) {
      if (READ_OUTSIDE_THE_SKIN.has(channel)) continue;
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({ channel, fallbacks: [value] });
    }
  });

  it("states the four geometry tracks at exactly the chain the structure reads", () => {
    const derived = appShellChromeDeriver.derive(context(), {});
    // `var(--ds-x, VALUE)` is the read; VALUE is what the deriver must produce.
    const tail = (read: string) => normalise(read.slice(read.indexOf(",") + 1, -1));
    expect(tail(SHELL_GEOMETRY_READS.sidebarWidth)).toBe(derived["--ds-shell-sidebar-width"]);
    expect(tail(SHELL_GEOMETRY_READS.sidebarCollapsedWidth)).toBe(
      derived["--ds-shell-sidebar-collapsed-width"]
    );
    expect(tail(SHELL_GEOMETRY_READS.headerBlockSize)).toBe(
      derived["--ds-shell-header-block-size"]
    );
    expect(tail(SHELL_GEOMETRY_READS.sidebarHeaderBlockSize)).toBe(
      derived["--ds-shell-sidebar-header-block-size"]
    );
  });

  it("rests the tracks on the tenant's own sidebar channels", () => {
    const derived = appShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-shell-sidebar-width"]).toBe("var(--ds-sidebar-width, 18.5rem)");
    expect(derived["--ds-shell-sidebar-collapsed-width"]).toBe(
      "var(--ds-sidebar-collapsed-width, 6rem)"
    );
  });

  it("links the collapse of the track to the rearrange cadence", () => {
    const derived = appShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-shell-collapse-transition"]).toBe(
      "var(--ds-motion-rearrange, var(--ds-motion-normal)) var(--ds-motion-ease-move)"
    );
  });

  it("names only its own family namespace", () => {
    for (const channel of appShellChromeDeriver.produces) {
      expect(channel.startsWith("--ds-shell-")).toBe(true);
    }
  });

  it("leaves the navigation shadow to the two rests its consumers already author", () => {
    const derived = appShellChromeDeriver.derive(context(), {});
    // One channel, two correct values (a flat track, a lifted overlay): a
    // produced rest would silently repaint whichever arm it is not.
    expect(derived["--ds-shell-navigation-shadow"]).toBeUndefined();
    expect(skinFallbacks("--ds-shell-navigation-shadow").sort()).toEqual([
      "none",
      "var(--ds-elevation-3)",
    ]);
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(appShellChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: appShellChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [appShellChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
