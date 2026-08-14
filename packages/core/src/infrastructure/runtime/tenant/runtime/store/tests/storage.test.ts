/**
 * @fileoverview Tests for the tenant storage facade -- validates the full
 * resolution chain: memory -> localStorage -> registry -> static -> remote -> default.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getKnownTenantConfig } from '../../../foundation/configuration/registry';
import {
  clearTenantCache,
  getTenantConfig,
  preloadTenantConfig,
} from '..';
import { loadStaticTenantConfig } from '../static/loader';
import { fetchRemoteTenantConfig } from '../remote';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';

vi.mock('../static/loader', () => ({
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

  it('resolves the code-owned registry before a poisoned first-party cache entry', async () => {
    localStorage.setItem(
      'rottay-ds-tenant-cache-bithire',
      JSON.stringify({
        config: {
          slug: 'bithire',
          name: 'Attacker',
          engine: 'modern',
          theme: 'base',
          plan: 'enterprise',
          features: ['*'],
          branding: { companyName: 'Attacker' },
        },
        timestamp: Date.now(),
      }),
    );

    await expect(getTenantConfig('bithire')).resolves.toEqual(
      getKnownTenantConfig('bithire'),
    );
    expect(mockedLoadStaticTenantConfig).not.toHaveBeenCalled();
    expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
  });

  it.each(['BitHire', 'bit-hire', 'bit\u200dhire', 'ＢｉｔＨｉｒｅ'])(
    'rejects a reserved request variant before cache or I/O: %j',
    async (slug) => {
      await expect(getTenantConfig(slug)).rejects.toThrow(/reserved/);
      expect(mockedLoadStaticTenantConfig).not.toHaveBeenCalled();
      expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
    },
  );

  it.each(['Acme', 'acme_works', 'acme--works'])(
    'rejects a non-canonical customer request before cache or I/O: %j',
    async (slug) => {
      await expect(getTenantConfig(slug)).rejects.toThrow(/lower-kebab/);
      expect(mockedLoadStaticTenantConfig).not.toHaveBeenCalled();
      expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
    },
  );

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

  it.each([
    ['non-numeric', 'not-a-timestamp'],
    ['null', null],
    ['future', Date.now() + 60_000],
  ])('discards a %s localStorage timestamp', async (_label, timestamp) => {
    localStorage.setItem(
      'rottay-ds-tenant-cache-acme',
      JSON.stringify({
        config: {
          slug: 'acme',
          name: 'Cached Acme',
          theme: 'base',
          plan: 'pro',
          features: [],
          branding: { companyName: 'Cached Acme' },
        },
        timestamp,
      }),
    );
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'acme',
      name: 'Fresh Acme',
      theme: 'base',
      plan: 'pro',
      features: [],
      branding: { companyName: 'Fresh Acme' },
    });

    await expect(getTenantConfig('acme')).resolves.toMatchObject({ name: 'Fresh Acme' });
    expect(localStorage.removeItem).toHaveBeenCalledWith('rottay-ds-tenant-cache-acme');
    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledWith('acme');
  });

  it('discards a cached slug that only matches after normalization', async () => {
    localStorage.setItem(
      'rottay-ds-tenant-cache-acme',
      JSON.stringify({
        config: {
          slug: 'ACME',
          name: 'Cached Acme',
          theme: 'base',
          plan: 'pro',
          features: [],
          branding: { companyName: 'Cached Acme' },
        },
        timestamp: Date.now(),
      }),
    );
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'acme',
      name: 'Fresh Acme',
      theme: 'base',
      plan: 'pro',
      features: [],
      branding: { companyName: 'Fresh Acme' },
    });

    await expect(getTenantConfig('acme')).resolves.toMatchObject({ name: 'Fresh Acme' });
    expect(localStorage.removeItem).toHaveBeenCalledWith('rottay-ds-tenant-cache-acme');
  });

  it('discards a customer cache entry carrying a reserved display identity', async () => {
    localStorage.setItem(
      'rottay-ds-tenant-cache-acme',
      JSON.stringify({
        config: {
          slug: 'acme',
          name: 'Bit Hire',
          engine: 'modern',
          theme: 'base',
          plan: 'pro',
          features: [],
          branding: { companyName: 'Acme' },
        },
        timestamp: Date.now(),
      }),
    );
    mockedLoadStaticTenantConfig.mockResolvedValue({
      slug: 'acme',
      name: 'Acme',
      engine: 'modern',
      theme: 'base',
      plan: 'pro',
      features: [],
      branding: { companyName: 'Acme' },
    });

    await expect(getTenantConfig('acme')).resolves.toMatchObject({ name: 'Acme' });
    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledWith('acme');
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      'rottay-ds-tenant-cache-acme',
    );
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

  it('stores an immutable snapshot so a caller cannot poison the memory cache', async () => {
    const loaderConfig = {
      slug: 'acme',
      name: 'Acme',
      theme: 'base',
      plan: 'pro' as const,
      features: ['search'],
      branding: { companyName: 'Acme' },
    };
    mockedLoadStaticTenantConfig.mockResolvedValue(loaderConfig);

    const first = await getTenantConfig('acme');
    expect(first).not.toBe(loaderConfig);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.branding)).toBe(true);
    expect(Object.isFrozen(first.features)).toBe(true);
    expect(Reflect.set(first, 'name', 'BitHire')).toBe(false);
    expect(Reflect.set(first.branding, 'companyName', 'BitHire')).toBe(false);

    loaderConfig.name = 'BitHire';
    loaderConfig.branding.companyName = 'BitHire';
    const second = await getTenantConfig('acme');
    expect(second).toMatchObject({
      slug: 'acme',
      name: 'Acme',
      branding: { companyName: 'Acme' },
    });
    expect(mockedLoadStaticTenantConfig).toHaveBeenCalledTimes(1);
  });

  it('propagates a reserved identity returned by a loader instead of falling back', async () => {
    mockedLoadStaticTenantConfig.mockRejectedValue(
      new ReservedTenantIdentityError({
        kind: 'reserved-identity-violation',
        field: 'name',
        value: 'BitHire',
        reservedAs: 'BitHire',
      }),
    );

    await expect(getTenantConfig('acme')).rejects.toThrow(/reserved/);
    expect(mockedFetchRemoteTenantConfig).not.toHaveBeenCalled();
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

  it('preserves requested identity and retries after every source fails', async () => {
    mockedLoadStaticTenantConfig.mockRejectedValue(new Error('missing'));
    mockedFetchRemoteTenantConfig.mockRejectedValue(new Error('offline'));

    const config = await getTenantConfig('unknown-tenant');

    expect(config).toMatchObject({
      slug: 'unknown-tenant',
      name: 'unknown-tenant',
      features: [],
      branding: { companyName: 'unknown-tenant' },
    });

    mockedFetchRemoteTenantConfig.mockResolvedValue({
      slug: 'unknown-tenant',
      name: 'Recovered Tenant',
      theme: 'base',
      plan: 'starter',
      features: [],
      branding: { companyName: 'Recovered Tenant' },
    });
    const recovered = await getTenantConfig('unknown-tenant');

    expect(recovered.name).toBe('Recovered Tenant');
    expect(mockedFetchRemoteTenantConfig).toHaveBeenCalledTimes(2);
  });

  it('rejects a remote payload belonging to another tenant', async () => {
    mockedLoadStaticTenantConfig.mockRejectedValue(new Error('missing'));
    mockedFetchRemoteTenantConfig.mockResolvedValue({
      slug: 'tenant-b',
      name: 'Tenant B',
      theme: 'base',
      plan: 'starter',
      features: [],
      branding: { companyName: 'Tenant B' },
    });

    const config = await getTenantConfig('tenant-a');

    expect(config).toMatchObject({
      slug: 'tenant-a',
      branding: { companyName: 'tenant-a' },
    });
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
