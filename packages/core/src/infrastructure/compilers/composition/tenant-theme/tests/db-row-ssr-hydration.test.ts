/**
 * DB row -> reader -> validation -> compiler -> SSR embed -> hydration reuse.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT. This exercises the whole seam a real
 * request travels, starting from the JSONB payload as persisted. It does NOT
 * connect to a database: there is no DB harness in this package, so calling it
 * a "live DB" test would be a lie. What it proves is everything downstream of
 * the row read — which is precisely the part that can regress silently.
 *
 * The live `DB -> SSR -> browser` certification stays with independent code audit in R2.
 *
 * WHY IT IS SEPARATE FROM `db-row-canary.test.ts`. That file proves the
 * compiler's OUTPUT is correct and divergent. This one proves the PLUMBING:
 * that the reader assembles the envelope the compiler expects, that the SSR
 * embed carries what hydration needs to recognise it, and that hydration reuses
 * the server's artifact instead of recompiling a second, possibly different one.
 * A change can keep every value correct and still break the handover.
 */

import { afterEach, describe, it, expect } from 'vitest';

import {
  THEMANAGEMENT_TENANT_THEME_DOCUMENT,
  THEMANAGEMENT_TENANT_THEME_IDENTITY,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row';
import { TENANT_THEME_V1_COVERAGE } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { resolveDocumentRootAttributes } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import { resolveEngine } from '@/infrastructure/runtime/engines/runtime/resolution';
import {
  getKnownTenantConfig,
  getKnownTenantSlugs,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  resolveVisualAuthority,
  appearanceMatchesArtifact,
  emitTenantThemeArtifactForSsr,
  type TenantThemeArtifactSsrEmission,
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

  // What the document actually carries. This used to be a hand-built object
  // literal, so the test asserted against the HARNESS's idea of the embed --
  // an element id and attribute names (`data-digest`, `data-compiler`) that no
  // production path ever wrote. The runtime now owns the emission, so the
  // assertions below are about the bytes and attributes a real request ships.
  const emission = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });

  return {
    artifact,
    emission,
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
    const { artifact, emission, rootAttributes } = renderOnServer();

    // The artifact scopes itself to `[data-ds-root][data-vertical][data-tenant]`.
    // If SSR stamps a different set, the CSS ships and matches nothing — a
    // failure that looks like "the tenant has no theme" rather than an error.
    expect(rootAttributes['data-ds-root']).toBe('');
    expect(rootAttributes['data-vertical']).toBe('bithire');
    expect(rootAttributes['data-tenant']).toBe('themanagement');
    expect(emission.css).toContain('themanagement');
    expect(emission.attributes[TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE]).toBe(artifact.digest);
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

  /**
   * WHY that stamp reads `modern`, and why nothing else proves it.
   *
   * The block above asserts the value. This one asserts the AUTHORITY behind
   * the value: the vertical preset is the sole author of the engine, and a
   * first-party tenant carries no engine of its own.
   *
   * `resolveEngine` consults `verticalEngine` before `tenantEngine` and returns
   * unconditionally when it is truthy. Every first-party vertical preset
   * declares `modern`, so the tenant branch is unreachable for these slugs.
   * That is exactly what makes the absence unguardable by behaviour: putting
   * `engine: entry.engine` back on the `createKnownTenant` literal feeds a
   * branch nothing can reach, so it changes no output anywhere. Measured, not
   * assumed -- with the key replanted, 286 tests across the tenant, engine and
   * system suites stayed green and `tsc` stayed at zero errors.
   *
   * So the fence has to be stated as a fact about the registry rather than
   * inferred from a rendered result. An own-property check rather than a
   * truthiness check: an explicit `engine: undefined` would be the same defect
   * wearing a disguise -- a second authority declared over a decision the
   * vertical already owns. `Object.prototype.hasOwnProperty.call` rather than
   * `Object.hasOwn`, which is ES2022; this package targets ES2020 and the test
   * project's lib is ES2021, and a test is not a reason to move either.
   */
  it('proves the engine stamp has one author: no first-party tenant carries an engine', () => {
    const slugs = getKnownTenantSlugs();
    expect(slugs.length).toBeGreaterThan(0);

    for (const slug of slugs) {
      const config = getKnownTenantConfig(slug);
      // Explicit failure rather than `?.` or `!`: a slug the registry lists but
      // cannot resolve is itself the bug, and must not be skipped silently.
      if (!config) {
        throw new Error(`getKnownTenantSlugs() listed "${slug}" but getKnownTenantConfig() returned undefined`);
      }

      expect(Object.prototype.hasOwnProperty.call(config, 'engine'), slug).toBe(false);

      // The other half of the same fact: even when the tenant's own engine is
      // handed to the resolver alongside the vertical's, the vertical decides.
      expect(
        resolveEngine({
          verticalEngine: 'modern',
          tenantEngine: config.engine,
          tenantSlug: config.slug,
        }),
        slug,
      ).toBe('modern');
    }
  });
});

/**
 * Mount what the server emitted, byte for byte.
 *
 * The hydrating client does not build this element — it INHERITS it from the
 * SSR stream. Constructing it from `emission` rather than from the artifact is
 * what keeps the two legs honest: if the emitter ever stopped stamping a proof
 * attribute, hydration would stop recognising the mount here instead of the
 * harness quietly supplying what production forgot.
 */
const mountedElements: HTMLStyleElement[] = [];

function mountServerEmission(emission: TenantThemeArtifactSsrEmission): HTMLStyleElement {
  const style = document.createElement('style');
  for (const [name, value] of Object.entries(emission.attributes)) {
    style.setAttribute(name, value);
  }
  style.textContent = emission.css;
  document.head.appendChild(style);
  mountedElements.push(style);
  return style;
}

afterEach(() => {
  while (mountedElements.length > 0) mountedElements.pop()?.remove();
});

describe('SSR embed -> hydration reuse', () => {
  it('admits the server render against its own emission receipt', () => {
    // The server leg. There is no DOM to observe, so the resolver may not fall
    // back to "trust the declaration": it admits only because the design system
    // itself produced these bytes and minted a receipt bound to them.
    const { artifact, emission } = renderOnServer();

    const resolution = resolveVisualAuthority({
      declaration: {
        authority: 'compiled-artifact',
        artifact,
        ssrReceipt: emission.receipt,
      },
      slug: artifact.slug,
      verticalKey: artifact.verticalKey,
      payload: {
        visualBranding: false,
        tokenOverrides: false,
        appearance: artifact.normalizedAppearance,
        personality: false,
        brandTheme: false,
      },
      documentRoot: null,
    });

    expect(resolution.authority).toBe('compiled-artifact');
    expect(resolution.origin).toBe('ssr-emission-receipt');
    expect(resolution.conflict).toBeNull();
    // Emission is not observation. Nothing on the server may claim a mounted
    // element; only the client can prove that, and it does so below.
    expect(resolution.mountedArtifact).toBeNull();
    expect([...resolution.suppressedChannels].sort()).toEqual(
      [...TENANT_THEME_V1_COVERAGE].sort(),
    );
  });

  it('recognises the server artifact instead of compiling a second one', () => {
    // The property that makes hydration safe: the client declares the artifact
    // the server already mounted, and the resolver verifies rather than trusts.
    const server = renderOnServer();
    const serverElement = mountServerEmission(server.emission);

    // The RSC/JSON boundary produces a structurally identical, referentially
    // distinct object. Round-tripping models that faithfully.
    const overWire = JSON.parse(JSON.stringify(server.artifact));

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: overWire },
      slug: overWire.slug,
      verticalKey: overWire.verticalKey,
      payload: {
        visualBranding: false,
        tokenOverrides: false,
        // The app retains the compiled appearance because the runtime still
        // READS it (density, motion dial, anatomy). It is an echo, not a
        // second authority, and the resolver must tell those apart.
        appearance: overWire.normalizedAppearance,
        personality: false,
        brandTheme: false,
      },
    });

    expect(resolution.authority).toBe('compiled-artifact');
    expect(resolution.origin).toBe('compiled-envelope');
    // "Reuse" is only meaningful if the proof is the SERVER's element. A client
    // that recompiled and mounted its own would satisfy every other assertion
    // here; identity is what distinguishes reuse from a second compile.
    expect(resolution.mountedArtifact).toBe(serverElement);
    expect(resolution.conflict).toBeNull();
    expect([...resolution.suppressedChannels].sort()).toEqual(
      [...TENANT_THEME_V1_COVERAGE].sort(),
    );
  });

  it('DRILL: hydration refuses an artifact the server never mounted', () => {
    // Deliberately no `mountServerEmission`. The declaration is otherwise
    // perfect — correct tenant, correct digest, correct bytes — and it must
    // still be refused, because on the client the mount is observable and
    // therefore mandatory. A receipt is the server's affordance, not a way for
    // a browser to skip the one check it is actually able to run.
    const { artifact } = renderOnServer();
    const overWire = JSON.parse(JSON.stringify(artifact));

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: overWire },
      slug: overWire.slug,
      verticalKey: overWire.verticalKey,
      payload: {
        visualBranding: false,
        tokenOverrides: false,
        appearance: undefined,
        personality: false,
        brandTheme: false,
      },
    });

    expect(resolution.origin).toBe('invalid-declaration');
    expect(resolution.conflict).toMatch(/artifact is not mounted/);
    expect(resolution.artifact).toBeNull();
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
    const { artifact, emission } = renderOnServer();

    // The mount is genuine, so the appearance mismatch is the ONLY thing wrong.
    // Without this the drill passed for the wrong reason: the resolver blocked
    // on "not mounted" and `conflict !== null` was satisfied, which means it
    // would have stayed green with the echo comparison deleted outright.
    mountServerEmission(emission);

    const tampered = JSON.parse(JSON.stringify(artifact.normalizedAppearance));
    tampered.general = { ...(tampered.general ?? {}), density: 'compact' };
    // Guards the tamper itself: if the fixture ever compiles to `compact`, the
    // line above becomes a no-op and this drill would assert nothing.
    expect(appearanceMatchesArtifact(tampered, artifact.normalizedAppearance)).toBe(false);

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact },
      slug: artifact.slug,
      verticalKey: artifact.verticalKey,
      payload: {
        visualBranding: false,
        tokenOverrides: false,
        appearance: tampered,
        personality: false,
        brandTheme: false,
      },
    });

    expect(resolution.conflict).toMatch(/raw appearance differs from the artifact/);
    expect(resolution.conflict).not.toMatch(/is not mounted/);
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
