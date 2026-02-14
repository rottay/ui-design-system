/**
 * BhInterviewScheduler - Main Export
 * Schedule & Configure Interviews for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhInterviewSchedulerProps } from './core';
import { BH_INTERVIEW_SCHEDULER_DEFAULTS } from './core';
import { BH_INTERVIEW_SCHEDULER_PRESETS } from './presets';

export {
  type BhInterviewSchedulerProps,
  type BhInterviewSchedulerPreset,
  type RecruiterInterview,
  type ScheduleCandidate,
  type InterviewTypeConfig,
  type ScheduleData,
  type AgentOverride,
  type AvailableAgent,
  type AvailableInterviewer,
  BH_INTERVIEW_SCHEDULER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhInterviewScheduler component
 * Renders the appropriate preset based on the preset prop
 */
export function BhInterviewScheduler(props: BhInterviewSchedulerProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_SCHEDULER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_INTERVIEW_SCHEDULER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewScheduler.displayName = 'BhInterviewScheduler';

export { StandardBhInterviewScheduler, CompactBhInterviewScheduler } from './presets';
