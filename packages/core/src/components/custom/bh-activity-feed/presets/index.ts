/**
 * BhActivityFeed - All Presets
 */

import type { BhActivityFeedPreset } from '../core';
import { FullBhActivityFeed } from './full';

export { FullBhActivityFeed } from './full';

export const BH_ACTIVITY_FEED_PRESETS: Record<BhActivityFeedPreset, React.ComponentType<any>> = {
  full: FullBhActivityFeed,
};
