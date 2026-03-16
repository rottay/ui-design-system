'use client';

/**
 * @fileoverview FeatureProvider - Rottay Design System
 * @description Manages feature flags for progressive feature rollout,
 * A/B testing, and plan-based feature gating.
 *
 * @remarks
 * The FeatureProvider enables feature flag management:
 * - **Progressive rollout**: Enable features for specific tenants
 * - **Plan-based gating**: Restrict features to certain subscription tiers
 * - **Wildcard access**: Use '*' to enable all features
 * - **Runtime checks**: Components can check feature availability
 *
 * Features are typically derived from tenant configuration but can
 * be overridden for testing or A/B experiments.
 *
 * @example Basic usage
 * ```tsx
 * import { FeatureProvider } from '@rottay/design-system';
 *
 * <FeatureProvider features={['dark-mode', 'export-pdf', 'advanced-charts']}>
 *   <App />
 * </FeatureProvider>
 * ```
 *
 * @example Checking features in components
 * ```tsx
 * function ExportButton() {
 *   const { hasFeature } = useFeatureContext();
 *
 *   if (!hasFeature('export-pdf')) return null;
 *
 *   return <Button onClick={handleExport}>Export PDF</Button>;
 * }
 * ```
 *
 * @example Wildcard access (all features enabled)
 * ```tsx
 * // Using '*' enables all features
 * <FeatureProvider features={['*']}>
 *   <App />
 * </FeatureProvider>
 * ```
 *
 * @see {@link useFeatureContext} - Hook to access feature context
 * @module System/Providers/Features
 * @category System
 * @package @rottay/design-system
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * Shape of the feature context consumed by `useFeatureContext()` and `useFeatures()`.
 *
 * - `features` is the raw string array as passed to `FeatureProvider`.
 * - `hasFeature` encapsulates the wildcard logic so consumers never need to
 *   check for `'*'` themselves.
 */
interface FeatureContextValue {
  /** Array of enabled feature flag names. May include `'*'` for wildcard access. */
  features: string[];
  /** Returns `true` if `feature` is explicitly listed or if wildcard `'*'` is present. */
  hasFeature: (feature: string) => boolean;
}

// WHY `null` default: a `null` context value lets consumer hooks distinguish
// "no provider mounted" from "provider mounted with zero features", so they
// can throw a helpful error instead of silently returning false for every check.
const FeatureContext = createContext<FeatureContextValue | null>(null);

/**
 * Props for the {@link FeatureProvider} component.
 */
export interface FeatureProviderProps {
  /** React subtree that gains access to the feature context. */
  children: ReactNode;
  /** Array of enabled feature flag names. Use `['*']` to enable all features. */
  features: string[];
}

export function FeatureProvider({
  children,
  features,
}: FeatureProviderProps): React.ReactElement {
  const value = useMemo<FeatureContextValue>(() => ({
    features,
    // Wildcard support keeps tenant plans simple when a first-party tenant or
    // admin environment should bypass individual feature checks.
    hasFeature: (feature: string) =>
      features.includes(feature) || features.includes('*'),
  }), [features]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

/**
 * Hook to access the feature context directly from the provider.
 *
 * Prefer `useFeatures()` from `./useFeatures.ts` for most component code --
 * this hook is the canonical source that `useFeatures` delegates to, but
 * both return the same `FeatureContextValue` shape.
 *
 * @returns The current feature context value.
 * @throws If called outside a `FeatureProvider` subtree.
 */
export function useFeatureContext(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    // Feature gating should fail loudly because silent fallbacks would hide
    // product entitlements bugs.
    throw new Error('useFeatureContext must be used within FeatureProvider');
  }
  return context;
}

export { FeatureContext };
