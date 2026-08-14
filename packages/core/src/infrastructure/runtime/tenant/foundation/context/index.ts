'use client';

import { createContext, useContext } from 'react';

import type { TenantContextValue } from '@/foundation/contracts';

/**
 * The narrow tenant-context identity shared by providers and engine routers.
 * Keeping the Context object and its throwing hook in a foundation leaf
 * prevents leaf components from importing provider validation, root-attribute
 * and first-party registry machinery.
 */
export const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenantContext(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    // Tenant context is foundational for tokens, branding, and engine pack lookup.
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}
