'use client';

/**
 * @fileoverview useTenant Hook - Rottay Design System
 * @description React hook for accessing tenant-specific configuration,
 * branding, and multi-tenant settings.
 *
 * @remarks
 * The useTenant hook provides:
 * - **Tenant config**: Access complete tenant settings
 * - **Branding**: Logo, colors, company name
 * - **Features**: Enabled feature flags for the tenant
 * - **Plan info**: Subscription tier and limitations
 *
 * @example Branded header
 * ```tsx
 * function Header() {
 *   const { config } = useTenant();
 *   return (
 *     <header style={{ color: config.branding?.primaryColor }}>
 *       <img src={config.branding?.logo} alt={config.name} />
 *     </header>
 *   );
 * }
 * ```
 *
 * @see {@link TenantProvider} - Provider component
 * @see {@link TenantConfig} - Configuration type
 * @module System/Hooks/Tenant
 * @category System
 * @package @rottay/design-system
 */

import { useContext } from 'react';
import { TenantContext } from '../../providers/tenant';

/**
 * Hook to access the current tenant context and configuration.
 *
 * The design system supports multi-tenancy, allowing different tenants
 * to have their own branding, themes, and feature configurations.
 * This hook provides access to the current tenant's configuration.
 *
 * @example
 * ```tsx
 * import { useTenant } from '@rottay/design-system';
 *
 * function BrandedHeader() {
 *   const { tenant, config } = useTenant();
 *
 *   return (
 *     <header style={{ backgroundColor: config.branding.primaryColor }}>
 *       <img src={config.branding.logo} alt={tenant} />
 *       <h1>{config.branding.name}</h1>
 *     </header>
 *   );
 * }
 * ```
 *
 * @returns Object containing tenant information and configuration
 * @returns {string} returns.tenant - The current tenant identifier
 * @returns {TenantConfig} returns.config - The tenant's configuration object
 * @returns {Function} returns.setTenant - Function to change the current tenant
 *
 * @throws {Error} Throws an error if used outside of a TenantProvider
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

// Tenant creation utilities
export { resolvePersonalityPreset } from './personality-presets';
export type { PersonalityPreset } from './personality-presets';
export { createTenantConfig } from './create-tenant';
export type { TenantCreationConfig } from './create-tenant';
export { useCreateTenant } from './useCreateTenant';
