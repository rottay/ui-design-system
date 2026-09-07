/**
 * What the tenant's two rows hold, and which one each door accepts today.
 *
 * `TENANT_DOCUMENT_V2` is the shape a customer writes from day one (consumer
 * contract §3): a plan, closed-domain decision ids, and nothing else. It is the
 * document the theme door admits and reports against.
 *
 * `TENANT_TRANSPORT_V1` is the row the tenant still carries. It exists here
 * because the ARTIFACT compiler -- the producer of the `TenantThemeArtifact`
 * that `mountTenantTheme` requires for a `tenant-document` origin -- refuses a
 * v2 document by name today (`Only TenantThemeConfig schema version 1 is
 * supported`). The fixture pins that refusal as an executable fact rather than
 * routing around it; WO-CAT-02 is the work order that closes the seam, and when
 * it lands this file loses its second row and the pin fails loudly.
 */
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
  TenantThemeDocumentV2,
} from '@rottay/design-system/server';

export const TENANT_SLUG = 'acme';

export const TENANT_IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_acme',
  slug: TENANT_SLUG,
  verticalKey: 'bithire',
  rowVersion: 12,
};

/**
 * Four decisions on purpose: three the current fan-out lights, and
 * `states.emphasis`, which the catalog publishes and no family reads yet. The
 * door must ACCEPT it and REPORT it unlit -- refusing a published decision is
 * what would force the app to rewrite documents on every family cut.
 */
export const TENANT_DOCUMENT_V2: TenantThemeDocumentV2 = {
  version: 2,
  plan: 'pro',
  decisions: {
    'palette.seeds': { primary: '#4F46E5' },
    'typography.pairing': 'editorial',
    'density.mode': 'compact',
    'states.emphasis': 'strong',
  },
};

export const TENANT_TRANSPORT_V1 = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: { primary: '#4F46E5' },
    density: 'compact',
  },
} as unknown as TenantThemeDocument;
