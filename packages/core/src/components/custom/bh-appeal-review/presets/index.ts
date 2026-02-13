/**
 * BhAppealReview - All Presets
 */

import type { BhAppealReviewPreset } from '../core';
import { ReviewBhAppealReview } from './review';
import { CompactBhAppealReview } from './compact';

export { ReviewBhAppealReview } from './review';
export { CompactBhAppealReview } from './compact';

export const BH_APPEAL_REVIEW_PRESETS: Record<BhAppealReviewPreset, React.ComponentType<any>> = {
  'review': ReviewBhAppealReview,
  'compact': CompactBhAppealReview,
};
