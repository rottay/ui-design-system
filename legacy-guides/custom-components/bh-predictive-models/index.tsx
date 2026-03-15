/**
 * BhPredictiveModels - Main Export
 * Dashboard widget showing ML model performance and active predictions.
 */

import type { BhPredictiveModelsProps } from './core';
import { BH_PREDICTIVE_MODELS_DEFAULTS } from './core';
import { BH_PREDICTIVE_MODELS_PRESETS } from './presets';

export {
  type BhPredictiveModelsProps,
  type BhPredictiveModelsPreset,
  type PredictiveModelsData,
  type PredictiveModel,
  BH_PREDICTIVE_MODELS_DEFAULTS,
} from './core';
export * from './presets';

export function BhPredictiveModels(props: BhPredictiveModelsProps): React.ReactElement {
  const preset = props.preset ?? BH_PREDICTIVE_MODELS_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_PREDICTIVE_MODELS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPredictiveModels.displayName = 'BhPredictiveModels';

export { CompactBhPredictiveModels } from './presets';
