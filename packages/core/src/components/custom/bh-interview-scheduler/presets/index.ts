/**
 * BhInterviewScheduler - All Presets
 */

import type { BhInterviewSchedulerPreset, BhInterviewSchedulerProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhInterviewScheduler } from './standard';
import { CompactBhInterviewScheduler } from './compact';

export { StandardBhInterviewScheduler } from './standard';
export { CompactBhInterviewScheduler } from './compact';

export const BH_INTERVIEW_SCHEDULER_PRESETS: Record<BhInterviewSchedulerPreset, ComponentType<BhInterviewSchedulerProps>> = {
  standard: StandardBhInterviewScheduler,
  compact: CompactBhInterviewScheduler,
};
