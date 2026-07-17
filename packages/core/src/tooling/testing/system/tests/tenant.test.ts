/**
 * @fileoverview Tenant system unit tests covering schema validation
 * (isValidTenantConfig), default config generation
 * (getDefaultTenantConfig), and all three resolver strategies (subdomain,
 * domain, header).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isValidTenantConfig } from '../../../../infrastructure/runtime/tenant/foundation/validation';
import { getDefaultTenantConfig } from '../../../../infrastructure/runtime/tenant/foundation/configuration/defaults';
import { resolveFromSubdomain } from '../../../../infrastructure/runtime/tenant/runtime/resolution/subdomain';
import {
  resolveFromDomain,
  configureDomainLookup,
} from '../../../../infrastructure/runtime/tenant/runtime/resolution/domain';
import {
  resolveFromHeader,
  setServerHeaders,
  clearServerHeaders,
} from '../../../../infrastructure/runtime/tenant/runtime/resolution/header';

let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  consoleWarnSpy.mockRestore();
});

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
      // Same rule for the fallback tenant: no engine, so the vertical decides.
      expect(config.engine).toBeUndefined();
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
