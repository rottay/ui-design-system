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

interface FeatureContextValue {
  features: string[];
  hasFeature: (feature: string) => boolean;
}

const FeatureContext = createContext<FeatureContextValue | null>(null);

export interface FeatureProviderProps {
  children: ReactNode;
  features: string[];
}

export function FeatureProvider({
  children,
  features,
}: FeatureProviderProps): React.ReactElement {
  const value = useMemo<FeatureContextValue>(() => ({
    features,
    hasFeature: (feature: string) =>
      features.includes(feature) || features.includes('*'),
  }), [features]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatureContext(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatureContext must be used within FeatureProvider');
  }
  return context;
}

export { FeatureContext };
