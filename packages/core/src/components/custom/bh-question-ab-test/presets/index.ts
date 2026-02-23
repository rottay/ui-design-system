/**
 * BhQuestionAbTest - All Presets
 */

export { DashboardBhQuestionAbTest } from './dashboard';
export { DetailBhQuestionAbTest } from './detail';
export { AnalyticsBhQuestionAbTest } from './analytics';

import type { BhQuestionAbTestPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhQuestionAbTestProps } from '../core';
import { DashboardBhQuestionAbTest } from './dashboard';
import { DetailBhQuestionAbTest } from './detail';
import { AnalyticsBhQuestionAbTest } from './analytics';

export const BH_QUESTION_AB_TEST_PRESETS: Record<BhQuestionAbTestPreset, ComponentType<BhQuestionAbTestProps>> = {
  dashboard: DashboardBhQuestionAbTest,
  detail: DetailBhQuestionAbTest,
  analytics: AnalyticsBhQuestionAbTest,
};
