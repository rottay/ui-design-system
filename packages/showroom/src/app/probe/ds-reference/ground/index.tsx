/**
 * The DS reference lab's tenant ground.
 *
 * R1 scope.referenceLabLaw: "same hardcoded DS tree under BitHire static
 * BrandTheme and The Management published DB document; zero app-bithire
 * imports, styles, routes, APIs or product fixtures."
 *
 * A ground is per-DOCUMENT: it is stamped on documentElement and, for the DB
 * tenant, scoped artifact CSS is embedded to match. One document therefore
 * cannot carry both tenants, which is why the lab has two explicit route
 * segments rather than one page with a tenant switch. Each segment's layout
 * renders this component first-in-body, which a layout may do because the
 * tenant is STATIC per segment — no searchParams are involved, and that is
 * precisely the constraint that forced the older probe into a client-side
 * script pair.
 *
 * Imports are public `@rottay/design-system` entrypoints only. Nothing here
 * reaches into `components/torture-*`: R1 gives this lane exactly one owned
 * glob, so an import from the torture harness would create a consumption edge
 * into a tree no R1 lane owns.
 */

import type { ReactNode } from 'react';

import { DesignSystemProvider } from '@rottay/design-system';
import { bithireBrandTheme } from '@rottay/design-system';
import {
  buildThemePrepaintScript,
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  resolveDocumentRootAttributes,
} from '@rottay/design-system/server';
import tenantThemeCanaryFixtures from '@rottay/design-system/tenant-theme-canary-fixtures';

import { buildLabRootStampScript, judgeModeStyle, type JudgeMode } from './stamp';

/** The two grounds the lab renders. Closed on purpose — this is not a selector. */
export type LabTenant = 'bithire' | 'themanagement';

/**
 * Locale axis, additive to the tenant axis. Closed for the same reason
 * `LabTenant` is closed: this is not a free-text field, it is the finite set
 * the R1 matrix actually exercises. `en` is the pre-existing default and every
 * call site that predates this axis keeps working unchanged.
 *
 * `es`/`ar` are consumed by new sibling route segments (`bithire-es/`,
 * `bithire-ar/`) rather than a `[locale]` dynamic segment, for the identical
 * reason `bithire/` and `the-management/` are two explicit layouts instead of
 * one branch: locale is STATIC per segment, so "no locale conditional TSX" is
 * visible in review instead of argued. `ar` is the load-bearing case — it is
 * the harness's only COMPLETE right-to-left document: `resolveDocumentRootAttributes`
 * derives `dir="rtl"` from the locale itself and the root-stamp script writes
 * it first-in-body, so the whole document flips before hydration. That is
 * deliberately different from the per-scene content-torture rows (a local
 * `dir="rtl"` div around one Arabic string inside an otherwise-LTR page) —
 * this ground is RTL, not a wrapper claiming to be.
 */
export type LabLocale = 'en' | 'es' | 'ar';

/**
 * BitHire's ground is ATTRIBUTES ONLY.
 *
 * Its artifact CSS ships inside the vertical bundle the showroom already
 * loads, scoped to the root attributes stamped below. Embedding a second copy
 * would create a competing visual layer, which the tenancy law forbids.
 */
function bithireGround(judge: JudgeMode, locale: LabLocale) {
  return {
    rootAttributes: resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale,
      tenant: { slug: 'bithire', verticalKey: 'bithire' },
    }),
    css: '',
    digest: null as string | null,
    artifact: null as unknown,
    // The static tenant carries its code-owned BrandTheme. Without an explicit
    // tenantConfig the provider resolves the DEFAULT tenant ("rottay"), which
    // is how the first attempt produced near-black BitHire buttons: the ground
    // said bithire and the provider said rottay.
    tenantConfig: {
      slug: 'bithire',
      name: 'BitHire',
      vertical: 'bithire',
      engine: 'modern',
      theme: 'light',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'BitHire' },
      brandTheme: bithireBrandTheme,
    } as unknown,
    judgeCss: judgeModeStyle(judge),
    locale,
  };
}

/**
 * The Management's ground is COMPILED FROM THE PUBLISHED DOCUMENT.
 *
 * The read path's job is to assemble one envelope from the JSONB payload plus
 * the trusted row columns; `hydrateTenantThemeConfig` is that join, and the
 * compile below is the same call the production server embed makes. Nothing is
 * projected from a static BrandTheme, which is the entire point of this ground
 * existing beside BitHire's.
 */
function themanagementGround(judge: JudgeMode, locale: LabLocale) {
  const specimen = tenantThemeCanaryFixtures.specimens.themanagement;
  if (!specimen) throw new Error('The published The Management canary specimen is missing');

  const hydrated = hydrateTenantThemeConfig(specimen.document, specimen.identity);
  const artifact = compileTenantThemeConfig(hydrated, {
    verticalEnvelope: getTenantThemeVerticalEnvelope(specimen.identity.verticalKey),
  });

  return {
    rootAttributes: resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale,
      tenant: { slug: artifact.slug, verticalKey: artifact.verticalKey },
    }),
    css: artifact.css,
    digest: artifact.digest,
    artifact: artifact as unknown,
    // The DB tenant's config is DERIVED FROM THE ARTIFACT, never re-authored:
    // the compiled artifact is the single authority for the channels it owns,
    // and `normalizedAppearance` is the compiler's own normalization of the
    // document. Re-deriving it from the raw document here would create the
    // second authority the visualAuthority declaration exists to prevent.
    tenantConfig: {
      slug: artifact.slug,
      name: 'The Management',
      vertical: artifact.verticalKey,
      engine: 'modern',
      theme: 'light',
      plan: 'enterprise',
      features: ['*'],
      branding: { companyName: 'The Management' },
      appearance: artifact.normalizedAppearance,
    } as unknown,
    judgeCss: judgeModeStyle(judge),
    locale,
  };
}

export interface LabGroundProps {
  readonly tenant: LabTenant;
  readonly judge?: JudgeMode;
  /** Defaults to `'en'` — every pre-existing call site is unaffected. */
  readonly locale?: LabLocale;
  readonly children?: ReactNode;
}

/**
 * The ground is TWO seams, and the first attempt shipped only one.
 *
 * The root-attribute stamp plus the artifact CSS decide what the TOKENS
 * resolve to, and a measurement confirmed they were already correct: under the
 * DB tenant `--ds-color-primary` resolved to #1A1A18, `--ds-radius-md` to 0px
 * and the heading family to Fraunces. But the components still rendered
 * BitHire's blue, because token values do not select an ENGINE. Engine
 * resolution is a React context decision, and with no provider mounted every
 * family fell back to a default engine that paints its own chrome and never
 * reads the `--ds-button-*` channels the artifact authors.
 *
 * The visible symptom was the exact defect this round exists to eliminate —
 * two tenants that differ only in background colour — produced here by the
 * lab's own missing provider rather than by the design system. Worth stating
 * plainly so the captures taken before this fix are not mistaken for evidence
 * about the DS.
 *
 * `visualAuthority: 'compiled-artifact'` is required, not optional: the server
 * has already embedded this artifact, so without the declaration the provider
 * resolves `origin: 'db-tenant'` and paints a SECOND visual layer over a ground
 * that is already correct — two authorities for one surface.
 */
export function LabGround({ tenant, judge = 'none', locale = 'en', children }: LabGroundProps) {
  const ground = tenant === 'bithire' ? bithireGround(judge, locale) : themanagementGround(judge, locale);

  return (
    <>
      {/* First node in the body: the root projection plus the DS's own theme
          prepaint. Head stylesheets are render-blocking and this script runs
          before any body content, so no paint can precede the ground. */}
      <script
        data-testid="lab-ground-stamp"
        dangerouslySetInnerHTML={{
          __html: `${buildLabRootStampScript(ground.rootAttributes as unknown as Record<string, string>)};${buildThemePrepaintScript()}`,
        }}
      />
      {ground.css ? (
        <style
          id="rottay-runtime-tenant-theme"
          data-tenant={tenant}
          data-digest={ground.digest ?? undefined}
          dangerouslySetInnerHTML={{ __html: ground.css }}
        />
      ) : null}
      {/* Judging transforms are last so they win, and they carry a testid so a
          capture receipt can prove whether it was judged or plain. */}
      {ground.judgeCss ? (
        <style data-testid="lab-judge-mode" data-judge={judge} dangerouslySetInnerHTML={{ __html: ground.judgeCss }} />
      ) : null}
      <DesignSystemProvider
        forceEngine="modern"
        forceTheme="light"
        locale={ground.locale}
        tenantConfig={ground.tenantConfig as never}
        {...(ground.artifact
          ? { visualAuthority: { authority: 'compiled-artifact', artifact: ground.artifact } as never }
          : {})}
      >
        {children}
      </DesignSystemProvider>
    </>
  );
}
