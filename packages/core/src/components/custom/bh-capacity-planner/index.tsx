/**
 * BhCapacityPlanner - Main Export
 * Recruiter workload visualization with utilization and rebalancing.
 */

import type { BhCapacityPlannerProps } from './core';
import { BH_CAPACITY_PLANNER_DEFAULTS } from './core';
import { BH_CAPACITY_PLANNER_PRESETS } from './presets';

export {
  type BhCapacityPlannerProps,
  type BhCapacityPlannerPreset,
  type RecruiterCapacity,
  type RebalanceSuggestion,
  type CapacitySummary,
  BH_CAPACITY_PLANNER_DEFAULTS,
} from './core';
export * from './presets';

export function BhCapacityPlanner(props: BhCapacityPlannerProps): React.ReactElement {
  const preset = props.preset ?? BH_CAPACITY_PLANNER_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BH_CAPACITY_PLANNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCapacityPlanner.displayName = 'BhCapacityPlanner';

export { GridBhCapacityPlanner, ListBhCapacityPlanner } from './presets';
