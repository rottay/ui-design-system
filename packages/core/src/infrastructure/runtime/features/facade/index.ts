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
export { FeatureProvider, useFeatureContext, FeatureContext } from '../composition/react/provider';
export type { FeatureProviderProps } from '../composition/react/provider';
export { useFeatures, useHasFeature, useFeatureContext as useFeatureContextAlias } from '../composition/react/provider/features';
export { FeatureGate } from '../presentation/gates/feature';
export type { FeatureGateProps } from '../presentation/gates/feature';
