'use client';

import { useEffect, type ReactNode } from 'react';
import {
  DesignSystemProvider,
  getKnownTenantConfig,
  themanagementmiamiBrandTheme,
  tortureDarkBrandTheme,
  tortureLightBrandTheme,
  type BrandTheme,
  type TenantConfig,
} from '@rottay/design-system';

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

export type TortureFixture = 'torture-dark' | 'torture-light' | 'rottay' | 'bithire' | 'evnto' | 'themanagementmiami';

export const TORTURE_FIXTURES: TortureFixture[] = [
  'torture-dark',
  'torture-light',
  'rottay',
  'bithire',
  'evnto',
  'themanagementmiami',
];

/** Vertical baselines that resolve through the known-tenant registry. */
const KNOWN_TENANT_FIXTURES: ReadonlySet<TortureFixture> = new Set(['rottay', 'bithire', 'evnto']);

/** Fixtures that render clear-mode (light) rather than the torture fixtures' dark/light pairing. */
const LIGHT_FORCED_FIXTURES: ReadonlySet<TortureFixture> = new Set(['torture-light', 'bithire', 'themanagementmiami']);

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

/**
 * Ground the differential probe should wait for before capturing: torture-dark
 * and rottay both paint dark; torture-light, bithire, and themanagementmiami
 * all paint a light/clear-mode ground.
 */
export function surfaceGroundFor(fixture: TortureFixture): 'dark' | 'light' {
  return LIGHT_FORCED_FIXTURES.has(fixture) ? 'light' : 'dark';
}

/** The window key the whitelabel probe reads the active fixture's BrandTheme from. */
export const PROBE_BRAND_THEME_KEY = '__probeBrandTheme';

type ProbeWindow = Window & { [PROBE_BRAND_THEME_KEY]?: BrandTheme };

/** Engines the probe may render. The spec's own test compares modern against rustic. */
export type ProbeEngine = 'modern' | 'rustic' | 'classic';

export function TortureSurface({
  fixture,
  rtl,
  engine = 'modern',
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
  children: ReactNode;
}) {
  const tenantConfig = tortureTenantConfig(fixture);
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
      forceTheme={surfaceGroundFor(fixture)}
      tenantConfig={tenantConfig}
      locale={rtl ? 'ar' : 'en'}
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
