'use client';

/**
 * @fileoverview Feature Hooks - Rottay Design System
 * @description React hooks for accessing feature flags and implementing
 * conditional feature rendering based on tenant plans and flags.
 *
 * @remarks
 * The feature hooks provide:
 * - **useFeatures**: Full access to features array and hasFeature function
 * - **useHasFeature**: Simple boolean check for a single feature
 * - **useFeatureContext**: Direct context access (alias)
 *
 * Features enable:
 * - Progressive feature rollout
 * - Plan-based feature gating
 * - A/B testing support
 * - Tenant-specific customization
 *
 * @example Feature-gated component
 * ```tsx
 * function PremiumFeature() {
 *   const isPremium = useHasFeature('premium-analytics');
 *   if (!isPremium) return <UpgradePrompt />;
 *   return <AnalyticsDashboard />;
 * }
 * ```
 *
 * @see {@link FeatureProvider} - Provider component
 * @module System/Hooks/Features
 * @category System
 * @package @rottay/design-system
 */
import { useContext } from 'react';
import { FeatureContext } from './FeatureProvider';

interface FeatureContextValue {
  features: string[];
  hasFeature: (feature: string) => boolean;
}

/**
 * Hook to access the feature flags context.
 *
 * Provides access to all enabled features and a utility function to check
 * if a specific feature is enabled. Useful for conditional rendering based
 * on feature flags.
 *
 * @example
 * ```tsx
 * import { useFeatures } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const { features, hasFeature } = useFeatures();
 *
 *   return (
 *     <div>
 *       <p>Enabled features: {features.join(', ')}</p>
 *       {hasFeature('dark-mode') && <DarkModeToggle />}
 *       {hasFeature('experimental-ui') && <ExperimentalFeature />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns Object containing features array and hasFeature function
 * @returns {string[]} returns.features - Array of enabled feature names
 * @returns {Function} returns.hasFeature - Function to check if a feature is enabled
 *
 * @throws {Error} Throws an error if used outside of a FeatureProvider
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }
  return context;
}

/**
 * Convenience hook to check if a specific feature is enabled.
 *
 * A simpler alternative to useFeatures() when you only need to check
 * a single feature flag.
 *
 * @example
 * ```tsx
 * import { useHasFeature } from '@rottay/design-system';
 *
 * function BetaFeature() {
 *   const isBetaEnabled = useHasFeature('beta-features');
 *
 *   if (!isBetaEnabled) {
 *     return null;
 *   }
 *
 *   return <NewBetaComponent />;
 * }
 * ```
 *
 * @param feature - The name of the feature to check
 * @returns {boolean} True if the feature is enabled, false otherwise
 */
export function useHasFeature(feature: string): boolean {
  const { hasFeature } = useFeatures();
  return hasFeature(feature);
}

// Re-export for backwards compatibility
export { useFeatures as useFeatureContext };
