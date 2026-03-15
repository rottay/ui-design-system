/**
 * @fileoverview Tenant Test Utilities
 * @description Utilities for testing components across multiple tenants (rottay, bithire, default)
 */

import React, { ReactElement, Suspense } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { EngineProvider } from '../../engines/EngineProvider';
import { TenantProvider } from '../../core/providers/tenant';
import type { EngineName, TenantConfig, TenantPlan } from '../../contracts';
import { STABLE_ENGINES, type StableEngineName } from './engine-test-utils';

/**
 * Available tenants for testing
 */
export const TEST_TENANTS = ['rottay', 'bithire', 'default'] as const;
export type TestTenantName = (typeof TEST_TENANTS)[number];

/**
 * Default tenant configurations for testing
 */
export const TENANT_CONFIGS: Record<TestTenantName, TenantConfig> = {
  rottay: {
    slug: 'rottay',
    name: 'Rottay',
    engine: 'classic',
    theme: 'light',
    plan: 'enterprise' as TenantPlan,
    features: ['all'],
    branding: {
      companyName: 'Rottay',
      primaryColor: '#0066CC',
      accentColor: '#00A3E0',
    },
  },
  bithire: {
    slug: 'bithire',
    name: 'BitHire',
    engine: 'classic',
    theme: 'light',
    plan: 'enterprise' as TenantPlan,
    features: ['all'],
    branding: {
      companyName: 'BitHire',
      primaryColor: '#6366F1',
      accentColor: '#8B5CF6',
    },
  },
  default: {
    slug: 'default',
    name: 'Default',
    engine: 'classic',
    theme: 'light',
    plan: 'starter' as TenantPlan,
    features: [],
    branding: {
      companyName: 'Default',
      primaryColor: '#0066CC',
    },
  },
};

/**
 * Options for renderWithTenant
 */
export interface RenderWithTenantOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Engine to use (defaults to classic)
   */
  engine?: EngineName;
  /**
   * Custom tenant config (overrides preset)
   */
  tenantConfig?: Partial<TenantConfig>;
  /**
   * Fallback component for suspense
   */
  suspenseFallback?: React.ReactNode;
}

/**
 * Creates wrapper component for tenant tests
 */
function createTenantWrapper(
  tenant: TestTenantName,
  engine: EngineName,
  tenantConfigOverride: Partial<TenantConfig>,
  suspenseFallback: React.ReactNode
): React.FC<{ children: React.ReactNode }> {
  return function TenantWrapper({ children }) {
    const config: TenantConfig = {
      ...TENANT_CONFIGS[tenant],
      ...tenantConfigOverride,
    };

    return (
      <TenantProvider config={config}>
        <EngineProvider defaultEngine={engine}>
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </EngineProvider>
      </TenantProvider>
    );
  };
}

/**
 * Sets the data-tenant attribute on document for CSS testing
 */
export function setTenantAttribute(tenant: TestTenantName): void {
  document.documentElement.setAttribute('data-tenant', tenant);
}

/**
 * Removes the data-tenant attribute
 */
export function clearTenantAttribute(): void {
  document.documentElement.removeAttribute('data-tenant');
}

/**
 * Renders a component with a specific tenant configuration
 *
 * @example
 * ```tsx
 * import { renderWithTenant } from '@/__tests__/helpers/tenant-test-utils';
 *
 * it('renders with rottay tenant', () => {
 *   const { getByRole } = renderWithTenant(<Button>Click</Button>, 'rottay');
 *   expect(getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithTenant(
  ui: ReactElement,
  tenant: TestTenantName,
  options: RenderWithTenantOptions = {}
): RenderResult {
  const {
    engine = 'classic',
    tenantConfig = {},
    suspenseFallback = <div data-testid="loading">Loading...</div>,
    ...renderOptions
  } = options;

  // Set data-tenant attribute for CSS
  setTenantAttribute(tenant);

  const Wrapper = createTenantWrapper(tenant, engine, tenantConfig, suspenseFallback);

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Result of renderWithAllTenants
 */
export type MultiTenantRenderResult = Record<TestTenantName, RenderResult>;

/**
 * Renders a component with all test tenants
 *
 * @example
 * ```tsx
 * it('all tenants render correctly', () => {
 *   const results = renderWithAllTenants(<Button>Click</Button>);
 *
 *   expect(results.rottay.getByRole('button')).toBeInTheDocument();
 *   expect(results.bithire.getByRole('button')).toBeInTheDocument();
 *   expect(results.default.getByRole('button')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithAllTenants(
  ui: ReactElement,
  options: RenderWithTenantOptions = {}
): MultiTenantRenderResult {
  return {
    rottay: renderWithTenant(ui, 'rottay', options),
    bithire: renderWithTenant(ui, 'bithire', options),
    default: renderWithTenant(ui, 'default', options),
  };
}

/**
 * Creates a describe.each block for testing across all tenants
 *
 * @example
 * ```tsx
 * describeEachTenant('Button', (tenant) => {
 *   it('renders correctly', () => {
 *     const { getByRole } = renderWithTenant(<Button>Click</Button>, tenant);
 *     expect(getByRole('button')).toBeInTheDocument();
 *   });
 * });
 * ```
 */
export function describeEachTenant(
  name: string,
  fn: (tenant: TestTenantName) => void
): void {
  describe.each(TEST_TENANTS)(`${name} - %s tenant`, fn);
}

/**
 * Creates an it.each block for testing across all tenants
 */
export function itEachTenant(
  name: string,
  fn: (tenant: TestTenantName) => void | Promise<void>
): void {
  it.each(TEST_TENANTS)(`${name} (%s)`, fn);
}

/**
 * Creates a describe.each block for testing across all engines AND tenants
 * This creates a matrix of tests: 3 engines x 3 tenants = 9 combinations
 *
 * @example
 * ```tsx
 * describeEachEngineAndTenant('Button', (engine, tenant) => {
 *   it('renders correctly', () => {
 *     const { getByRole } = renderWithTenant(<Button>Click</Button>, tenant, { engine });
 *     expect(getByRole('button')).toBeInTheDocument();
 *   });
 * });
 * ```
 */
export function describeEachEngineAndTenant(
  name: string,
  fn: (engine: StableEngineName, tenant: TestTenantName) => void
): void {
  const matrix: Array<[StableEngineName, TestTenantName]> = [];
  for (const engine of STABLE_ENGINES) {
    for (const tenant of TEST_TENANTS) {
      matrix.push([engine, tenant]);
    }
  }

  describe.each(matrix)(`${name} - %s engine / %s tenant`, fn);
}

/**
 * Utility to assert same behavior across all tenants
 */
export async function assertAcrossTenants(
  ui: ReactElement,
  assertion: (result: RenderResult, tenant: TestTenantName) => void | Promise<void>,
  options: RenderWithTenantOptions = {}
): Promise<void> {
  for (const tenant of TEST_TENANTS) {
    const result = renderWithTenant(ui, tenant, options);
    await assertion(result, tenant);
    result.unmount();
    clearTenantAttribute();
  }
}

/**
 * Utility to assert same behavior across all engines AND tenants
 */
export async function assertAcrossEnginesAndTenants(
  ui: ReactElement,
  assertion: (
    result: RenderResult,
    engine: StableEngineName,
    tenant: TestTenantName
  ) => void | Promise<void>,
  options: Omit<RenderWithTenantOptions, 'engine'> = {}
): Promise<void> {
  for (const engine of STABLE_ENGINES) {
    for (const tenant of TEST_TENANTS) {
      const result = renderWithTenant(ui, tenant, { ...options, engine });
      await assertion(result, engine, tenant);
      result.unmount();
      clearTenantAttribute();
    }
  }
}

/**
 * Get the tenant config for a given tenant name
 */
export function getTenantConfig(tenant: TestTenantName): TenantConfig {
  return TENANT_CONFIGS[tenant];
}

/**
 * Type guard to check if a string is a valid test tenant name
 */
export function isTestTenant(tenant: string): tenant is TestTenantName {
  return TEST_TENANTS.includes(tenant as TestTenantName);
}
