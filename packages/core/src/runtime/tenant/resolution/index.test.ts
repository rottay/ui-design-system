/**
 * @fileoverview Tests for the central tenant slug resolver chain:
 * header -> subdomain -> domain -> fallback.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  configureDomainLookup,
  resolveFromDomain,
  resolveTenant,
} from '.';

describe('tenant resolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('returns the fallback when subdomain and domain strategies are skipped', async () => {
    vi.stubGlobal('window', { location: { hostname: '' } });

    await expect(
      resolveTenant({
        skipSubdomain: true,
        skipDomain: true,
        fallback: 'rottay',
      })
    ).resolves.toBe('rottay');
  });

  it('resolves the tenant from the current subdomain', async () => {
    vi.stubGlobal('window', { location: { hostname: 'bithire.rottay.dev' } });

    await expect(resolveTenant({ skipDomain: true })).resolves.toBe('bithire');
  });

  it('resolves the tenant from the configured domain lookup endpoint', async () => {
    configureDomainLookup('/api/tenant');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ found: true, slug: 'evnto' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveFromDomain('events.example.com')).resolves.toBe('evnto');
    expect(fetchMock).toHaveBeenCalledWith('/api/tenant?domain=events.example.com');
  });

  it('returns null for missing or failing domain lookups', async () => {
    configureDomainLookup('/api/tenant');

    const missingFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ found: false, slug: 'ignored' }),
    });
    vi.stubGlobal('fetch', missingFetch);
    await expect(resolveFromDomain('unknown.example.com')).resolves.toBeNull();

    const failedFetch = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', failedFetch);
    await expect(resolveFromDomain('offline.example.com')).resolves.toBeNull();
  });
});
