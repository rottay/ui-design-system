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

  it("produces none of the four tenant-door chrome names", () => {
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    for (const channel of [
      "--ds-workspace-shell-bg",
      "--ds-workspace-shell-border",
      "--ds-workspace-shell-shadow",
      "--ds-workspace-shell-overlay",
    ]) {
      expect(derived[channel]).toBeUndefined();
    }
  });

  it("gives `.ds-workspace-frame` its own names at its own selector and rests", () => {
    const patterns = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/patterns/index.css"
      ),
      "utf8"
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    // Conditional ownership: a stated door wins, and nothing rests at the root,
    // because a root value would state the name for every tenant.
    const producer = patterns.indexOf(":where(.ds-workspace-frame) {");
    const list = patterns.indexOf(":where(.ds-workspace-frame--list) {");
    const form = patterns.indexOf(":where(.ds-workspace-frame--form) {");
    const owned = patterns.slice(producer, list);
    expect(owned).toContain("--ds-workspace-frame-bg: var(--ds-workspace-shell-bg, transparent);");
    expect(owned).toContain(
      "--ds-workspace-frame-border: var(--ds-workspace-shell-border, var(--ds-color-border));"
    );
    expect(owned).toContain(
      "--ds-workspace-frame-shadow: var(--ds-workspace-shell-shadow, var(--ds-card-shadow));"
    );
    expect(patterns.slice(0, producer)).not.toContain("--ds-workspace-frame-");
    // Equal specificity, so the variants' ground wins by source order alone.
    expect(producer).toBeLessThan(list);
    expect(list).toBeLessThan(form);
    expect(patterns.match(/--ds-workspace-frame-(?:bg|border|shadow):/g)).toHaveLength(5);
    expect(patterns.match(/--ds-workspace-frame-bg: linear-gradient\(/g)).toHaveLength(2);
    // The frame only reads the door; declaring it would mask the tenant's value.
    expect(patterns).not.toMatch(/--ds-workspace-shell-(?:bg|border|shadow):/);
    // One rest per name: the paint rule carries no second copy of it.
    expect(patterns).toContain("border: 1px solid var(--ds-workspace-frame-border);");
    expect(patterns).toContain("background: var(--ds-workspace-frame-bg);");
    expect(patterns).toContain("box-shadow: var(--ds-workspace-frame-shadow);");
    // The wash stays one shared name, resolved by the authored `:root` row.
    expect(patterns).toContain("--ds-workspace-shell-overlay: var(--ds-material-canvas-texture, transparent);");
    expect(patterns).toContain("background: var(--ds-workspace-shell-overlay);");
  });

  it("gives the canvas colours a rest the structure no longer carries", () => {
    // Both were `color-mix()` strings in `workspace-shell/index.tsx` — the cut's
    // only two BLOCKING visual literals. The structure now names a resolution
    // relay and the value lives here.
    const derived = workspaceShellChromeDeriver.derive(context(), {});
    expect(derived["--ds-workspace-shell-particle-primary"]).toContain("var(--ds-color-primary) 34%");
    // A three-input `color-mix()` is invalid and left the canvas on its default
    // ink; the nested mix keeps 18% primary, 24% text-secondary, alpha 0.42.
    expect(derived["--ds-workspace-shell-particle-secondary"]).toBe(
      "color-mix(in srgb, color-mix(in srgb, var(--ds-color-primary) 42.857%, var(--ds-color-text-secondary)) 42%, transparent)",
    );
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
