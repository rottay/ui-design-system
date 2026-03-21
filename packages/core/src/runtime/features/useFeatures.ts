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

/**
 * Duplicated locally to avoid a circular import with `FeatureProvider`.
 * The canonical definition lives in `FeatureProvider.tsx`, but both files
 * need the type and importing it would create a cycle. The shape is trivial
 * enough that keeping it in sync manually is acceptable.
 */
interface FeatureContextValue {
  /** Array of enabled feature flag names. May include `'*'` for wildcard access. */
  features: string[];
  /** Returns `true` if the feature is explicitly listed or if wildcard is present. */
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
    // Feature flags are app behavior, not a cosmetic enhancement, so missing
    // provider state is treated as a developer error.
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

// Re-export for backwards compatibility. Some early adopters imported
// `useFeatureContext` from this file; the canonical version now lives in
// `FeatureProvider.tsx`, but we keep this alias to avoid breaking changes.
export { useFeatures as useFeatureContext };
