'use client';

/**
 * @fileoverview React context provider for the active product profile.
 *
 * Resolves a profile from three input forms: a registry key string, a literal
 * `ProductProfile` object (for custom experimentation), or null/undefined
 * (falls back to `generic.default`). The context always carries a concrete
 * value so downstream hooks never need null checks.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ProductProfile, ProductProfileContextValue, ProductProfileKey } from '../../contracts/product-profiles';
import { getProductProfile } from './registry';

/** Fallback context value using the generic default profile, ensuring the context is never undefined. */
const DEFAULT_CONTEXT_VALUE: ProductProfileContextValue = {
  profile: getProductProfile(),
};

const ProductProfileContext = createContext<ProductProfileContextValue>(DEFAULT_CONTEXT_VALUE);

/** Props for the ProductProfileProvider component. */
export interface ProductProfileProviderProps {
  children: ReactNode;
  /** Registry key, literal profile object, or null to use the default profile. */
  profile?: ProductProfileKey | ProductProfile | null;
}

/**
 * Provides the resolved product profile to the component tree.
 *
 * Accepts a string key (resolved from registry), a literal `ProductProfile`
 * object, or null/undefined (falls back to `generic.default`).
 */
export function ProductProfileProvider({
  children,
  profile,
}: ProductProfileProviderProps): React.ReactElement {
  const resolvedProfile = useMemo<ProductProfile>(() => {
    if (!profile) {
      return getProductProfile();
    }

    // When apps pass a literal object we honor it directly. This is what keeps
    // the registry open and avoids turning product profiles into another closed
    // union that blocks experimentation.
    if (typeof profile === 'object') {
      return profile;
    }

    return getProductProfile(profile);
  }, [profile]);

  const contextValue = useMemo<ProductProfileContextValue>(() => {
    return {
      profile: resolvedProfile,
    };
  }, [resolvedProfile]);

  return (
    <ProductProfileContext.Provider value={contextValue}>
      {children}
    </ProductProfileContext.Provider>
  );
}

/** Reads the product profile context. Always returns a value (never undefined). */
export function useProductProfileContext(): ProductProfileContextValue {
  return useContext(ProductProfileContext);
}

export { ProductProfileContext };
