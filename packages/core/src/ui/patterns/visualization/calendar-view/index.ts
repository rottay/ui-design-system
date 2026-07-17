'use client';

/**
 * @fileoverview CalendarView pattern -- engine-aware month/week/day calendar
 * grid with event rendering. Supports navigation, view switching, custom event
 * renderers, and date/event click callbacks.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CalendarViewProps } from './contracts';

export type { CalendarViewProps, CalendarEvent } from './contracts';

export const PatternCalendarView = createEngineComponent<CalendarViewProps<any>>(
  'PatternCalendarView',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
