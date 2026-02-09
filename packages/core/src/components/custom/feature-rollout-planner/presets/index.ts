/**
 * FeatureRolloutPlanner - All Presets
 */

import type { FeatureRolloutPlannerPreset } from '../core';
import { TimelineFeatureRolloutPlanner } from './timeline';
import { MatrixFeatureRolloutPlanner } from './matrix';
import { SchedulerFeatureRolloutPlanner } from './scheduler';

export { TimelineFeatureRolloutPlanner } from './timeline';
export { MatrixFeatureRolloutPlanner } from './matrix';
export { SchedulerFeatureRolloutPlanner } from './scheduler';

export const FEATURE_ROLLOUT_PLANNER_PRESETS: Record<FeatureRolloutPlannerPreset, React.ComponentType<any>> = {
  timeline: TimelineFeatureRolloutPlanner,
  matrix: MatrixFeatureRolloutPlanner,
  scheduler: SchedulerFeatureRolloutPlanner,
};
