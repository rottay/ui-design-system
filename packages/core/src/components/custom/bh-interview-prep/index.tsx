/**
 * BhInterviewPrep - Main Export
 * Interview Preparation Briefing for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhInterviewPrepProps } from './core';
import { BH_INTERVIEW_PREP_DEFAULTS } from './core';
import { BH_INTERVIEW_PREP_PRESETS } from './presets';

export {
  type BhInterviewPrepProps,
  type BhInterviewPrepPreset,
  type InterviewBrief,
  type CandidateBrief,
  type EvaluationFocus,
  type ScriptOverview,
  type ChecklistItem,
  BH_INTERVIEW_PREP_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhInterviewPrep component
 * Renders the appropriate preset based on the preset prop
 */
export function BhInterviewPrep(props: BhInterviewPrepProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_PREP_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_INTERVIEW_PREP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewPrep.displayName = 'BhInterviewPrep';

export { StandardBhInterviewPrep } from './presets';
