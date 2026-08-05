'use client';

import { useEffect, type ReactNode } from 'react';
import {
  DesignSystemProvider,
  getKnownTenantConfig,
  type BrandTheme,
  type TenantConfig,
} from '@rottay/design-system';
import type { TenantThemeArtifact } from '@rottay/design-system/server';

import {
  compileCanonicalManagementArtifact,
  KNOWN_TENANT_FIXTURES,
  surfaceGroundFor,
  type ManagementFixtureSource,
  type ProbeEngine,
  type TortureFixture,
} from '@/components/torture-tenant';
import { publishedManagementSpecimen } from '@/components/torture-tenant/specimen';

import {
  themanagementmiamiBrandTheme,
  tortureDarkBrandTheme,
  tortureLightBrandTheme,
} from './fixtures';

// ---------------------------------------------------------------------------
// Torture surface (WO-GAT-03 hostile-tenant whitelabel proof)
//
// Renders children under one of five fixtures:
//   - torture-dark / torture-light: synthetic hostile tenants that are NOT
//     registered anywhere (not in BUNDLED_TENANT_SLUGS, not in the known-tenant
//     registry). Because their slug is unbundled and they carry a brandTheme,
//     DesignSystemProvider's generateTenantCssFromResolvedVisualConfig path
//     compiles their CSS at render time -- the exact dynamic-tenant path a real
//     hostile DB-driven customer tenant would take. Nothing needs to be
//     registered for this to work.
//   - rottay: the real first-party tenant, used as the differential reference
//     the Playwright spec compares the torture fixtures against.
//   - bithire / themanagementmiami: the bithire vertical baseline and one
//     explicit tenant regression fixture. The customer is deliberately NOT in
//     the DS known-tenant registry: production resolves its published config
//     from the tenancy DB. This page supplies the checked-in specimen directly
//     so sighted regression remains reproducible without creating a runtime
//     source of truth.
//
// Tenant, theme, and text direction are all anchored on <html>
// (ThemeProvider writes document.documentElement, TenantProvider writes
// data-tenant, I18nProvider writes dir), so exactly ONE fixture can own a DOM
// per page load -- there is no side-by-side comparison, only repeat loads
// driven by the ?fixture= query param on the probe page.
// ---------------------------------------------------------------------------

// The fixture vocabulary, the ground map and the DB compile all moved to
// `@/components/torture-tenant`, which is pure and server-safe: the server
// resolves the same facts to stamp the tenant before the first paint, and a
// second copy here would be a second answer to the same question. Re-exported
// so every existing importer keeps its import path.
export {
  TORTURE_FIXTURES,
  surfaceGroundFor,
  type ManagementFixtureSource,
  type ProbeEngine,
  type TortureFixture,
} from '@/components/torture-tenant';

function tortureTenantConfig(fixture: TortureFixture): TenantConfig | undefined {
  if (KNOWN_TENANT_FIXTURES.has(fixture)) {
    return getKnownTenantConfig(fixture);
  }

  if (fixture === 'torture-dark') {
    return {
      slug: 'torture-dark',
      name: 'Torture Dark',
      engine: 'modern',
      theme: 'dark',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'Torture Dark' },
      brandTheme: tortureDarkBrandTheme,
    };
  }

  if (fixture === 'themanagementmiami') {
    return {
      slug: 'themanagementmiami',
      name: 'The Management Miami fixture',
      vertical: 'bithire',
      engine: 'modern',
      theme: 'light',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'The Management Miami' },
      brandTheme: themanagementmiamiBrandTheme,
    };
  }

  return {
    slug: 'torture-light',
    name: 'Torture Light',
    engine: 'modern',
    theme: 'light',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: 'Torture Light' },
    brandTheme: tortureLightBrandTheme,
  };
}

/** The window key the whitelabel probe reads the active fixture's BrandTheme from. */
export const PROBE_BRAND_THEME_KEY = '__probeBrandTheme';

type ProbeWindow = Window & { [PROBE_BRAND_THEME_KEY]?: BrandTheme };

/**
 * The tenant the published DB specimen describes, projected from the artifact
 * the server already compiled and embedded.
 *
 * `appearance` is retained deliberately: the runtime still READS it for
 * density, the motion dial, `backgroundMode` and the recipe profile. It is the
 * artifact's own compiled source echoed back, not a second authority, and the
 * visual-authority resolver recognises that structurally.
 */
function canonicalManagementTenantConfig(artifact: TenantThemeArtifact): TenantConfig {
  return {
    slug: artifact.slug,
    name: 'The Management',
    vertical: artifact.verticalKey,
    engine: 'modern',
    theme: 'light',
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: 'The Management' },
    appearance: artifact.normalizedAppearance as TenantConfig['appearance'],
  };
}

export function TortureSurface({
  fixture,
  rtl,
  engine = 'modern',
  ground,
  managementSource = 'legacy-brand-fixture',
  artifact,
  children,
}: {
  fixture: TortureFixture;
  rtl?: boolean;
  /**
   * The engine to render. Defaults to `modern`: every differential probe on this
   * surface attributes its readings to the tenant, and a second engine would be a
   * second variable. WO-ENG-11 overrides it to put modern and rustic side by side,
   * which is the spec's own falsifiable test for whether modern has a signature.
   */
  engine?: ProbeEngine;
  /**
   * Optional capture-axis override. The fixture remains the sole owner of the
   * tenant config; this only asks ThemeProvider to paint its light or dark
   * presentation so probes can audit both modes without inventing a tenant.
   */
  ground?: 'dark' | 'light';
  /**
   * The governed DS reference lab uses the published DB document. Existing
   * historical screenshot suites stay on their former fixture until migrated.
   */
  managementSource?: ManagementFixtureSource;
  /**
   * The artifact the server already compiled and embedded for this request.
   * Omitted, the compiled-DB path recompiles the same published specimen: the
   * compile is a pure function of a frozen document, so both sides reach the
   * same digest and neither becomes a second source of truth.
   */
  artifact?: TenantThemeArtifact;
  children: ReactNode;
}) {
  const compiledArtifact =
    fixture === 'themanagementmiami' && managementSource === 'canonical-db'
      ? (artifact ?? compileCanonicalManagementArtifact(publishedManagementSpecimen()))
      : undefined;
  const tenantConfig = compiledArtifact
    ? canonicalManagementTenantConfig(compiledArtifact)
    : tortureTenantConfig(fixture);
  const brandTheme = tenantConfig?.brandTheme;

  // The probe's derivation check needs the value the tenant's theme ASKED for,
  // independent of the CSS cascade. Reading a --ds-* variable back off <html>
  // would only prove the component consumes that variable, not that the
  // variable still carries the tenant's value: a later, more specific rule can
  // overwrite it and the component and the read would move together.
  useEffect(() => {
    const probeWindow = window as ProbeWindow;
    probeWindow[PROBE_BRAND_THEME_KEY] = brandTheme;
    return () => {
      delete probeWindow[PROBE_BRAND_THEME_KEY];
    };
  }, [brandTheme]);

  if (!tenantConfig) {
    return null;
  }

  return (
    <DesignSystemProvider
      forceEngine={engine}
      forceTheme={ground ?? surfaceGroundFor(fixture)}
      tenantConfig={tenantConfig}
      locale={rtl ? 'ar' : 'en'}
      // The server already embedded this artifact's CSS, so declaring it
      // silences exactly the four channels it covers. Without the declaration
      // the resolver reads `origin: 'db-tenant'` and the provider paints a
      // second visual layer over ground that is already correct.
      visualAuthority={
        compiledArtifact ? { authority: 'compiled-artifact', artifact: compiledArtifact } : undefined
      }
      // No `vertical` prop for ANY fixture, including rottay: a vertical
      // baseline would layer extra tokens under the BrandTheme and muddy the
      // proof -- the probe must attribute every value to the tenant theme
      // alone, and the rottay reference must be layered identically to the
      // torture fixtures for the differential comparison to be apples-to-apples.
    >
      {children}
    </DesignSystemProvider>
  );
}
