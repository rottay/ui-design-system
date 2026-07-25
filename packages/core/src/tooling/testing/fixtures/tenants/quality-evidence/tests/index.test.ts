import { describe, expect, it } from "vitest";

import { SEMANTIC_SURFACE_ROLES } from "@/foundation/contracts/kernel/tokens/materials";
import { TENANT_THEME_OVERRIDE_TOKENS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from "@/infrastructure/compilers/composition/tenant-theme";

import {
  EDITORIAL_FLAT_BRAND_THEME,
  HUMANIST_SOFT_BRAND_THEME,
  TECHNICAL_DARK_BRAND_THEME,
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
