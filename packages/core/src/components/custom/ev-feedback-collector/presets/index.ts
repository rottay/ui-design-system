export { FeedbackCollectorSurvey } from './survey';
export { FeedbackCollectorResults } from './results';

import type { FeedbackCollectorPreset } from '../core';
import type { ComponentType } from 'react';
import type { FeedbackCollectorProps } from '../core';
import { FeedbackCollectorSurvey } from './survey';
import { FeedbackCollectorResults } from './results';

export const PRESETS: Record<
  FeedbackCollectorPreset,
  ComponentType<FeedbackCollectorProps>
> = {
  survey: FeedbackCollectorSurvey,
  results: FeedbackCollectorResults,
};
