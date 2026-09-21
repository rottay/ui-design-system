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
 *
 * The `_STATES` and `_UNMIGRATABLE_*` rows are the two directions of that same
 * promise for the interaction dials (WO-CON-06): what the migration carries,
 * and what it refuses by name instead of dropping in silence.
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
 * Five decisions on purpose, and NOT rewritten as each one is connected.
 *
 * Two of them were written here while the catalog gave them no keypath at all:
 * `states.emphasis` until WO-DER-02 derived it, and `shape.control-height`
 * until connection lot 2 did. Both are unchanged, and both now lower -- which
 * is the promise the unlit report exists to make. Refusing a published decision
 * is what would have forced this app to rewrite its rows on every family cut;
 * accepting it and naming it unlit is what lets the row outlive the gap.
 */
export const TENANT_DOCUMENT_V2: TenantThemeDocumentV2 = {
  version: 2,
  plan: 'pro',
  decisions: {
    'palette.seeds': { primary: '#4F46E5' },
    'typography.pairing': 'editorial',
    'density.mode': 'compact',
    'states.emphasis': 'strong',
    'shape.control-height': 'tall',
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

/**
 * The same tenant, one edit earlier: a v1 row that also authored the two
 * interaction dials.
 *
 * `emphasis` is deliberately NOT this vertical's own posture. bithire's
 * baseline is already `strong`, so a row authoring `strong` compiles to an
 * empty delta and would prove the carry whether or not it happened; `subtle`
 * moves six `--ds-state-*` channels, and `glow` moves three `--ds-focus-ring*`
 * ones, so the migration is measured by what the published artifact gained
 * rather than by the migrated document agreeing with itself.
 */
export const TENANT_TRANSPORT_V1_STATES = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: { primary: '#4F46E5' },
    density: 'compact',
    states: { emphasis: 'subtle', focusStyle: 'glow' },
  },
} as unknown as TenantThemeDocument;

/**
 * The rows the migration must REFUSE rather than carry, one per field.
 *
 * v1 types both state fields as an open string at the DB edge, so a value
 * outside the closed catalog vocabulary is admitted by every validator
 * upstream of the migration; only the migration itself can name it, which is
 * why the refusal is part of this app's proof and not an internal detail.
 * They are two rows and not one with two bad fields because the migration
 * throws on the first thing it cannot carry: a single row would prove the
 * first field is named and leave the second one unproven.
 */
export const TENANT_TRANSPORT_V1_UNMIGRATABLE_EMPHASIS = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: { primary: '#4F46E5' },
    states: { emphasis: 'loud' },
  },
} as unknown as TenantThemeDocument;

export const TENANT_TRANSPORT_V1_UNMIGRATABLE_FOCUS_STYLE = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: {
    palette: { primary: '#4F46E5' },
    states: { focusStyle: 'halo' },
  },
} as unknown as TenantThemeDocument;
