import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS,
  PREVIEW_SCOPE_ATTRIBUTE,
  buildTenantThemePreviewScope,
  compileTenantThemePreview,
  probeTenantThemePackWarnings,
  selectTenantThemeAdjustments,
  useTenantThemePreview,
} from '../index';

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_preview',
  slug: 'preview-tenant',
  verticalKey: 'bithire',
  rowVersion: 1,
};

function makeDocument(primary: string): TenantThemeDocument {
  return {
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary },
      typography: { fontFamilyHeading: "'Fraunces', Georgia, serif" },
    },
  };
}

/** A document whose density enum value is not allowed; the compiler rejects it. */
const INVALID_DOCUMENT = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: { density: 'ultra' },
} as unknown as TenantThemeDocument;

describe('compileTenantThemePreview', () => {
  it('compiles a valid document into an artifact with no issues', () => {
    const result = compileTenantThemePreview({
      document: makeDocument('#2F6B9A'),
      identity: IDENTITY,
    });
    expect(result.issues).toBeNull();
    expect(result.artifact).not.toBeNull();
    expect(result.artifact?.slug).toBe('preview-tenant');
    expect(typeof result.artifact?.digest).toBe('string');
  });

  it('returns structured issues instead of throwing for an invalid document', () => {
    const result = compileTenantThemePreview({
      document: INVALID_DOCUMENT,
      identity: IDENTITY,
    });
    expect(result.artifact).toBeNull();
    expect(result.issues).not.toBeNull();
    expect(result.issues!.length).toBeGreaterThan(0);
  });

  it.each([
    ['tenantId', IDENTITY.tenantId],
    ['slug', IDENTITY.slug],
    ['verticalKey', IDENTITY.verticalKey],
    ['rowVersion', IDENTITY.rowVersion],
  ] as const)('rejects a document-carried identity key instead of overwriting %s', (key, value) => {
    const result = compileTenantThemePreview({
      document: { ...makeDocument('#2F6B9A'), [key]: value } as TenantThemeDocument,
      identity: IDENTITY,
    });

    expect(result.artifact).toBeNull();
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'unknown_key', path: `$.${key}` }),
    );
  });

  it('returns issues for an unknown vertical (no registered envelope) rather than throwing', () => {
    const result = compileTenantThemePreview({
      document: makeDocument('#2F6B9A'),
      identity: { ...IDENTITY, verticalKey: 'not-a-vertical' },
    });
    expect(result.artifact).toBeNull();
    expect(result.issues!.length).toBeGreaterThan(0);
  });
});

describe('useTenantThemePreview debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exposes the default debounce constant', () => {
    expect(DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS).toBe(150);
  });

  it('compiles the first document immediately and defers edits until the debounce elapses', () => {
    const { result, rerender } = renderHook(
      ({ document }) => useTenantThemePreview({ document, identity: IDENTITY }),
      { initialProps: { document: makeDocument('#2F6B9A') } }
    );

    const firstDigest = result.current.artifact?.digest;
    expect(firstDigest).toBeTruthy();

    rerender({ document: makeDocument('#A23B72') });
    // Before the debounce window elapses the artifact still reflects the first document.
    expect(result.current.artifact?.digest).toBe(firstDigest);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_TENANT_THEME_PREVIEW_DEBOUNCE_MS);
    });
    expect(result.current.artifact?.digest).not.toBe(firstDigest);
  });

  it('coalesces rapid edits so only the final document within a window compiles', () => {
    const { result, rerender } = renderHook(
      ({ document }) => useTenantThemePreview({ document, identity: IDENTITY, debounceMs: 200 }),
      { initialProps: { document: makeDocument('#2F6B9A') } }
    );
    const firstDigest = result.current.artifact?.digest;

    rerender({ document: makeDocument('#111111') });
    act(() => {
      vi.advanceTimersByTime(120);
    });
    // Superseded before its timer fired.
    expect(result.current.artifact?.digest).toBe(firstDigest);

    rerender({ document: makeDocument('#A23B72') });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const finalArtifact = compileTenantThemePreview({
      document: makeDocument('#A23B72'),
      identity: IDENTITY,
    }).artifact;
    expect(result.current.artifact?.digest).toBe(finalArtifact?.digest);
  });
});

describe('useTenantThemePreview result shape', () => {
  it('exposes preview scope, adjustments, and pack warnings for a valid document', () => {
    const { result } = renderHook(() =>
      useTenantThemePreview({
        document: makeDocument('#2F6B9A'),
        identity: IDENTITY,
        packWarningsOptions: { resolveVariable: () => 'Inter' },
      })
    );

    expect(result.current.artifact).not.toBeNull();
    expect(result.current.issues).toBeNull();
    expect(Array.isArray(result.current.adjustments)).toBe(true);
    expect(Array.isArray(result.current.packWarnings)).toBe(true);
    expect(result.current.css).toContain(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`);
    expect(result.current.previewScopeSelector).toBe(
      `[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`
    );
    expect(result.current.previewRootAttributes[PREVIEW_SCOPE_ATTRIBUTE]).toBe('preview-tenant');
  });

  it('renders no preview scope and surfaces issues for an invalid document', () => {
    const { result } = renderHook(() =>
      useTenantThemePreview({ document: INVALID_DOCUMENT, identity: IDENTITY })
    );
    expect(result.current.artifact).toBeNull();
    expect(result.current.issues!.length).toBeGreaterThan(0);
    expect(result.current.css).toBe('');
    expect(result.current.previewRootAttributes).toEqual({});
  });
});

describe('buildTenantThemePreviewScope', () => {
  function compiledArtifact() {
    const result = compileTenantThemePreview({
      document: makeDocument('#2F6B9A'),
      identity: IDENTITY,
    });
    expect(result.artifact).not.toBeNull();
    return result.artifact!;
  }

  it('verifies and re-anchors a compiler artifact onto the CMP-02 preview scope', () => {
    const artifact = compiledArtifact();
    const scope = buildTenantThemePreviewScope(artifact);

    expect(scope.safeSlug).toBe('preview-tenant');
    expect(scope.scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`);
    expect(scope.css).toContain(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant'] {`);
    expect(scope.css).toContain('--ds-color-primary: #2F6B9A;');
    expect(scope.css).not.toContain('data-ds-root');
  });

  it('rejects a counterfeit artifact whose variables no longer match its digest', () => {
    const artifact = compiledArtifact();
    const counterfeit = {
      ...artifact,
      variables: { ...artifact.variables, '--ds-color-primary': '#000000' },
    };

    expect(() => buildTenantThemePreviewScope(counterfeit)).toThrow(/digest/);
  });

  it('rejects a reserved slug before any preview CSS can be emitted', () => {
    const artifact = compiledArtifact();
    const reserved = { ...artifact, slug: 'Bit-Hire' };

    expect(() => buildTenantThemePreviewScope(reserved)).toThrow(/reserved/);
  });
});

describe('probeTenantThemePackWarnings', () => {
  const artifact = {
    variables: {
      '--ds-font-family-heading': "var(--ds-font-pack-editorial-display), Georgia, serif",
      '--ds-font-family-base': "var(--ds-font-pack-humanist-text), system-ui, sans-serif",
      '--ds-color-primary': '#2F6B9A',
    },
  };

  it('warns for every referenced font pack that does not resolve in the host document', () => {
    const warnings = probeTenantThemePackWarnings(artifact, {
      resolveVariable: () => '',
    });
    expect(warnings).toHaveLength(2);
    expect(warnings.map((warning) => warning.variable).sort()).toEqual([
      '--ds-font-pack-editorial-display',
      '--ds-font-pack-humanist-text',
    ]);
    expect(warnings[0].referencedBy.startsWith('--ds-font-family-')).toBe(true);
  });

  it('emits no warning when a referenced pack resolves to a value', () => {
    const warnings = probeTenantThemePackWarnings(artifact, {
      resolveVariable: (variable) =>
        variable === '--ds-font-pack-editorial-display' ? 'Fraunces' : '',
    });
    expect(warnings.map((warning) => warning.variable)).toEqual([
      '--ds-font-pack-humanist-text',
    ]);
  });

  it('returns no warnings for an artifact that references no font packs', () => {
    expect(
      probeTenantThemePackWarnings(
        { variables: { '--ds-color-primary': '#2F6B9A' } },
        { resolveVariable: () => '' }
      )
    ).toEqual([]);
  });

  it('returns no warnings for a null artifact', () => {
    expect(probeTenantThemePackWarnings(null, { resolveVariable: () => '' })).toEqual([]);
  });
});

describe('selectTenantThemeAdjustments', () => {
  it('returns an empty list for an artifact without a compiler adjustments field', () => {
    expect(selectTenantThemeAdjustments({})).toEqual([]);
  });

  it('passes through compiler-emitted adjustments unchanged', () => {
    const adjustments = [
      {
        token: '--ds-button-primary-color',
        pairedWith: '--ds-button-primary-bg',
        from: '#5A6B7C',
        to: '#47555F',
        lcBefore: 42,
        lcAfter: 61,
      },
    ] as const;
    expect(selectTenantThemeAdjustments({ adjustments })).toEqual(adjustments);
  });

  it('tolerates a null artifact', () => {
    expect(selectTenantThemeAdjustments(null)).toEqual([]);
  });
});
