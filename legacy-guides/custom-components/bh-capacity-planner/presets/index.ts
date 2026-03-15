/**
 * BhCapacityPlanner - All Presets
 */

export { GridBhCapacityPlanner } from './grid';
export { ListBhCapacityPlanner } from './list';

import type { BhCapacityPlannerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhCapacityPlannerProps } from '../core';
import { GridBhCapacityPlanner } from './grid';
import { ListBhCapacityPlanner } from './list';

export const BH_CAPACITY_PLANNER_PRESETS: Record<BhCapacityPlannerPreset, ComponentType<BhCapacityPlannerProps>> = {
  grid: GridBhCapacityPlanner,
  list: ListBhCapacityPlanner,
};
