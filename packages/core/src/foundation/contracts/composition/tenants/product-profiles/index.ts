/**
 * @fileoverview Product Profile contracts - Rottay Design System
 * @description Defines the ProductProfile type layer that sits between generic DS
 * defaults and tenant-specific overrides, enabling distinct UX presets (admin, events
 * organizer, recruiting operator) without hardcoding differences into components.
 *
 * @remarks
 * Resolution order: DS defaults -> product profile -> tenant overrides.
 * Product profiles are broad UX presets (personality, token overrides, surface
 * defaults), not app-specific configuration blobs.
 *
 * @module Contracts/ProductProfiles
 * @category Types
 * @package @rottay/design-system
 */

import type { PersonalityTokens } from '../../../kernel/tokens/personality';
import type { ProductProfileKey } from '../../../kernel/product-profile-identity';
import type { TenantTokenOverrides } from '..';

export type { ProductProfileKey } from '../../../kernel/product-profile-identity';

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
