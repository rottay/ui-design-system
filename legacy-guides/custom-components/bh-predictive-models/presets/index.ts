/**
 * BhPredictiveModels - All Presets
 */

import type { BhPredictiveModelsPreset, BhPredictiveModelsProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhPredictiveModels } from './compact';

export { CompactBhPredictiveModels } from './compact';

export const BH_PREDICTIVE_MODELS_PRESETS: Record<BhPredictiveModelsPreset, ComponentType<BhPredictiveModelsProps>> = {
  compact: CompactBhPredictiveModels,
};
