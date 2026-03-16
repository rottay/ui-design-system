'use client';

/**
 * @fileoverview Timeline pattern -- engine-aware chronological event display
 * with left/right/alternate modes and optional date grouping.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { TimelinePatternProps } from './Timeline.types';

export type { TimelinePatternProps, TimelineItem } from './Timeline.types';

export const PatternTimeline = createEngineComponent<TimelinePatternProps<any>>(
  'PatternTimeline',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
