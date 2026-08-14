'use client';

/**
 * @fileoverview TenantProvider - Rottay Design System
 * @description Provides tenant-specific configuration context for multi-tenant
 * applications, including branding, features, and plan information.
 *
 * @remarks
 * The TenantProvider enables multi-tenant architecture by providing:
 * - **Configuration**: Complete tenant settings and preferences
 * - **Branding**: Logo, colors, and company information
 * - **Features**: Enabled feature flags per tenant
 * - **Plans**: Subscription tier and limitations
 *
 * This provider is typically used internally by DesignSystemProvider,
 * but can be used standalone for custom setups.
 *
 * @example Basic usage
 * ```tsx
 * import { TenantProvider } from '@rottay/design-system';
 *
 * const tenantConfig = {
 *   slug: 'acme',
 *   name: 'ACME Corp',
 *   theme: 'light',
 *   plan: 'enterprise',
 *   features: ['advanced-charts', 'export-pdf'],
 *   branding: { companyName: 'ACME' },
 * };
 *
 * <TenantProvider config={tenantConfig}>
 *   <App />
 * </TenantProvider>
 * ```
 *
 * @example Accessing tenant in components
 * ```tsx
 * function TenantInfo() {
 *   const { config, isLoading } = useTenantContext();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <h1>Welcome to {config.branding?.companyName}</h1>;
 * }
 * ```
 *
 * @see {@link useTenantContext} - Hook to access tenant context
 * @see {@link TenantConfig} - Tenant configuration structure
 * @module System/Providers/Tenant
 * @category System
 * @package @rottay/design-system
 */

import React, {
  useContext,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import type { TenantConfig, TenantContextValue } from '../../../../../../foundation/contracts';
import { claimRootAttribute } from '@/infrastructure/runtime/foundation/root-attributes/registry';
import { isCanonicalJsonObject } from '@/foundation/kernel/serialization';
import { assertTenantIdentityAllowed } from '@/foundation/tokens/ts/presentation/brand-themes';
import { isCodeOwnedTenantConfig } from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import {
  assertLowerKebabTenantSlug,
  isValidTenantConfig,
} from '@/infrastructure/runtime/tenant/foundation/validation';
import { TenantContext, useTenantContext } from '../../../foundation/context';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
type ResolvedVerticalPreset = NonNullable<TenantContextValue['vertical']>;

export interface TenantProviderProps {
  children: ReactNode;
  config: TenantConfig;
  isLoading?: boolean;
  /** Resolved vertical preset passed from DesignSystemProvider */
  vertical?: ResolvedVerticalPreset;
}

export function assertProviderTenantConfig(config: unknown): asserts config is TenantConfig {
  if (isCodeOwnedTenantConfig(config)) return;

  const candidate = config as Partial<TenantConfig> | null;
  assertTenantIdentityAllowed({
    slug: candidate?.slug,
    name: candidate?.name,
    companyName: candidate?.branding?.companyName,
    verticalKey: candidate?.vertical,
  });
  assertLowerKebabTenantSlug(candidate?.slug);
  if (!isValidTenantConfig(config)) {
    throw new TypeError('[design-system] TenantProvider received an invalid tenant config.');
  }
}

function cloneAndFreezeTenantValue<T>(
  value: T,
  seen: WeakMap<object, unknown> = new WeakMap(),
): T {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return value;
  }
  if (typeof value === 'function' || React.isValidElement(value)) return value;

  const source = value as object;
  const previous = seen.get(source);
  if (previous) return previous as T;

  if (Array.isArray(value)) {
    const clone: unknown[] = [];
    seen.set(source, clone);
    for (const item of value) clone.push(cloneAndFreezeTenantValue(item, seen));
    return Object.freeze(clone) as T;
  }

  // Realm-SAFE, not prototype-identity based. `getPrototypeOf(v) === Object.prototype`
  // rejects an object literal allocated in another realm -- a `node:vm` context,
  // an iframe, a `structuredClone` that allocates in the host realm -- as if it
  // were a class instance. `isCanonicalJsonObject` tests the immediate prototype
  // structurally, so any realm's plain object is admitted and every class
  // instance, Date, Map and host object is still rejected.
  if (!isCanonicalJsonObject(value)) {
    throw new TypeError('[design-system] TenantProvider config must contain data-only objects.');
  }

  const clone: Record<string, unknown> = {};
  seen.set(source, clone);
  for (const key of Object.keys(value as Record<string, unknown>)) {
    Object.defineProperty(clone, key, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: cloneAndFreezeTenantValue(
        (value as Record<string, unknown>)[key],
        seen,
      ),
    });
  }
  return Object.freeze(clone) as T;
}

export function TenantProvider({
  children,
  config,
  isLoading = false,
  vertical,
}: TenantProviderProps): React.ReactElement {
  // Never publish or later stamp from caller-owned mutable data. A child layout
  // effect runs before its parent layout effect, so validating `config` during
  // render and reading the same object later would let a mutation cross the
  // reserved-identity boundary between those two moments.
  const validatedConfig = useMemo(() => {
    if (isCodeOwnedTenantConfig(config)) return config;
    const snapshot = cloneAndFreezeTenantValue(config);
    assertProviderTenantConfig(snapshot);
    return snapshot;
  }, [config]);
  const validatedSlug = validatedConfig.slug;

  // The `data-tenant` attribute is the CSS-facing bridge for tenant-scoped
  // selectors generated by the theming and token layers.
  useIsomorphicLayoutEffect(() => {
    if (!validatedSlug || typeof document === 'undefined') return undefined;
    return claimRootAttribute(
      document.documentElement,
      'data-tenant',
      validatedSlug,
    );
  }, [validatedSlug]);

  // Memoize the context value so child re-renders only fire when config,
  // loading state, or vertical actually change. Without this, every parent
  // render would create a new object reference and cascade re-renders through
  // every useTenant() consumer in the tree.
  const value = useMemo<TenantContextValue>(
    () => ({ config: validatedConfig, isLoading, vertical }),
    [validatedConfig, isLoading, vertical],
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/** Access the resolved tenant identity, branding and feature configuration. */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

export { TenantContext, useTenantContext };
