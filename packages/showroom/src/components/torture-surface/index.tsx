'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import {
  DesignSystemProvider,
  getKnownTenantConfig,
  type BrandTheme,
  type TenantConfig,
} from '@rottay/design-system';
import {
  engineVisualOf,
  firstPartyEngineVisual,
  brandTenantSelector,
  compileThemeIntent,
  draftPreviewThemeIntent,
  containerScope,
  emitThemeCss,
  emitTenantThemeArtifactForSsr,
  isFirstPartyVerticalId,
  type TenantThemeArtifact,
  type ThemeIntent,
} from '@rottay/design-system/server';

import { isShowroomTenant } from '@/components/runtime/query';
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
//     registry). Because their slug is unbundled and they carry a brandTheme
//     with no compiled artifact behind it, DesignSystemProvider has nothing to
//     paint them with on its own (the runtime tenant-CSS generator is gone).
//     TortureSurface itself compiles their BrandTheme with `compileTheme`
//     and mounts the resulting CSS as a <style> element, then hands the
//     provider the config WITHOUT the brandTheme -- the same static ingress
//     path a code-owned vertical takes (compileTheme ->
//     renderFirstPartyArtifact, whose runtime projection also strips the
//     theme), minus the build-time artifact step these ephemeral probe
//     fixtures don't need. Nothing needs to be registered for this to work.
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
      vertical: 'rottay',
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
    vertical: 'rottay',
    branding: { companyName: 'Torture Light' },
    brandTheme: tortureLightBrandTheme,
  };
}

/**
 * The intent a fixture BrandTheme compiles under.
 *
 * A fixture theme is a DRAFT — a patch over the vertical it is a fixture of —
 * exactly like a brand-studio draft. It used to be lifted into a baseline of
 * its own and compiled with no vertical at all, which is a shape no publish
 * path can produce. A fixture that names no first-party vertical has no
 * baseline, so this surface compiles nothing for it rather than inventing one.
 */
function tortureDraftIntent(
  tenantConfig: TenantConfig,
  draft: BrandTheme,
): ThemeIntent | undefined {
  const vertical = tenantConfig.vertical;
  if (!isFirstPartyVerticalId(vertical)) return undefined;
  return draftPreviewThemeIntent({ vertical, slug: tenantConfig.slug, draft });
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

  // The legacy-brand-fixture path: an unbundled, unregistered tenant carrying
  // a BrandTheme with no compiled artifact and no bundled CSS. The compiled
  // artifact and the bundled-vertical fixtures (rottay/bithire/evnto, which
  // already carry their own pre-built stylesheet inside the DS bundle) both
  // paint through a channel this surface does not own; this branch is what's
  // left once those two are excluded. `compileTheme` is the same pure
  // static ingress path a code-owned vertical's build takes -- this surface
  // just mounts the result itself instead of persisting it to disk, since a
  // probe fixture has no build step.
  const legacyBrandCss = useMemo(() => {
    if (!brandTheme || !tenantConfig || compiledArtifact || KNOWN_TENANT_FIXTURES.has(fixture)) {
      return undefined;
    }
    const slug = tenantConfig.slug;
    const intent = tortureDraftIntent(tenantConfig, brandTheme);
    if (!intent) return undefined;
    // The explicit engine is the SANCTIONED override: this surface exists to
    // render one fixture under all three engines side by side. A productive
    // compile passes none and takes the vertical's roster row.
    const compiled = compileThemeIntent(intent, { engine }).compiled;
    return emitThemeCss(compiled, containerScope(brandTenantSelector(slug)));
  }, [brandTheme, tenantConfig, compiledArtifact, fixture, engine]);

  // The classic engine seeds antd from the compiled projection, so the surface
  // publishes the same compile it paints with. A fixture whose theme this
  // surface does not own publishes nothing, and classic refuses rather than
  // seeding antd from a guess.
  const engineVisual = useMemo(() => {
    if (brandTheme && tenantConfig) {
      const intent = tortureDraftIntent(tenantConfig, brandTheme);
      if (intent) {
        return engineVisualOf(compileThemeIntent(intent, { engine }).compiled);
      }
    }
    const slug = tenantConfig?.slug ?? null;
    return isShowroomTenant(slug) ? firstPartyEngineVisual(slug, engine) : undefined;
  }, [brandTheme, tenantConfig, engine]);

  // Once this surface compiles and mounts the BrandTheme itself, the theme is
  // no longer a payload the provider may act on -- it is CSS already in the
  // document. Handing it to the provider anyway is a tenant carrying an
  // uncompiled visual payload with nothing to verify against, which the
  // resolver refuses outright. Stripping it here is the same projection the
  // registry performs for a code-owned vertical, for the same reason: static
  // CSS stays the sole visual emitter. The probe still reads the theme it
  // ASKED for through `PROBE_BRAND_THEME_KEY` below, which is where that
  // question belongs.
  const providerConfig = useMemo(() => {
    if (!tenantConfig || !legacyBrandCss) return tenantConfig;
    const { brandTheme: _mountedSeparately, ...withoutTheme } = tenantConfig;
    return withoutTheme as TenantConfig;
  }, [tenantConfig, legacyBrandCss]);

  // The receipt for the SERVER pass only. The artifact element itself is
  // mounted first-in-body by `TortureFirstPaint`, and the mount proof admits
  // exactly one -- so this surface must NOT mount a second copy of the same
  // bytes. On the client the DOM proof supersedes the receipt entirely.
  const ssrReceipt = useMemo(
    () =>
      compiledArtifact
        ? emitTenantThemeArtifactForSsr(compiledArtifact, {
            slug: compiledArtifact.slug,
            verticalKey: compiledArtifact.verticalKey,
          }).receipt
        : undefined,
    [compiledArtifact],
  );

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

  if (!providerConfig) {
    return null;
  }

  return (
    <DesignSystemProvider
      forceEngine={engine}
      engineVisual={engineVisual}
      forceTheme={ground ?? surfaceGroundFor(fixture)}
      tenantConfig={providerConfig}
      locale={rtl ? 'ar' : 'en'}
      // A declaration is EVIDENCE, so exactly one branch here can produce one:
      //   - compiled-artifact: the server embedded this artifact's CSS and the
      //     element is in the document, so the declaration names bytes the
      //     resolver can verify and it silences exactly the channels the
      //     artifact's `coverage` covers.
      //   - legacy BrandTheme and bundled verticals: there is no v1 artifact to
      //     name. Their CSS is static, `providerConfig` carries no visual
      //     payload, and the resolver settles on `no-visual-payload` with
      //     nothing suppressed. A declaration here would name an artifact the
      //     mount proof could never find and would block the surface.
      visualAuthority={
        compiledArtifact
          ? { authority: 'compiled-artifact', artifact: compiledArtifact, ssrReceipt }
          : undefined
      }
      // No `vertical` prop for ANY fixture, including rottay: a vertical
      // baseline would layer extra tokens under the BrandTheme and muddy the
      // proof -- the probe must attribute every value to the tenant theme
      // alone, and the rottay reference must be layered identically to the
      // torture fixtures for the differential comparison to be apples-to-apples.
    >
      {legacyBrandCss ? (
        // The exact compiled BrandTheme, mounted once. Scoped to
        // html[data-tenant='<slug>'] (+ [data-theme='<mode>'] for the mode
        // overlay block) by compileTheme itself; TenantProvider and
        // ThemeProvider stamp those same attributes on <html>, so no selector
        // is hand-written here.
        <style
          data-testid="torture-legacy-brand-style"
          dangerouslySetInnerHTML={{ __html: legacyBrandCss }}
        />
      ) : null}
      {children}
    </DesignSystemProvider>
  );
}
