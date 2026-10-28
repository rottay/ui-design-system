import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import type { TenantThemeDocumentAny, TenantThemeDocumentVersioned } from '@/contracts/theme/presentation/document';
import { compileTenantThemeDocumentV2 } from '@/infrastructure/compilers/composition/tenant-theme/document-v2';
import { documentThemeIntent } from '@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document';
import { mountTenantTheme } from '@/infrastructure/runtime/theming/composition/mount';
import { emitTenantArtifactCss } from '@/infrastructure/compilers/runtime/theme/runtime/emission';
import { canonicalizeJsonValue } from '@/foundation/kernel/serialization';
import { sha256Utf8 } from '@/foundation/kernel/cryptography/sha-256';
import {
  verifyTenantThemeArtifactV1,
  emitTenantThemeArtifactForSsr,
} from '@/infrastructure/runtime/theming/foundation/visual-authority/foundation/admission';

export const IDENTITY = { tenantId: 't', slug: 'acme', verticalKey: 'bithire', rowVersion: 1 } as const;
export const STYLE_DOCUMENT = { version: 3, plan: 'standard', decisions: {}, style: { id: 'product-dense', version: 1 } } as const;
export const NO_STYLE_V3 = { version: 3, plan: 'standard', decisions: {} } as const;
export const NO_STYLE_V2 = { version: 2, plan: 'standard', decisions: {} } as const;
export const DECISION_DOCUMENT = { version: 3, plan: 'standard', decisions: { 'density.mode': 'compact' } } as const;

export function compile(document: TenantThemeDocumentVersioned): TenantThemeArtifact {
  return compileTenantThemeDocumentV2({ ...IDENTITY, document }).artifact;
}

export function reseal(artifact: TenantThemeArtifact): TenantThemeArtifact {
  const digestSource = {
    schemaVersion: artifact.schemaVersion,
    compilerVersion: artifact.compilerVersion,
    coverage: artifact.coverage,
    tenantId: artifact.tenantId,
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
    rowVersion: artifact.rowVersion,
    normalizedAppearance: artifact.normalizedAppearance,
    variables: artifact.variables,
    ...(artifact.modeDeltas?.length ? { modeDeltas: artifact.modeDeltas } : {}),
    ...(artifact.contrastDeltas?.length ? { contrastDeltas: artifact.contrastDeltas } : {}),
    ...(artifact.densityScopeVariables !== undefined ? { densityScopeVariables: artifact.densityScopeVariables } : {}),
    ...(artifact.provenance ? { provenance: artifact.provenance } : {}),
    ...(artifact.runtime ? { runtime: artifact.runtime } : {}),
    scopes: artifact.scopes,
    ...(artifact.adjustments?.length ? { adjustments: artifact.adjustments } : {}),
    ...(artifact.verticalEnvelopeDigest ? { verticalEnvelopeDigest: artifact.verticalEnvelopeDigest } : {}),
  };
  const digest = `sha256-${sha256Utf8(canonicalizeJsonValue(digestSource))}`;
  const css = emitTenantArtifactCss({
    ...artifact,
    digest,
    followsSystem: artifact.normalizedAppearance.general?.palette?.backgroundMode === 'auto',
  });
  return { ...artifact, digest, css };
}

export function mutateEntry(artifact: TenantThemeArtifact, patch: Record<string, unknown>): TenantThemeArtifact {
  const mutant = structuredClone(artifact);
  const entry = mutant.provenance?.entries.at(0);
  if (!entry) throw new Error('fixture requires a provenance entry');
  Object.assign(entry, patch);
  return reseal(mutant);
}

export const HOSTILE_CASES = [
  ['C3-unknown-kind', { ref: { kind: 'unregistered-style', id: 'product-dense', version: 1 } }],
  ['malformed-id-number', { ref: { kind: 'style-reference', id: 42, version: 1 } }],
  ['malformed-id-empty', { ref: { kind: 'style-reference', id: '', version: 1 } }],
  ['unknown-id', { ref: { kind: 'style-reference', id: 'not-published', version: 1 } }],
  ['malformed-version-string', { ref: { kind: 'style-reference', id: 'product-dense', version: '1' } }],
  ['malformed-version-zero', { ref: { kind: 'style-reference', id: 'product-dense', version: 0 } }],
  ['malformed-version-fraction', { ref: { kind: 'style-reference', id: 'product-dense', version: 1.5 } }],
  ['malformed-version-unsafe', { ref: { kind: 'style-reference', id: 'product-dense', version: Number.MAX_SAFE_INTEGER + 1 } }],
  ['unavailable-version', { ref: { kind: 'style-reference', id: 'product-dense', version: 999 } }],
  ['inconsistent-provenance', { provenance: 'direct-override' }],
  ['unknown-provenance', { provenance: 'untrusted' }],
  ['inconsistent-tier', { tier: 'standard' }],
  ['extra-ref-key', { ref: { kind: 'style-reference', id: 'product-dense', version: 1, digest: 'caller-value' } }],
  ['missing-ref-version', { ref: { kind: 'style-reference', id: 'product-dense' } }],
] as const;

export const OWN_KEY_CASES = [
  ['R2-inherited-kind-extra-key', JSON.parse('{"__proto__":{"__proto__":null,"hasOwnProperty":null,"isPrototypeOf":null,"propertyIsEnumerable":null,"toLocaleString":null,"toString":null,"valueOf":null,"kind":"style-reference"},"id":"product-dense","version":1,"extra":true}')],
  ['missing-own-kind', { id: 'product-dense', version: 1, extra: true }],
  ['inherited-id-extra-key', JSON.parse('{"__proto__":{"__proto__":null,"hasOwnProperty":null,"isPrototypeOf":null,"propertyIsEnumerable":null,"toLocaleString":null,"toString":null,"valueOf":null,"id":"product-dense"},"kind":"style-reference","version":1,"extra":true}')],
  ['inherited-version-extra-key', JSON.parse('{"__proto__":{"__proto__":null,"hasOwnProperty":null,"isPrototypeOf":null,"propertyIsEnumerable":null,"toLocaleString":null,"toString":null,"valueOf":null,"version":1},"kind":"style-reference","id":"product-dense","extra":true}')],
] as const;

export async function chain(artifact: TenantThemeArtifact, document: TenantThemeDocumentAny) {
  const verify = verifyTenantThemeArtifactV1(artifact, IDENTITY);
  let ssr;
  try {
    const emitted = emitTenantThemeArtifactForSsr(artifact, IDENTITY);
    ssr = { ok: true, bytesMatch: emitted.css === artifact.css };
  } catch (error) {
    ssr = { ok: false, error: String(error) };
  }
  let mount;
  try {
    const intent = documentThemeIntent({ vertical: IDENTITY.verticalKey, slug: IDENTITY.slug, document });
    const mounted = await mountTenantTheme(intent, { artifact });
    mount = {
      ok: true,
      digestMatches: mounted.artifactDigest === artifact.digest,
      bytesMatch: mounted.styleElements.at(0)?.css === artifact.css,
      scopeMatches: Reflect.get(mounted.rootAttributes, 'data-tenant') === artifact.slug && Reflect.get(mounted.rootAttributes, 'data-vertical') === artifact.verticalKey,
    };
  } catch (error) {
    mount = { ok: false, error: String(error) };
  }
  return {
    digest: artifact.digest,
    verify: verify.ok ? { ok: true } : verify,
    ssr,
    mount,
  };
}
