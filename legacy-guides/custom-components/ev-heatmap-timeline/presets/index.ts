export { HeatmapTimelinePlayer } from './player';
export { HeatmapTimelineSnapshot } from './snapshot';

import type { HeatmapTimelinePreset } from '../core';
import type { ComponentType } from 'react';
import type { HeatmapTimelineProps } from '../core';
import { HeatmapTimelinePlayer } from './player';
import { HeatmapTimelineSnapshot } from './snapshot';

export const PRESETS: Record<
  HeatmapTimelinePreset,
  ComponentType<HeatmapTimelineProps>
> = {
  player: HeatmapTimelinePlayer,
  snapshot: HeatmapTimelineSnapshot,
};
