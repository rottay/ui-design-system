'use client';

import React, { type ReactNode } from 'react';
import { useFeatures } from './useFeatures';

export interface FeatureGateProps {
  feature: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'all' | 'any';
}

/**
 * Small declarative wrapper for feature-flagged content.
 *
 * The DS already exposes the feature context and hooks. This component exists
 * for pages/stories that want a terse JSX contract instead of inline branching.
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  mode = 'any',
}: FeatureGateProps): React.ReactElement | null {
  const { hasFeature } = useFeatures();
  const requestedFeatures = Array.isArray(feature) ? feature : [feature];

  const isEnabled =
    mode === 'all'
      ? requestedFeatures.every((entry) => hasFeature(entry))
      : requestedFeatures.some((entry) => hasFeature(entry));

  if (isEnabled) {
    return React.createElement(React.Fragment, null, children);
  }

  if (fallback === null) {
    return null;
  }

  return React.createElement(React.Fragment, null, fallback);
}
