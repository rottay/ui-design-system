/**
 * EvBudgetPlanner - All Presets
 */

export { OverviewEvBudgetPlanner } from './overview';
export { BreakdownEvBudgetPlanner } from './breakdown';

import type { EvBudgetPlannerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvBudgetPlannerProps } from '../core';
import { OverviewEvBudgetPlanner } from './overview';
import { BreakdownEvBudgetPlanner } from './breakdown';

export const EV_BUDGET_PLANNER_PRESETS: Record<EvBudgetPlannerPreset, ComponentType<EvBudgetPlannerProps>> = {
  overview: OverviewEvBudgetPlanner,
  breakdown: BreakdownEvBudgetPlanner,
};
