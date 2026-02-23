/**
 * BhScoringJobQueue - All Presets
 */

import type { BhScoringJobQueuePreset, BhScoringJobQueueProps } from '../core';
import type { ComponentType } from 'react';
import { ListBhScoringJobQueue } from './list';
import { CompactBhScoringJobQueue } from './compact';

export { ListBhScoringJobQueue } from './list';
export { CompactBhScoringJobQueue } from './compact';

export const BH_SCORING_JOB_QUEUE_PRESETS: Record<BhScoringJobQueuePreset, ComponentType<BhScoringJobQueueProps>> = {
  'list': ListBhScoringJobQueue,
  'compact': CompactBhScoringJobQueue,
};
