/**
 * BhSprintCapacity - All Presets
 */

import type { BhSprintCapacityPreset, BhSprintCapacityProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhSprintCapacity } from './compact';

export { CompactBhSprintCapacity } from './compact';

export const BH_SPRINT_CAPACITY_PRESETS: Record<BhSprintCapacityPreset, ComponentType<BhSprintCapacityProps>> = {
  compact: CompactBhSprintCapacity,
};
