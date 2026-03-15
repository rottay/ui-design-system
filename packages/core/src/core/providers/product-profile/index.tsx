'use client';

/**
 * ProductProfileProvider
 *
 * This provider exposes the resolved product profile to hooks and components.
 * The context always has a value because the DS should never force every app
 * to wrap custom provider stacks just to keep token resolution working.
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ProductProfile, ProductProfileContextValue, ProductProfileKey } from '../../types/product-profiles';
import { getProductProfile } from '../../../theme/product-profiles';

const DEFAULT_CONTEXT_VALUE: ProductProfileContextValue = {
  profile: getProductProfile(),
};

const ProductProfileContext = createContext<ProductProfileContextValue>(DEFAULT_CONTEXT_VALUE);

export interface ProductProfileProviderProps {
  children: ReactNode;
  profile?: ProductProfileKey | ProductProfile | null;
}

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

export function useProductProfileContext(): ProductProfileContextValue {
  return useContext(ProductProfileContext);
}

export { ProductProfileContext };
