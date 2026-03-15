/**
 * BhProctoringActivity - All Presets
 */

import type { BhProctoringActivityPreset, BhProctoringActivityProps } from '../core';
import type { ComponentType } from 'react';
import { FeedBhProctoringActivity } from './feed';
import { CompactBhProctoringActivity } from './compact';

export { FeedBhProctoringActivity } from './feed';
export { CompactBhProctoringActivity } from './compact';

export const BH_PROCTORING_ACTIVITY_PRESETS: Record<BhProctoringActivityPreset, ComponentType<BhProctoringActivityProps>> = {
  'feed': FeedBhProctoringActivity,
  'compact': CompactBhProctoringActivity,
};
