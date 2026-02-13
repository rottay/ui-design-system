/**
 * BhScoringJobQueue - All Presets
 */

import type { BhScoringJobQueuePreset } from '../core';
import { ListBhScoringJobQueue } from './list';
import { CompactBhScoringJobQueue } from './compact';

export { ListBhScoringJobQueue } from './list';
export { CompactBhScoringJobQueue } from './compact';

export const BH_SCORING_JOB_QUEUE_PRESETS: Record<BhScoringJobQueuePreset, React.ComponentType<any>> = {
  'list': ListBhScoringJobQueue,
  'compact': CompactBhScoringJobQueue,
};
