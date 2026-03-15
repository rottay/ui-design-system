/**
 * BhCorrelationHeatmap - All Presets
 */

export { StandardBhCorrelationHeatmap } from './standard';

import type { BhCorrelationHeatmapPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhCorrelationHeatmapProps } from '../core';
import { StandardBhCorrelationHeatmap } from './standard';

export const BH_CORRELATION_HEATMAP_PRESETS: Record<BhCorrelationHeatmapPreset, ComponentType<BhCorrelationHeatmapProps>> = {
  standard: StandardBhCorrelationHeatmap,
};
