/**
 * BhSprintVelocity - All Presets
 */

export { ChartBhSprintVelocity } from './chart';
export { CompactBhSprintVelocity } from './compact';

import type { BhSprintVelocityPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintVelocityProps } from '../core';
import { ChartBhSprintVelocity } from './chart';
import { CompactBhSprintVelocity } from './compact';

export const BH_SPRINT_VELOCITY_PRESETS: Record<BhSprintVelocityPreset, ComponentType<BhSprintVelocityProps>> = {
  chart: ChartBhSprintVelocity,
  compact: CompactBhSprintVelocity,
};
