/**
 * BhInterviewScheduler - All Presets
 */

import type { BhInterviewSchedulerPreset } from '../core';
import { StandardBhInterviewScheduler } from './standard';
import { CompactBhInterviewScheduler } from './compact';

export { StandardBhInterviewScheduler } from './standard';
export { CompactBhInterviewScheduler } from './compact';

export const BH_INTERVIEW_SCHEDULER_PRESETS: Record<BhInterviewSchedulerPreset, React.ComponentType<any>> = {
  standard: StandardBhInterviewScheduler,
  compact: CompactBhInterviewScheduler,
};
