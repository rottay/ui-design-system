import { describe, expect, it } from 'vitest';
import type { TenantConfig } from '@/foundation/contracts';
import * as provider from '..';
import * as facade from '../../..';
import * as tenantConfig from '../tenant-config';
import { mergeLocaleTranslations } from '../translations';
import { NO_RETENTION_REVOCATION, NO_RETENTION_SUBSCRIPTION } from '../retention';

const base = {
  slug: 'acme',
  name: 'ACME',
  plan: 'enterprise',
  features: ['a'],
  branding: { companyName: 'ACME', logo: '/l.svg', primaryColor: '#000000' },
} as unknown as TenantConfig;

describe('provider module split — public bindings', () => {
  it('publishes exactly the runtime bindings it published before the split', () => {
    expect(Object.keys(provider).sort()).toEqual([
      'BEHAVIOR_OVERRIDE_KEYS',
      'DesignSystemProvider',
      'isCommittedTenantRequest',
      'mergeDefinedOwnEntries',
    ]);
  });

  it('re-exports the owning declarations by identity', () => {
    expect(provider.BEHAVIOR_OVERRIDE_KEYS).toBe(tenantConfig.BEHAVIOR_OVERRIDE_KEYS);
    expect(provider.mergeDefinedOwnEntries).toBe(tenantConfig.mergeDefinedOwnEntries);
    expect(provider.isCommittedTenantRequest).toBe(tenantConfig.isCommittedTenantRequest);
    expect(facade.DesignSystemProvider).toBe(provider.DesignSystemProvider);
  });
});

describe('provider module split — moved helpers', () => {
  it('keeps a behavior-only override on the untouched base object', () => {
    const partition = tenantConfig.partitionTenantOverrides({ locale: 'es', theme: 'dark', slug: undefined });
    expect(partition).toEqual({ behavior: { locale: 'es', theme: 'dark' }, config: null });
    expect(tenantConfig.resolveTenantConfigWithOverrides(base, partition)).toBe(base);
  });

  it('merges branding under the undefined discipline and projects identity-only branding', () => {
    const partition = tenantConfig.partitionTenantOverrides({
      branding: { companyName: 'X', logo: undefined, favicon: '/f.ico' },
    } as Partial<TenantConfig>);
    const merged = tenantConfig.resolveTenantConfigWithOverrides(base, partition);
    expect(merged.branding).toEqual({ companyName: 'X', logo: '/l.svg', primaryColor: '#000000', favicon: '/f.ico' });
    expect(tenantConfig.buildResolvedRuntimeConfig(merged).branding).toEqual({
      companyName: 'X',
      logo: '/l.svg',
      favicon: '/f.ico',
    });
  });

  it('keeps the committed-request predicate and the no-artifact store identities', () => {
    expect(tenantConfig.isCommittedTenantRequest(false, 'a', 'a')).toBe(true);
    expect(tenantConfig.isCommittedTenantRequest(true, 'a', 'a')).toBe(false);
    expect(tenantConfig.isCommittedTenantRequest(false, 'a', 'b')).toBe(false);
    expect(NO_RETENTION_REVOCATION()).toBeNull();
    expect(typeof NO_RETENTION_SUBSCRIPTION()).toBe('function');
  });

  it('merges locale dictionaries surgically and skips undefined', () => {
    const merged = mergeLocaleTranslations(
      { common: { save: 'Save', cancel: 'Cancel' } } as never,
      { common: { save: 'Guardar', cancel: undefined } } as never,
    );
    expect(merged).toEqual({ common: { save: 'Guardar', cancel: 'Cancel' } });
  });
});
