// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  resolveVisualAuthority as resolveFromAdmission,
  verifyTenantThemeArtifactV1,
} from '../foundation/admission';
import {
  resolveVisualAuthority as resolveFromFacade,
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '..';
import { resolveVisualAuthority as resolveFromPublic } from '@/entrypoints/public/runtime/visual-authority';
import * as retention from '../runtime/retention';
import type { RuntimeVisualPayloadCensus } from '../foundation/admission';

/**
 * A hand-authored artifact fixture, NOT produced by `compileTenantThemeConfig`.
 * Its digest and CSS are literal values; the verifier must accept it exactly.
 */
const FIXTURE: TenantThemeArtifact = {
  schemaVersion: 1,
  tenantId: 'tenant_manual',
  slug: 'manual',
  verticalKey: 'rottay',
  rowVersion: 1,
  compilerVersion: 'tenant-theme-compiler@4',
  coverage: ['visual-branding', 'token-overrides', 'appearance', 'brand-chrome'] as const,
  normalizedAppearance: {},
  variables: { '--ds-color-primary': '#123456' },
  scopes: {
    root: {
      attribute: 'data-ds-root',
      selector: ':where([data-ds-root])',
    },
    vertical: {
      attribute: 'data-vertical',
      value: 'rottay',
      selector: ':where([data-ds-root][data-vertical="rottay"])',
    },
    tenant: {
      attribute: 'data-tenant',
      value: 'manual',
      selector: ':where([data-ds-root][data-tenant="manual"])',
    },
    combinedSelector: '[data-ds-root][data-vertical="rottay"][data-tenant][data-tenant="manual"]',
  },
  digest: 'sha256-0d97e85c7d2b63427c3d3f8317b0239b86f808e5d3d5f39c108b0f7977ea2c4c',
  css: '/* TenantThemeArtifact v1 | tenant-theme-compiler@4 | sha256-0d97e85c7d2b63427c3d3f8317b0239b86f808e5d3d5f39c108b0f7977ea2c4c */\n[data-ds-root][data-vertical="rottay"][data-tenant][data-tenant="manual"] {\n  --ds-color-primary: #123456;\n}\n',
};

const EMPTY_PAYLOAD: RuntimeVisualPayloadCensus = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: undefined,
  personality: false,
  brandTheme: false,
};

function mountArtifact(artifact: TenantThemeArtifact = FIXTURE): HTMLStyleElement {
  const style = document.createElement('style');
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
  return style;
}

describe('visual-authority admission', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('exports resolveVisualAuthority from public, facade and admission as one value', () => {
    expect(resolveFromPublic).toBe(resolveFromAdmission);
    expect(resolveFromFacade).toBe(resolveFromAdmission);
  });

  it('does not expose the retention ledger as part of the public export set', () => {
    expect('RETENTION_LEDGERS' in retention).toBe(false);
  });

  it('accepts the handcoded v1 artifact fixture', () => {
    expect(verifyTenantThemeArtifactV1(FIXTURE, {
      slug: FIXTURE.slug,
      verticalKey: FIXTURE.verticalKey,
    })).toEqual({ ok: true, artifact: expect.objectContaining({ digest: FIXTURE.digest }) });
  });

  it('resolves the handcoded fixture through all three entrypoints', () => {
    mountArtifact();
    const declaration = { authority: 'compiled-artifact' as const, artifact: FIXTURE };
    const input = {
      declaration,
      slug: FIXTURE.slug,
      verticalKey: FIXTURE.verticalKey,
      payload: EMPTY_PAYLOAD,
    };

    const fromAdmission = resolveFromAdmission(input);
    const fromFacade = resolveFromFacade(input);
    const fromPublic = resolveFromPublic(input);

    expect(fromAdmission.conflict).toBeNull();
    expect(fromAdmission.origin).toBe('compiled-envelope');
    expect(fromFacade).toEqual(fromAdmission);
    expect(fromPublic).toEqual(fromAdmission);
  });

  describe('hostile verifier mutants', () => {
    it.each([
      ['schemaVersion', { schemaVersion: 99 as unknown as 1 }, 'schemaVersion is not 1'],
      ['compilerVersion', { compilerVersion: 'tenant-theme-compiler@0' }, 'compilerVersion is not'],
      ['slug mismatch', { slug: 'other-tenant' }, 'slug'],
      ['verticalKey mismatch', { verticalKey: 'bithire' }, 'verticalKey'],
      ['coverage order', { coverage: [...FIXTURE.coverage].reverse() as unknown as typeof FIXTURE.coverage }, 'coverage is not the exact ordered v1 coverage'],
      ['coverage missing channel', { coverage: FIXTURE.coverage.slice(1) }, 'coverage is not the exact ordered v1 coverage'],
      ['coverage extra channel', { coverage: [...FIXTURE.coverage, 'visual-branding'] as unknown as typeof FIXTURE.coverage }, 'coverage is not the exact ordered v1 coverage'],
      ['scopes combinedSelector', { scopes: { ...FIXTURE.scopes, combinedSelector: ':root' } }, 'artifact scopes do not recompute from identity'],
      ['scopes tenant value', { scopes: { ...FIXTURE.scopes, tenant: { ...FIXTURE.scopes.tenant, value: 'not-the-tenant' } } }, 'artifact scopes do not recompute from identity'],
      ['variable non --ds-', { variables: { '--other': 'x' } }, 'variables are not an ordered --ds-* string map'],
    ] as const)('rejects a hostile %s mutation', (_label, patch, expectedError) => {
      const mutant = { ...FIXTURE, ...patch } as TenantThemeArtifact;
      const result = verifyTenantThemeArtifactV1(mutant, {
        slug: FIXTURE.slug,
        verticalKey: FIXTURE.verticalKey,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(new RegExp(expectedError.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
    });

    it('rejects a stale digest (variables changed)', () => {
      const mutant: TenantThemeArtifact = {
        ...FIXTURE,
        variables: { '--ds-color-primary': '#ff0000' },
      };
      const result = verifyTenantThemeArtifactV1(mutant, {
        slug: FIXTURE.slug,
        verticalKey: FIXTURE.verticalKey,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/digest does not recompute/);
    });

    it('rejects a CSS mutant even when the digest still matches', () => {
      // The v1 digest does NOT cover css, so a CSS rewrite can keep the same
      // digest while the bytes diverge. The deterministic CSS check catches it.
      const mutant: TenantThemeArtifact = {
        ...FIXTURE,
        css: `${FIXTURE.css}\n/* appended */\n`,
      };
      expect(mutant.digest).toBe(FIXTURE.digest);
      const result = verifyTenantThemeArtifactV1(mutant, {
        slug: FIXTURE.slug,
        verticalKey: FIXTURE.verticalKey,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/CSS is not the deterministic v1 rendering/);
    });

    it('rejects a digest mutant even when CSS still matches', () => {
      const forgedDigest = `sha256-${'0'.repeat(64)}`;
      const mutant: TenantThemeArtifact = {
        ...FIXTURE,
        digest: forgedDigest,
        css: FIXTURE.css.replace(FIXTURE.digest, forgedDigest),
      };
      expect(mutant.css).toContain(forgedDigest);
      const result = verifyTenantThemeArtifactV1(mutant, {
        slug: FIXTURE.slug,
        verticalKey: FIXTURE.verticalKey,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/digest does not recompute/);
    });
  });
});
