/**
 * BhProctoringReview - All Presets
 */

import type { BhProctoringReviewPreset } from '../core';
import { SplitBhProctoringReview } from './split';
import { StackedBhProctoringReview } from './stacked';

export { SplitBhProctoringReview } from './split';
export { StackedBhProctoringReview } from './stacked';

export const BH_PROCTORING_REVIEW_PRESETS: Record<BhProctoringReviewPreset, React.ComponentType<any>> = {
  'split': SplitBhProctoringReview,
  'stacked': StackedBhProctoringReview,
};
