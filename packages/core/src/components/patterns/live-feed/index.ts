'use client';

/**
 * @fileoverview LiveFeed pattern -- engine-aware real-time data feed with
 * auto-refresh, new-items indicator, and load-more pagination.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { LiveFeedProps } from './LiveFeed.types';

export type { LiveFeedProps, FeedItem } from './LiveFeed.types';

export const PatternLiveFeed = createEngineComponent<LiveFeedProps>(
  'PatternLiveFeed',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
