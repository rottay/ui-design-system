/**
 * Tenant Storage
 * Facade with caching for tenant config retrieval
 *
 * Resolution priority:
 * 1. Memory cache
 * 2. localStorage cache
 * 3. Known tenants registry (built-in configs)
 * 4. Static files
 * 5. Remote API
 * 6. Default config (rottay)
 */

import type { TenantConfig } from '../../core/types';
import { loadStaticTenantConfig } from './static';
import { fetchRemoteTenantConfig } from './remote';
import { getDefaultTenantConfig } from '../defaults';
import { getKnownTenantConfig, getDefaultTenant } from '../registry';

export { loadStaticTenantConfig } from './static';
export { generateTenantCss, generateTenantCssFile, buildTenantSelector } from './static';
export type { GenerateTenantCssOptions } from './static';
export { fetchRemoteTenantConfig, configureTenantApi } from './remote';
export { getKnownTenantConfig, isKnownTenant, getKnownTenantSlugs, DEFAULT_TENANT_SLUG } from '../registry';

// In-memory cache
const cache = new Map<string, TenantConfig>();

// LocalStorage key
const STORAGE_KEY = 'rottay-ds-tenant-cache';

/**
 * Get cached config from localStorage
 */
function getFromLocalStorage(slug: string): TenantConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${slug}`);
    if (!stored) return null;

    const { config, timestamp } = JSON.parse(stored);

    // Cache expires after 1 hour
    if (Date.now() - timestamp > 60 * 60 * 1000) {
      localStorage.removeItem(`${STORAGE_KEY}-${slug}`);
      return null;
    }

    return config;
  } catch {
    return null;
  }
}

/**
 * Save config to localStorage
 */
function saveToLocalStorage(slug: string, config: TenantConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${STORAGE_KEY}-${slug}`, JSON.stringify({
      config,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get tenant configuration
 * Priority: memory cache → localStorage → known registry → static files → remote API → default
 */
export async function getTenantConfig(slug: string): Promise<TenantConfig> {
  const normalizedSlug = slug.toLowerCase();

  // 1. Check memory cache
  if (cache.has(normalizedSlug)) {
    return cache.get(normalizedSlug)!;
  }

  // 2. Check localStorage cache
  const fromStorage = getFromLocalStorage(normalizedSlug);
  if (fromStorage) {
    cache.set(normalizedSlug, fromStorage);
    return fromStorage;
  }

  // 3. Check known tenants registry (built-in configs)
  const knownConfig = getKnownTenantConfig(normalizedSlug);
  if (knownConfig) {
    cache.set(normalizedSlug, knownConfig);
    return knownConfig;
  }

  // 4. Try static files
  try {
    const config = await loadStaticTenantConfig(normalizedSlug);
    cache.set(normalizedSlug, config);
    saveToLocalStorage(normalizedSlug, config);
    return config;
  } catch {
    // Static file not found, continue
  }

  // 5. Try remote API
  try {
    const config = await fetchRemoteTenantConfig(normalizedSlug);
    cache.set(normalizedSlug, config);
    saveToLocalStorage(normalizedSlug, config);
    return config;
  } catch {
    // API failed, continue
  }

  // 6. Return default tenant (rottay)
  const defaultConfig = getDefaultTenant();
  cache.set(normalizedSlug, defaultConfig);
  return defaultConfig;
}

/**
 * Clear tenant cache
 */
export function clearTenantCache(slug?: string): void {
  if (slug) {
    cache.delete(slug);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_KEY}-${slug}`);
    }
  } else {
    cache.clear();
  }
}

/**
 * Preload tenant config
 */
export async function preloadTenantConfig(slug: string): Promise<void> {
  await getTenantConfig(slug);
}
