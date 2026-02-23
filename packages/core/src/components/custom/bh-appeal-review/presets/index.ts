/**
 * BhAppealReview - All Presets
 */

import type { BhAppealReviewPreset, BhAppealReviewProps } from '../core';
import type { ComponentType } from 'react';
import { ReviewBhAppealReview } from './review';
import { CompactBhAppealReview } from './compact';

export { ReviewBhAppealReview } from './review';
export { CompactBhAppealReview } from './compact';

export const BH_APPEAL_REVIEW_PRESETS: Record<BhAppealReviewPreset, ComponentType<BhAppealReviewProps>> = {
  'review': ReviewBhAppealReview,
  'compact': CompactBhAppealReview,
};
