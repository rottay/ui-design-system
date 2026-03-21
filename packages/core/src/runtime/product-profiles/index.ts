/**
 * @fileoverview Public entry point for product profiles.
 *
 * Product profiles express UX defaults (personality, density, surface layout)
 * for product types without binding the DS to a single application or tenant.
 * They sit below vertical presets and above engine defaults in the resolution chain.
 */
export { getProductProfile, PRODUCT_PROFILES, DEFAULT_PRODUCT_PROFILE_KEY } from './registry';
export { ProductProfileProvider, useProductProfileContext, ProductProfileContext } from './ProductProfileProvider';
export type { ProductProfileProviderProps } from './ProductProfileProvider';
export { useProductProfile } from './useProductProfile';
