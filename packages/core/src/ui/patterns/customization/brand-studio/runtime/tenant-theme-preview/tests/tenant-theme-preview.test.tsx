import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import type {
  TenantThemeConfigIdentityV1,
  TenantThemeDocumentV1,
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

const IDENTITY: TenantThemeConfigIdentityV1 = {
  tenantId: 'tenant_preview',
  slug: 'preview-tenant',
  verticalKey: 'bithire',
  rowVersion: 1,
};

function makeDocument(primary: string): TenantThemeDocumentV1 {
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
} as unknown as TenantThemeDocumentV1;

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
  it('re-anchors compiled variables onto the CMP-02 preview scope and drops unsafe values', () => {
    const scope = buildTenantThemePreviewScope({
      slug: 'acme-co',
      variables: {
        '--ds-color-primary': '#2F6B9A',
        '--ds-font-family-heading': "'Fraunces', Georgia, serif",
        // A value that could escape the block must be dropped by the shared whitelist.
        '--ds-evil': 'red; } * { color: red',
      },
    });

    expect(scope.safeSlug).toBe('acme-co');
    expect(scope.scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='acme-co']`);
    expect(scope.css).toContain(`[${PREVIEW_SCOPE_ATTRIBUTE}='acme-co'] {`);
    expect(scope.css).toContain('--ds-color-primary: #2F6B9A;');
    // Never the document-root selector, and never a block-escaping declaration.
    expect(scope.css).not.toContain('data-ds-root');
    expect(scope.css).not.toContain('--ds-evil');
    expect(scope.css).not.toContain('* {');
  });

  it('sanitizes a hostile slug before it reaches the scope attribute', () => {
    const scope = buildTenantThemePreviewScope({
      slug: "x'] , * { --pwn: 1 } [q='",
      variables: { '--ds-color-primary': '#000000' },
    });
    // The hostile punctuation is stripped to inert attribute-value characters,
    // so the block stays a single well-formed rule anchored to the preview root:
    // no wildcard selector escapes and no injected declaration appears.
    expect(scope.safeSlug).toMatch(/^[a-z0-9-]+$/);
    expect(scope.scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='${scope.safeSlug}']`);
    expect(scope.css.startsWith(`[${PREVIEW_SCOPE_ATTRIBUTE}='${scope.safeSlug}'] {`)).toBe(true);
    expect(scope.css).not.toContain('* {');
    expect(scope.css).not.toContain('--pwn:');
  });

  it('emits an empty stylesheet when no declaration survives', () => {
    const scope = buildTenantThemePreviewScope({ slug: 'empty', variables: {} });
    expect(scope.css).toBe('');
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
