/**
 * BhProctoringReview - Main Export
 * Split-view event detail + review form for proctoring events
 */

import type { BhProctoringReviewProps } from './core';
import { BH_PROCTORING_REVIEW_DEFAULTS } from './core';
import { BH_PROCTORING_REVIEW_PRESETS } from './presets';

export {
  type BhProctoringReviewProps,
  type BhProctoringReviewPreset,
  type ProctoringEventType,
  type ProctoringEventSeverity,
  type ProctoringReviewEventView,
  type ReviewSubmission,
  type ProctoringEventSelect,
  BH_PROCTORING_REVIEW_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringReview component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringReview(props: BhProctoringReviewProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_REVIEW_DEFAULTS.preset ?? 'split';
  const PresetComponent = BH_PROCTORING_REVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringReview.displayName = 'BhProctoringReview';

export { SplitBhProctoringReview, StackedBhProctoringReview } from './presets';
