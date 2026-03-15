import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
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
} from './tenant-test-utils';
import { STABLE_ENGINES } from './engine-test-utils';

describe('tenant-test-utils', () => {
  afterEach(() => {
    clearTenantAttribute();
    vi.restoreAllMocks();
  });

  it('sets and clears the tenant attribute on the document root', () => {
    setTenantAttribute('bithire');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('bithire');

    clearTenantAttribute();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('renders a component with an explicit tenant wrapper', () => {
    const result = renderWithTenant(<div>Tenant ready</div>, 'rottay', {
      tenantConfig: {
        branding: {
          companyName: 'Rottay QA',
          primaryColor: '#0f62fe',
        },
      },
    });

    expect(result.getByText('Tenant ready')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-tenant')).toBe('rottay');
  });

  it('renders the same component with all test tenants', () => {
    const results = renderWithAllTenants(<div>All tenants</div>);

    expect(results.rottay.container).toHaveTextContent('All tenants');
    expect(results.bithire.container).toHaveTextContent('All tenants');
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
    expect(seen[0]).toBe('classic:rottay');
    expect(seen.at(-1)).toBe('rustic:default');
  });

  it('registers describe.each for tenant-only helpers', () => {
    const eachRegistrar = vi.fn();
    const describeEachSpy = vi.fn(() => eachRegistrar);
    const originalDescribe = globalThis.describe;

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
    const originalIt = globalThis.it;

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
    const describeEachSpy = vi.fn(() => eachRegistrar);
    const originalDescribe = globalThis.describe;

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: Object.assign(vi.fn(), { each: describeEachSpy }),
    });

    const callback = vi.fn();
    describeEachEngineAndTenant('Matrix helper', callback);

    const matrix = describeEachSpy.mock.calls[0]?.[0];
    expect(matrix).toHaveLength(STABLE_ENGINES.length * TEST_TENANTS.length);
    expect(matrix[0]).toEqual(['classic', 'rottay']);
    expect(matrix.at(-1)).toEqual(['rustic', 'default']);
    expect(eachRegistrar).toHaveBeenCalledWith('Matrix helper - %s engine / %s tenant', callback);

    Object.defineProperty(globalThis, 'describe', {
      configurable: true,
      value: originalDescribe,
    });
  });

  it('exposes tenant configs and type guards', () => {
    expect(getTenantConfig('rottay').branding?.companyName).toBe('Rottay');
    expect(getTenantConfig('bithire').branding?.companyName).toBe('BitHire');
    expect(isTestTenant('rottay')).toBe(true);
    expect(isTestTenant('default')).toBe(true);
    expect(isTestTenant('platform')).toBe(false);
  });
});
