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
 * Hook to access feature context
 * @throws Error if used outside FeatureProvider
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }
  return context;
}

/**
 * Ergonomic hook to check if a feature is enabled
 * @param feature - Feature name to check
 * @returns boolean - Whether the feature is enabled
 */
export function useHasFeature(feature: string): boolean {
  const { hasFeature } = useFeatures();
  return hasFeature(feature);
}

// Re-export for backwards compatibility
export { useFeatures as useFeatureContext };
