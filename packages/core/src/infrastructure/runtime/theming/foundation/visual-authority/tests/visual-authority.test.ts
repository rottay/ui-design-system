// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import {
  type TenantThemeArtifact,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  censusRuntimeVisualPayload,
  reportVisualAuthorityConflict,
  resetVisualAuthorityDiagnostics,
  resolveVisualAuthority,
  verifyMountedTenantThemeArtifact,
  verifyTenantThemeArtifactV1,
  type RuntimeVisualPayloadCensus,
} from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
    },
  }, {
    tenantId: 'tenant_themanagement',
    slug: 'themanagement',
    verticalKey: 'bithire',
    rowVersion: 7,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

const EMPTY_PAYLOAD: RuntimeVisualPayloadCensus = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: undefined,
  personality: false,
  brandTheme: false,
};

function mountArtifact(artifact: TenantThemeArtifact = ARTIFACT): HTMLStyleElement {
  const style = document.createElement('style');
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  return style;
}

function resolve(
  artifact: TenantThemeArtifact = ARTIFACT,
  payload: RuntimeVisualPayloadCensus = {
    ...EMPTY_PAYLOAD,
    appearance: ARTIFACT.normalizedAppearance as TenantAppearance,
  },
) {
  return resolveVisualAuthority({
    declaration: { authority: 'compiled-artifact', artifact },
    slug: ARTIFACT.slug,
    verticalKey: ARTIFACT.verticalKey,
    payload,
  });
}

describe('tenant visual authority', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    resetVisualAuthorityDiagnostics();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('recomputes and accepts every self-contained v1 invariant', () => {
    expect(verifyTenantThemeArtifactV1(ARTIFACT, {
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
    })).toEqual({ ok: true, artifact: ARTIFACT });
  });

  it.each([
    ['digest', { digest: `sha256-${'0'.repeat(64)}` }],
    ['css', { css: `${ARTIFACT.css}\n/* tampered */` }],
    ['slug', { slug: 'other' }],
    ['coverage', { coverage: ARTIFACT.coverage.slice(1) }],
    ['scopes', { scopes: { ...ARTIFACT.scopes, combinedSelector: ':root' } }],
  ] as const)('rejects a tampered %s', (_label, patch) => {
    expect(verifyTenantThemeArtifactV1({ ...ARTIFACT, ...patch }, {
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
    }).ok).toBe(false);
  });

  it('requires exactly one mounted element with exact style bytes', () => {
    expect(verifyMountedTenantThemeArtifact(ARTIFACT).ok).toBe(false);
    const style = mountArtifact();
    expect(verifyMountedTenantThemeArtifact(ARTIFACT)).toEqual({ ok: true, element: style });
    style.textContent = `${ARTIFACT.css}\n`;
    expect(verifyMountedTenantThemeArtifact(ARTIFACT)).toEqual({
      ok: false,
      error: 'mounted style bytes do not equal artifact.css',
    });
  });

  it('rejects a second artifact for the same tenant scope even with a different digest', () => {
    mountArtifact();
    const stale = mountArtifact({ ...ARTIFACT, digest: `sha256-${'0'.repeat(64)}` });
    expect(verifyMountedTenantThemeArtifact(ARTIFACT)).toEqual({
      ok: false,
      error: 'expected exactly one mounted artifact element, found 2',
    });
    stale.remove();
  });

  it('accepts only a verified, mounted artifact and its structural appearance echo', () => {
    expect(resolve().conflict).toMatch(/not mounted/);
    mountArtifact();
    const resolution = resolve();
    expect(resolution.conflict).toBeNull();
    expect(resolution.origin).toBe('compiled-envelope');
    // An owned snapshot, not the caller's object: equal in value, distinct in
    // identity, and frozen through the whole tree.
    expect(resolution.artifact).toEqual(ARTIFACT);
    expect(resolution.artifact).not.toBe(ARTIFACT);
    expect(Object.isFrozen(resolution.artifact)).toBe(true);
    expect(Object.isFrozen(resolution.artifact?.variables)).toBe(true);
    expect(Object.isFrozen(resolution.artifact?.scopes.tenant)).toBe(true);
    expect(Object.isFrozen(resolution.artifact?.coverage)).toBe(true);
  });

  it('retains artifact.css byte-exactly, including its trailing newline', () => {
    // The compiled rendering ends in a newline. A canonicalizing round trip
    // trims string edges, so retaining the artifact that way rejects every
    // valid artifact as "not the deterministic v1 rendering".
    expect(ARTIFACT.css.endsWith('}\n')).toBe(true);
    const verified = verifyTenantThemeArtifactV1(ARTIFACT, {
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
    });
    expect(verified.ok).toBe(true);
    expect(verified.ok && verified.artifact.css).toBe(ARTIFACT.css);
  });

  it('cannot be mutated through the caller reference after admission', () => {
    mountArtifact();
    const declared = structuredClone(ARTIFACT) as TenantThemeArtifact;
    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: declared },
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
      payload: { ...EMPTY_PAYLOAD, appearance: ARTIFACT.normalizedAppearance as TenantAppearance },
    });
    expect(resolution.conflict).toBeNull();

    (declared as { css: string }).css = ':root{--ds-color-primary:#ff0000}';
    (declared.variables as Record<string, string>)['--ds-color-primary'] = '#ff0000';
    expect(resolution.artifact?.css).toBe(ARTIFACT.css);
    expect(resolution.artifact?.variables).toEqual(ARTIFACT.variables);
  });

  it('rejects a declaration that is not plain JSON data', () => {
    class ExoticArtifact {}
    Object.assign(ExoticArtifact.prototype, ARTIFACT);
    expect(verifyTenantThemeArtifactV1(new ExoticArtifact(), {
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
    })).toEqual({ ok: false, error: 'artifact is not plain JSON data' });

    // A hole reads back as `undefined` and is skipped by `every`, so an ordered
    // coverage comparison would never see the missing channel.
    const holed = [...ARTIFACT.coverage] as unknown[];
    delete holed[0];
    expect(verifyTenantThemeArtifactV1({ ...ARTIFACT, coverage: holed }, {
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
    })).toEqual({ ok: false, error: 'artifact is not plain JSON data' });
  });

  it('reads each declared property once, so an accessor cannot swap the payload', () => {
    mountArtifact();
    let reads = 0;
    const declared = Object.defineProperty(
      { ...structuredClone(ARTIFACT) } as Record<string, unknown>,
      'css',
      {
        enumerable: true,
        get() {
          reads += 1;
          return reads === 1 ? ARTIFACT.css : ':root{--ds-color-primary:#ff0000}';
        },
      },
    ) as unknown as TenantThemeArtifact;

    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: declared },
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
      payload: { ...EMPTY_PAYLOAD, appearance: ARTIFACT.normalizedAppearance as TenantAppearance },
    });
    expect(reads).toBe(1);
    expect(resolution.conflict).toBeNull();
    expect(resolution.artifact?.css).toBe(ARTIFACT.css);
  });

  it('rejects bare declarations, raw visual fields, and no-artifact payloads', () => {
    expect(resolveVisualAuthority({
      declaration: 'compiled-artifact' as never,
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
      payload: EMPTY_PAYLOAD,
    }).origin).toBe('invalid-declaration');

    mountArtifact();
    expect(resolve(ARTIFACT, { ...EMPTY_PAYLOAD, visualBranding: true }).conflict)
      .toMatch(/raw visual branding/);

    expect(resolveVisualAuthority({
      slug: 'uncompiled',
      payload: { ...EMPTY_PAYLOAD, appearance: ARTIFACT.normalizedAppearance as TenantAppearance },
    }).origin).toBe('uncompiled-visual-payload');
  });

  it('does not infer ownership from a first-party-looking slug', () => {
    const resolution = resolveVisualAuthority({ slug: 'bithire', payload: EMPTY_PAYLOAD });
    expect(resolution).toMatchObject({
      authority: 'provider',
      origin: 'no-visual-payload',
      conflict: null,
      artifact: null,
    });
  });

  it('separates identity branding from raw visual payload without slug inference', () => {
    // The census only needs a valid BrandTheme presence witness; the previous
    // fixture invented a `general` family that BrandTheme never declared and
    // only compiled through a cast.
    const codeOwned: NonNullable<TenantConfig['brandTheme']> = {
      id: 'test-code-owned',
      name: 'Test Code Owned',
    };
    const identityConfig = {
      branding: { companyName: 'Acme', logo: '/logo.svg' },
      brandTheme: codeOwned,
    } as TenantConfig;
    expect(censusRuntimeVisualPayload(identityConfig))
      .toMatchObject({ visualBranding: false, brandTheme: true });

    expect(censusRuntimeVisualPayload({
      ...identityConfig,
      branding: { ...identityConfig.branding, primaryColor: '#123456' },
      brandTheme: { ...codeOwned },
    } as TenantConfig))
      .toMatchObject({ visualBranding: true, brandTheme: true });
  });

  it('counts declared tokenOverrides keys, not their leaves', () => {
    // The census reads `Object.keys(tokenOverrides).length > 0`, so a declared
    // section is a declared channel even when it carries no value. This is the
    // rule the provider's `tenantOverrides` merge used to violate from the other
    // side: it spread all seven sections unconditionally, which turned a tenant
    // with no visual payload into one carrying seven keys and got the mount
    // refused as `uncompiled-visual-payload`.
    const withConfig = (tokenOverrides: TenantConfig['tokenOverrides']) =>
      censusRuntimeVisualPayload({
        branding: { companyName: 'Acme' },
        tokenOverrides,
      } as TenantConfig).tokenOverrides;

    // The exact fabrication the merge used to produce.
    expect(withConfig({
      surface: {},
      motion: {},
      borderRadius: {},
      shadows: {},
      glass: {},
      gradients: {},
      overlays: {},
    })).toBe(true);
    // One empty section is still one declared channel.
    expect(withConfig({ surface: {} })).toBe(true);
    // A bare object declares nothing, so there is nothing to compile and
    // nothing to refuse.
    expect(withConfig({})).toBe(false);
  });

  it('reports a production conflict once and throws in development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    reportVisualAuthorityConflict('conflict', 'production');
    reportVisualAuthorityConflict('conflict', 'production');
    expect(error).toHaveBeenCalledTimes(1);
    expect(() => reportVisualAuthorityConflict('conflict', 'development')).toThrow('conflict');
  });
});
