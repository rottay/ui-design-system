/**
 * DB row -> reader -> validation -> compiler -> SSR embed -> hydration reuse.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT. This exercises the whole seam a real
 * request travels, starting from the JSONB payload as persisted. It does NOT
 * connect to a database: there is no DB harness in this package, so calling it
 * a "live DB" test would be a lie. What it proves is everything downstream of
 * the row read — which is precisely the part that can regress silently.
 *
 * The live `DB -> SSR -> browser` certification stays with Codex in R2.
 *
 * WHY IT IS SEPARATE FROM `db-row-canary.test.ts`. That file proves the
 * compiler's OUTPUT is correct and divergent. This one proves the PLUMBING:
 * that the reader assembles the envelope the compiler expects, that the SSR
 * embed carries what hydration needs to recognise it, and that hydration reuses
 * the server's artifact instead of recompiling a second, possibly different one.
 * A change can keep every value correct and still break the handover.
 */

import { describe, it, expect } from 'vitest';

import {
  THEMANAGEMENT_TENANT_THEME_DOCUMENT,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import { TENANT_THEME_V1_COVERAGE } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { resolveDocumentRootAttributes } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import {
  resolveVisualAuthority,
  appearanceMatchesArtifact,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  tenantThemeArtifactRootAttributes,
} from '..';

/**
 * The projection must agree with the compiler's own scope helper. Asserting the
 * EQUIVALENCE (rather than spreading both) keeps one runtime source while still
 * failing if the two ever drift apart.
 */
function scopeAttributesAgree(artifact: Parameters<typeof tenantThemeArtifactRootAttributes>[0]) {
  const fromCompiler = tenantThemeArtifactRootAttributes(artifact);
  const fromProjection = resolveDocumentRootAttributes({
    themeMode: 'light',
    engine: 'modern',
    locale: 'en',
    tenant: { slug: fromCompiler['data-tenant'], verticalKey: fromCompiler['data-vertical'] },
  });
  return (['data-ds-root', 'data-vertical', 'data-tenant'] as const).every(
    (key) => fromProjection[key] === fromCompiler[key],
  );
}

const ENVELOPE = getTenantThemeVerticalEnvelope(
  THEMANAGEMENT_TENANT_THEME_IDENTITY.verticalKey,
);

/**
 * The server request, end to end.
 *
 * `hydrateTenantThemeConfig` is the reader: it validates the JSONB and joins it
 * to the TRUSTED row columns. Identity never comes from the payload, so a
 * customer cannot restate their own tenant id.
 */
function renderOnServer() {
  const config = hydrateTenantThemeConfig(
    THEMANAGEMENT_TENANT_THEME_DOCUMENT,
    THEMANAGEMENT_TENANT_THEME_IDENTITY,
    { expectedIdentity: { slug: 'themanagement', verticalKey: 'bithire' } },
  );
  const artifact = compileTenantThemeConfig(config, { verticalEnvelope: ENVELOPE });

  return {
    artifact,
    // What the document actually carries: the scoped <style> and the root
    // attributes its selector needs to match.
    styleElement: {
      id: 'rottay-runtime-tenant-theme',
      'data-tenant': artifact.slug,
      'data-digest': artifact.digest,
      'data-compiler': artifact.compilerVersion,
      css: artifact.css,
    },
    // ONE source. This previously also spread `tenantThemeArtifactRootAttributes`,
    // which emits the same three tenant-scope attributes -- so the assertions
    // below could not fail: deleting the scope from the SSR projection was
    // silently repaired by the second spread. Two overlapping sources for one
    // attribute is exactly the duplication Phase 4 removed from the DOM, and it
    // hid here in the test harness.
    rootAttributes: resolveDocumentRootAttributes({
      themeMode: 'light',
      engine: 'modern',
      locale: 'en',
      tenant: { slug: artifact.slug, verticalKey: artifact.verticalKey },
    }),
  };
}

describe('DB row -> SSR embed', () => {
  it('reads identity from the trusted columns, never from the payload', () => {
    // The document deliberately has no identity fields. If the reader ever
    // started accepting them, a tenant could claim another tenant's scope.
    expect(THEMANAGEMENT_TENANT_THEME_DOCUMENT).not.toHaveProperty('tenantId');
    expect(THEMANAGEMENT_TENANT_THEME_DOCUMENT).not.toHaveProperty('slug');

    const { artifact } = renderOnServer();
    expect(artifact.slug).toBe('themanagement');
    expect(artifact.tenantId).toBe(THEMANAGEMENT_TENANT_THEME_IDENTITY.tenantId);
  });

  it('DRILL: fails closed when the row identity contradicts the request', () => {
    // The reader's whole reason for taking `expectedIdentity`. A row served for
    // the wrong tenant must throw, not render someone else's brand.
    expect(() =>
      hydrateTenantThemeConfig(
        THEMANAGEMENT_TENANT_THEME_DOCUMENT,
        THEMANAGEMENT_TENANT_THEME_IDENTITY,
        { expectedIdentity: { slug: 'bithire' } },
      ),
    ).toThrow();
  });

  it('embeds a style element whose selector the root attributes can match', () => {
    const { artifact, styleElement, rootAttributes } = renderOnServer();

    // The artifact scopes itself to `[data-ds-root][data-vertical][data-tenant]`.
    // If SSR stamps a different set, the CSS ships and matches nothing — a
    // failure that looks like "the tenant has no theme" rather than an error.
    expect(rootAttributes['data-ds-root']).toBe('');
    expect(rootAttributes['data-vertical']).toBe('bithire');
    expect(rootAttributes['data-tenant']).toBe('themanagement');
    expect(styleElement.css).toContain('themanagement');
    expect(styleElement['data-digest']).toBe(artifact.digest);
    // And the projection must not drift from the compiler's own scope helper.
    expect(scopeAttributesAgree(artifact)).toBe(true);
  });

  it('carries the engine and locale stamps in the same projection', () => {
    // One projection owns every root attribute, so SSR cannot emit a partial set.
    const { rootAttributes } = renderOnServer();
    expect(rootAttributes['data-engine']).toBe('modern');
    expect(rootAttributes.lang).toBe('en');
    expect(rootAttributes.dir).toBe('ltr');
    expect(rootAttributes['data-theme']).toBe('light');
  });
});

describe('SSR embed -> hydration reuse', () => {
  it('recognises the server artifact instead of compiling a second one', () => {
    // The property that makes hydration safe: the client declares the artifact
    // the server already mounted, and the resolver verifies rather than trusts.
    const server = renderOnServer();

    // The RSC/JSON boundary produces a structurally identical, referentially
    // distinct object. Round-tripping models that faithfully.
    const overWire = JSON.parse(JSON.stringify(server.artifact));

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: overWire },
      slug: overWire.slug,
      hasBundledArtifact: false,
      payload: {
        visualBranding: false,
        tokenOverrides: false,
        // The app retains the compiled appearance because the runtime still
        // READS it (density, motion dial, anatomy). It is an echo, not a
        // second authority, and the resolver must tell those apart.
        appearance: overWire.normalizedAppearance,
      },
    });

    expect(resolution.authority).toBe('compiled-artifact');
    expect(resolution.conflict).toBeNull();
    expect([...resolution.suppressedChannels].sort()).toEqual(
      [...TENANT_THEME_V1_COVERAGE].sort(),
    );
  });

  it('identifies the echo structurally, surviving the JSON boundary', () => {
    // Reference identity is unusable here: hydration always yields a distinct
    // object. If the echo test regressed to `===`, every correct tenant would
    // report double authority.
    const { artifact } = renderOnServer();
    const overWire = JSON.parse(JSON.stringify(artifact));

    expect(overWire.normalizedAppearance).not.toBe(artifact.normalizedAppearance);
    expect(
      appearanceMatchesArtifact(overWire.normalizedAppearance, artifact.normalizedAppearance),
    ).toBe(true);
  });

  it('DRILL: an authored override is NOT mistaken for the echo', () => {
    // The other direction. A payload that genuinely differs must be reported as
    // a conflict, or a second painter ships silently.
    const { artifact } = renderOnServer();
    const tampered = JSON.parse(JSON.stringify(artifact.normalizedAppearance));
    tampered.general = { ...(tampered.general ?? {}), density: 'compact' };

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact },
      slug: artifact.slug,
      hasBundledArtifact: false,
      payload: { visualBranding: false, tokenOverrides: false, appearance: tampered },
    });

    expect(resolution.conflict).not.toBeNull();
    // Suppression stays total under conflict: a reported ambiguity must never
    // become a second painter.
    expect([...resolution.suppressedChannels].sort()).toEqual(
      [...TENANT_THEME_V1_COVERAGE].sort(),
    );
  });

  it('reuses the server digest, so hydration cannot serve a stale artifact', () => {
    // Compiling the same row twice must agree; if it did not, the embedded CSS
    // and the hydrated declaration could describe different themes.
    expect(renderOnServer().artifact.digest).toBe(renderOnServer().artifact.digest);
  });
});
