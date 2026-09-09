/**
 * F-19: the mount is proven by SCOPE, not only by bytes.
 *
 * Admission used to verify the schema, the version, the slug, the vertical, the
 * tenant id, the row version, the digest and a deterministic re-render of the
 * CSS — and never ask whether the document root carried the attributes those
 * bytes are nested under. A document whose `<html>` had no `data-ds-root`
 * therefore admitted an artifact, reported `conflict: null`, and painted
 * nothing. That was the live state of app-platform.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { TENANT_THEME_V1_COVERAGE } from '@/foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';

import { resolveVisualAuthority, verifyTenantThemeArtifactScope } from '../foundation/admission';
import {
  clearTenantThemeScope,
  mountTenantThemeArtifactFixture,
  stampTenantThemeScope,
} from './mount-fixture';

const ARTIFACT: TenantThemeArtifact = compileTenantThemeConfig(
  hydrateTenantThemeConfig(
    {
      schemaVersion: 1,
      mode: 'simple',
      appearance: { palette: { primary: '#2F6B9A' }, density: 'compact' },
    },
    {
      tenantId: 'tenant_themanagement',
      slug: 'themanagement',
      verticalKey: 'bithire',
      rowVersion: 7,
    },
  ),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

const PAYLOAD = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: ARTIFACT.normalizedAppearance as TenantAppearance,
  personality: false,
  brandTheme: false,
};

const resolve = () =>
  resolveVisualAuthority({
    declaration: { authority: 'compiled-artifact', artifact: ARTIFACT },
    slug: ARTIFACT.slug,
    verticalKey: ARTIFACT.verticalKey,
    payload: PAYLOAD,
  });

beforeEach(() => {
  document.head.innerHTML = '';
  clearTenantThemeScope();
});

afterEach(() => {
  document.head.innerHTML = '';
  clearTenantThemeScope();
});

describe('admission proves scope, not only bytes', () => {
  it('refuses a byte-perfect artifact whose document root carries no scope', () => {
    mountTenantThemeArtifactFixture(ARTIFACT, { scope: false });

    const resolution = resolve();

    expect(resolution.conflictKind).toBe('scope');
    expect(resolution.origin).toBe('unscoped-mount');
    expect(resolution.conflict).toMatch(/does not carry data-ds-root/);
    // A refusal suppresses every channel: an artifact that cannot paint must
    // not leave a provider free to paint the ones it "did not cover".
    expect(resolution.artifact).toBeNull();
    expect([...resolution.suppressedChannels].sort()).toEqual(
      [...TENANT_THEME_V1_COVERAGE].sort(),
    );
  });

  it('admits the same artifact once the root carries the scope', () => {
    mountTenantThemeArtifactFixture(ARTIFACT);

    const resolution = resolve();

    expect(resolution.conflict).toBeNull();
    expect(resolution.conflictKind).toBeNull();
    expect(resolution.origin).toBe('compiled-envelope');
  });

  it('names the attribute that disagrees, one at a time', () => {
    mountTenantThemeArtifactFixture(ARTIFACT, { scope: false });
    const root = document.documentElement;

    root.setAttribute('data-ds-root', '');
    expect(resolve().conflict).toMatch(/carries data-vertical=null, not "bithire"/);

    root.setAttribute('data-vertical', 'bithire');
    expect(resolve().conflict).toMatch(/carries data-tenant=null, not "themanagement"/);

    // A neighbouring tenant's scope is not this tenant's scope.
    root.setAttribute('data-tenant', 'someone-else');
    expect(resolve().conflict).toMatch(/carries data-tenant="someone-else"/);

    root.setAttribute('data-tenant', 'themanagement');
    expect(resolve().conflict).toBeNull();
  });

  it('resolves a container search root against its own document root', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      expect(verifyTenantThemeArtifactScope(ARTIFACT, container).ok).toBe(false);
      stampTenantThemeScope(ARTIFACT);
      expect(verifyTenantThemeArtifactScope(ARTIFACT, container).ok).toBe(true);
    } finally {
      container.remove();
    }
  });
});
