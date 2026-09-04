import { describe, expect, it } from "vitest";

import { SEMANTIC_SURFACE_ROLES } from "@/foundation/contracts/kernel/tokens/materials";
import type {
  BrandTheme,
  BrandThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import { TENANT_THEME_OVERRIDE_TOKENS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from "@/infrastructure/compilers/composition/tenant-theme";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";

import {
  EDITORIAL_FLAT_BRAND_THEME,
  EDITORIAL_FLAT_IDENTITY,
  HUMANIST_SOFT_BRAND_THEME,
  HUMANIST_SOFT_IDENTITY,
  TECHNICAL_DARK_BRAND_THEME,
  TECHNICAL_DARK_IDENTITY,
  TORTURE_TENANT_FIXTURES,
  type TortureTenantAxis,
} from "..";

const REQUIRED_AXES = [
  "editorial",
  "technical",
  "humanist",
  "light",
  "dark",
  "flat",
  "soft",
  "radius-0",
  "ultra-rounded",
  "compact",
  "spacious",
] as const satisfies readonly TortureTenantAxis[];

describe("DS-Q001 torture tenant fixtures", () => {
  it("covers every requested structural and material extreme", () => {
    const coveredAxes = new Set(
      TORTURE_TENANT_FIXTURES.flatMap((fixture) => fixture.axes)
    );

    for (const axis of REQUIRED_AXES) {
      expect(coveredAxes.has(axis), `missing torture axis: ${axis}`).toBe(true);
    }
  });

  it("keeps fixture and tenant identities stable and unique", () => {
    const fixtureIds = TORTURE_TENANT_FIXTURES.map((fixture) => fixture.id);
    const brandIds = TORTURE_TENANT_FIXTURES.map(
      (fixture) => fixture.brandTheme.id
    );
    const tenantIds = TORTURE_TENANT_FIXTURES.map(
      (fixture) => fixture.tenantTheme.identity.tenantId
    );
    const slugs = TORTURE_TENANT_FIXTURES.map(
      (fixture) => fixture.tenantTheme.identity.slug
    );

    for (const values of [fixtureIds, brandIds, tenantIds, slugs]) {
      expect(new Set(values).size).toBe(TORTURE_TENANT_FIXTURES.length);
    }

    for (const fixture of TORTURE_TENANT_FIXTURES) {
      expect(fixture.tenantTheme.identity.verticalKey).toBe("bithire");
      expect(fixture.tenantTheme.identity.rowVersion).toBe(1);
    }
  });

  it("defines all eight coordinated semantic surface roles for every brand", () => {
    for (const fixture of TORTURE_TENANT_FIXTURES) {
      const surfaceRoles = fixture.brandTheme.surfaces?.surfaceRoles;
      expect(
        surfaceRoles,
        `${fixture.id} has no surface-role hierarchy`
      ).toBeDefined();

      for (const role of SEMANTIC_SURFACE_ROLES) {
        const surfaceRole = surfaceRoles?.[role];
        expect(surfaceRole, `${fixture.id} is missing ${role}`).toBeDefined();
        expect(
          surfaceRole?.background,
          `${fixture.id}.${role} has no background`
        ).toBeTruthy();
        expect(
          surfaceRole?.foreground,
          `${fixture.id}.${role} has no readable foreground contract`
        ).toBeTruthy();
        expect(
          surfaceRole?.border,
          `${fixture.id}.${role} has no edge contract`
        ).toBeTruthy();
        expect(
          surfaceRole?.borderStrong,
          `${fixture.id}.${role} has no emphasized edge contract`
        ).toBeTruthy();
        expect(
          surfaceRole?.shadow,
          `${fixture.id}.${role} must explicitly choose depth or none`
        ).toBeTruthy();
      }
    }
  });

  it("makes the editorial fixture genuinely flat, square and compact", () => {
    expect(EDITORIAL_FLAT_BRAND_THEME.surfaces.borderRadius).toEqual({
      sm: "0px",
      md: "0px",
      lg: "0px",
      xl: "0px",
    });
    expect(EDITORIAL_FLAT_BRAND_THEME.surfaces.densityScale).toBeLessThan(1);
    expect(EDITORIAL_FLAT_BRAND_THEME.surfaces.effectIntensity).toBe(0);
    expect(
      Object.values(EDITORIAL_FLAT_BRAND_THEME.surfaces.shadows)
    ).toEqual(["none", "none", "none", "none"]);

    for (const surfaceRole of Object.values(
      EDITORIAL_FLAT_BRAND_THEME.surfaces.surfaceRoles
    )) {
      expect(surfaceRole.shadow).toBe("none");
      expect(surfaceRole.shadowHover).toBe("none");
    }
  });

  it("makes the technical fixture dark, precise and instrument-dense", () => {
    expect(TECHNICAL_DARK_BRAND_THEME.palette.backgroundColor).toBe(
      "#07101C"
    );
    expect(
      TECHNICAL_DARK_BRAND_THEME.surfaces.surfaceRoles.canvas.foreground
    ).toBe("#EDF5FF");
    expect(TECHNICAL_DARK_BRAND_THEME.surfaces.densityScale).toBeLessThan(1);
    expect(TECHNICAL_DARK_BRAND_THEME.surfaces.borderRadius.xl).toBe("6px");
    expect(
      TECHNICAL_DARK_BRAND_THEME.typography.fontFamilyMono
    ).toContain("plex-mono");
  });

  it("makes the humanist fixture soft, ultra-rounded and spacious", () => {
    expect(HUMANIST_SOFT_BRAND_THEME.surfaces.borderRadius).toEqual({
      sm: "18px",
      md: "24px",
      lg: "32px",
      xl: "40px",
    });
    expect(HUMANIST_SOFT_BRAND_THEME.surfaces.densityScale).toBeGreaterThan(1);
    expect(HUMANIST_SOFT_BRAND_THEME.surfaces.effectIntensity).toBeGreaterThan(
      0.5
    );
    expect(
      HUMANIST_SOFT_BRAND_THEME.typography.fontFamilyBase
    ).toContain("humanist-text");
    expect(
      HUMANIST_SOFT_BRAND_THEME.surfaces.surfaceRoles.card.shadow
    ).not.toBe("none");
  });

  it("produces three distinct whole-product signatures, not recolors", () => {
    const signatures = TORTURE_TENANT_FIXTURES.map((fixture) =>
      JSON.stringify({
        palette: fixture.brandTheme.palette,
        typography: fixture.brandTheme.typography,
        surfaceRoles: fixture.brandTheme.surfaces?.surfaceRoles,
        radii: fixture.brandTheme.surfaces?.borderRadius,
        shadows: fixture.brandTheme.surfaces?.shadows,
        density: fixture.brandTheme.surfaces?.densityScale,
        effects: fixture.brandTheme.surfaces?.effectIntensity,
        general: fixture.tenantTheme.document.visualFoundation.general,
        anatomy:
          fixture.tenantTheme.document.visualFoundation.advanced?.chrome,
      })
    );

    expect(new Set(signatures).size).toBe(TORTURE_TENANT_FIXTURES.length);
  });

  it("keeps every DB-authored override inside the published closed set", () => {
    const allowed = new Set<string>(TENANT_THEME_OVERRIDE_TOKENS);

    for (const fixture of TORTURE_TENANT_FIXTURES) {
      const overrides =
        fixture.tenantTheme.document.visualFoundation.advanced
          ?.tokenOverrides ?? {};
      for (const token of Object.keys(overrides)) {
        expect(allowed.has(token), `${fixture.id} uses unknown ${token}`).toBe(
          true
        );
      }
    }
  });

  it("round-trips as valid TenantTheme v1 JSON documents", () => {
    for (const fixture of TORTURE_TENANT_FIXTURES) {
      const serialized = JSON.stringify(fixture.tenantTheme.document);
      const parsed = JSON.parse(serialized) as unknown;
      const validation = validateTenantThemeDocument(parsed);

      expect(validation.success, `${fixture.id} is not a valid document`).toBe(
        true
      );
      if (validation.success) {
        expect(validation.data).toEqual(fixture.tenantTheme.document);
      }
    }
  });

  it("hydrates and compiles every fixture through the real bithire envelope", () => {
    const envelope = getTenantThemeVerticalEnvelope("bithire");
    expect(envelope).toBeDefined();

    const artifacts = TORTURE_TENANT_FIXTURES.map((fixture) =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(
          fixture.tenantTheme.document,
          fixture.tenantTheme.identity
        ),
        { verticalEnvelope: envelope }
      )
    );

    for (const [index, artifact] of artifacts.entries()) {
      const fixture = TORTURE_TENANT_FIXTURES[index];
      expect(artifact.slug).toBe(fixture.tenantTheme.identity.slug);
      expect(artifact.verticalKey).toBe("bithire");
      for (const role of SEMANTIC_SURFACE_ROLES) {
        expect(
          artifact.variables[`--ds-surface-${role}`],
          `${fixture.id} did not compile ${role}`
        ).toBeDefined();
      }
    }

    expect(new Set(artifacts.map((artifact) => artifact.digest)).size).toBe(
      TORTURE_TENANT_FIXTURES.length
    );
  });
});

/**
 * The four palette channels this fixture family authors per mode, and the CSS
 * variable each one reaches. These are exactly the channels that used to be
 * written twice — once plainly and once under a retired `dark`-prefixed twin —
 * so they are where a regression back to the two-field shape would show.
 */
const MODE_CHANNEL_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
] as const;

const MODE_CHANNELS = {
  primary: "--ds-color-primary",
  secondary: "--ds-color-secondary",
  accent: "--ds-color-accent",
  background: "--ds-color-bg-primary",
} as const satisfies Readonly<Record<(typeof MODE_CHANNEL_KEYS)[number], string>>;

type ModeChannelValues = Readonly<
  Record<(typeof MODE_CHANNEL_KEYS)[number], string>
>;

interface ModeFixtureExpectation {
  readonly id: string;
  readonly slug: string;
  readonly brandTheme: BrandTheme;
  /** The mode the theme body itself is authored in. */
  readonly defaultMode: BrandThemeMode;
  /** The mode authored as a `modes` overlay; the only block that may compile. */
  readonly nonDefaultMode: BrandThemeMode;
  /** Expected effective values of the default mode (the base block). */
  readonly base: ModeChannelValues;
  /** Expected effective values of the non-default mode. */
  readonly overlay: ModeChannelValues;
}

const MODE_FIXTURES = [
  {
    id: "quality-editorial-flat",
    slug: EDITORIAL_FLAT_IDENTITY.slug,
    brandTheme: EDITORIAL_FLAT_BRAND_THEME,
    defaultMode: "light",
    nonDefaultMode: "dark",
    base: {
      primary: "#174E77",
      secondary: "#8C5E38",
      accent: "#C67C3B",
      background: "#F7F2E8",
    },
    overlay: {
      primary: "#7DB4D9",
      secondary: "#D3A77F",
      accent: "#E3A76E",
      background: "#171A1D",
    },
  },
  {
    id: "quality-technical-dark",
    slug: TECHNICAL_DARK_IDENTITY.slug,
    brandTheme: TECHNICAL_DARK_BRAND_THEME,
    defaultMode: "dark",
    nonDefaultMode: "light",
    base: {
      primary: "#8DC4FF",
      secondary: "#78E4D8",
      accent: "#FFC07D",
      background: "#07101C",
    },
    overlay: {
      primary: "#77B7FF",
      secondary: "#61D4C8",
      accent: "#F0A45D",
      background: "#07101C",
    },
  },
  {
    id: "quality-humanist-soft",
    slug: HUMANIST_SOFT_IDENTITY.slug,
    brandTheme: HUMANIST_SOFT_BRAND_THEME,
    defaultMode: "light",
    nonDefaultMode: "dark",
    base: {
      primary: "#315F83",
      secondary: "#6C7661",
      accent: "#A96D4E",
      background: "#F3F0E9",
    },
    overlay: {
      primary: "#91BED9",
      secondary: "#B4C0A5",
      accent: "#D7A88D",
      background: "#172126",
    },
  },
] as const satisfies readonly ModeFixtureExpectation[];

describe("DS-Q001 torture tenant mode authority", () => {
  it("declares the exact mode each fixture's body is authored in", () => {
    expect(EDITORIAL_FLAT_BRAND_THEME.appearance.defaultMode).toBe("light");
    expect(TECHNICAL_DARK_BRAND_THEME.appearance.defaultMode).toBe("dark");
    expect(HUMANIST_SOFT_BRAND_THEME.appearance.defaultMode).toBe("light");
  });

  it("authors the non-default mode as a source overlay and never its inverse", () => {
    expect(EDITORIAL_FLAT_BRAND_THEME.modes.dark.palette).toEqual({
      primaryColor: "#7DB4D9",
      secondaryColor: "#D3A77F",
      accentColor: "#E3A76E",
      backgroundColor: "#171A1D",
    });
    expect(EDITORIAL_FLAT_BRAND_THEME.modes).not.toHaveProperty("light");

    expect(TECHNICAL_DARK_BRAND_THEME.modes.light.palette).toEqual({
      primaryColor: "#77B7FF",
      secondaryColor: "#61D4C8",
      accentColor: "#F0A45D",
      backgroundColor: "#07101C",
    });
    expect(TECHNICAL_DARK_BRAND_THEME.modes).not.toHaveProperty("dark");

    expect(HUMANIST_SOFT_BRAND_THEME.modes.dark.palette).toEqual({
      primaryColor: "#91BED9",
      secondaryColor: "#B4C0A5",
      accentColor: "#D7A88D",
      backgroundColor: "#172126",
    });
    expect(HUMANIST_SOFT_BRAND_THEME.modes).not.toHaveProperty("light");
  });

  it("compiles each base block as that fixture's default-mode palette", () => {
    for (const fixture of MODE_FIXTURES) {
      const compiled = lowerBrandThemeFixture({
        brandTheme: fixture.brandTheme,
        tenantSlug: fixture.slug,
      });

      expect(compiled.colorScheme, `${fixture.id} color-scheme`).toBe(
        fixture.defaultMode
      );

      for (const channel of MODE_CHANNEL_KEYS) {
        const variable = MODE_CHANNELS[channel];
        expect(
          compiled.cssVariables[variable],
          `${fixture.id} base ${variable}`
        ).toBe(fixture.base[channel]);
      }
    }
  });

  it("compiles exactly one non-default mode block per fixture", () => {
    for (const fixture of MODE_FIXTURES) {
      const compiled = lowerBrandThemeFixture({
        brandTheme: fixture.brandTheme,
        tenantSlug: fixture.slug,
      });
      const blocks = compiled.modeBlocks ?? [];

      expect(
        blocks.map((block) => block.mode),
        `${fixture.id} compiled mode blocks`
      ).toEqual([fixture.nonDefaultMode]);
      expect(blocks[0].colorScheme).toBe(fixture.nonDefaultMode);
    }
  });

  it("gives the non-default mode its own effective palette", () => {
    for (const fixture of MODE_FIXTURES) {
      const compiled = lowerBrandThemeFixture({
        brandTheme: fixture.brandTheme,
        tenantSlug: fixture.slug,
      });
      const block = (compiled.modeBlocks ?? [])[0];

      for (const channel of MODE_CHANNEL_KEYS) {
        const variable = MODE_CHANNELS[channel];
        // A block carries only the channels whose value actually MOVES; every
        // channel it does not restate keeps cascading from the base block. So
        // the effective value of a mode is the delta when there is one and the
        // base otherwise -- requiring a delta here would demand the compiler
        // emit a redundant declaration to satisfy a test.
        const effective =
          block.cssVariables[variable] ?? compiled.cssVariables[variable];

        expect(
          effective,
          `${fixture.id} ${fixture.nonDefaultMode} ${variable}`
        ).toBe(fixture.overlay[channel]);
      }
    }
  });

  it("keeps the delta honest: an equal channel is absent, a moved one present", () => {
    // This is what makes the fallback above load-bearing rather than cosmetic.
    // Technical's light ground is the same hex as its dark base, so its block
    // must NOT restate the ground; Editorial's dark ground genuinely moves, so
    // its block must.
    const technical = lowerBrandThemeFixture({
      brandTheme: TECHNICAL_DARK_BRAND_THEME,
      tenantSlug: TECHNICAL_DARK_IDENTITY.slug,
    });
    const technicalLight = (technical.modeBlocks ?? [])[0];

    expect(TECHNICAL_DARK_BRAND_THEME.modes.light.palette.backgroundColor).toBe(
      TECHNICAL_DARK_BRAND_THEME.palette.backgroundColor
    );
    expect(technicalLight.cssVariables).not.toHaveProperty(
      MODE_CHANNELS.background
    );
    expect(technicalLight.cssVariables[MODE_CHANNELS.primary]).toBe("#77B7FF");

    const editorial = lowerBrandThemeFixture({
      brandTheme: EDITORIAL_FLAT_BRAND_THEME,
      tenantSlug: EDITORIAL_FLAT_IDENTITY.slug,
    });
    const editorialDark = (editorial.modeBlocks ?? [])[0];

    expect(editorialDark.cssVariables[MODE_CHANNELS.background]).toBe(
      "#171A1D"
    );
  });
});
