// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { assertDecisionProvenanceLedger } from '@/foundation/contracts/composition/tenants/themes/provenance';
import { THEME_DECISION_PROVENANCE_CATALOG } from '@/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/provenance';
import { compileTenantThemeDocumentV2 } from '@/infrastructure/compilers/composition/tenant-theme/document-v2';
import { THEME_STYLE_IDS } from '@/contracts/theme/runtime/styles';
import {
  emitTenantThemeArtifactForSsr,
  verifyTenantThemeArtifactV1,
  resolveVisualAuthority,
} from '@/infrastructure/runtime/theming/foundation/visual-authority/foundation/admission';
import {
  compile, reseal, mutateEntry, chain, IDENTITY,
  STYLE_DOCUMENT, NO_STYLE_V3, NO_STYLE_V2, DECISION_DOCUMENT, HOSTILE_CASES, OWN_KEY_CASES,
} from './fixture';

const STYLED = compile(STYLE_DOCUMENT);
const NO_STYLE_CASES = [NO_STYLE_V2, NO_STYLE_V3, DECISION_DOCUMENT];

afterEach(() => {
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('data-ds-root');
  document.documentElement.removeAttribute('data-vertical');
  document.documentElement.removeAttribute('data-tenant');
});

describe('style-reference artifact admission', () => {
  it('reseals a real compiler artifact without changing its digest or CSS', () => {
    expect(reseal(STYLED)).toEqual(STYLED);
  });

  it.each(THEME_STYLE_IDS)('%s@1 compiles, verifies, SSR-emits and mounts', async (id) => {
    const row = { ...STYLE_DOCUMENT, style: { id, version: 1 } };
    const artifact = compile(row);
    const result = await chain(artifact, row);
    expect(result.verify).toEqual({ ok: true });
    expect(result.ssr).toEqual({ ok: true, bytesMatch: true });
    expect(result.mount).toEqual({ ok: true, digestMatches: true, bytesMatch: true, scopeMatches: true });
    expect(artifact.provenance?.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ ref: { kind: 'style-reference', id, version: 1 }, provenance: 'preset-inherited', tier: null }),
    ]));
  });

  it.each(NO_STYLE_CASES)('preserves no-style document %j through the complete server chain', async (row) => {
    const result = await chain(compile(row), row);
    expect(result.verify.ok).toBe(true);
    expect(result.ssr).toEqual({ ok: true, bytesMatch: true });
    expect(result.mount).toEqual({ ok: true, digestMatches: true, bytesMatch: true, scopeMatches: true });
  });

  it('admits the exact emitted bytes and scope in a jsdom document', () => {
    const emitted = emitTenantThemeArtifactForSsr(STYLED);
    const style = document.createElement('style');
    for (const [attribute, value] of Object.entries(emitted.attributes)) style.setAttribute(attribute, value);
    style.textContent = emitted.css;
    document.head.appendChild(style);
    document.documentElement.setAttribute('data-ds-root', '');
    document.documentElement.setAttribute('data-vertical', STYLED.verticalKey);
    document.documentElement.setAttribute('data-tenant', STYLED.slug);
    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: STYLED },
      ...IDENTITY, payload: { visualBranding: false }, documentRoot: document,
    });
    expect(resolution.conflict).toBeNull();
    expect(resolution.mountedArtifact).toBe(style);
  });

  it.each(HOSTILE_CASES)('refuses %s with recomputed digest and deterministic CSS', async (_label, patch) => {
    const result = await chain(mutateEntry(STYLED, patch), STYLE_DOCUMENT);
    expect(result.verify).toEqual({ ok: false, error: 'provenance is not a serialized decision ledger' });
    expect(result.ssr.ok).toBe(false);
    expect(result.mount.ok).toBe(false);
  });

  it.each(OWN_KEY_CASES)('refuses %s through verification, SSR and mount after resealing', async (label, ref) => {
    const artifact = mutateEntry(STYLED, { ref });
    expect(reseal(artifact)).toEqual(artifact);
    if (label === 'R2-inherited-kind-extra-key') {
      expect(Object.keys(ref)).toEqual(['__proto__', 'id', 'version', 'extra']);
      expect(Object.prototype.hasOwnProperty.call(ref, 'kind')).toBe(false);
      expect(artifact.digest).toBe('sha256-832b195176dc13f90c5ce7cc35bc870c71cb3f63a2b14f90c305dcf814df4a12');
    }
    const result = await chain(artifact, STYLE_DOCUMENT);
    expect(result.verify).toEqual({ ok: false, error: 'provenance is not a serialized decision ledger' });
    expect(result.ssr.ok).toBe(false);
    expect(result.mount.ok).toBe(false);
  });

  it('C3 refuses an actual unknown kind while its otherwise identical legitimate style ref passes', () => {
    const ledger = structuredClone(compileTenantThemeDocumentV2({ ...IDENTITY, document: STYLE_DOCUMENT }).ledger);
    expect(() => assertDecisionProvenanceLedger(ledger, THEME_DECISION_PROVENANCE_CATALOG)).not.toThrow();
    Object.assign(ledger.entries.at(0)?.ref ?? {}, { kind: 'unregistered-style' });
    expect(() => assertDecisionProvenanceLedger(ledger, THEME_DECISION_PROVENANCE_CATALOG)).toThrow(/unknown ref kind "unregistered-style"/);
    const unknown = mutateEntry(STYLED, { ref: { kind: 'unregistered-style', id: 'product-dense', version: 1 } });
    expect(verifyTenantThemeArtifactV1(unknown, IDENTITY)).toEqual({ ok: false, error: 'provenance is not a serialized decision ledger' });
    expect(verifyTenantThemeArtifactV1(STYLED, IDENTITY).ok).toBe(true);
  });

  it('still binds a valid style reference to the artifact digest', () => {
    const tampered = structuredClone(STYLED);
    Object.assign(tampered.provenance?.entries.at(0)?.ref ?? {}, { id: 'quiet-premium' });
    expect(verifyTenantThemeArtifactV1(tampered, IDENTITY)).toEqual({ ok: false, error: 'artifact digest does not recompute from v1 source' });
  });

  it('still refuses CSS changed after a valid style compile', () => {
    const tampered = { ...STYLED, css: STYLED.css + '/* edited */' };
    expect(verifyTenantThemeArtifactV1(tampered, IDENTITY)).toEqual({ ok: false, error: 'artifact CSS is not the deterministic v1 rendering' });
  });

  const malformedLeaves = [{ effectiveLeaves: 42 }, { effectiveLeaves: [''] }, { effectiveLeaves: [42] }];
  it.each(malformedLeaves)('preserves effectiveLeaves shape rejection for %j', ({ effectiveLeaves }) => {
    const mutant = mutateEntry(STYLED, { effectiveLeaves });
    expect(verifyTenantThemeArtifactV1(mutant, IDENTITY)).toEqual({ ok: false, error: 'provenance is not a serialized decision ledger' });
  });
});
