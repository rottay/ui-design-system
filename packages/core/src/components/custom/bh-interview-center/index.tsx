/**
 * BhInterviewCenter - Main Export
 * Interview Management Hub for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhInterviewCenterProps } from './core';
import { BH_INTERVIEW_CENTER_DEFAULTS } from './core';
import { BH_INTERVIEW_CENTER_PRESETS } from './presets';

export {
  type BhInterviewCenterProps,
  type BhInterviewCenterPreset,
  type InterviewItem,
  type InterviewType,
  type InterviewStatus,
  type InterviewStats,
  type InterviewFilter,
  type CalendarView,
  type SortDirection,
  BH_INTERVIEW_CENTER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhInterviewCenter component
 * Renders the appropriate preset based on the preset prop
 */
export function BhInterviewCenter(props: BhInterviewCenterProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_CENTER_DEFAULTS.preset ?? 'calendar';
  const PresetComponent = BH_INTERVIEW_CENTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewCenter.displayName = 'BhInterviewCenter';

export { CalendarBhInterviewCenter, ListBhInterviewCenter, TimelineBhInterviewCenter } from './presets';
