/**
 * Tenant Provider
 * Provides tenant configuration context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { TenantConfig, TenantContextValue } from '../../../types';

const TenantContext = createContext<TenantContextValue | null>(null);

export interface TenantProviderProps {
  children: ReactNode;
  config: TenantConfig;
  isLoading?: boolean;
}

export function TenantProvider({
  children,
  config,
  isLoading = false,
}: TenantProviderProps): React.ReactElement {
  const value: TenantContextValue = {
    config,
    isLoading,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}

export { TenantContext };
