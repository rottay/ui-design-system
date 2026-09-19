/**
 * The `stepper` vocabulary at rest: every channel the Modern skin reads bare
 * now falls back to the exact chain the deriver produces for it, so the
 * fallback cannot move a pixel, and any higher-ranked statement still wins.
 * The finish paints and the four ring/lift/press composites stay read bare:
 * the finish paints resolve to the produced legacy-rooted chain, while no
 * produced root reproduces the composites' resting value (box-shadow rings,
 * the motion-dial lift, the press transform).
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
import { stepperChromeDeriver } from "..";

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

describeFamilyContract(stepperChromeDeriver, FIXTURES);

const SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/stepper/index.css"),
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

/** Channels whose bare skin reads chain to the produced root the deriver already lands on. */
const WIRED: Record<string, string> = {
  "--ds-stepper-item-font-size-md": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-label-font-size-md": "var(--ds-type-body-font-size)",
  "--ds-stepper-description-font-size-md": "var(--ds-type-caption-font-size)",
  "--ds-stepper-item-font-size-sm": "var(--ds-type-caption-font-size)",
  "--ds-stepper-label-font-size-sm": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-item-font-size-lg": "var(--ds-type-body-font-size)",
  "--ds-stepper-label-font-size-lg": "var(--ds-font-size-base)",
  "--ds-stepper-description-font-size-lg": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-connector-clearance": "var(--ds-spacing-1)",
  "--ds-stepper-motion-duration": "var(--ds-motion-feedback)",
  "--ds-stepper-motion-easing": "var(--ds-motion-ease-standard)",
  "--ds-stepper-item-bg-error":
    "color-mix(in srgb, var(--ds-color-error) 8%, var(--ds-card-bg, var(--ds-surface-card)))",
  "--ds-stepper-item-border-error":
    "color-mix(in srgb, var(--ds-color-error) 36%, var(--ds-color-border))",
  "--ds-stepper-dot-size": "var(--ds-spacing-2)",
  "--ds-stepper-label-line-height": "var(--ds-type-body-line-height)",
  "--ds-stepper-description-line-height": "var(--ds-type-supporting-line-height)",
  "--ds-stepper-hover-shadow": "var(--ds-elevation-1)",
};

/** Finish paints the deriver produces at a legacy-rooted chain; the skin reads the produced names bare. */
const PRODUCED_BARE: Record<string, string> = {
  "--ds-stepper-item-bg-finish":
    "var(--ds-steps-finish-bg, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-bg, var(--ds-surface-card))))",
  "--ds-stepper-item-border-finish":
    "var(--ds-steps-finish-border, color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border)))",
};

/** Produced composites no produced root reproduces: the skin keeps reading them bare. */
const ROOTLESS: Record<string, string> = {
  "--ds-stepper-process-ring":
    "0 0 0 var(--ds-spacing-1) color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
  "--ds-stepper-circles-ring":
    "0 0 0 calc(var(--ds-spacing-1) * 0.75) color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)",
  "--ds-stepper-hover-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-stepper-pressed-transform": "translateY(0) scale(var(--ds-state-press-scale))",
};

describe("chrome/stepper", () => {
  it("produces every wired channel at the exact chain the skin falls back to", () => {
    const derived = stepperChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(WIRED)) {
      expect(derived[channel], channel).toBe(chain);
      expect(skinFallbacks(channel), channel).toEqual([chain]);
    }
  });

  it("produces the finish paints at their legacy-rooted chain while the skin reads the produced names bare", () => {
    const derived = stepperChromeDeriver.derive(context(), {});
    for (const [channel, chain] of Object.entries(PRODUCED_BARE)) {
      expect(derived[channel], channel).toBe(chain);
      expect(skinFallbacks(channel), channel).toEqual([]);
    }
  });

  it("keeps the ring, lift and press composites rootless: produced but read bare", () => {
    const derived = stepperChromeDeriver.derive(context(), {});
    for (const [channel, value] of Object.entries(ROOTLESS)) {
      expect(derived[channel], channel).toBe(value);
      expect(skinFallbacks(channel), channel).toEqual([]);
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of stepperChromeDeriver.produces) {
      expect(channel.startsWith("--ds-stepper-")).toBe(true);
    }
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(stepperChromeDeriver.derive(context(), {}));
    for (const rank of ["verticalOverride", "tenant"] as const) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: stepperChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [stepperChromeDeriver, stated]);
      for (const channel of channels) {
        expect(result.channels[channel]).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});
