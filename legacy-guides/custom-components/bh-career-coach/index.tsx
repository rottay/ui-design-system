/**
 * BhCareerCoach - Main Export
 * AI Career Coach for rejected candidates providing personalized
 * career development plans based on interview performance.
 * Public-facing, empathetic by design.
 */

import type { BhCareerCoachProps } from './core';
import { BH_CAREER_COACH_DEFAULTS } from './core';
import { BH_CAREER_COACH_PRESETS } from './presets';

export {
  type BhCareerCoachProps,
  type BhCareerCoachPreset,
  type CareerCoachData,
  type CareerSkillGap,
  type CareerStrength,
  type DevelopmentPlanItem,
  type LearningResource,
  type TalentPoolInfo,
  type CareerCoachFeedback,
  type TalentPoolOptInData,
  type GapSeverity,
  type DevelopmentPriority,
  type ResourceType,
  type FeedbackRating,
  BH_CAREER_COACH_DEFAULTS,
} from './core';
export {
  getSeverityConfig,
  getPriorityConfig,
  getResourceTypeConfig,
  getScoreLevelColor,
  getScoreLevelLabel,
  sortByPriority,
  groupResourcesBySkill,
} from './core';
export * from './presets';

/**
 * BhCareerCoach component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCareerCoach(props: BhCareerCoachProps): React.ReactElement {
  const preset = props.preset ?? BH_CAREER_COACH_DEFAULTS.preset ?? 'candidate-facing';
  const PresetComponent = BH_CAREER_COACH_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCareerCoach.displayName = 'BhCareerCoach';

export { CandidateFacingBhCareerCoach, OptInBhCareerCoach } from './presets';
