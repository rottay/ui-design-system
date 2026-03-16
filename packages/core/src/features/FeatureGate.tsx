'use client';

/**
 * @fileoverview FeatureGate - Rottay Design System
 * @description Declarative JSX wrapper for feature-flagged content.
 *
 * WHY a component instead of just hooks: feature gating in JSX often leads to
 * verbose `{hasFeature('x') ? <A /> : <B />}` ternaries scattered through
 * templates. `FeatureGate` encapsulates the check, supports multi-feature
 * `all`/`any` modes, and provides a first-class `fallback` slot -- keeping
 * page components declarative and easy to audit for entitlement coverage.
 */

import React, { type ReactNode } from 'react';
import { useFeatures } from './useFeatures';

/**
 * Props for the `FeatureGate` component.
 */
export interface FeatureGateProps {
  /** Feature name(s) to check. Pass a string for one, or an array for multi-gate. */
  feature: string | string[];
  /** Content rendered when the feature check passes. */
  children: ReactNode;
  /** Content rendered when the feature check fails. Defaults to `null` (unmount). */
  fallback?: ReactNode;
  /**
   * Matching mode when `feature` is an array.
   * - `'any'` (default): renders children if at least one feature is enabled
   * - `'all'`: renders children only if every feature is enabled
   */
  mode?: 'all' | 'any';
}

/**
 * Declarative feature gate that conditionally renders children based on
 * the enabled feature flags in the nearest `FeatureProvider`.
 *
 * Supports single-feature and multi-feature checks via the `feature` prop.
 * When `feature` is an array, the `mode` prop controls the matching strategy:
 * - `'any'` (default) -- render if at least one feature is enabled.
 * - `'all'` -- render only if every listed feature is enabled.
 *
 * @example Single feature
 * ```tsx
 * <FeatureGate feature="export-pdf">
 *   <ExportButton />
 * </FeatureGate>
 * ```
 *
 * @example Multi-feature with fallback
 * ```tsx
 * <FeatureGate feature={['ai-chat', 'ai-summary']} mode="any" fallback={<UpgradePrompt />}>
 *   <AiPanel />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  mode = 'any',
}: FeatureGateProps): React.ReactElement | null {
  const { hasFeature } = useFeatures();

  // Normalize to an array once so the rest of the gate logic can stay simple.
  const requestedFeatures = Array.isArray(feature) ? feature : [feature];

  // WHY `every` vs `some`: `all` mode is useful for composite features that
  // require multiple flags (e.g., 'ai-chat' AND 'ai-summary' both enabled).
  // `any` mode is the default because most gates check a single flag.
  const isEnabled =
    mode === 'all'
      ? requestedFeatures.every((entry) => hasFeature(entry))
      : requestedFeatures.some((entry) => hasFeature(entry));

  if (isEnabled) {
    return React.createElement(React.Fragment, null, children);
  }

  // `null` fallback means "remove from the tree entirely", which is the most
  // common behavior for gated DS content (premium-only widgets, beta features).
  if (fallback === null) {
    return null;
  }

  return React.createElement(React.Fragment, null, fallback);
}
