/**
 * @fileoverview Tenant Storage Facade
 * @description Central entry point for tenant resolution across built-in,
 * static, remote, and cached sources.
 *
 * Resolution priority:
 * 1. Memory cache
 * 2. localStorage cache
 * 3. Known tenants registry (built-in configs)
 * 4. Static files
 * 5. Remote API
 * 6. Default config (rottay)
 *
 * This file is intentionally the only place that knows the full fallback chain.
 * Providers and apps should call `getTenantConfig()` rather than reimplementing
 * their own lookup strategy.
 */

import type { TenantConfig } from '../../contracts';
import { loadStaticTenantConfig } from './static';
import { fetchRemoteTenantConfig } from './remote';
import { getDefaultTenantConfig } from '../defaults';
import { getKnownTenantConfig, getDefaultTenant } from '../registry';

export { loadStaticTenantConfig } from './static';
export { generateTenantCss, generateTenantCssFile, buildTenantSelector } from './static';
export type { GenerateTenantCssOptions } from './static';
export { fetchRemoteTenantConfig, configureTenantApi } from './remote';
export { getKnownTenantConfig, isKnownTenant, getKnownTenantSlugs, DEFAULT_TENANT_SLUG } from '../registry';

// In-memory cache -- survives React re-renders and hot reloads. This is the
// fastest lookup (step 1 in the chain) and is populated by every successful
// resolution from any downstream source.
const cache = new Map<string, TenantConfig>();

// WHY a prefixed key: multiple Rottay apps may coexist on the same origin
// (e.g., Storybook and the platform app), so we namespace to avoid collisions.
const STORAGE_KEY = 'rottay-ds-tenant-cache';

/**
 * Reads a cached tenant config from localStorage.
 *
 * Local cache is treated as an optimization only. Any parse issue or expired
 * record is ignored so runtime resolution can continue to the next source.
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
 * Persists a tenant config to localStorage with a short-lived timestamp.
 *
 * The DS keeps this best-effort on purpose: tenant resolution should never fail
 * just because the browser blocks storage writes.
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
 * Resolves a tenant configuration using the runtime fallback chain.
 *
 * Priority:
 * 1. Memory cache (instant, populated by prior calls)
 * 2. localStorage cache (fast, survives page reloads, 1-hour TTL)
 * 3. Known registry (bundled first-party tenants -- zero network)
 * 4. Static files (`/.designsystem/tenants/<slug>/config.json`)
 * 5. Remote API (platform-managed tenants in the database)
 * 6. Default Rottay config (absolute safety net)
 *
 * WHY six levels: the DS must render predictably in every environment --
 * local dev (no API), preview deploys (static files only), production
 * (full API), and CI (bundled registry). Each level adds resilience.
 *
 * @param slug - Tenant identifier to resolve (case-insensitive).
 * @returns A guaranteed-valid TenantConfig. Never throws.
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

  // 3. Built-in registry is the fast path for first-party/demo tenants that ship
  // with the DS bundle.
  const knownConfig = getKnownTenantConfig(normalizedSlug);
  if (knownConfig) {
    cache.set(normalizedSlug, knownConfig);
    return knownConfig;
  }

  // 4. Static files are useful for deployments that publish tenant payloads as
  // versioned assets instead of serving them from an API.
  try {
    const config = await loadStaticTenantConfig(normalizedSlug);
    cache.set(normalizedSlug, config);
    saveToLocalStorage(normalizedSlug, config);
    return config;
  } catch {
    // Static file not found, continue
  }

  // 5. Remote API is the canonical path for platform-managed tenants.
  try {
    const config = await fetchRemoteTenantConfig(normalizedSlug);
    cache.set(normalizedSlug, config);
    saveToLocalStorage(normalizedSlug, config);
    return config;
  } catch {
    // API failed, continue
  }

  // 6. Final safety net. We always return a valid tenant so the DS can render
  // predictably even when tenant resolution fails upstream.
  const defaultConfig = getDefaultTenant();
  cache.set(normalizedSlug, defaultConfig);
  return defaultConfig;
}

/**
 * Clears cached tenant configs from the in-memory Map and optionally from
 * localStorage. Pass a specific slug to evict one tenant, or call with no
 * arguments to flush the entire memory cache.
 *
 * WHY localStorage is only cleared when a slug is provided: a blanket
 * `localStorage.clear()` could wipe unrelated app data. Targeted removal
 * is safer.
 *
 * @param slug - Optional tenant slug. If omitted, only the in-memory cache is cleared.
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
 * Preloads a tenant config into the cache without returning it to the caller.
 * Useful for route transitions or dashboards that know the next tenant ahead of time.
 */
export async function preloadTenantConfig(slug: string): Promise<void> {
  await getTenantConfig(slug);
}
