/**
 * BhRetentionForecast - All Presets
 */

import type { BhRetentionForecastPreset, BhRetentionForecastProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhRetentionForecast } from './compact';

export { CompactBhRetentionForecast } from './compact';

export const BH_RETENTION_FORECAST_PRESETS: Record<BhRetentionForecastPreset, ComponentType<BhRetentionForecastProps>> = {
  compact: CompactBhRetentionForecast,
};
