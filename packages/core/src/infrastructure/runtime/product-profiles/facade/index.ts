/**
 * @fileoverview Public entry point for product profiles.
 *
 * Product profiles express UX defaults (personality, density, surface layout)
 * for product types without binding the DS to a single application or tenant.
 * They sit below vertical presets and above engine defaults in the resolution chain.
 */
export { getProductProfile, PRODUCT_PROFILES, DEFAULT_PRODUCT_PROFILE_KEY } from '@/foundation/presets/product-profiles';
export { ProductProfileProvider, useProductProfileContext, ProductProfileContext } from '../composition/react/provider';
export type { ProductProfileProviderProps } from '../composition/react/provider';
export { useProductProfile } from '../composition/react/provider/profile';
