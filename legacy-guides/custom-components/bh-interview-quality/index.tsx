/**
 * BhInterviewQuality - Main Export
 * Dashboard widget showing interviewer quality scores and dimension breakdown.
 */

import type { BhInterviewQualityProps } from './core';
import { BH_INTERVIEW_QUALITY_DEFAULTS } from './core';
import { BH_INTERVIEW_QUALITY_PRESETS } from './presets';

export {
  type BhInterviewQualityProps,
  type BhInterviewQualityPreset,
  type InterviewQualityData,
  type QualityDimension,
  type RecentQualityInterview,
  BH_INTERVIEW_QUALITY_DEFAULTS,
  getQualityScoreColor,
  getQualityBadgeColor,
  QUALITY_DIMENSIONS,
} from './core';
export * from './presets';

export function BhInterviewQuality(props: BhInterviewQualityProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_QUALITY_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_INTERVIEW_QUALITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewQuality.displayName = 'BhInterviewQuality';

export { CompactBhInterviewQuality } from './presets';
