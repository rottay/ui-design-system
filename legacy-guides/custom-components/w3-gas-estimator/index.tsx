/**
 * W3GasEstimator - Main Export
 * Estimate gas costs for transactions with speed options and historical pricing
 */

import type { W3GasEstimatorProps } from './core';
import { W3_GAS_ESTIMATOR_DEFAULTS } from './core';
import { W3_GAS_ESTIMATOR_PRESETS } from './presets';

export { type W3GasEstimatorProps, type W3GasEstimatorPreset, W3_GAS_ESTIMATOR_DEFAULTS } from './core';
export * from './presets';

export function W3GasEstimator(props: W3GasEstimatorProps): React.ReactElement {
  const preset = props.preset ?? W3_GAS_ESTIMATOR_DEFAULTS.preset ?? 'panel';
  const PresetComponent = W3_GAS_ESTIMATOR_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3GasEstimator.displayName = 'W3GasEstimator';
