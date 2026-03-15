/**
 * Product profile types
 *
 * Product profiles sit between the generic DS defaults and tenant-specific
 * overrides. This lets the same tenant system power very different product
 * experiences without hardcoding those differences into individual components.
 */

import type { PersonalityTokens } from '../tokens/personality';
import type { TenantTokenOverrides } from '../tenants';

/**
 * Known first-party product profiles.
 *
 * The string union is intentionally open-ended via `(string & {})` so product
 * teams can add local profiles without waiting for a DS release.
 */
export type ProductProfileKey =
  | 'generic.default'
  | 'events.organizer'
  | 'recruiting.operator'
  | 'platform.admin'
  | (string & {});

/**
 * Visual defaults that are safe to resolve at the profile layer.
 *
 * Surface-specific behavior still belongs to surface configs inside apps.
 * This object only captures broad product personality and sensible defaults.
 */
export interface ProductProfileSurfaceDefaults {
  listView?: 'table' | 'cards';
  density?: 'compact' | 'comfortable' | 'spacious';
  schedulerView?: 'month' | 'week' | 'day';
}

/**
 * Product profile definition.
 *
 * A profile can influence:
 * - personality tokens read by components
 * - token overrides that tune spacing/radius/shadows
 * - broad defaults that surfaces may opt into
 */
export interface ProductProfile {
  key: ProductProfileKey;
  label: string;
  description?: string;
  personality?: Partial<PersonalityTokens>;
  tokenOverrides?: TenantTokenOverrides;
  surfaceDefaults?: ProductProfileSurfaceDefaults;
}

/**
 * Context value exposed by the ProductProfileProvider.
 */
export interface ProductProfileContextValue {
  profile: ProductProfile;
}
