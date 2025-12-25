/**
 * Calendar Component Types
 *
 * Unified type definitions for the Calendar component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Calendar Mode
 */
export type CalendarMode = 'month' | 'year';

/**
 * Header Render Info
 */
export interface CalendarHeaderRenderInfo {
  value: Date;
  type: CalendarMode;
  onChange: (date: Date) => void;
  onTypeChange: (type: CalendarMode) => void;
}

/**
 * Calendar Props
 */
export interface CalendarProps {
  /** Current selected date (controlled) */
  value?: Date;

  /** Default selected date (uncontrolled) */
  defaultValue?: Date;

  /** Display mode */
  mode?: CalendarMode;

  /** Whether to display full calendar or just month/year panel */
  fullscreen?: boolean;

  /** Custom header render function */
  headerRender?: (info: CalendarHeaderRenderInfo) => ReactNode;

  /** Custom cell render function */
  cellRender?: (date: Date, info: { type: CalendarMode }) => ReactNode;

  /** Date cell render function (month mode) */
  dateCellRender?: (date: Date) => ReactNode;

  /** Month cell render function (year mode) */
  monthCellRender?: (date: Date) => ReactNode;

  /** Callback when date is selected */
  onSelect?: (date: Date) => void;

  /** Callback when date changes */
  onChange?: (date: Date) => void;

  /** Callback when panel changes */
  onPanelChange?: (date: Date, mode: CalendarMode) => void;

  /** Function to disable specific dates */
  disabledDate?: (date: Date) => boolean;

  /** Valid range for calendar */
  validRange?: [Date, Date];

  /** Locale settings */
  locale?: CalendarLocale;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Calendar Locale
 */
export interface CalendarLocale {
  lang?: {
    locale?: string;
    monthFormat?: string;
    monthBeforeYear?: boolean;
    today?: string;
    now?: string;
    backToToday?: string;
    ok?: string;
    clear?: string;
    month?: string;
    year?: string;
    timeSelect?: string;
    dateSelect?: string;
    monthSelect?: string;
    yearSelect?: string;
    decadeSelect?: string;
    dayFormat?: string;
    dateFormat?: string;
    dateTimeFormat?: string;
    shortWeekDays?: string[];
    shortMonths?: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday, 1 = Monday, etc.)
 */
export function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

/**
 * Get calendar grid for a month
 */
export function getCalendarGrid(date: Date): (Date | null)[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(date);
  const firstDay = getFirstDayOfMonth(date);

  const grid: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  // Fill empty days at start
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  // Fill days
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // Fill empty days at end
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);
  }

  return grid;
}

/**
 * Get months for year view
 */
export function getMonthsGrid(date: Date): Date[][] {
  const year = date.getFullYear();
  const grid: Date[][] = [];

  for (let row = 0; row < 3; row++) {
    const months: Date[] = [];
    for (let col = 0; col < 4; col++) {
      months.push(new Date(year, row * 4 + col, 1));
    }
    grid.push(months);
  }

  return grid;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format month name
 */
export function formatMonth(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, { month: 'long' });
}

/**
 * Format year
 */
export function formatYear(date: Date): string {
  return String(date.getFullYear());
}

/**
 * Default weekday names
 */
export const DEFAULT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Default month names
 */
export const DEFAULT_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
