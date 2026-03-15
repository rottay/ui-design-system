/**
 * BhRetentionForecast - Main Export
 * Dashboard widget showing AI-powered retention predictions for recent hires.
 */

import type { BhRetentionForecastProps } from './core';
import { BH_RETENTION_FORECAST_DEFAULTS } from './core';
import { BH_RETENTION_FORECAST_PRESETS } from './presets';

export {
  type BhRetentionForecastProps,
  type BhRetentionForecastPreset,
  type RetentionForecastData,
  type RetentionPrediction,
  BH_RETENTION_FORECAST_DEFAULTS,
} from './core';
export * from './presets';

export function BhRetentionForecast(props: BhRetentionForecastProps): React.ReactElement {
  const preset = props.preset ?? BH_RETENTION_FORECAST_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_RETENTION_FORECAST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRetentionForecast.displayName = 'BhRetentionForecast';

export { CompactBhRetentionForecast } from './presets';
