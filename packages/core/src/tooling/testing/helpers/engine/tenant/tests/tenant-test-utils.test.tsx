/**
 * @fileoverview Tests for tenant test utilities: renderWithTenant,
 * renderWithAllTenants, describeEachTenant, and cross-engine x tenant matrix.
 *
 * The four mounting suites here were red for a reason worth stating, because
 * the failure was in the fixture and not in the helper: `TEST_TENANTS` used to
 * name the code-owned first-party identities `rottay` and `bithire`, and
 * `TenantProvider` throws `ReservedTenantIdentityError` on exactly those. Every
 * assertion that mounted a provider died before rendering.
 *
 * Renaming the roster to synthetic customers fixes it, but a rename is only as
 * durable as what guards it, so two fences are asserted below rather than
 * assumed: `ships only non-reserved customer identities` classifies the shipped
 * roster and fails the moment a first-party slug is reintroduced, and
 * `refuses to mount a reserved first-party identity` drives a first-party slug
 * through `renderWithTenant` itself and proves the runtime -- not this test --
 * is what rejects it.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ReservedTenantIdentityError,
  classifyTenantIdentity,
} from '@/foundation/tokens/ts/presentation/brand-themes';

import {
  TENANT_CONFIGS,
  TEST_TENANTS,
  assertAcrossEnginesAndTenants,
  assertAcrossTenants,
  clearTenantAttribute,
  describeEachEngineAndTenant,
  describeEachTenant,
  getTenantConfig,
  isTestTenant,
  itEachTenant,
  renderWithAllTenants,
  renderWithTenant,
  setTenantAttribute,
} from '..';
import { STABLE_ENGINES } from '../..';

/**
 * `vitest/globals` declares `describe`/`it` as ambient `const` bindings, and a
 * `const` never becomes a property of `typeof globalThis` — only `var` does.
 * These suites legitimately read them off the global object to swap the
 * registrar, so the property view is spelled out here rather than in the
 * ambient .d.ts (where it cannot work: the names are already bound).
 */
const testGlobals = globalThis as typeof globalThis & {
  describe: typeof describe;
  it: typeof it;
};



describe('tenant-test-utils', () => {
  afterEach(() => {
    clearTenantAttribute();
    vi.restoreAllMocks();
  });

  it('sets and clears the tenant attribute on the document root', () => {
    setTenantAttribute('northwind');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('northwind');

    clearTenantAttribute();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('ships only non-reserved customer identities', () => {
    for (const tenant of TEST_TENANTS) {
      const config = TENANT_CONFIGS[tenant];

      expect(
        classifyTenantIdentity({
          slug: config.slug,
          name: config.name,
          companyName: config.branding?.companyName,
        })
      ).toEqual({ kind: 'customer' });
    }
  });

  it('refuses to mount a reserved first-party identity', () => {
    // Driven through renderWithTenant, not through the classifier directly, so
    // the refusal is proved on the path the helper actually offers callers.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      renderWithTenant(<div>Reserved</div>, 'acme', {
        tenantConfig: { slug: 'rottay', name: 'Rottay' },
      })
    ).toThrow(ReservedTenantIdentityError);

    consoleError.mockRestore();
  });

  it('renders a component with an explicit tenant wrapper', () => {
    const result = renderWithTenant(<div>Tenant ready</div>, 'acme', {
      tenantConfig: {
        branding: {
          companyName: 'Acme QA',
          primaryColor: '#0f62fe',
        },
      },
    });

    expect(result.getByText('Tenant ready')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-tenant')).toBe('acme');
  });

  it('renders the same component with all test tenants', () => {
    const results = renderWithAllTenants(<div>All tenants</div>);

    expect(results.acme.container).toHaveTextContent('All tenants');
    expect(results.northwind.container).toHaveTextContent('All tenants');
    expect(results.default.container).toHaveTextContent('All tenants');
  });

  it('asserts across all tenants', async () => {
    const seen: string[] = [];

    await assertAcrossTenants(<div>Tenant matrix</div>, (result, tenant) => {
      expect(result.getByText('Tenant matrix')).toBeInTheDocument();
      seen.push(tenant);
    });

    expect(seen).toEqual([...TEST_TENANTS]);
  });

  it('asserts across the engine and tenant matrix', async () => {
    const seen: Array<string> = [];

    await assertAcrossEnginesAndTenants(<div>Matrix</div>, (result, engine, tenant) => {
      expect(result.getByText('Matrix')).toBeInTheDocument();
      seen.push(`${engine}:${tenant}`);
    });

    expect(seen).toHaveLength(STABLE_ENGINES.length * TEST_TENANTS.length);
    expect(seen[0]).toBe('classic:acme');
    expect(seen.at(-1)).toBe('rustic:default');
  });

  it('registers describe.each for tenant-only helpers', () => {
    const eachRegistrar = vi.fn();
    const describeEachSpy = vi.fn(() => eachRegistrar);
    const originalDescribe = testGlobals.describe;

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: describeEachSpy }),
    });

    const callback = vi.fn();
    describeEachTenant('Tenant helper', callback);

    expect(describeEachSpy).toHaveBeenCalledWith(TEST_TENANTS);
    expect(eachRegistrar).toHaveBeenCalledWith('Tenant helper - %s tenant', callback);

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: originalDescribe,
    });
  });

  it('registers it.each for tenant-only helpers', () => {
    const eachRegistrar = vi.fn();
    const itEachSpy = vi.fn(() => eachRegistrar);
    const originalIt = testGlobals.it;

    Object.defineProperty(globalThis, 'it', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: itEachSpy }),
    });

    const callback = vi.fn();
    itEachTenant('Tenant case', callback);

    expect(itEachSpy).toHaveBeenCalledWith(TEST_TENANTS);
    expect(eachRegistrar).toHaveBeenCalledWith('Tenant case (%s)', callback);

    Object.defineProperty(globalThis, 'it', {
      configurable: true,
      value: originalIt,
    });
  });

  it('registers describe.each for the engine/tenant matrix', () => {
    const eachRegistrar = vi.fn();
    const describeEachSpy = vi.fn(
      (_matrix: ReadonlyArray<readonly [string, string]>) => eachRegistrar
    );
    const originalDescribe = testGlobals.describe;

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: describeEachSpy }),
    });

    const callback = vi.fn();
    describeEachEngineAndTenant('Matrix helper', callback);

    const matrix = describeEachSpy.mock.calls[0]?.[0] ?? [];
    expect(matrix).toHaveLength(STABLE_ENGINES.length * TEST_TENANTS.length);
    expect(matrix[0]).toEqual(['classic', 'acme']);
    expect(matrix.at(-1)).toEqual(['rustic', 'default']);
    expect(eachRegistrar).toHaveBeenCalledWith('Matrix helper - %s engine / %s tenant', callback);

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: originalDescribe,
    });
  });

  it('exposes tenant configs and type guards', () => {
    expect(getTenantConfig('acme').branding?.companyName).toBe('Acme Industries');
    expect(getTenantConfig('northwind').branding?.companyName).toBe('Northwind Trading');
    expect(isTestTenant('acme')).toBe(true);
    expect(isTestTenant('default')).toBe(true);
    expect(isTestTenant('rottay')).toBe(false);
  });
});
