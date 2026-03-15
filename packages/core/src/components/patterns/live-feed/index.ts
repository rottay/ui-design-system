'use client';

/**
 * LiveFeed - Pattern Component
 *
 * Real-time data feed with auto-refresh, new-items indicator, and load-more.
 * Used by: OrderQueue (bar), CheckIns (ev), Notifications (pl), ActivityFeed (generic)
 */

import { createEngineComponent } from '../../../core/engines/factory';
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
