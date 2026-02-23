/**
 * BhSprintReview - All Presets
 */

export { SummaryBhSprintReview } from './summary';

import type { BhSprintReviewPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintReviewProps } from '../core';
import { SummaryBhSprintReview } from './summary';

export const BH_SPRINT_REVIEW_PRESETS: Record<BhSprintReviewPreset, ComponentType<BhSprintReviewProps>> = {
  summary: SummaryBhSprintReview,
};
