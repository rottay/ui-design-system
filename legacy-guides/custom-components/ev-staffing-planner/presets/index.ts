/**
 * EvStaffingPlanner - All Presets
 */

export { OverviewEvStaffingPlanner } from './overview';
export { DetailEvStaffingPlanner } from './detail';

import type { EvStaffingPlannerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvStaffingPlannerProps } from '../core';
import { OverviewEvStaffingPlanner } from './overview';
import { DetailEvStaffingPlanner } from './detail';

export const EV_STAFFING_PLANNER_PRESETS: Record<EvStaffingPlannerPreset, ComponentType<EvStaffingPlannerProps>> = {
  overview: OverviewEvStaffingPlanner,
  detail: DetailEvStaffingPlanner,
};
