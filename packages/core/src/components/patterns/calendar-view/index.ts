'use client';

/**
 * @fileoverview CalendarView pattern -- engine-aware month/week/day calendar
 * grid with event rendering. Supports navigation, view switching, custom event
 * renderers, and date/event click callbacks.
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
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
