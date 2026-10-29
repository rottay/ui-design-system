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
import { descriptionsChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };
const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  { label: "bithire under a tenant floor", theme: firstPartyFixture("bithire"), tenant: FIXTURE_TENANT_FACTS },
  { label: "minimal under a tenant floor", theme: MINIMAL_THEME, tenant: FIXTURE_TENANT_FACTS },
];
const TITLE_WEIGHT = "--ds-descriptions-title-font-weight";
const TITLE_CHAIN = "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold))";
const OTHER_CHANNELS: Record<string, string> = {
  "--ds-descriptions-color": "var(--ds-color-text-primary)",
  "--ds-descriptions-column-gap": "var(--ds-spacing-6)",
  "--ds-descriptions-content-font-size": "var(--ds-font-size-sm)",
  "--ds-descriptions-content-font-weight": "var(--ds-font-weight-medium)",
  "--ds-descriptions-content-line-height": "1.45",
  "--ds-descriptions-extra-border": "var(--ds-color-border-subtle)",
  "--ds-descriptions-extra-padding": "0.1875rem",
  "--ds-descriptions-extra-radius": "var(--ds-radius-md)",
  "--ds-descriptions-grid-gap": "calc(var(--ds-spacing-2) * 1.25)",
  "--ds-descriptions-grid-padding": "var(--ds-spacing-3)",
  "--ds-descriptions-header-bg": "linear-gradient(118deg, color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-primary) 6%), var(--ds-surface-card) 52%, color-mix(in srgb, var(--ds-surface-inset) 70%, var(--ds-surface-card)))",
  "--ds-descriptions-header-border": "var(--ds-color-border)",
  "--ds-descriptions-header-border-hover": "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))",
  "--ds-descriptions-header-min-height": "calc(var(--ds-spacing-14))",
  "--ds-descriptions-header-padding": "0.75rem 1rem",
  "--ds-descriptions-header-radius": "var(--ds-radius-lg)",
  "--ds-descriptions-header-shadow": "var(--ds-elevation-1)",
  "--ds-descriptions-header-shadow-hover": "var(--ds-elevation-2)",
  "--ds-descriptions-item-span": "1",
  "--ds-descriptions-label-font-size": "var(--ds-font-size-xs)",
  "--ds-descriptions-label-font-weight": "var(--ds-font-weight-medium)",
  "--ds-descriptions-label-gap": "0.3125rem",
  "--ds-descriptions-label-ink": "color-mix(in srgb, var(--ds-descriptions-label-color, var(--ds-color-text-secondary)) 70%, var(--ds-color-text-primary) 30%)",
  "--ds-descriptions-label-letter-spacing": "0.045em",
  "--ds-descriptions-label-line-height": "1.25",
  "--ds-descriptions-label-transform": "uppercase",
  "--ds-descriptions-radius": "var(--ds-radius-xl)",
  "--ds-descriptions-row-bg": "color-mix(in srgb, var(--ds-surface-inset) 46%, transparent)",
  "--ds-descriptions-row-bg-hover": "color-mix(in srgb, var(--ds-surface-card) 91%, var(--ds-color-primary) 9%)",
  "--ds-descriptions-row-border": "var(--ds-color-border-subtle)",
  "--ds-descriptions-row-border-hover": "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))",
  "--ds-descriptions-row-padding": "0.75rem 0.875rem",
  "--ds-descriptions-row-padding-md": "0.625rem 0.75rem",
  "--ds-descriptions-row-padding-sm": "0.5rem 0.625rem",
  "--ds-descriptions-row-radius": "var(--ds-radius-md)",
  "--ds-descriptions-section-gap": "calc(var(--ds-spacing-2) * 1.25)",
  "--ds-descriptions-shadow": "var(--ds-elevation-1)",
  "--ds-descriptions-title-font-family": "var(--ds-font-family-heading)",
  "--ds-descriptions-title-font-size": "var(--ds-font-size-lg)",
  "--ds-descriptions-title-letter-spacing": "-0.02em",
  "--ds-descriptions-title-line-height": "1.25"
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
  expect(Object.fromEntries(Object.entries(channels).filter(([channel]) => channel !== TITLE_WEIGHT)))
    .toEqual(OTHER_CHANNELS);
}

describeFamilyContract(descriptionsChromeDeriver, FIXTURES);

describe("chrome/descriptions title role weight", () => {
  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const ctx = buildLoweringContext({
        theme: { ...MINIMAL_THEME, typography: { roleWeights, roles: { sectionTitle: { fontSize } } } },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, descriptionsChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(expected);
      expect(resolveWeight(Reflect.get(channels, "--ds-descriptions-label-font-weight"), channels)).toBe("500");
      expect(resolveWeight(Reflect.get(channels, "--ds-descriptions-content-font-weight"), channels)).toBe("500");
      const family = descriptionsChromeDeriver.derive(ctx, {});
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
      const { channels } = runDerivation(ctx, [typographyDeriver, descriptionsChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-label-font-weight")).toBe("800");
      expect(Reflect.get(channels, "--ds-type-section-title-font-weight")).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, "--ds-descriptions-label-font-weight"), channels)).toBe("500");
      expectOtherChannels(descriptionsChromeDeriver.derive(ctx, {}));
    }
  });

  it("falls back to semibold only when the section-title role channel is absent", () => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const { channels } = runDerivation(ctx, [descriptionsChromeDeriver]);
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
    const channels = descriptionsChromeDeriver.derive(ctx, {});
    expect(Object.keys(channels).sort()).toEqual([...descriptionsChromeDeriver.produces].sort());
    expect(Reflect.get(channels, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
    expectOtherChannels(channels);
  });

  it.each(OVERRIDE_RANKS)("yields every family channel to %s statements in either derivation order", (rank) => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const stated: FamilyDeriver = {
      family: `stated-${rank}`,
      rank,
      consumes: ["chrome.*"],
      produces: descriptionsChromeDeriver.produces,
      derive: () => Object.fromEntries(descriptionsChromeDeriver.produces.map((channel) => [channel, "321"])),
    };
    const orders = [[descriptionsChromeDeriver, stated], [stated, descriptionsChromeDeriver]];
    for (const derivers of orders) {
      const { channels, provenance } = runDerivation(ctx, derivers);
      for (const channel of descriptionsChromeDeriver.produces) {
        expect(Reflect.get(channels, channel)).toBe("321");
        expect(provenance.get(channel)).toEqual({ family: stated.family, rank });
      }
    }
  });
});
