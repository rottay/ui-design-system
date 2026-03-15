/**
 * EvBudgetPlanner - Main Export
 * Event budget planning
 * Automatically selects preset based on props
 */

import type { EvBudgetPlannerProps } from './core';
import { EV_BUDGET_PLANNER_DEFAULTS } from './core';
import { EV_BUDGET_PLANNER_PRESETS } from './presets';

export {
  type EvBudgetPlannerProps,
  type EvBudgetPlannerPreset,
  type BudgetCategory as EvBudgetPlannerBudgetCategory,
  type BudgetSummary as EvBudgetPlannerBudgetSummary,
  EV_BUDGET_PLANNER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvBudgetPlanner component
 * Renders the appropriate preset based on the preset prop
 */
export function EvBudgetPlanner(props: EvBudgetPlannerProps): React.ReactElement {
  const preset = props.preset ?? EV_BUDGET_PLANNER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_BUDGET_PLANNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvBudgetPlanner.displayName = 'EvBudgetPlanner';

export { OverviewEvBudgetPlanner, BreakdownEvBudgetPlanner } from './presets';
