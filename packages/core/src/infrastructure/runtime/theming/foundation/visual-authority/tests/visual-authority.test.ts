/**
 * @fileoverview Visual authority resolution tests - Rottay Design System
 * @description Pins that authority is resolved per CHANNEL from a declaration
 * carrying the artifact's provenance, and that simultaneous ownership is
 * reported without misreading the artifact's own compiled appearance.
 *
 * Two failures are guarded here, in opposite directions:
 * - fail-open: `visualAuthority = 'provider'` as a plain default parameter let
 *   provider emitters paint over a mounted server-compiled artifact silently;
 * - fail-closed: a lossy `hasRuntimeVisualPayload` boolean counted
 *   `Boolean(config.appearance)` as provider paint, so every correct DB tenant
 *   -- whose config echoes `artifact.normalizedAppearance` because the runtime
 *   must still READ it -- reported double authority and threw in development.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { TenantAppearance } from '@/foundation/contracts/composition/tenants/themes';
import {
  TENANT_THEME_V1_COVERAGE,
  TENANT_VISUAL_CHANNELS,
  type TenantThemeArtifact,
  type TenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';

import {
  appearanceMatchesArtifact,
  resolveVisualAuthority,
  reportVisualAuthorityConflict,
  resetVisualAuthorityDiagnostics,
  type CompiledArtifactDeclaration,
  type RuntimeVisualPayloadCensus,
} from '..';

const TENANT_DOCUMENT = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
    },
    advanced: {
      chrome: { sidebar: { bg: '#101014' } },
      tokenOverrides: { '--ds-radius-md': '10px' },
    },
  },
} as const;

/** A real compiled artifact: the echo must be the compiler's own output. */
const ARTIFACT: TenantThemeArtifact = compileTenantThemeConfig(
  hydrateTenantThemeConfig(TENANT_DOCUMENT, {
    tenantId: 'tenant_themanagement',
    slug: 'themanagement',
    verticalKey: 'bithire',
    rowVersion: 7,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

const DECLARATION: CompiledArtifactDeclaration = {
  authority: 'compiled-artifact',
  artifact: {
    digest: ARTIFACT.digest,
    compilerVersion: ARTIFACT.compilerVersion,
    coverage: ARTIFACT.coverage,
    normalizedAppearance: ARTIFACT.normalizedAppearance,
  },
};

/** What `buildTenantConfig` puts on `TenantConfig.appearance` for a DB tenant. */
const ECHO = ARTIFACT.normalizedAppearance as TenantAppearance;

const EMPTY_PAYLOAD: RuntimeVisualPayloadCensus = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: undefined,
};

const BASE = { slug: 'acme', hasBundledArtifact: false, payload: EMPTY_PAYLOAD };

function payload(overrides: Partial<RuntimeVisualPayloadCensus>): RuntimeVisualPayloadCensus {
  return { ...EMPTY_PAYLOAD, ...overrides };
}

function declarationWithCoverage(
  coverage: readonly TenantVisualChannel[],
): CompiledArtifactDeclaration {
  return { ...DECLARATION, artifact: { ...DECLARATION.artifact, coverage } };
}

describe('resolveVisualAuthority', () => {
  describe('compiled envelope: the echo is not a second authority', () => {
    it('accepts the artifact appearance echoed back through the config', () => {
      // THE FIX. This exact input threw in development for every correct
      // DB-backed tenant, because the config legitimately carries the
      // artifact's own compiled appearance so the runtime can read density,
      // the motion dial, backgroundMode, the recipe profile and anatomy.
      const resolution = resolveVisualAuthority({
        ...BASE,
        slug: 'themanagement',
        declaration: DECLARATION,
        payload: payload({ appearance: ECHO }),
      });

      expect(resolution.conflict).toBeNull();
      expect(resolution.authority).toBe('compiled-artifact');
      expect(resolution.origin).toBe('compiled-envelope');
      expect(resolution.suppressedChannels).toEqual([...ARTIFACT.coverage]);
    });

    it('detects the echo across the RSC/JSON boundary, without referential identity', () => {
      // `initialRuntimeTheme` is serialized by the server and deserialized in
      // the browser, so the hydrated appearance is never the same object.
      const serialized = JSON.parse(
        JSON.stringify({ declaration: DECLARATION, appearance: ECHO }),
      ) as { declaration: CompiledArtifactDeclaration; appearance: TenantAppearance };

      expect(serialized.appearance).not.toBe(ECHO);
      expect(serialized.declaration.artifact.normalizedAppearance).not.toBe(
        DECLARATION.artifact.normalizedAppearance,
      );

      const resolution = resolveVisualAuthority({
        ...BASE,
        slug: 'themanagement',
        declaration: serialized.declaration,
        payload: payload({ appearance: serialized.appearance }),
      });

      expect(resolution.conflict).toBeNull();
      expect(resolution.suppressedChannels).toEqual([...ARTIFACT.coverage]);
    });

    it('keeps the bridge mounted because personality is outside v1 coverage', () => {
      // Personality is a subordinate product/vertical data axis. Its
      // namespaced bridge remains mounted while the static projection retains
      // sole ownership of canonical component aliases.
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: DECLARATION,
        payload: payload({ appearance: ECHO }),
      });

      expect(TENANT_THEME_V1_COVERAGE).not.toContain('personality');
      expect(resolution.suppressedChannels).not.toContain('personality');
    });

    it('suppresses a channel the coverage adds, so the artifact wins it deterministically', () => {
      // The rollback lever: coverage is declarative, so a future artifact that
      // compiles personality suppresses the bridge and wins the contested
      // channel without any code change here.
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: declarationWithCoverage([...TENANT_THEME_V1_COVERAGE, 'personality']),
        payload: payload({ appearance: ECHO }),
      });

      expect(resolution.suppressedChannels).toContain('personality');
    });

    it('leaves an uncovered channel open to the provider', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: declarationWithCoverage(['appearance']),
        payload: payload({ appearance: ECHO, visualBranding: true, tokenOverrides: true }),
      });

      expect(resolution.suppressedChannels).toEqual(['appearance']);
      // Branding/tokenOverrides are not a competing authority when the artifact
      // never claimed them, so they emit and nothing is reported.
      expect(resolution.conflict).toBeNull();
    });
  });

  describe('compiled envelope: authored payload is still reported', () => {
    it('reports an appearance that differs from the artifact by a single key', () => {
      const authored = {
        ...ECHO,
        general: {
          ...ECHO.general,
          palette: { ...ECHO.general?.palette, primary: '#B3001B' },
        },
      } as TenantAppearance;

      const resolution = resolveVisualAuthority({
        ...BASE,
        slug: 'themanagement',
        declaration: DECLARATION,
        payload: payload({ appearance: authored }),
      });

      expect(resolution.conflict).toMatch(
        /an uncompiled appearance override for tenant "themanagement"/,
      );
      // Suppression stays total under conflict: a reported ambiguity must
      // never degrade into a second painter.
      expect(resolution.suppressedChannels).toEqual([...ARTIFACT.coverage]);
    });

    it('reports uncompiled visual branding', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: DECLARATION,
        payload: payload({ appearance: ECHO, visualBranding: true }),
      });

      expect(resolution.conflict).toMatch(/uncompiled visual branding under compiled-artifact/);
    });

    it('reports uncompiled tokenOverrides', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: DECLARATION,
        payload: payload({ appearance: ECHO, tokenOverrides: true }),
      });

      expect(resolution.conflict).toMatch(/uncompiled tokenOverrides under compiled-artifact/);
    });

    it('does not report identity-only branding', () => {
      // companyName/logo/favicon are identity, not paint. The census reports
      // `visualBranding: false` for them, so a DB tenant that only names
      // itself is not a second authority.
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: DECLARATION,
        payload: payload({ appearance: ECHO, visualBranding: false }),
      });

      expect(resolution.conflict).toBeNull();
    });

    it('fails closed in development on an authored override', () => {
      const authored = { ...ECHO, general: { ...ECHO.general, density: 'spacious' } } as TenantAppearance;
      const { conflict } = resolveVisualAuthority({
        ...BASE,
        declaration: DECLARATION,
        payload: payload({ appearance: authored }),
      });

      expect(conflict).not.toBeNull();
      expect(() => reportVisualAuthorityConflict(conflict as string, 'development')).toThrow(
        /uncompiled appearance override/,
      );
    });
  });

  describe('bare string declaration stays unverifiable and fail-closed', () => {
    it('suppresses all five channels', () => {
      const resolution = resolveVisualAuthority({ ...BASE, declaration: 'compiled-artifact' });

      expect(resolution.authority).toBe('compiled-artifact');
      expect(resolution.origin).toBe('explicit');
      expect([...resolution.suppressedChannels].sort()).toEqual(
        [...TENANT_VISUAL_CHANNELS].sort(),
      );
    });

    it('reports ANY payload, including an appearance that would be a valid echo', () => {
      // Without the artifact there is nothing to compare against, so the
      // previous behavior is preserved exactly rather than guessed at.
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: 'compiled-artifact',
        payload: payload({ appearance: ECHO }),
      });

      expect(resolution.conflict).toMatch(/Two\s+authorities would paint the same variables/);
      expect([...resolution.suppressedChannels].sort()).toEqual(
        [...TENANT_VISUAL_CHANNELS].sort(),
      );
    });

    it('reports nothing when no payload competes', () => {
      expect(resolveVisualAuthority({ ...BASE, declaration: 'compiled-artifact' }).conflict)
        .toBeNull();
    });

    it('honors a bare provider string with no suppression', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        declaration: 'provider',
        payload: payload({ appearance: ECHO, visualBranding: true, tokenOverrides: true }),
      });

      expect(resolution.authority).toBe('provider');
      expect(resolution.suppressedChannels).toEqual([]);
      expect(resolution.conflict).toBeNull();
    });
  });

  describe('derivation when no declaration is supplied', () => {
    it.each(['rottay', 'bithire', 'evnto'])(
      'gives the %s bundled vertical compiled authority over v1 paint',
      (slug) => {
        // The first-party bundle is already a compiled artifact. Leaving the
        // provider paint channels open would run the static and runtime
        // emitters together and let source order choose the winner.
        const resolution = resolveVisualAuthority({
          ...BASE,
          slug,
          hasBundledArtifact: true,
          payload: payload({ visualBranding: true, tokenOverrides: true }),
        });

        expect(resolution.authority).toBe('compiled-artifact');
        expect(resolution.origin).toBe('bundled-vertical');
        expect(resolution.suppressedChannels).toEqual(TENANT_THEME_V1_COVERAGE);
        expect(resolution.suppressedChannels).not.toContain('personality');
        expect(resolution.conflict).toBeNull();
      },
    );

    it('requires an explicit provider declaration to reopen a bundled paint path', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        slug: 'bithire',
        hasBundledArtifact: true,
        declaration: { authority: 'provider' },
        payload: payload({ visualBranding: true, tokenOverrides: true }),
      });

      expect(resolution.authority).toBe('provider');
      expect(resolution.origin).toBe('explicit');
      expect(resolution.suppressedChannels).toEqual([]);
    });

    it('separates a DB-sourced tenant from a tenant with no payload at all', () => {
      const db = resolveVisualAuthority({ ...BASE, payload: payload({ appearance: ECHO }) });
      const bare = resolveVisualAuthority(BASE);

      expect(db.origin).toBe('db-tenant');
      expect(bare.origin).toBe('no-visual-payload');
      expect(db.authority).toBe('provider');
      expect(db.suppressedChannels).toEqual([]);
    });

    it('honors a typed provider declaration over the derived origin', () => {
      const resolution = resolveVisualAuthority({
        ...BASE,
        slug: 'bithire',
        hasBundledArtifact: true,
        declaration: { authority: 'provider' },
      });

      expect(resolution.origin).toBe('explicit');
      expect(resolution.suppressedChannels).toEqual([]);
    });
  });

  describe('invalid declarations throw instead of falling back', () => {
    it.each([
      ['an unknown string', 'artifact'],
      ['a null declaration', null],
      ['an unknown authority', { authority: 'compiled' }],
      ['a compiled declaration with no artifact', { authority: 'compiled-artifact' }],
      [
        'a coverage entry outside the channel vocabulary',
        {
          authority: 'compiled-artifact',
          artifact: { ...DECLARATION.artifact, coverage: ['appearance', 'typography'] },
        },
      ],
      [
        'a duplicated coverage entry',
        {
          authority: 'compiled-artifact',
          artifact: { ...DECLARATION.artifact, coverage: ['appearance', 'appearance'] },
        },
      ],
      [
        'a coverage that is not an array',
        {
          authority: 'compiled-artifact',
          artifact: { ...DECLARATION.artifact, coverage: 'appearance' },
        },
      ],
    ])('throws on %s', (_label, declaration) => {
      // A silent fallback is exactly the fail-open behavior being replaced.
      expect(() =>
        resolveVisualAuthority({ ...BASE, declaration: declaration as never }),
      ).toThrow(/Invalid visualAuthority/);
    });
  });
});

describe('appearanceMatchesArtifact', () => {
  it('is insensitive to key order and edge whitespace, like the compiler digest', () => {
    const reordered = JSON.parse(
      JSON.stringify({ advanced: ECHO.advanced, general: ECHO.general }),
    ) as TenantAppearance;

    expect(appearanceMatchesArtifact(reordered, ARTIFACT.normalizedAppearance)).toBe(true);
  });

  it('rejects a payload the compiler cannot canonicalize', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    expect(
      appearanceMatchesArtifact(cyclic as TenantAppearance, ARTIFACT.normalizedAppearance),
    ).toBe(false);
  });
});

describe('reportVisualAuthorityConflict', () => {
  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetVisualAuthorityDiagnostics();
  });

  it('fails closed in development', () => {
    expect(() => reportVisualAuthorityConflict('two owners', 'development')).toThrow(
      /two owners/,
    );
  });

  it('reports without throwing in production', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => reportVisualAuthorityConflict('two owners', 'production')).not.toThrow();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('reports only once in production', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportVisualAuthorityConflict('two owners', 'production');
    reportVisualAuthorityConflict('two owners', 'production');

    expect(error).toHaveBeenCalledTimes(1);
  });
});
