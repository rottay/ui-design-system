/**
 * W3TvlTracker - All Presets
 */

export { ChartW3TvlTracker } from './chart';
export { SummaryW3TvlTracker } from './summary';

import type { W3TvlTrackerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TvlTrackerProps } from '../core';
import { ChartW3TvlTracker } from './chart';
import { SummaryW3TvlTracker } from './summary';

export const W3_TVL_TRACKER_PRESETS: Record<W3TvlTrackerPreset, ComponentType<W3TvlTrackerProps>> = {
  chart: ChartW3TvlTracker,
  summary: SummaryW3TvlTracker,
};
