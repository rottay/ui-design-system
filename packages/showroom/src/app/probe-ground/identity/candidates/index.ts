import {
  assertTenantThemeDocumentV2,
  type TenantThemeDocumentV2,
} from '@rottay/design-system/server';

// The candidate documents are DS sources with no public subpath of their own
// (WO-DER-07 deletes them once the owner picks), so the probe-ground reads the
// same JSON bytes the DS probe reads rather than keeping a second copy.
import editorialQuiet from '../../../../../../core/src/foundation/presets/candidates/bithire/documents/editorial-quiet/index.json';
import manifest from '../../../../../../core/src/foundation/presets/candidates/bithire/documents/manifest/index.json';
import productDense from '../../../../../../core/src/foundation/presets/candidates/bithire/documents/product-dense/index.json';
import warmHumanist from '../../../../../../core/src/foundation/presets/candidates/bithire/documents/warm-humanist/index.json';

export const BASELINE_ID = 'baseline' as const;

export interface IdentityCandidate {
  id: string;
  title: string;
  intent: string;
  slug: string;
  document: TenantThemeDocumentV2;
}

const DOCUMENTS: Record<string, unknown> = {
  'editorial-quiet': editorialQuiet,
  'product-dense': productDense,
  'warm-humanist': warmHumanist,
};

export const IDENTITY_CANDIDATES: IdentityCandidate[] = manifest.candidates.map((row) => ({
  id: row.id,
  title: row.title,
  intent: row.intent,
  slug: row.slug,
  document: assertTenantThemeDocumentV2(DOCUMENTS[row.id]),
}));

export const IDENTITY_COLUMN_IDS: string[] = [
  BASELINE_ID,
  ...IDENTITY_CANDIDATES.map((row) => row.id),
];

export function identityCandidate(id: string): IdentityCandidate | null {
  return IDENTITY_CANDIDATES.find((row) => row.id === id) ?? null;
}

export function sanitizeColumn(raw: string | null): string {
  return raw && IDENTITY_COLUMN_IDS.includes(raw) ? raw : IDENTITY_CANDIDATES[0].id;
}

export const IDENTITY_MODES = ['light', 'dark'] as const;
export type IdentityMode = (typeof IDENTITY_MODES)[number];

export function sanitizeMode(raw: string | null): IdentityMode {
  return raw === 'dark' ? 'dark' : 'light';
}

export const IDENTITY_SCREENS = [
  'list',
  'record',
  'form',
  'dashboard',
  'modal',
  'phone',
] as const;
export type IdentityScreen = (typeof IDENTITY_SCREENS)[number];

export function sanitizeScreen(raw: string | null): IdentityScreen | 'all' {
  return raw && (IDENTITY_SCREENS as readonly string[]).includes(raw)
    ? (raw as IdentityScreen)
    : 'all';
}
