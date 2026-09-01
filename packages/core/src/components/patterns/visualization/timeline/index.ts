'use client';

/**
 * @fileoverview Timeline pattern -- engine-aware chronological event display
 * with left/right/alternate modes and optional date grouping.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TimelinePatternProps } from './contracts';

export type { TimelinePatternProps, TimelineItem } from './contracts';

export const PatternTimeline = createEngineComponent<TimelinePatternProps<any>>(
  'PatternTimeline',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
