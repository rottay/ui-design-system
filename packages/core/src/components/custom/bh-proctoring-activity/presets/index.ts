/**
 * BhProctoringActivity - All Presets
 */

import type { BhProctoringActivityPreset } from '../core';
import { FeedBhProctoringActivity } from './feed';
import { CompactBhProctoringActivity } from './compact';

export { FeedBhProctoringActivity } from './feed';
export { CompactBhProctoringActivity } from './compact';

export const BH_PROCTORING_ACTIVITY_PRESETS: Record<BhProctoringActivityPreset, React.ComponentType<any>> = {
  'feed': FeedBhProctoringActivity,
  'compact': CompactBhProctoringActivity,
};
