/**
 * BhInterviewScheduler - All Presets
 */

import type { BhInterviewSchedulerPreset } from '../core';
import { StandardBhInterviewScheduler } from './standard';

export { StandardBhInterviewScheduler } from './standard';

export const BH_INTERVIEW_SCHEDULER_PRESETS: Record<BhInterviewSchedulerPreset, React.ComponentType<any>> = {
  standard: StandardBhInterviewScheduler,
};
