/**
 * Tenant System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidTenantConfig,
  createTenantConfig,
} from '../../theme/tenants/schema';
import { getDefaultTenantConfig } from '../../theme/tenants/defaults';
import { resolveFromSubdomain } from '../../theme/tenants/resolver/subdomain';
import { resolveFromDomain, configureDomainLookup } from '../../theme/tenants/resolver/domain';
import { resolveFromHeader, setServerHeaders, clearServerHeaders } from '../../theme/tenants/resolver/header';

describe('Tenant Schema', () => {
  describe('isValidTenantConfig', () => {
    it('should return true for valid config', () => {
      const config = {
        slug: 'acme',
        name: 'Acme Corp',
        engine: 'classic' as const,
        theme: 'default',
        plan: 'pro' as const,
        features: ['dashboard'],
        branding: {
          companyName: 'Acme Corp',
        },
      };
      expect(isValidTenantConfig(config)).toBe(true);
    });

    it('should return false for missing required fields', () => {
      expect(isValidTenantConfig({})).toBe(false);
      expect(isValidTenantConfig({ slug: 'test' })).toBe(false);
      expect(isValidTenantConfig(null)).toBe(false);
      expect(isValidTenantConfig(undefined)).toBe(false);
    });

    it('should return false for invalid engine', () => {
      const config = {
        slug: 'test',
        name: 'Test',
        engine: 'invalid',
        theme: 'default',
        plan: 'pro',
        features: [],
        branding: { companyName: 'Test' },
      };
      expect(isValidTenantConfig(config)).toBe(false);
    });

    it('should return false for invalid plan', () => {
      const config = {
        slug: 'test',
        name: 'Test',
        engine: 'classic',
        theme: 'default',
        plan: 'invalid',
        features: [],
        branding: { companyName: 'Test' },
      };
      expect(isValidTenantConfig(config)).toBe(false);
    });
  });

  describe('createTenantConfig', () => {
    it('should create config with defaults', () => {
      const config = createTenantConfig({
        slug: 'test',
        name: 'Test Company',
      });

      expect(config.slug).toBe('test');
      expect(config.name).toBe('Test Company');
      expect(config.engine).toBe('classic');
      expect(config.theme).toBe('base'); // default theme is 'base'
      expect(config.plan).toBe('starter');
      expect(config.features).toEqual([]);
      expect(config.branding.companyName).toBe('Test Company');
    });

    it('should allow overriding defaults', () => {
      const config = createTenantConfig({
        slug: 'acme',
        name: 'Acme',
        engine: 'modern',
        plan: 'enterprise',
      });

      expect(config.engine).toBe('modern');
      expect(config.plan).toBe('enterprise');
    });
  });
});

describe('Tenant Defaults', () => {
  describe('getDefaultTenantConfig', () => {
    it('should create default config with required fields', () => {
      const config = getDefaultTenantConfig({
        slug: 'demo',
        name: 'Demo Tenant',
      });

      expect(config.slug).toBe('demo');
      expect(config.name).toBe('Demo Tenant');
      expect(config.engine).toBeDefined();
      expect(config.theme).toBeDefined();
      expect(config.plan).toBeDefined();
      expect(config.features).toBeDefined();
      expect(config.branding).toBeDefined();
    });
  });
});

describe('Tenant Resolver', () => {
  describe('resolveFromSubdomain', () => {
    it('should extract tenant from subdomain', () => {
      expect(resolveFromSubdomain('acme.app.rottay.com')).toBe('acme');
      expect(resolveFromSubdomain('demo.app.rottay.com')).toBe('demo');
    });

    it('should return null for invalid subdomains', () => {
      expect(resolveFromSubdomain('app.rottay.com')).toBeNull();
      expect(resolveFromSubdomain('localhost')).toBeNull();
      expect(resolveFromSubdomain('')).toBeNull();
    });

    it('should handle www subdomain', () => {
      expect(resolveFromSubdomain('www.app.rottay.com')).toBeNull();
    });
  });

  describe('resolveFromDomain', () => {
    it('should return null when no domain lookup endpoint configured', async () => {
      const result = await resolveFromDomain('acme.com');
      expect(result).toBeNull();
    });

    it('should return null for empty domain', async () => {
      const result = await resolveFromDomain('');
      expect(result).toBeNull();
    });
  });

  describe('resolveFromHeader', () => {
    beforeEach(() => {
      clearServerHeaders();
    });

    it('should return header value as tenant when server headers are set', () => {
      setServerHeaders(new Headers({ 'x-tenant-id': 'acme' }));
      expect(resolveFromHeader()).toBe('acme');
    });

    it('should return null when no server headers set', () => {
      expect(resolveFromHeader()).toBeNull();
    });

    it('should work with plain object headers', () => {
      setServerHeaders({ 'x-tenant-id': 'demo' });
      expect(resolveFromHeader()).toBe('demo');
    });
  });
});
