/**
 * The compiler version is part of an artifact's identity, so an artifact another
 * compiler wrote is refused before anything reads it, with the instruction that
 * clears the refusal. The stale artifact here is self-consistent: its digest and
 * CSS recompute under its own version, which is what a stored row looks like.
 */
import { describe, expect, it } from 'vitest';

import { TENANT_THEME_COMPILER_VERSION } from '@rottay/design-system/server';
import { buildTenantThemePreviewScope } from '@/components/patterns/customization/brand-studio/runtime/tenant-theme-preview/scope';
import { resolveVisualAuthority, verifyTenantThemeArtifactV1 } from '..';
import { chain, compile, IDENTITY, NO_STYLE_V3, reseal } from './fixture';

const CURRENT = 'tenant-theme-compiler@5';
const STALE = 'tenant-theme-compiler@4';
const REFUSAL = `compilerVersion is not ${CURRENT}: recompile this tenant's stored document with the current compiler and republish the artifact`;

const current = compile(NO_STYLE_V3);
const stale = reseal({ ...current, compilerVersion: STALE });

const authority = (artifact: typeof current) =>
  resolveVisualAuthority({
    declaration: { authority: 'compiled-artifact', artifact },
    ...IDENTITY,
    payload: { visualBranding: false },
    documentRoot: null,
  });

describe('compiler identity at admission', () => {
  it('is the current line, and the stale fixture really carries the old one', () => {
    expect(TENANT_THEME_COMPILER_VERSION).toBe(CURRENT);
    expect(current.compilerVersion).toBe(CURRENT);
    expect(stale.compilerVersion).toBe(STALE);
    expect(stale.css).toContain(`| ${STALE} |`);
    expect(stale.digest).not.toBe(current.digest);
    expect(stale.variables).toEqual(current.variables);
  });

  it('accepts a current artifact through verification, SSR and mount', async () => {
    expect(verifyTenantThemeArtifactV1(current, IDENTITY)).toEqual({
      ok: true,
      artifact: expect.objectContaining({ digest: current.digest, compilerVersion: CURRENT }),
    });
    const result = await chain(current, NO_STYLE_V3);
    expect(result.ssr).toEqual({ ok: true, bytesMatch: true });
    expect(result.mount).toMatchObject({ ok: true, digestMatches: true, bytesMatch: true });
  });

  it('still refuses a current artifact that is invalid for another reason', () => {
    const forged = { ...current, digest: `sha256-${'0'.repeat(64)}` };
    expect(verifyTenantThemeArtifactV1(forged, IDENTITY)).toEqual({
      ok: false,
      error: 'artifact digest does not recompute from v1 source',
    });
  });

  it('refuses a self-consistent stale artifact with the recompile instruction', async () => {
    expect(verifyTenantThemeArtifactV1(stale, IDENTITY)).toEqual({ ok: false, error: REFUSAL });
    const result = await chain(stale, NO_STYLE_V3);
    expect(result.verify).toEqual({ ok: false, error: REFUSAL });
    const refused = {
      ok: false,
      error: `Error: [design-system] refusing to emit an unverified tenant theme artifact: ${REFUSAL}.`,
    };
    expect(result.ssr).toEqual(refused);
    expect(result.mount).toEqual(refused);
  });

  it('refuses the version before any other check can read the stale bytes', () => {
    const corrupt = { ...stale, digest: 'not-a-digest', css: 'garbage' };
    expect(verifyTenantThemeArtifactV1(corrupt, IDENTITY)).toEqual({ ok: false, error: REFUSAL });
  });

  it('blocks the visual authority without admitting the artifact', () => {
    const resolution = authority(stale);
    expect(resolution.conflict).toBe(`Tenant "${IDENTITY.slug}" artifact rejected: ${REFUSAL}.`);
    expect(resolution.origin).toBe('invalid-declaration');
    expect(resolution.conflictKind).toBe('declaration');
    expect(resolution.artifact).toBeNull();
    expect(resolution.mountedArtifact).toBeNull();
  });

  it('refuses the studio preview door with the same instruction', () => {
    expect(() => buildTenantThemePreviewScope(current)).not.toThrow();
    expect(() => buildTenantThemePreviewScope(stale)).toThrow(REFUSAL);
  });

  it('clears the refusal by recompiling the stored document, with the same paint', () => {
    const recompiled = compile(NO_STYLE_V3);
    expect(verifyTenantThemeArtifactV1(recompiled, IDENTITY).ok).toBe(true);
    expect(recompiled.variables).toEqual(stale.variables);
    expect(recompiled.modeDeltas).toEqual(stale.modeDeltas);
  });
});
