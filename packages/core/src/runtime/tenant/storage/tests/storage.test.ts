/**
 * @fileoverview Tests for the tenant storage facade -- validates the full
 * resolution chain: memory -> localStorage -> registry -> static -> remote -> default.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getKnownTenantConfig } from '../../registry';
import {
  clearTenantCache,
  getTenantConfig,
  preloadTenantConfig,
} from '..';
import { loadStaticTenantConfig } from '../static';
import { fetchRemoteTenantConfig } from '../remote';

vi.mock('../static', () => ({
  loadStaticTenantConfig: vi.fn(),
}));

vi.mock('../remote', () => ({
  fetchRemoteTenantConfig: vi.fn(),
  configureTenantApi: vi.fn(),
}));

const mockedLoadStaticTenantConfig = vi.mocked(loadStaticTenantConfig);
const mockedFetchRemoteTenantConfig = vi.mocked(fetchRemoteTenantConfig);

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

describe('tenant storage facade', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
    clearTenantCache();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('returns built-in known tenants without touching static or remote storage', async () => {
    const config = await getTenantConfig('bithire');

    expect(config).toEqual(getKnownTenantConfig('bithire'));
    expect(mockedLoadStaticTenantConfig).not.toHaveBeenCalled();
    expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
  });

  it('hydrates from localStorage before falling through to network-backed loaders', async () => {
    localStorage.setItem(
      'rottay-ds-tenant-cache-cached-tenant',
      JSON.stringify({
        config: {
          slug: 'cached-tenant',
          name: 'Cached Tenant',
          engine: 'modern',
          theme: 'dark',
          locale: 'en',
          fallbackLocale: 'en',
          plan: 'pro',
          features: ['analytics'],
          branding: { companyName: 'Cached Tenant', primaryColor: '#2563eb', accentColor: '#14b8a6' },
        },
        timestamp: Date.now(),
      })
    );

    const config = await getTenantConfig('cached-tenant');

    expect(config.name).toBe('Cached Tenant');
    expect(mockedLoadStaticTenantConfig).not.toHaveBeenCalled();
    expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
  });

  it('loads from static storage and persists successful lookups to cache', async () => {
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'static-tenant',
      name: 'Static Tenant',
      engine: 'rustic',
      theme: 'light',
      locale: 'en',
      fallbackLocale: 'en',
      plan: 'enterprise',
      features: ['ops'],
      branding: { companyName: 'Static Tenant', primaryColor: '#0a66c2', accentColor: '#22c55e' },
    });

    const config = await getTenantConfig('static-tenant');

    expect(config.slug).toBe('static-tenant');
    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledWith('static-tenant');
    expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
    expect(localStorage.getItem('rottay-ds-tenant-cache-static-tenant')).toContain('Static Tenant');
  });

  it('falls back to remote storage when the static loader fails', async () => {
    mockedLoadStaticTenantConfig.mockRejectedValue(new Error('missing'));
    mockedFetchRemoteTenantConfig.mockResolvedValue({
      slug: 'remote-tenant',
      name: 'Remote Tenant',
      engine: 'classic',
      theme: 'base',
      locale: 'es',
      fallbackLocale: 'en',
      plan: 'enterprise',
      features: ['ops', 'sales'],
      branding: { companyName: 'Remote Tenant', primaryColor: '#ea580c', accentColor: '#06b6d4' },
    });

    const config = await getTenantConfig('remote-tenant');

    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledWith('remote-tenant');
    expect(mockedFetchRemoteTenantConfig).toHaveBeenCalledWith('remote-tenant');
    expect(config.name).toBe('Remote Tenant');
  });

  it('returns the default tenant when every source fails', async () => {
    mockedLoadStaticTenantConfig.mockRejectedValue(new Error('missing'));
    mockedFetchRemoteTenantConfig.mockRejectedValue(new Error('offline'));

    const config = await getTenantConfig('unknown-tenant');

    expect(config.slug).toBe('rottay');
  });

  it('preloads tenant configs through the same cache path', async () => {
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'preloaded',
      name: 'Preloaded Tenant',
      engine: 'rustic',
      theme: 'light',
      locale: 'en',
      fallbackLocale: 'en',
      plan: 'enterprise',
      features: ['ops'],
      branding: { companyName: 'Preloaded Tenant', primaryColor: '#111827', accentColor: '#f59e0b' },
    });

    await preloadTenantConfig('preloaded');
    const secondRead = await getTenantConfig('preloaded');

    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledTimes(1);
    expect(secondRead.name).toBe('Preloaded Tenant');
  });

  it('clears either a single tenant cache key or the whole in-memory cache', async () => {
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'clear-me',
      name: 'Clear Me',
      engine: 'classic',
      theme: 'base',
      locale: 'en',
      fallbackLocale: 'en',
      plan: 'starter',
      features: ['ops'],
      branding: { companyName: 'Clear Me', primaryColor: '#2563eb', accentColor: '#14b8a6' },
    });

    await getTenantConfig('clear-me');
    clearTenantCache('clear-me');
    await getTenantConfig('clear-me');

    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledTimes(2);

    clearTenantCache();
    localStorage.setItem(
      'rottay-ds-tenant-cache-clear-me',
      JSON.stringify({ config: { slug: 'clear-me' }, timestamp: Date.now() })
    );
    clearTenantCache('clear-me');
    expect(localStorage.getItem('rottay-ds-tenant-cache-clear-me')).toBeNull();
  });
});
