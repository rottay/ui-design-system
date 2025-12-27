/**
 * Feature hooks - Access feature flags and permissions
 */
import { useContext } from 'react';
import { FeatureContext } from '../../providers/features';

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
