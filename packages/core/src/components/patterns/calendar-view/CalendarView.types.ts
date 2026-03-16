/**
 * @fileoverview Type definitions for the CalendarView pattern component.
 * Defines the generic `CalendarEvent<T>` shape for calendar entries and
 * `CalendarViewProps<T>` controlling view mode (month/week/day), date
 * navigation, event rendering, and interaction callbacks. The calendar is
 * fully controlled -- the parent owns the current date and view state.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/**
 * Represents a single event displayed on the calendar.
 *
 * Events require at minimum an `id`, `title`, and `start` date/time.
 * The optional generic parameter `T` allows attaching arbitrary domain data
 * (e.g. a full `Meeting` or `Appointment` object) accessible via the `data`
 * property.
 *
 * @typeParam T - Shape of the custom data payload attached to the event.
 *   Defaults to `unknown` when no domain-specific data is needed.
 */
export interface CalendarEvent<T = unknown> {
  /** Unique identifier for the event. Used as React key and for click callbacks. */
  id: string;

  /** Display title shown on the calendar cell or time slot. */
  title: string;

  /**
   * Start date/time of the event. Accepts a `Date` object or an ISO 8601
   * string. Determines which cell or time slot the event renders in.
   */
  start: Date | string;

  /**
   * End date/time of the event. When omitted, the event is treated as a
   * point-in-time occurrence (or an all-day event if `allDay` is true).
   * Accepts a `Date` object or an ISO 8601 string.
   */
  end?: Date | string;

  /**
   * Color indicator for the event chip/badge. Should reference a
   * design-system CSS variable for theme compatibility
   * (e.g. `"var(--ds-color-primary)"`).
   */
  color?: string;

  /**
   * Whether this is an all-day event. All-day events render in a dedicated
   * banner area at the top of day/week views, rather than in a specific
   * time slot.
   * @default false
   */
  allDay?: boolean;

  /**
   * Arbitrary domain data attached to the event. Available in callbacks
   * like `onEventClick` so the parent can access full entity details
   * without a separate lookup.
   */
  data?: T;
}

/**
 * Props for the CalendarView pattern component.
 *
 * CalendarView renders events in a month, week, or day layout with
 * navigation controls. The parent owns all state (current date, view mode,
 * events array) and the calendar only renders UI and fires callbacks.
 *
 * @typeParam T - Shape of the custom data payload on `CalendarEvent`.
 *
 * @example
 * ```tsx
 * <PatternCalendarView<Meeting>
 *   events={meetings.map((m) => ({
 *     id: m.id,
 *     title: m.title,
 *     start: m.startTime,
 *     end: m.endTime,
 *     color: m.isUrgent ? 'var(--ds-color-danger)' : undefined,
 *     data: m,
 *   }))}
 *   view={currentView}
 *   currentDate={selectedDate}
 *   onDateChange={setSelectedDate}
 *   onViewChange={setCurrentView}
 *   onEventClick={(event) => openMeetingDetail(event.data)}
 *   onDateClick={(date) => openNewMeetingDialog(date)}
 * />
 * ```
 */
export interface CalendarViewProps<T> extends PatternBaseProps {
  /**
   * Array of events to display on the calendar. Events are positioned
   * according to their `start` (and optionally `end`) date/time.
   */
  events: CalendarEvent<T>[];

  /**
   * Active view mode controlling the calendar layout.
   *
   * - `"month"` -- Full month grid showing day cells.
   * - `"week"` -- 7-day view with hourly time slots.
   * - `"day"` -- Single day view with detailed hourly time slots.
   *
   * @default "month"
   */
  view?: 'month' | 'week' | 'day';

  /**
   * The date the calendar is centered on. In month view, this determines
   * which month is displayed. In week/day views, it determines the visible
   * date range.
   * @default new Date() (today)
   */
  currentDate?: Date;

  /**
   * Called when the user navigates to a different date (via prev/next buttons
   * or by clicking a date cell in month view).
   *
   * @param date - The new target date.
   */
  onDateChange?: (date: Date) => void;

  /**
   * Called when the user switches between view modes (month/week/day toggle).
   *
   * @param view - The newly selected view mode.
   */
  onViewChange?: (view: 'month' | 'week' | 'day') => void;

  /**
   * Called when an event chip/badge is clicked.
   *
   * @param event - The full `CalendarEvent` object that was clicked.
   */
  onEventClick?: (event: CalendarEvent<T>) => void;

  /**
   * Called when an empty date cell or time slot is clicked. Typically used
   * to open a "create event" dialog pre-filled with the clicked date.
   *
   * @param date - The `Date` corresponding to the clicked cell/slot.
   */
  onDateClick?: (date: Date) => void;

  /**
   * Custom event renderer that replaces the default event chip. Useful for
   * rendering rich event cards with avatars, status badges, or progress bars.
   *
   * @param event - The event to render.
   */
  renderEvent?: (event: CalendarEvent<T>) => ReactNode;

  /**
   * Toolbar slot rendered above the calendar grid. Typically contains
   * navigation arrows, view mode toggle, and a "Today" button. When omitted,
   * the component renders its own default toolbar.
   */
  toolbar?: ReactNode;

  /**
   * Header slot rendered above the toolbar. Useful for page titles,
   * breadcrumbs, or action buttons.
   */
  header?: ReactNode;
}
