/**
 * The title follows its semantic role weight; other channels retain the
 * Modern skin's resting fallbacks. Higher-ranked family statements still win.
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
import { shortcutsOverlayChromeDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  { label: "minimal under a tenant floor", theme: MINIMAL_THEME, tenant: FIXTURE_TENANT_FACTS },
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
    if (Reflect.get(match, 1) !== channel) continue;
    const start = (match.index ?? 0) + Reflect.get(match, 0).length;
    let end = start;
    for (let depth = 1; depth > 0 && end < SKIN.length; end += 1) {
      if (SKIN.charAt(end) === "(") depth += 1;
      else if (SKIN.charAt(end) === ")") depth -= 1;
    }
    expect(end, `unbalanced var() for ${channel}`).toBeLessThan(SKIN.length);
    found.add(normalise(SKIN.slice(start, end - 1)));
  }
  return [...found];
}

const TITLE_WEIGHT = "--ds-shortcuts-overlay-title-font-weight";
const TITLE_CHAIN = "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))";
const OTHER_CHANNELS: Record<string, string> = {
  "--ds-shortcuts-overlay-padding-inline": "var(--ds-spacing-3, 12px)",
  "--ds-shortcuts-overlay-dialog-max-inline-size": "40rem",
  "--ds-shortcuts-overlay-dialog-bg": "var(--ds-surface-card)",
  "--ds-shortcuts-overlay-dialog-shadow": "var(--ds-elevation-3)",
  "--ds-shortcuts-overlay-dialog-color": "var(--ds-color-text-primary)",
  "--ds-shortcuts-overlay-enter-duration": "var(--ds-motion-reveal)",
  "--ds-shortcuts-overlay-enter-easing": "var(--ds-motion-ease-enter, ease-out)",
  "--ds-shortcuts-overlay-header-gap": "var(--ds-spacing-3, 12px)",
  "--ds-shortcuts-overlay-header-padding-block": "var(--ds-spacing-3, 12px)",
  "--ds-shortcuts-overlay-header-padding-inline": "var(--ds-spacing-5, 20px)",
  "--ds-shortcuts-overlay-title-color": "var(--ds-color-text-primary)",
  "--ds-shortcuts-overlay-title-font-size": "var(--ds-font-size-base, 16px)",
  "--ds-shortcuts-overlay-search-padding-block": "var(--ds-spacing-2, 8px)",
  "--ds-shortcuts-overlay-search-padding-inline": "var(--ds-spacing-5, 20px)",
  "--ds-shortcuts-overlay-close-touch-target": "var(--ds-touch-target-min, 44px)",
  "--ds-shortcuts-overlay-list-padding-block": "var(--ds-spacing-2, 8px)",
  "--ds-shortcuts-overlay-list-column-width": "16rem",
  "--ds-shortcuts-overlay-list-column-gap": "var(--ds-spacing-4, 16px)",
  "--ds-shortcuts-overlay-group-padding-block": "var(--ds-spacing-1, 4px)",
  "--ds-shortcuts-overlay-category-padding-block": "var(--ds-spacing-1, 4px)",
  "--ds-shortcuts-overlay-category-padding-inline": "var(--ds-spacing-5, 20px)",
  "--ds-shortcuts-overlay-category-color": "var(--ds-color-text-secondary)",
  "--ds-shortcuts-overlay-category-font-size": "var(--ds-font-size-xs, 12px)",
  "--ds-shortcuts-overlay-category-font-weight": "var(--ds-font-weight-semibold, 600)",
  "--ds-shortcuts-overlay-category-letter-spacing": "var(--ds-letter-spacing-wide, 0.025em)",
  "--ds-shortcuts-overlay-item-gap": "var(--ds-spacing-3, 12px)",
  "--ds-shortcuts-overlay-item-padding-block": "6px",
  "--ds-shortcuts-overlay-item-padding-inline": "var(--ds-spacing-5, 20px)",
  "--ds-shortcuts-overlay-description-color": "var(--ds-color-text-primary)",
  "--ds-shortcuts-overlay-description-font-size": "var(--ds-font-size-sm, 14px)",
  "--ds-shortcuts-overlay-chord-gap": "var(--ds-spacing-1, 4px)",
  "--ds-shortcuts-overlay-empty-padding-block": "var(--ds-spacing-8, 32px)",
  "--ds-shortcuts-overlay-footer-padding-block": "var(--ds-spacing-2, 8px)",
  "--ds-shortcuts-overlay-footer-padding-inline": "var(--ds-spacing-5, 20px)",
  "--ds-shortcuts-overlay-footer-color": "var(--ds-color-text-secondary)",
  "--ds-shortcuts-overlay-footer-font-size": "var(--ds-font-size-xs, 12px)",
  "--ds-shortcuts-overlay-rule": "1px solid var(--ds-color-border)"
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

const context = () => buildLoweringContext({ theme: firstPartyFixture("bithire") });

describe("chrome/shortcuts-overlay", () => {
  it("retains every skin fallback, with the title weight below its semantic role", () => {
    const derived = shortcutsOverlayChromeDeriver.derive(context(), {});
    expect(Object.keys(derived).sort()).toEqual(
      [...shortcutsOverlayChromeDeriver.produces].sort()
    );
    for (const [channel, value] of Object.entries(derived)) {
      expect({ channel, fallbacks: skinFallbacks(channel) }).toEqual({
        channel,
        fallbacks: [channel === TITLE_WEIGHT ? "var(--ds-font-weight-semibold, 600)" : normalise(value)],
      });
    }
  });

  it("names only its own family namespace", () => {
    for (const channel of shortcutsOverlayChromeDeriver.produces) {
      expect(channel.startsWith("--ds-shortcuts-overlay-")).toBe(true);
    }
  });

  it("restates nothing the Modal chamber owns: layer, top offset, scrim, radius rung, keyframes", () => {
    for (const channel of shortcutsOverlayChromeDeriver.produces) {
      expect(channel).not.toMatch(/z-index|inset-block-start|scrim|dialog-radius|keyframes/);
    }
    expect(SKIN).not.toMatch(/\banimation(-name)?\s*:/);
    expect(SKIN).not.toMatch(/z-index\s*:/);
  });

  it("yields every channel to a vertical or tenant statement of it", () => {
    const channels = Object.keys(shortcutsOverlayChromeDeriver.derive(context(), {}));
    for (const rank of OVERRIDE_RANKS) {
      const stated: FamilyDeriver = {
        family: `stated-${rank}`,
        rank,
        consumes: ["chrome.*"],
        produces: shortcutsOverlayChromeDeriver.produces,
        derive: () => Object.fromEntries(channels.map((channel) => [channel, rank])),
      };
      const result = runDerivation(context(), [shortcutsOverlayChromeDeriver, stated]);
      for (const channel of channels) {
        expect(Reflect.get(result.channels, channel)).toBe(rank);
        expect(result.provenance.get(channel)?.rank).toBe(rank);
      }
    }
  });
});

describe("chrome/shortcuts-overlay title role weight", () => {
  it("declares the role-weight input and preserves family metadata", () => {
    expect(shortcutsOverlayChromeDeriver.family).toBe("shortcuts-overlay");
    expect(shortcutsOverlayChromeDeriver.rank).toBe("derived");
    expect(shortcutsOverlayChromeDeriver.scopes).toEqual(["density"]);
    expect(shortcutsOverlayChromeDeriver.consumes).toEqual([
      "surfaces.*", "palette.*", "shape.*", "density", "motion", "typography.roleWeights",
    ]);
  });

  it.each(WEIGHT_POSTURES)("follows $roleWeights independently of section-title font-size", ({ roleWeights, expected }) => {
    for (const fontSize of FONT_SIZES) {
      const ctx = buildLoweringContext({
        theme: { ...MINIMAL_THEME, typography: { roleWeights, roles: { sectionTitle: { fontSize } } } },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, shortcutsOverlayChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-section-title-font-size")).toBe(fontSize);
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(expected);
      expect(resolveWeight(Reflect.get(channels, "--ds-shortcuts-overlay-category-font-weight"), channels)).toBe("600");
      const family = shortcutsOverlayChromeDeriver.derive(ctx, {});
      expect(Reflect.get(family, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
      expect(Reflect.get(family, "--ds-shortcuts-overlay-title-font-size")).toBe("var(--ds-font-size-base, 16px)");
      expectOtherChannels(family);
    }
  });

  it.each(WEIGHT_POSTURES)("follows authored section-title weight above $roleWeights and the independent label role", ({ roleWeights }) => {
    for (const fontWeight of AUTHORED_WEIGHTS) {
      const ctx = buildLoweringContext({
        theme: {
          ...MINIMAL_THEME,
          typography: { roleWeights, roles: { sectionTitle: { fontWeight }, label: { fontWeight: 800 } } },
        },
      });
      const { channels } = runDerivation(ctx, [typographyDeriver, shortcutsOverlayChromeDeriver]);
      expect(Reflect.get(channels, "--ds-type-label-font-weight")).toBe("800");
      expect(Reflect.get(channels, "--ds-type-section-title-font-weight")).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, TITLE_WEIGHT), channels)).toBe(String(fontWeight));
      expect(resolveWeight(Reflect.get(channels, "--ds-shortcuts-overlay-category-font-weight"), channels)).toBe("600");
      expectOtherChannels(shortcutsOverlayChromeDeriver.derive(ctx, {}));
    }
  });

  it("falls back to semibold only when the section-title role channel is absent", () => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const { channels } = runDerivation(ctx, [shortcutsOverlayChromeDeriver]);
    const titleWeight = Reflect.get(channels, TITLE_WEIGHT);
    expect(Reflect.has(channels, "--ds-type-section-title-font-weight")).toBe(false);
    expect(resolveWeight(titleWeight, channels)).toBe("600");
    expect(resolveWeight(titleWeight, { ...channels, "--ds-font-weight-semibold": "650" })).toBe("650");
    expect(resolveWeight(titleWeight, {
      ...channels,
      "--ds-type-section-title-font-weight": "300",
      "--ds-font-weight-semibold": "900",
    })).toBe("300");
  });

  it.each(FIXTURES)("preserves all other declared channels exactly for $label", ({ theme, tenant }) => {
    const ctx = buildLoweringContext({ theme, tenant });
    const channels = shortcutsOverlayChromeDeriver.derive(ctx, {});
    expect(Object.keys(channels).sort()).toEqual([...shortcutsOverlayChromeDeriver.produces].sort());
    expect(Reflect.get(channels, TITLE_WEIGHT)).toBe(TITLE_CHAIN);
    expectOtherChannels(channels);
  });

  it.each(OVERRIDE_RANKS)("yields every family channel to %s statements in either derivation order", (rank) => {
    const ctx = buildLoweringContext({ theme: MINIMAL_THEME });
    const stated: FamilyDeriver = {
      family: `stated-${rank}`,
      rank,
      consumes: ["chrome.*"],
      produces: shortcutsOverlayChromeDeriver.produces,
      derive: () => Object.fromEntries(shortcutsOverlayChromeDeriver.produces.map((channel) => [channel, "321"])),
    };
    const orders = [[shortcutsOverlayChromeDeriver, stated], [stated, shortcutsOverlayChromeDeriver]];
    for (const derivers of orders) {
      const { channels, provenance } = runDerivation(ctx, derivers);
      for (const channel of shortcutsOverlayChromeDeriver.produces) {
        expect(Reflect.get(channels, channel)).toBe("321");
        expect(provenance.get(channel)).toEqual({ family: stated.family, rank });
      }
    }
  });
});
