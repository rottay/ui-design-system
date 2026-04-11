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
          slug: 'bithire',
          name: 'BitHire',
          engine: 'classic',
          theme: 'base',
          locale: 'en',
          fallbackLocale: 'en',
          plan: 'enterprise',
          features: ['recruiting'],
          branding: { companyName: 'BitHire', primaryColor: '#0a66c2', accentColor: '#22c55e' },
        }),
      })
    );

    const config = await loadStaticTenantConfig('bithire');

    expect(fetch).toHaveBeenCalledWith('/.designsystem/tenants/bithire/config.json');
    expect(config.name).toBe('BitHire');
  });

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
