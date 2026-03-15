/**
 * Product Profiles System
 * Registry, provider, and hooks for product-level personality and token overrides.
 */
export { getProductProfile, PRODUCT_PROFILES, DEFAULT_PRODUCT_PROFILE_KEY } from './registry';
export { ProductProfileProvider, useProductProfileContext, ProductProfileContext } from './ProductProfileProvider';
export type { ProductProfileProviderProps } from './ProductProfileProvider';
export { useProductProfile } from './useProductProfile';
