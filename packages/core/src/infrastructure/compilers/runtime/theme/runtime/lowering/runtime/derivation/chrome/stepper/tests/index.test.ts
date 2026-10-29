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
import { typographyDeriver } from "../../../typography";
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

const TITLE_CHANNELS = [
  "--ds-stepper-item-font-weight",
  "--ds-stepper-label-font-weight-process"
] as const;
const TITLE_CHAIN = "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold))";
const OTHER_CHANNELS: Record<string, string> = {
  "--ds-stepper-font-family": "var(--ds-type-body-font-family)",
  "--ds-stepper-motion-duration": "var(--ds-motion-feedback)",
  "--ds-stepper-motion-easing": "var(--ds-motion-ease-standard)",
  "--ds-stepper-item-size-sm": "var(--ds-spacing-6)",
  "--ds-stepper-item-size-md": "var(--ds-spacing-8)",
  "--ds-stepper-item-size-lg": "var(--ds-spacing-10)",
  "--ds-stepper-item-font-size-sm": "var(--ds-type-caption-font-size)",
  "--ds-stepper-item-font-size-md": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-item-font-size-lg": "var(--ds-type-body-font-size)",
  "--ds-stepper-label-font-size-sm": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-label-font-size-md": "var(--ds-type-body-font-size)",
  "--ds-stepper-label-font-size-lg": "var(--ds-font-size-base)",
  "--ds-stepper-description-font-size-sm": "var(--ds-type-caption-font-size)",
  "--ds-stepper-description-font-size-md": "var(--ds-type-caption-font-size)",
  "--ds-stepper-description-font-size-lg": "var(--ds-type-supporting-font-size)",
  "--ds-stepper-dot-size": "var(--ds-spacing-2)",
  "--ds-stepper-item-gap": "var(--ds-spacing-3)",
  "--ds-stepper-item-radius": "var(--ds-radius-md)",
  "--ds-stepper-item-bg": "var(--ds-steps-wait-bg, var(--ds-steps-item-bg, var(--ds-card-bg, var(--ds-surface-card))))",
  "--ds-stepper-item-color": "var(--ds-steps-item-color, var(--ds-color-text-secondary))",
  "--ds-stepper-item-border": "var(--ds-steps-wait-border, var(--ds-color-border))",
  "--ds-stepper-numeric": "tabular-nums",
  "--ds-stepper-icon-border-width": "var(--ds-border-width-2)",
  "--ds-stepper-item-bg-process": "var(--ds-steps-process-bg, var(--ds-steps-item-bg-active, var(--ds-color-primary)))",
  "--ds-stepper-item-color-process": "var(--ds-steps-item-color-active, var(--ds-color-text-on-primary))",
  "--ds-stepper-item-border-process": "var(--ds-steps-process-border, var(--ds-steps-item-bg-active, var(--ds-color-primary)))",
  "--ds-stepper-process-ring": "0 0 0 var(--ds-spacing-1) color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
  "--ds-stepper-item-bg-finish": "var(--ds-steps-finish-bg, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-bg, var(--ds-surface-card))))",
  "--ds-stepper-item-color-finish": "var(--ds-color-primary)",
  "--ds-stepper-item-border-finish": "var(--ds-steps-finish-border, color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border)))",
  "--ds-stepper-item-bg-error": "color-mix(in srgb, var(--ds-color-error) 8%, var(--ds-card-bg, var(--ds-surface-card)))",
  "--ds-stepper-item-color-error": "var(--ds-color-error)",
  "--ds-stepper-item-border-error": "color-mix(in srgb, var(--ds-color-error) 36%, var(--ds-color-border))",
  "--ds-stepper-item-color-process-simple": "var(--ds-color-primary)",
  "--ds-stepper-circles-ring": "0 0 0 calc(var(--ds-spacing-1) * 0.75) color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)",
  "--ds-stepper-icon-color": "var(--ds-color-text-secondary)",
  "--ds-stepper-connector-width": "var(--ds-border-width-2)",
  "--ds-stepper-connector-clearance": "var(--ds-spacing-1)",
  "--ds-stepper-connector-color": "var(--ds-steps-connector-color, var(--ds-color-border-secondary))",
  "--ds-stepper-connector-color-active": "var(--ds-steps-connector-color-active, var(--ds-color-primary))",
  "--ds-stepper-connector-min-length": "var(--ds-spacing-8)",
  "--ds-stepper-connector-inset": "var(--ds-spacing-2)",
  "--ds-stepper-connector-block-gap": "var(--ds-spacing-1)",
  "--ds-stepper-text-gap": "calc(var(--ds-spacing-1) / 2)",
  "--ds-stepper-text-margin-block-start": "var(--ds-spacing-2)",
  "--ds-stepper-vertical-gap": "var(--ds-spacing-3)",
  "--ds-stepper-vertical-item-gap": "var(--ds-spacing-4)",
  "--ds-stepper-label-color": "var(--ds-color-text-primary)",
  "--ds-stepper-label-color-process": "var(--ds-color-text-primary)",
  "--ds-stepper-label-color-wait": "var(--ds-steps-label-color-wait, var(--ds-color-text-secondary))",
  "--ds-stepper-label-color-error": "var(--ds-color-error)",
  "--ds-stepper-label-color-hover": "var(--ds-color-primary)",
  "--ds-stepper-label-font-weight": "var(--ds-font-weight-medium)",
  "--ds-stepper-label-line-height": "var(--ds-type-body-line-height)",
  "--ds-stepper-subtitle-color": "var(--ds-color-text-tertiary)",
  "--ds-stepper-description-color": "var(--ds-color-text-secondary)",
  "--ds-stepper-description-line-height": "var(--ds-type-supporting-line-height)",
  "--ds-stepper-hover-lift": "calc(-1px * var(--ds-motion-intensity))",
  "--ds-stepper-hover-shadow": "var(--ds-elevation-1)",
  "--ds-stepper-pressed-transform": "translateY(0) scale(var(--ds-state-press-scale))",
  "--ds-stepper-focus-ring": "var(--ds-focus-ring)",
  "--ds-stepper-focus-ring-width": "var(--ds-focus-ring-width)",
  "--ds-stepper-disabled-opacity": "var(--ds-button-disabled-opacity)",
  "--ds-stepper-disabled-label-color": "var(--ds-color-text-secondary)",
  "--ds-stepper-disabled-description-color": "var(--ds-color-text-secondary)",
  "--ds-stepper-panel-slide-distance": "var(--ds-spacing-5)",
  "--ds-stepper-panel-motion-duration": "var(--ds-motion-normal)",
  "--ds-stepper-panel-motion-easing": "var(--ds-motion-ease-out)",
  "--ds-stepper-touch-target-min": "var(--ds-touch-target-min)"
};
const WEIGHT_POSTURES = [
  { roleWeights: "light", expected: "500" },
  { roleWeights: "regular", expected: "600" },
  { roleWeights: "strong", expected: "700" },
] as const;
const FONT_SIZES = ["1rem", "2rem"];
const AUTHORED_WEIGHTS = [300, 700];
const OVERRIDE_RANKS = ["verticalOverride", "tenant"] as const;

/** Resolve only the weight var chain emitted by real derivation; this is not a CSS engine. */
function resolveWeight(value: string | undefined, channels: Record<string, string>): string {
  if (value === undefined) throw new Error("Missing weight channel");
  const reference = /^var\((--ds-[a-z0-9-]+)(?:,\s*(.*))?\)$/.exec(value);
  if (reference === null) return value;
  const [, channel, fallback] = reference;
  if (channel === undefined) throw new Error("Missing weight reference");
  return resolveWeight(Reflect.get(channels, channel) ?? fallback, channels);
}

function expectOtherChannels(channels: Record<string, string>): void {
  expect(Object.fromEntries(Object.entries(channels).filter(([channel]) => !TITLE_CHANNELS.some((title) => title === channel))))
    .toEqual(OTHER_CHANNELS);
}

describe.each(TITLE_CHANNELS)("chrome/stepper title role weight %s", (TITLE_WEIGHT) => {
  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const ctx = buildLoweringContext({
        theme: { ...MINIMAL_THEME, typography: { roleWeights, roles: { sectionTitle: { fontSize } } } },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, stepperChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(expected);
      expect(resolveWeight(Reflect.get(channels, "--ds-stepper-label-font-weight"), channels)).toBe("500");
      const family = stepperChromeDeriver.derive(ctx, {});
      expect(Reflect.get(family, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
      expectOtherChannels(family);
    }
  });

  it.each(WEIGHT_POSTURES)("follows authored section-title weight above $roleWeights and label weight", ({ roleWeights }) => {
    for (const fontWeight of AUTHORED_WEIGHTS) {
      const ctx = buildLoweringContext({
        theme: {
          ...MINIMAL_THEME,
          typography: { roleWeights, roles: { sectionTitle: { fontWeight }, label: { fontWeight: 800 } } },
        },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, stepperChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-label-font-weight")).toBe("800");
      expect(Reflect.get(channels, "--ds-type-section-title-font-weight")).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, "--ds-stepper-label-font-weight"), channels)).toBe("500");
      expectOtherChannels(stepperChromeDeriver.derive(ctx, {}));
    }
  });

  it("falls back to semibold only when the section-title role channel is absent", () => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const { channels } = runDerivation(ctx, [stepperChromeDeriver]);
    const titleWeight = Reflect.get(channels, TITLE_WEIGHT);
    expect(Reflect.has(channels, "--ds-type-section-title-font-weight")).toBe(false);
    expect(resolveWeight(titleWeight, { ...channels, "--ds-font-weight-semibold": "600" })).toBe("600");
    expect(resolveWeight(titleWeight, {
      ...channels,
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });

  it.each(FIXTURES)("preserves all other declared channels exactly for $label", ({ theme, tenant }) => {
    const ctx = buildLoweringContext({ theme, tenant });
    const channels = stepperChromeDeriver.derive(ctx, {});
    expect(Object.keys(channels).sort()).toEqual([...stepperChromeDeriver.produces].sort());
    expect(Reflect.get(channels, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
    expectOtherChannels(channels);
  });

  it.each(OVERRIDE_RANKS)("yields every family channel to %s statements in either derivation order", (rank) => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const stated: FamilyDeriver = {
      family: `stated-${rank}`,
      rank,
      consumes: ["chrome.*"],
      produces: stepperChromeDeriver.produces,
      derive: () => Object.fromEntries(stepperChromeDeriver.produces.map((channel) => [channel, "321"])),
    };
    const orders = [[stepperChromeDeriver, stated], [stated, stepperChromeDeriver]];
    for (const derivers of orders) {
      const { channels, provenance } = runDerivation(ctx, derivers);
      for (const channel of stepperChromeDeriver.produces) {
        expect(Reflect.get(channels, channel)).toBe("321");
        expect(provenance.get(channel)).toEqual({ family: stated.family, rank });
      }
    }
  });
});
