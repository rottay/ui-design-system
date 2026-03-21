/**
 * @fileoverview Feature Flags - Rottay Design System
 * @description Public barrel for the feature-flag subsystem. Groups the
 * FeatureProvider, hooks (`useFeatures`, `useHasFeature`), and the
 * declarative `FeatureGate` component so consumers can discover the
 * full feature-flag API from a single import path.
 *
 * @module System/Features
 * @category System
 * @package @rottay/design-system
 */
export { FeatureProvider, useFeatureContext, FeatureContext } from './FeatureProvider';
export type { FeatureProviderProps } from './FeatureProvider';
export { useFeatures, useHasFeature, useFeatureContext as useFeatureContextAlias } from './useFeatures';
export { FeatureGate } from './FeatureGate';
export type { FeatureGateProps } from './FeatureGate';
