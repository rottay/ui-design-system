/**
 * @fileoverview The calendar kernel: grid geometry, locale week start and names,
 * formatting and the APG date-grid keyboard, shared by every calendar-bearing
 * primitive.
 *
 * @module primitives/foundation/calendar
 * @category PrimitiveFoundation
 * @package @rottay/design-system
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const year = date.getFullYear();
  const yyyy = year >= 0 ? String(year).padStart(4, '0') : String(year);
  return `${yyyy}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
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

export interface CalendarGridOptions {
  /** @default 0 (Sunday) */
  readonly weekStartsOn?: WeekStartsOn;
}

/**
 * Generate a 6-week (42-cell) grid for a month whose first column is
 * `weekStartsOn`, padded with the adjacent months' days.
 */
export function generateCalendarGrid(
  year: number,
  month: number,
  disabledDate?: (d: Date) => boolean,
  options: CalendarGridOptions = {},
): CalendarDay[] {
  const { weekStartsOn = 0 } = options;
  const today = new Date();
  const leading = (firstDayOfMonth(year, month) - weekStartsOn + 7) % 7;
  const viewedMonth = new Date(year, month, 1).getMonth();
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - leading + index);
    return {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === viewedMonth,
      isToday: isSameDay(date, today),
      isDisabled: disabledDate ? disabledDate(date) : false,
    };
  });
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

// ---------------------------------------------------------------------------
// Locale geometry
// ---------------------------------------------------------------------------

/** The weekday a grid's first column holds: 0 is Sunday, 6 is Saturday. */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** CLDR regions whose week starts on Sunday or Saturday; every other region starts on Monday. */
const SUNDAY_REGIONS = new Set([
  'AG', 'AS', 'BD', 'BR', 'BS', 'BT', 'BW', 'BZ', 'CA', 'CN', 'CO', 'DM', 'DO', 'ET', 'GT', 'GU', 'HK',
  'HN', 'ID', 'IL', 'IN', 'JM', 'JP', 'KE', 'KH', 'KR', 'LA', 'MH', 'MM', 'MO', 'MT', 'MX', 'MZ', 'NI',
  'NP', 'PA', 'PE', 'PH', 'PK', 'PR', 'PY', 'SA', 'SG', 'SV', 'TH', 'TT', 'TW', 'UM', 'US', 'VE', 'VI',
  'WS', 'YE', 'ZA', 'ZW',
]);
const SATURDAY_REGIONS = new Set(['AE', 'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY']);

/** A bare language tag answers for the region the product ships it to. */
const WEEK_START_BY_LANGUAGE: Readonly<Record<string, WeekStartsOn>> = { en: 0, es: 1, fr: 1, pt: 1, de: 1, it: 1, ar: 6, fa: 6, he: 0, ja: 0, ko: 0, zh: 0 };

/**
 * The first weekday of a locale, from a fixed CLDR table rather than
 * `Intl.Locale#weekInfo`, so the grid is identical across ICU builds.
 */
export function resolveWeekStartsOn(locale?: string | null): WeekStartsOn {
  if (!locale) return 0;
  const [language = '', ...rest] = locale.replace(/_/g, '-').split('-');
  const region = rest.find((part) => /^[A-Za-z]{2}$|^\d{3}$/.test(part))?.toUpperCase();
  if (region) {
    if (SUNDAY_REGIONS.has(region)) return 0;
    if (SATURDAY_REGIONS.has(region)) return 6;
    return 1;
  }
  return WEEK_START_BY_LANGUAGE[language.toLowerCase()] ?? 1;
}

/** Sunday-based weekday indices in column order. */
export function weekdayOrder(weekStartsOn: WeekStartsOn = 0): number[] {
  return Array.from({ length: 7 }, (_, column) => (weekStartsOn + column) % 7);
}

const REFERENCE_SUNDAY = new Date(2023, 0, 1);

function formatterFor(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat | null {
  if (!locale) return null;
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch {
    return null;
  }
}

/** Weekday names in column order; without a locale the English floor. */
export function formatWeekdayNames(
  locale: string | undefined,
  options: { weekStartsOn?: WeekStartsOn; width?: 'narrow' | 'short' | 'long' } = {},
): string[] {
  const { weekStartsOn = 0, width = 'short' } = options;
  const formatter = formatterFor(locale, { weekday: width });
  return weekdayOrder(weekStartsOn).map((weekday) =>
    formatter
      ? formatter.format(new Date(REFERENCE_SUNDAY.getFullYear(), 0, 1 + weekday))
      : width === 'long'
        ? DAYS_LONG[weekday]
        : DAYS_SHORT[weekday],
  );
}

/** Month names January first; without a locale the English floor. */
export function formatMonthNames(locale: string | undefined, width: 'short' | 'long' = 'long'): string[] {
  const formatter = formatterFor(locale, { month: width });
  return Array.from({ length: 12 }, (_, month) =>
    formatter ? formatter.format(new Date(2023, month, 1)) : width === 'long' ? MONTHS_FULL[month] : MONTHS_SHORT[month],
  );
}

/** The accessible name of a day cell in the active locale. */
export function formatCalendarDate(date: Date, locale?: string): string {
  const formatter = formatterFor(locale, { dateStyle: 'full' });
  return formatter ? formatter.format(date) : formatDateStr(date);
}

// ---------------------------------------------------------------------------
// Grid keyboard (APG date grid)
// ---------------------------------------------------------------------------

export interface CalendarKeyEvent {
  readonly key: string;
  readonly shiftKey?: boolean;
}

export interface CalendarKeyOptions {
  /** Left and right swap in a right-to-left context. */
  readonly rtl?: boolean;
  readonly weekStartsOn?: WeekStartsOn;
}

/** Same day in another month, clamped to that month's length. */
function shiftMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(date.getDate(), daysInMonthCount(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
}

/**
 * The date a grid key moves focus to, or `null` for a key the grid does not
 * own: arrows a day or a week, Home and End the week edges, PageUp and
 * PageDown a month, with Shift a year.
 */
export function resolveCalendarKeyDate(
  current: Date,
  event: CalendarKeyEvent,
  options: CalendarKeyOptions = {},
): Date | null {
  const { rtl = false, weekStartsOn = 0 } = options;
  const y = current.getFullYear();
  const m = current.getMonth();
  const d = current.getDate();
  switch (event.key) {
    case 'ArrowLeft':
      return new Date(y, m, d + (rtl ? 1 : -1));
    case 'ArrowRight':
      return new Date(y, m, d + (rtl ? -1 : 1));
    case 'ArrowUp':
      return new Date(y, m, d - 7);
    case 'ArrowDown':
      return new Date(y, m, d + 7);
    case 'Home':
      return new Date(y, m, d - ((current.getDay() - weekStartsOn + 7) % 7));
    case 'End':
      return new Date(y, m, d + (6 - ((current.getDay() - weekStartsOn + 7) % 7)));
    case 'PageUp':
      return shiftMonths(current, event.shiftKey ? -12 : -1);
    case 'PageDown':
      return shiftMonths(current, event.shiftKey ? 12 : 1);
    default:
      return null;
  }
}

/**
 * The key's destination, stepping past disabled dates in the same direction;
 * `null` when the key is not a grid key or every date that way is disabled.
 */
export function resolveEnabledCalendarKeyDate(
  current: Date,
  event: CalendarKeyEvent,
  isDisabled: (date: Date) => boolean,
  options: CalendarKeyOptions = {},
): Date | null {
  let target = resolveCalendarKeyDate(current, event, options);
  const stepKey = event.key === 'Home' ? 'ArrowRight' : event.key === 'End' ? 'ArrowLeft' : event.key;
  const stepOptions = event.key === 'Home' || event.key === 'End' ? { ...options, rtl: false } : options;
  for (let guard = 0; target && isDisabled(target) && guard < 366; guard += 1) {
    target = resolveCalendarKeyDate(target, { ...event, key: stepKey }, stepOptions);
  }
  return target && !isDisabled(target) ? target : null;
}
