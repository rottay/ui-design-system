/**
 * BhSprintReview - Main Export
 * Sprint review/summary for BitHire recruiting sprints
 * Automatically selects preset based on props
 */

import type { BhSprintReviewProps } from './core';
import { BH_SPRINT_REVIEW_DEFAULTS } from './core';
import { BH_SPRINT_REVIEW_PRESETS } from './presets';

export {
  type BhSprintReviewProps,
  type BhSprintReviewPreset,
  type SprintGoal,
  type SprintMetric,
  type SprintReviewData,
  BH_SPRINT_REVIEW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintReview component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintReview(props: BhSprintReviewProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_REVIEW_DEFAULTS.preset ?? 'summary';
  const PresetComponent = BH_SPRINT_REVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintReview.displayName = 'BhSprintReview';

export { SummaryBhSprintReview } from './presets';
