'use client';

/**
 * @fileoverview LiveFeed pattern -- engine-aware real-time data feed with
 * auto-refresh, new-items indicator, and load-more pagination.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { LiveFeedProps } from './contracts';

export type { LiveFeedProps, FeedItem } from './contracts';

export const PatternLiveFeed = createEngineComponent<LiveFeedProps>(
  'PatternLiveFeed',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
