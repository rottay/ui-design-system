/**
 * BhActivityFeed - All Presets
 */

import type { BhActivityFeedPreset, BhActivityFeedProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhActivityFeed } from './full';

export { FullBhActivityFeed } from './full';

export const BH_ACTIVITY_FEED_PRESETS: Record<BhActivityFeedPreset, ComponentType<BhActivityFeedProps>> = {
  full: FullBhActivityFeed,
};
