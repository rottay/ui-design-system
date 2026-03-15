/**
 * FeatureRolloutPlanner - All Presets
 */

import type { FeatureRolloutPlannerPreset, FeatureRolloutPlannerProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineFeatureRolloutPlanner } from './timeline';
import { MatrixFeatureRolloutPlanner } from './matrix';
import { SchedulerFeatureRolloutPlanner } from './scheduler';

export { TimelineFeatureRolloutPlanner } from './timeline';
export { MatrixFeatureRolloutPlanner } from './matrix';
export { SchedulerFeatureRolloutPlanner } from './scheduler';

export const FEATURE_ROLLOUT_PLANNER_PRESETS: Record<FeatureRolloutPlannerPreset, ComponentType<FeatureRolloutPlannerProps>> = {
  timeline: TimelineFeatureRolloutPlanner,
  matrix: MatrixFeatureRolloutPlanner,
  scheduler: SchedulerFeatureRolloutPlanner,
};
