/**
 * @fileoverview Tests for the static tenant config loader -- validates fetch
 * behavior, path construction, and schema validation on loaded payloads.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadStaticTenantConfig } from '..';

describe('static tenant loader', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads valid tenant configs from the static config path', async () => {
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
          features: ['recruiting'],
          branding: { companyName: 'Acme', primaryColor: '#0a66c2', accentColor: '#22c55e' },
        }),
      })
    );

    const config = await loadStaticTenantConfig('acme');

    expect(fetch).toHaveBeenCalledWith('/.designsystem/tenants/acme/config.json');
    expect(config.name).toBe('Acme');
    expect(config.engine).toBeUndefined();
  });

  it('rejects a reserved slug before fetching', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(loadStaticTenantConfig('Bit-Hire')).rejects.toThrow(/reserved/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['Acme', 'acme_works', 'acme--works'])(
    'rejects a non-canonical request before fetching: %j',
    async (slug) => {
      const fetch = vi.fn();
      vi.stubGlobal('fetch', fetch);

      await expect(loadStaticTenantConfig(slug)).rejects.toThrow(/lower-kebab/);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('rejects a reserved display identity from static JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: 'acme',
          name: 'Bit Hire',
          engine: 'modern',
          theme: 'base',
          plan: 'enterprise',
          features: [],
          branding: { companyName: 'Acme' },
        }),
      }),
    );

    await expect(loadStaticTenantConfig('acme')).rejects.toThrow(/reserved/);
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

      await expect(loadStaticTenantConfig('acme')).rejects.toThrow(/identity mismatch/);
    },
  );

  it('rejects when the static asset does not exist', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      })
    );

    await expect(loadStaticTenantConfig('missing')).rejects.toThrow(
      'Static config not found for tenant: missing'
    );
  });

  it('rejects invalid static tenant configs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: 'broken' }),
      })
    );

    await expect(loadStaticTenantConfig('broken')).rejects.toThrow(
      'Invalid tenant config for: broken'
    );
  });
});
