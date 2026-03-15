'use client';

/**
 * CalendarView<T> - Pattern Component
 *
 * Month/week/day calendar grid with event rendering.
 * Implements a simple month view with events placed on dates.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { CalendarViewProps } from './CalendarView.types';

export type { CalendarViewProps, CalendarEvent } from './CalendarView.types';

export const PatternCalendarView = createEngineComponent<CalendarViewProps<any>>(
  'PatternCalendarView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
