/**
 * BhAppealReview - Main Export
 * Appeal review and resolution panel for BitHire ATS platform
 */

import type { BhAppealReviewProps } from './core';
import { BH_APPEAL_REVIEW_DEFAULTS } from './core';
import { BH_APPEAL_REVIEW_PRESETS } from './presets';

export {
  type BhAppealReviewProps,
  type BhAppealReviewPreset,
  type AppealData,
  BH_APPEAL_REVIEW_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhAppealReview component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAppealReview(props: BhAppealReviewProps): React.ReactElement {
  const preset = props.preset ?? BH_APPEAL_REVIEW_DEFAULTS.preset ?? 'review';
  const PresetComponent = BH_APPEAL_REVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAppealReview.displayName = 'BhAppealReview';

export { ReviewBhAppealReview, CompactBhAppealReview } from './presets';
