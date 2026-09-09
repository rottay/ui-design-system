/**
 * What the tenant's rows hold, and what each one is for.
 *
 * `TENANT_DOCUMENT_V2` is the shape a customer writes from day one (consumer
 * contract §3): a plan, closed-domain decision ids, and nothing else. It is the
 * document the theme door admits and reports against, AND the document this
 * application publishes its artifact from -- `compileTenantThemeDocumentV2`
 * compiles it without flattening it to v1 first, so the app keeps one row.
 *
 * `TENANT_TRANSPORT_V1` is no longer a workaround for a door that refused v2.
 * It stays as the migration example: a tenant that still holds a v1 row proves
 * here that `migrateDocumentV1ToV2` reaches the same patch through the same
 * door, which is what makes the migration a fact rather than a promise.
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
    // A decision the catalog still gives no keypath, so the fixture keeps an
    // executable example of the "accepted but not lit" report.
    'surfaces.border-style': 'hairline',
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
