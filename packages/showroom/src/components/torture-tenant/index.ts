/**
 * Which tenant a torture query addresses, and what the document must stamp so
 * the FIRST painted frame is already that tenant's.
 *
 * The probe previously resolved all of this inside `'use client'` components,
 * so the tenant only reached `<html>` in a layout effect. Everything before
 * that effect painted the DS default, which is dark on a bare `:root` — light
 * and tenant values activate exclusively through html-anchored selectors.
 *
 * This module is therefore PURE and server-safe: no React, no DOM, no relative
 * import and no JSON module. That is deliberate rather than incidental — the
 * file the Next build compiles is the same file the first-paint assertion loads
 * directly under `node --experimental-strip-types`, so the assertion cannot
 * drift from the code that serves the bytes. The published DB specimen is an
 * INPUT for the same reason: supplying it is the composition root's job.
 */

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  resolveDocumentRootAttributes,
  type DocumentRootAttributes,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

export type TortureFixture =
  | 'torture-dark'
  | 'torture-light'
  | 'rottay'
  | 'bithire'
  | 'evnto'
  | 'themanagementmiami';

export const TORTURE_FIXTURES: TortureFixture[] = [
  'torture-dark',
  'torture-light',
  'rottay',
  'bithire',
  'evnto',
  'themanagementmiami',
];

/** Engines the probe may render. The spec's own test compares modern against rustic. */
export type ProbeEngine = 'modern' | 'rustic' | 'classic';

export type ManagementFixtureSource = 'legacy-brand-fixture' | 'canonical-db';

/** Vertical baselines that resolve through the known-tenant registry. */
export const KNOWN_TENANT_FIXTURES: ReadonlySet<TortureFixture> = new Set([
  'rottay',
  'bithire',
  'evnto',
]);

/** Fixtures that render clear-mode (light) rather than the torture fixtures' dark/light pairing. */
const LIGHT_FORCED_FIXTURES: ReadonlySet<TortureFixture> = new Set([
  'torture-light',
  'bithire',
  'themanagementmiami',
]);

/**
 * Ground the differential probe should wait for before capturing: torture-dark
 * and rottay both paint dark; torture-light, bithire, and themanagementmiami
 * all paint a light/clear-mode ground.
 */
export function surfaceGroundFor(fixture: TortureFixture): 'dark' | 'light' {
  return LIGHT_FORCED_FIXTURES.has(fixture) ? 'light' : 'dark';
}

/**
 * Vertical scope key per fixture whose compiled CSS already ships inside the DS
 * bundle. The key is the VERTICAL, not the slug: rottay's bundled artifact is
 * scoped to `data-vertical='rottay'`, and stamping its slug there would ship
 * a scope no rule matches.
 */
const BUNDLED_VERTICAL_BY_FIXTURE: Partial<Record<TortureFixture, string>> = {
  rottay: 'rottay',
  bithire: 'bithire',
  evnto: 'evnto',
};

/** The published canary row: JSONB payload plus the trusted identity columns. */
export interface TortureThemeSpecimen {
  document: unknown;
  identity: { tenantId: string; slug: string; verticalKey: string; rowVersion: number };
}

/**
 * The published DB document through the real validator and the production
 * compiler. Deterministic by construction — a pure function of a frozen
 * specimen — so the server embed and the client declaration compile to the
 * same digest without either having to send the artifact to the other.
 */
export function compileCanonicalManagementArtifact(
  specimen: TortureThemeSpecimen,
): TenantThemeArtifact {
  const envelope = getTenantThemeVerticalEnvelope(specimen.identity.verticalKey);
  if (!envelope) {
    throw new Error(`No tenant-theme envelope for ${specimen.identity.verticalKey}`);
  }

  const hydrated = hydrateTenantThemeConfig(specimen.document, specimen.identity);
  return compileTenantThemeConfig(hydrated, { verticalEnvelope: envelope });
}

/** Next's `searchParams` shape. */
export type TortureQuery = Record<string, string | string[] | undefined>;

export function readQueryValue(query: TortureQuery, key: string): string | null {
  const raw = query[key];
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

export function sanitizeFixture(raw: string | null): TortureFixture {
  return raw && (TORTURE_FIXTURES as string[]).includes(raw)
    ? (raw as TortureFixture)
    : 'torture-dark';
}

export function sanitizeEngine(raw: string | null): ProbeEngine {
  return raw === 'rustic' || raw === 'classic' ? raw : 'modern';
}

export interface TortureFirstPaintPlan {
  fixture: TortureFixture;
  engine: ProbeEngine;
  ground: 'dark' | 'light';
  rtl: boolean;
  managementSource: ManagementFixtureSource;
  /**
   * The governed root attribute set, or `null` when this fixture's settled
   * ground is not deterministic from bundled or compiled CSS. A null plan
   * stamps nothing: the torture fixtures compile their BrandTheme inside
   * TortureSurface itself at render time (client-side, via `compileTheme`,
   * mounted as a `<style>` element), so an early server stamp would activate a
   * scope whose declarations do not exist yet and could not match the settled
   * render.
   */
  rootAttributes: DocumentRootAttributes | null;
  /** Compiled artifact CSS to embed. Empty when the tenant's CSS is bundled. */
  css: string;
  /** Present only on the compiled-DB path. */
  artifact: TenantThemeArtifact | null;
}

export interface ResolveTortureFirstPaintOptions {
  /** The published canary row the canonical-db path compiles. */
  specimen: TortureThemeSpecimen;
}

/**
 * Resolves the first-paint plan from the query string alone.
 *
 * Both tenant paths that R0 binds resolve to a stamp:
 *   - `bithire` scopes the artifact the DS bundle already carries
 *   - `themanagementmiami` + `tenantSource=canonical-db` compiles the published
 *     document here and carries its CSS in `plan.css`
 *
 * Every other fixture keeps the historical provider-owned path untouched.
 */
export function resolveTortureFirstPaint(
  query: TortureQuery,
  { specimen }: ResolveTortureFirstPaintOptions,
): TortureFirstPaintPlan {
  const fixture = sanitizeFixture(readQueryValue(query, 'fixture'));
  const engine = sanitizeEngine(readQueryValue(query, 'engine'));
  const rtl = readQueryValue(query, 'rtl') === '1';
  const managementSource: ManagementFixtureSource =
    readQueryValue(query, 'tenantSource') === 'canonical-db'
      ? 'canonical-db'
      : 'legacy-brand-fixture';
  const ground = surfaceGroundFor(fixture);
  const locale = rtl ? 'ar' : 'en';

  const base = { fixture, engine, ground, rtl, managementSource } as const;

  if (fixture === 'themanagementmiami' && managementSource === 'canonical-db') {
    const artifact = compileCanonicalManagementArtifact(specimen);
    return {
      ...base,
      rootAttributes: resolveDocumentRootAttributes({
        themeMode: ground,
        engine,
        locale,
        tenant: { slug: artifact.slug, verticalKey: artifact.verticalKey },
      }),
      css: artifact.css,
      artifact,
    };
  }

  const verticalKey = BUNDLED_VERTICAL_BY_FIXTURE[fixture];
  if (verticalKey) {
    return {
      ...base,
      rootAttributes: resolveDocumentRootAttributes({
        themeMode: ground,
        engine,
        locale,
        tenant: { slug: fixture, verticalKey },
      }),
      css: '',
      artifact: null,
    };
  }

  return { ...base, rootAttributes: null, css: '', artifact: null };
}

/**
 * The stamp, as a string for `dangerouslySetInnerHTML`.
 *
 * It writes the projection above and the two surfaces the theme provider later
 * claims (`.dark`, `color-scheme`) and nothing else. Claiming is why this is
 * safe: the client providers replace these exact stamps and restore them on
 * cleanup, so the ground simply arrives earlier instead of gaining a second
 * owner. `base` deliberately leaves `color-scheme` to the stylesheet that
 * declares it, exactly as the provider does.
 */
export function buildRootStampScript(attributes: DocumentRootAttributes): string {
  const payload = JSON.stringify(attributes);
  return (
    '(function(){try{' +
    'var r=document.documentElement,a=' +
    payload +
    ';' +
    'for(var k in a)r.setAttribute(k,a[k]);' +
    'var t=a["data-theme"];' +
    'r.classList.toggle("dark",t==="dark");' +
    'if(t!=="base")r.style.colorScheme=t;' +
    '}catch(e){}})()'
  );
}
