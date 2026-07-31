/**
 * @fileoverview Shared calendar utilities - Rottay Design System
 * @description Engine-agnostic calendar functions, constants, and types used
 * by calendar-bearing primitives.
 *
 * Extracted to eliminate duplication between engine implementations.
 *
 * @module primitives/foundation/calendar
 * @category PrimitiveFoundation
 * @package @rottay/design-system
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ---------------------------------------------------------------------------
// Number/date formatting
// ---------------------------------------------------------------------------

/** Pad a number to 2 digits with a leading zero. */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// ---------------------------------------------------------------------------
// Date calculation helpers
// ---------------------------------------------------------------------------

/** Return the number of days in a given month (0-indexed). */
export function daysInMonthCount(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Return the day-of-week (0=Sunday) for the first day of a month. */
export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Check whether two dates represent the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Strip time components from a Date, returning midnight. */
export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Check whether a date falls within an inclusive range (ignoring time). */
export function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const d = stripTime(date).getTime();
  const s = stripTime(start).getTime();
  const e = stripTime(end).getTime();
  return d >= Math.min(s, e) && d <= Math.max(s, e);
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Parse a Date, string, null, or undefined into a Date or null. */
export function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Format a date as YYYY-MM-DD. */
export function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Format a date's time portion as HH:mm. */
export function formatTimeStr(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Apply a custom format string to a Date. */
export function applyFormat(date: Date, fmt: string): string {
  return fmt
    .replace('YYYY', String(date.getFullYear()))
    .replace('MMMM', MONTHS_FULL[date.getMonth()])
    .replace('MMM', MONTHS_SHORT[date.getMonth()])
    .replace('MM', pad2(date.getMonth() + 1))
    .replace('DD', pad2(date.getDate()))
    .replace('dd', pad2(date.getDate()))
    .replace('HH', pad2(date.getHours()))
    .replace('mm', pad2(date.getMinutes()))
    .replace('ss', pad2(date.getSeconds()));
}

/** Format a date for display based on picker mode and options. */
export function formatDisplay(
  date: Date | null,
  format: string | undefined,
  picker: string,
  showTime: boolean,
): string {
  if (!date) return '';
  if (format) return applyFormat(date, format);
  switch (picker) {
    case 'month':
      return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
    case 'year':
      return String(date.getFullYear());
    default:
      return showTime
        ? `${formatDateStr(date)} ${formatTimeStr(date)}`
        : formatDateStr(date);
  }
}

// ---------------------------------------------------------------------------
// Calendar grid
// ---------------------------------------------------------------------------

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

/**
 * Generate a 6-week (42-cell) calendar grid for a given year/month.
 * Includes leading days from the previous month and trailing days
 * from the next month.
 */
export function generateCalendarGrid(
  year: number,
  month: number,
  disabledDate?: (d: Date) => boolean,
): CalendarDay[] {
  const today = new Date();
  const totalDays = daysInMonthCount(year, month);
  const startDay = firstDayOfMonth(year, month);
  const grid: CalendarDay[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = daysInMonthCount(prevYear, prevMonth);
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const date = new Date(prevYear, prevMonth, d);
    grid.push({
      date, day: d, isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isDisabled: disabledDate ? disabledDate(date) : false,
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    grid.push({
      date, day: d, isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isDisabled: disabledDate ? disabledDate(date) : false,
    });
  }

  const remaining = 42 - grid.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(nextYear, nextMonth, d);
    grid.push({
      date, day: d, isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isDisabled: disabledDate ? disabledDate(date) : false,
    });
  }

  return grid;
}

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

/** Return the new date after a keyboard navigation action, or null if unrecognized. */
export function getKeyboardNavDate(current: Date, key: string): Date | null {
  const y = current.getFullYear();
  const m = current.getMonth();
  const d = current.getDate();
  switch (key) {
    case 'ArrowLeft':  return new Date(y, m, d - 1);
    case 'ArrowRight': return new Date(y, m, d + 1);
    case 'ArrowUp':    return new Date(y, m, d - 7);
    case 'ArrowDown':  return new Date(y, m, d + 7);
    case 'PageUp':     return new Date(y, m - 1, d);
    case 'PageDown':   return new Date(y, m + 1, d);
    case 'Home':       return new Date(y, m, 1);
    case 'End':        return new Date(y, m + 1, 0);
    default:           return null;
  }
}
