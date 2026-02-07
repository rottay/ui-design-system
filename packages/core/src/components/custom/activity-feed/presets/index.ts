export { TimelineActivityFeed } from './timeline';
export { CompactActivityFeed } from './compact';

import type { ActivityFeedPreset } from '../core';
import type { ComponentType } from 'react';
import type { ActivityFeedProps } from '../core';
import { TimelineActivityFeed } from './timeline';
import { CompactActivityFeed } from './compact';

export const ACTIVITY_FEED_PRESETS: Record<ActivityFeedPreset, ComponentType<ActivityFeedProps>> = {
  timeline: TimelineActivityFeed,
  compact: CompactActivityFeed,
};
