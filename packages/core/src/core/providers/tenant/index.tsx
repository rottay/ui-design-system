/**
 * @fileoverview TenantProvider - Rottay Design System
 * @description Provides tenant-specific configuration context for multi-tenant
 * applications, including branding, features, and plan information.
 *
 * @remarks
 * The TenantProvider enables multi-tenant architecture by providing:
 * - **Configuration**: Complete tenant settings and preferences
 * - **Branding**: Logo, colors, and company information
 * - **Features**: Enabled feature flags per tenant
 * - **Plans**: Subscription tier and limitations
 *
 * This provider is typically used internally by DesignSystemProvider,
 * but can be used standalone for custom setups.
 *
 * @example Basic usage
 * ```tsx
 * import { TenantProvider } from '@rottay/design-system';
 *
 * const tenantConfig = {
 *   slug: 'acme',
 *   name: 'ACME Corp',
 *   engine: 'titan',
 *   theme: 'light',
 *   plan: 'enterprise',
 *   features: ['advanced-charts', 'export-pdf'],
 *   branding: { companyName: 'ACME' },
 * };
 *
 * <TenantProvider config={tenantConfig}>
 *   <App />
 * </TenantProvider>
 * ```
 *
 * @example Accessing tenant in components
 * ```tsx
 * function TenantInfo() {
 *   const { config, isLoading } = useTenantContext();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <h1>Welcome to {config.branding?.companyName}</h1>;
 * }
 * ```
 *
 * @see {@link useTenantContext} - Hook to access tenant context
 * @see {@link TenantConfig} - Tenant configuration structure
 * @module System/Providers/Tenant
 * @category System
 * @package @rottay/design-system
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { TenantConfig, TenantContextValue } from '../../types';

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
