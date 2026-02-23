/**
 * BhInterviewCopilot - Main Export
 * Real-time AI coaching copilot for interviewers during live interviews.
 * Sidebar preset for live coaching, Review preset for post-interview analysis.
 */

import type { BhInterviewCopilotProps } from './core';
import { BH_INTERVIEW_COPILOT_DEFAULTS } from './core';
import { BH_INTERVIEW_COPILOT_PRESETS } from './presets';

export {
  type BhInterviewCopilotProps,
  type BhInterviewCopilotPreset,
  type Whisper,
  type WhisperType,
  type WhisperPriority,
  type CopilotSessionStatus,
  type TalkTimeData,
  type DimensionCoverage,
  type CopilotSession,
  type CopilotReview,
  BH_INTERVIEW_COPILOT_DEFAULTS,
  WHISPER_TYPES,
  getWhisperTypeColors,
  getPriorityColors,
  getWhisperTypeLabel,
  getWhisperTypeIcon,
} from './core';
export * from './presets';

export function BhInterviewCopilot(props: BhInterviewCopilotProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_COPILOT_DEFAULTS.preset ?? 'sidebar';
  const PresetComponent = BH_INTERVIEW_COPILOT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewCopilot.displayName = 'BhInterviewCopilot';

export { SidebarBhInterviewCopilot, ReviewBhInterviewCopilot } from './presets';
