/**
 * The `workspace-shell` vocabulary at rest: every wired channel equals the one
 * fallback its skin reads it with, so producing the name cannot move a pixel,
 * and any higher-ranked statement still wins.
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
import { workspaceShellChromeDeriver } from "..";
import { isSafeCssValue } from "@/infrastructure/compilers/kernel/foundation/css/value-safety";

const MASK_STOP = "var(--ds-workspace-shell-mask-stop)";

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

describeFamilyContract(workspaceShellChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/collection-shell/index.css"
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

describe("chrome/workspace-shell", () => {
  it("states every wired channel at the single resting value the skin reads it with", () => {
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual(
      [...workspaceShellChromeDeriver.produces].sort()
    );
    // The ramps read the accent through `--ds-workspace-shell-mask-stop`, which
    // the same rule states; substituting it back is what makes the comparison
    // against the skin's terminal fallback a resolved-value comparison rather
    // than a spelling one. The skin cannot read the relay: with no producer at
    // all the relay is undefined too, so its fallback stays the whole chain.
    const stop = derived["--ds-workspace-shell-mask-stop"]!;
    const resolved = (value: string) => value.replaceAll(MASK_STOP, stop);
    for (const [channel, value] of Object.entries(derived)) {
      // The mask colour and its relay are read only as the accent INSIDE the two
      // ramps, so their rest is pinned by the ramps rather than by a fallback of
      // their own.
      if (channel === "--ds-workspace-shell-mask-color") continue;
      if (channel === "--ds-workspace-shell-mask-stop") continue;
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [normalise(resolved(value))],
      });
    }
  });

  it("keeps both ramps inside the emission grammar's value bound", () => {
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    for (const channel of Object.keys(derived)) {
      expect({ channel, admitted: isSafeCssValue(derived[channel]!) }).toEqual({
        channel,
        admitted: true,
      });
    }
    // Measured, not rounded: the orbital ramp is the longest value this family
    // states, and repeating the accent chain at each of its five stops put it
    // at 584 against a bound of 512.
    expect(derived["--ds-workspace-shell-orbital-mask"]).toHaveLength(454);
    expect(
      isSafeCssValue(
        derived["--ds-workspace-shell-orbital-mask"]!.replaceAll(
          MASK_STOP,
          derived["--ds-workspace-shell-mask-stop"]!
        )
      )
    ).toBe(false);
  });

  it("names only its own family namespace", () => {
    for (const channel of workspaceShellChromeDeriver.produces) {
      expect(channel.startsWith("--ds-workspace-shell-")).toBe(true);
    }
  });

  it("mixes the whole atmosphere from one accent channel", () => {
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-workspace-shell-mask-color"]).toBe("var(--ds-color-primary)");
    expect(derived["--ds-workspace-shell-mask-stop"]).toBe(
      "var(--ds-workspace-shell-mask-color, var(--ds-color-primary))"
    );
    for (const ramp of ["--ds-workspace-shell-orbital-mask", "--ds-workspace-shell-ambient-mask"]) {
      expect(derived[ramp]).toContain(MASK_STOP);
      expect(derived[ramp]).not.toContain("var(--ds-color-primary)");
    }
  });

  it("leaves the four chrome names `feature-workspace-frame` reads at a second rest", () => {
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    const frame = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/patterns-paint/index.css"
      ),
      "utf8"
    );
    for (const channel of [
      "--ds-workspace-shell-bg",
      "--ds-workspace-shell-border",
      "--ds-workspace-shell-shadow",
      "--ds-workspace-shell-overlay",
    ]) {
      expect(derived[channel]).toBeUndefined();
      expect(frame).toContain(channel);
    }
    // The frame's own rests are NOT this shell's: producing either would
    // repaint whichever family it is not.
    expect(frame).toContain("var(--ds-workspace-shell-border, var(--ds-color-border))");
    expect(frame).toContain("var(--ds-workspace-shell-shadow, var(--ds-card-shadow))");
  });

  it("gives the canvas colours a rest the structure no longer carries", () => {
    // Both were `color-mix()` strings in `workspace-shell/index.tsx` — the cut's
    // only two BLOCKING visual literals. The structure now names a resolution
    // relay and the value lives here.
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-workspace-shell-particle-primary"]).toContain("var(--ds-color-primary) 34%");
    expect(derived["--ds-workspace-shell-particle-secondary"]).toContain("var(--ds-color-primary) 18%");
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(workspaceShellChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: workspaceShellChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [workspaceShellChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
      }
    }
  });
});
