/**
 * @fileoverview Tests for the remote tenant config fetcher --
 * validates API endpoint configuration, fetch behavior, and schema validation.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureTenantApi, fetchRemoteTenantConfig } from '..';

describe('remote tenant storage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    configureTenantApi('');
  });

  it('requires an endpoint before fetching', async () => {
    await expect(fetchRemoteTenantConfig('acme')).rejects.toThrow(
      'Tenant API endpoint not configured'
    );
  });

  it('fetches and validates tenant configs from the configured endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: 'acme',
          name: 'Acme',
          theme: 'base',
          locale: 'en',
          fallbackLocale: 'en',
          plan: 'enterprise',
          features: ['events'],
          branding: { companyName: 'Acme', primaryColor: '#f97316', accentColor: '#06b6d4' },
        }),
      })
    );

    configureTenantApi('https://tenants.example.com');
    const config = await fetchRemoteTenantConfig('acme');

    expect(fetch).toHaveBeenCalledWith('https://tenants.example.com/acme');
    expect(config.slug).toBe('acme');
    expect(config.engine).toBeUndefined();
  });

  it('rejects a reserved request before the remote call', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    configureTenantApi('https://tenants.example.com');

    await expect(fetchRemoteTenantConfig('e\u200bvnto')).rejects.toThrow(/reserved/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['Acme', 'acme_works', 'acme--works'])(
    'rejects a non-canonical request before the remote call: %j',
    async (slug) => {
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);
      configureTenantApi('https://tenants.example.com');

      await expect(fetchRemoteTenantConfig(slug)).rejects.toThrow(/lower-kebab/);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('rejects a reserved identity returned by the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: 'acme',
          name: 'Acme',
          engine: 'modern',
          theme: 'base',
          plan: 'enterprise',
          features: [],
          branding: { companyName: 'Ｒｏｔｔａｙ' },
        }),
      }),
    );
    configureTenantApi('https://tenants.example.com');

    await expect(fetchRemoteTenantConfig('acme')).rejects.toThrow(/reserved/);
  });

  it.each(['other-tenant', 'ACME', 'acme '])(
    'rejects a response slug that is not exactly the requested slug: %j',
    async (responseSlug) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            slug: responseSlug,
            name: 'Acme',
            theme: 'base',
            plan: 'enterprise',
            features: [],
            branding: { companyName: 'Acme' },
          }),
        }),
      );
      configureTenantApi('https://tenants.example.com');

      await expect(fetchRemoteTenantConfig('acme')).rejects.toThrow(/identity mismatch/);
    },
  );

  it('surfaces transport errors when the response is not successful', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })
    );

    configureTenantApi('https://tenants.example.com');

    await expect(fetchRemoteTenantConfig('missing')).rejects.toThrow(
      'Failed to fetch tenant config: Not Found'
    );
  });

  it('rejects invalid tenant payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: 'broken' }),
      })
    );

    configureTenantApi('https://tenants.example.com');

    await expect(fetchRemoteTenantConfig('broken')).rejects.toThrow(
      'Invalid tenant config received for: broken'
    );
  });
});
