/**
 * The surfaces family states the scrim ladder in every block: the canon hue of
 * the block's mode at the canon strength, an authored strength at that hue, and
 * an authored colour verbatim. No tenant veil reaches it.
 */
import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import {
  describeFamilyContract,
  FIXTURE_TENANT_FACTS,
  type FamilyFixture,
} from "@tests/support/family-contract";
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { buildLoweringContext } from "../../../pipeline";
import { surfacesDeriver } from "..";

const MINIMAL_THEME: FlatTheme = { id: "minimal", name: "Minimal" };
const STEPS = ["light", "medium", "heavy"] as const;

const FIXTURES: readonly FamilyFixture[] = [
  { label: "rottay", theme: firstPartyFixture("rottay") },
  { label: "bithire", theme: firstPartyFixture("bithire") },
  { label: "evnto", theme: firstPartyFixture("evnto") },
  { label: "minimal", theme: MINIMAL_THEME },
  {
    label: "authored strength",
    theme: { ...MINIMAL_THEME, surfaces: { overlayStrength: { medium: 0.7 } } },
  },
  {
    label: "bithire under a tenant floor",
    theme: firstPartyFixture("bithire"),
    tenant: FIXTURE_TENANT_FACTS,
  },
];

describeFamilyContract(surfacesDeriver, FIXTURES);

const ladder = (theme: FlatTheme, mode: "light" | "dark") => {
  const vars = surfacesDeriver.derive(buildLoweringContext({ theme, mode }), {});
  return Object.fromEntries(STEPS.map((step) => [step, vars[`--ds-overlay-${step}`]]));
};

describe("the scrim ladder", () => {
  it("is stated by a theme that authors no surfaces at all", () => {
    expect(ladder(MINIMAL_THEME, "light")).toEqual({
      light: "color-mix(in srgb, var(--ds-color-black) 52%, transparent)",
      medium: "color-mix(in srgb, var(--ds-color-black) 78%, transparent)",
      heavy: "color-mix(in srgb, var(--ds-color-black) 90%, transparent)",
    });
  });

  it("takes the block's own ground in a dark block", () => {
    expect(ladder(MINIMAL_THEME, "dark")).toEqual({
      light: "color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)",
      medium: "color-mix(in srgb, var(--ds-color-bg-primary) 78%, transparent)",
      heavy: "color-mix(in srgb, var(--ds-color-bg-primary) 90%, transparent)",
    });
  });

  it("states the same relations for the three first-party verticals", () => {
    for (const mode of ["light", "dark"] as const) {
      const rottay = ladder(firstPartyFixture("rottay"), mode);
      expect(ladder(firstPartyFixture("bithire"), mode), mode).toEqual(rottay);
      expect(ladder(firstPartyFixture("evnto"), mode), mode).toEqual(rottay);
    }
  });

  it("mixes an authored strength at the canon hue, and passes an authored colour verbatim", () => {
    const theme: FlatTheme = {
      ...MINIMAL_THEME,
      surfaces: {
        overlayStrength: { medium: 0.7 },
        overlays: { heavy: "rgba(10, 10, 10, 0.9)" },
      },
    };
    expect(ladder(theme, "dark")).toEqual({
      light: "color-mix(in srgb, var(--ds-color-bg-primary) 52%, transparent)",
      medium: "color-mix(in srgb, var(--ds-color-bg-primary) 70%, transparent)",
      heavy: "rgba(10, 10, 10, 0.9)",
    });
  });
});

describe("a tenant veil never reaches the ladder", () => {
  const compile = (tokenOverrides: Record<string, string>) => {
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { advanced: { tokenOverrides } },
    } as unknown as TenantThemeDocument;
    const { css } = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, {
        tenantId: "scrim-veil",
        slug: "scrim-veil",
        verticalKey: "bithire",
        rowVersion: 1,
      } as never),
      { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire") }
    );
    return css;
  };
  const ladderDeclarations = (css: string) =>
    css.match(/--ds-overlay-(light|medium|heavy):[^;]+;/g) ?? [];

  it("emits the veil but no ladder delta over the vertical, with or without a chromatic --ds-color-bg-overlay", () => {
    const control = compile({ "--ds-color-primary": "#315D4D" });
    const veiled = compile({
      "--ds-color-primary": "#315D4D",
      "--ds-color-bg-overlay": "#ff00aa",
    });
    expect(veiled).toMatch(/--ds-color-bg-overlay:\s*#ff00aa/i);
    expect(ladderDeclarations(control)).toEqual([]);
    expect(ladderDeclarations(veiled)).toEqual([]);
  });
});
