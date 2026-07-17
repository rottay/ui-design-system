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
    await expect(fetchRemoteTenantConfig('evnto')).rejects.toThrow(
      'Tenant API endpoint not configured'
    );
  });

  it('fetches and validates tenant configs from the configured endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: 'evnto',
          name: 'Evnto',
          engine: 'classic',
          theme: 'base',
          locale: 'en',
          fallbackLocale: 'en',
          plan: 'enterprise',
          features: ['events'],
          branding: { companyName: 'Evnto', primaryColor: '#f97316', accentColor: '#06b6d4' },
        }),
      })
    );

    configureTenantApi('https://tenants.example.com');
    const config = await fetchRemoteTenantConfig('evnto');

    expect(fetch).toHaveBeenCalledWith('https://tenants.example.com/evnto');
    expect(config.slug).toBe('evnto');
  });

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
