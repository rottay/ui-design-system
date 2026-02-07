/**
 * Known Tenants Registry
 *
 * Built-in configurations for known tenants.
 * These are the "official" tenants that ship with the design system.
 *
 * For new/custom tenants:
 * - Use the remote API (configureTenantApi)
 * - Or provide config via DesignSystemProvider props
 *
 * The CSS styles for these tenants are included in the design system bundle.
 */

import type { TenantConfig, EngineName } from '../../../core/types';

/**
 * Known tenant configurations
 */
const KNOWN_TENANTS: Record<string, TenantConfig> = {
  /**
   * Rottay - Default tenant
   * Notion-inspired minimal design with dark grays
   */
  rottay: {
    slug: 'rottay',
    name: 'Rottay',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Rottay',
      primaryColor: '#37352f',
      accentColor: '#5c5248',
      logo: undefined,
    },
  },

  /**
   * BitHire - Tech recruitment platform
   * Indigo/purple color scheme
   */
  bithire: {
    slug: 'bithire',
    name: 'BitHire',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'BitHire',
      primaryColor: '#6366f1',
      accentColor: '#a855f7',
      logo: undefined,
    },
  },

  /**
   * Evnto - Event management platform
   * Notion-inspired monochromatic (black/grey scale)
   */
  evnto: {
    slug: 'evnto',
    name: 'Evnto',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Evnto',
      primaryColor: '#191919',
      accentColor: '#6b6b6b',
      logo: undefined,
    },
  },
};

/**
 * Default tenant slug (used when no tenant is specified)
 */
export const DEFAULT_TENANT_SLUG = 'rottay';

/**
 * Get known tenant configuration
 * Returns undefined if tenant is not in the registry
 */
export function getKnownTenantConfig(slug: string): TenantConfig | undefined {
  return KNOWN_TENANTS[slug.toLowerCase()];
}

/**
 * Check if a tenant is known (has built-in config)
 */
export function isKnownTenant(slug: string): boolean {
  return slug.toLowerCase() in KNOWN_TENANTS;
}

/**
 * Get all known tenant slugs
 */
export function getKnownTenantSlugs(): string[] {
  return Object.keys(KNOWN_TENANTS);
}

/**
 * Get default tenant config
 */
export function getDefaultTenant(): TenantConfig {
  return KNOWN_TENANTS[DEFAULT_TENANT_SLUG];
}
