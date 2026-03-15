/**
 * W3GasEstimator - All Presets
 */

export { PanelW3GasEstimator } from './panel';
export { InlineW3GasEstimator } from './inline';

import type { W3GasEstimatorPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3GasEstimatorProps } from '../core';
import { PanelW3GasEstimator } from './panel';
import { InlineW3GasEstimator } from './inline';

export const W3_GAS_ESTIMATOR_PRESETS: Record<W3GasEstimatorPreset, ComponentType<W3GasEstimatorProps>> = {
  panel: PanelW3GasEstimator,
  inline: InlineW3GasEstimator,
};
