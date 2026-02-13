/**
 * BhSprintBurndown - All Presets
 */

export { ChartBhSprintBurndown } from './chart';
export { CompactBhSprintBurndown } from './compact';

import type { BhSprintBurndownPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintBurndownProps } from '../core';
import { ChartBhSprintBurndown } from './chart';
import { CompactBhSprintBurndown } from './compact';

export const BH_SPRINT_BURNDOWN_PRESETS: Record<BhSprintBurndownPreset, ComponentType<BhSprintBurndownProps>> = {
  chart: ChartBhSprintBurndown,
  compact: CompactBhSprintBurndown,
};
