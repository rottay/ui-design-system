/**
 * FeatureRolloutPlanner - Main Export
 * Automatically selects preset based on props
 */

import type { FeatureRolloutPlannerProps } from './core';
import { FEATURE_ROLLOUT_PLANNER_DEFAULTS } from './core';
import { FEATURE_ROLLOUT_PLANNER_PRESETS } from './presets';

export {
  type FeatureRolloutPlannerProps,
  type FeatureRolloutPlannerPreset,
  type RolloutStage,
  type RolloutTarget,
  type FeatureRollout,
  FEATURE_ROLLOUT_PLANNER_DEFAULTS,
  getStageColors,
  getStageIndex,
  getStageLabel,
  getAllStages,
  getTargetLabel,
  canAdvance,
  canRollback,
  formatDate,
  formatDateFull,
  getDaysBetween,
  getDaysUntil,
  isOverdue,
  collectEnvironments,
} from './core';
export * from './presets';

/**
 * FeatureRolloutPlanner component
 * Renders the appropriate preset based on the preset prop
 */
export function FeatureRolloutPlanner(props: FeatureRolloutPlannerProps): React.ReactElement {
  const preset = props.preset ?? FEATURE_ROLLOUT_PLANNER_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = FEATURE_ROLLOUT_PLANNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

FeatureRolloutPlanner.displayName = 'FeatureRolloutPlanner';

export { TimelineFeatureRolloutPlanner, MatrixFeatureRolloutPlanner, SchedulerFeatureRolloutPlanner } from './presets';
