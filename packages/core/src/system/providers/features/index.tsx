/**
 * Feature Provider
 * Manages feature flags for the tenant
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
