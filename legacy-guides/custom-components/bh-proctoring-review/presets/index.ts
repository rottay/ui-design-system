/**
 * BhProctoringReview - All Presets
 */

import type { BhProctoringReviewPreset, BhProctoringReviewProps } from '../core';
import type { ComponentType } from 'react';
import { SplitBhProctoringReview } from './split';
import { StackedBhProctoringReview } from './stacked';

export { SplitBhProctoringReview } from './split';
export { StackedBhProctoringReview } from './stacked';

export const BH_PROCTORING_REVIEW_PRESETS: Record<BhProctoringReviewPreset, ComponentType<BhProctoringReviewProps>> = {
  'split': SplitBhProctoringReview,
  'stacked': StackedBhProctoringReview,
};
