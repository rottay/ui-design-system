'use client';

/**
 * Timeline<T> - Pattern Component
 *
 * Engine-aware timeline component for displaying chronological events.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { TimelinePatternProps } from './types';

export type { TimelinePatternProps, TimelineItem } from './types';

export const PatternTimeline = createEngineComponent<TimelinePatternProps<any>>(
  'PatternTimeline',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
