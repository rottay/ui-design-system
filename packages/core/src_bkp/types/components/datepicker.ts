/**
 * DatePicker Component Types
 *
 * Unified type definitions for the DatePicker component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Date value type - can be Date object, string, or number (timestamp)
 */
export type DateValue = Date | string | number | null;

/**
 * Size variants for DatePicker
 */
export type DatePickerSize = 'small' | 'middle' | 'large';

/**
 * Status variants for DatePicker
 */
export type DatePickerStatus = 'error' | 'warning';

/**
 * Picker mode/type
 */
export type DatePickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Placement for the dropdown
 */
export type DatePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Preset range configuration
 */
export interface DatePickerPreset {
  /** Label shown in the preset button */
  label: ReactNode;
  /** Value to set when preset is clicked */
  value: Date | (() => Date);
}

/**
 * Range preset configuration (for RangePicker)
 */
export interface DateRangePreset {
  /** Label shown in the preset button */
  label: ReactNode;
  /** Value to set when preset is clicked [start, end] */
  value: [Date, Date] | (() => [Date, Date]);
}

/**
 * Base props shared by all DatePicker implementations
 */
export interface DatePickerBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current value (controlled) */
  value?: DateValue;

  /** Default value (uncontrolled) */
  defaultValue?: DateValue;

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Whether the input is read-only */
  readOnly?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Picker Mode
  // ─────────────────────────────────────────────────────────────────────────────

  /** Type of picker */
  picker?: DatePickerMode;

  /** Show time picker as well */
  showTime?: boolean | object;

  /** Show "Today" button */
  showToday?: boolean;

  /** Show "Now" button (when showTime is true) */
  showNow?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: DatePickerSize;

  /** Status of the input (error/warning styling) */
  status?: DatePickerStatus;

  /** Allow clearing the input */
  allowClear?: boolean;

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  /** Custom suffix icon */
  suffixIcon?: ReactNode;

  /** Custom prev icon */
  prevIcon?: ReactNode;

  /** Custom next icon */
  nextIcon?: ReactNode;

  /** Custom super prev icon */
  superPrevIcon?: ReactNode;

  /** Custom super next icon */
  superNextIcon?: ReactNode;

  // ─────────────────────────────────────────────────────────────────────────────
  // Format
  // ─────────────────────────────────────────────────────────────────────────────

  /** Date format string (e.g., 'YYYY-MM-DD') */
  format?: string | string[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Placement of dropdown */
  placement?: DatePickerPlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Style for dropdown */
  popupStyle?: CSSProperties;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // ─────────────────────────────────────────────────────────────────────────────
  // Date Restrictions
  // ─────────────────────────────────────────────────────────────────────────────

  /** Minimum selectable date */
  minDate?: Date;

  /** Maximum selectable date */
  maxDate?: Date;

  /** Function to disable specific dates */
  disabledDate?: (currentDate: Date) => boolean;

  /** Default date for picker panel */
  defaultPickerValue?: DateValue;

  // ─────────────────────────────────────────────────────────────────────────────
  // Presets
  // ─────────────────────────────────────────────────────────────────────────────

  /** Preset date options */
  presets?: DatePickerPreset[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when value changes */
  onChange?: (date: Date | null, dateString: string) => void;

  /** Callback when dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;

  /** Callback when panel changes */
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;

  /** Callback on focus */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Callback on blur */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  /** Callback on key down */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;

  /** Name attribute */
  name?: string;

  /** Auto focus */
  autoFocus?: boolean;

  /** Input mode */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** Tab index */
  tabIndex?: number;
}

/**
 * Full DatePicker props
 */
export interface DatePickerProps extends DatePickerBaseProps {
  /** Whether to show week number column */
  showWeekNumber?: boolean;

  /** Custom cell render */
  cellRender?: (current: Date, info: { type: DatePickerMode }) => ReactNode;

  /** Custom panel render */
  panelRender?: (originPanel: ReactNode) => ReactNode;

  /** Multiple selection mode */
  multiple?: boolean;

  /** Maximum tag count (for multiple mode) */
  maxTagCount?: number | 'responsive';

  /** Custom dropdown render */
  dropdownRender?: (originNode: ReactNode) => ReactNode;
}

/**
 * RangePicker props
 */
export interface RangePickerProps
  extends Omit<DatePickerBaseProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder' | 'presets'> {
  /** Current value [start, end] */
  value?: [DateValue, DateValue] | null;

  /** Default value [start, end] */
  defaultValue?: [DateValue, DateValue];

  /** Placeholder [start, end] */
  placeholder?: [string, string];

  /** Separator between start and end */
  separator?: ReactNode;

  /** Preset range options */
  presets?: DateRangePreset[];

  /** Allow empty for start or end */
  allowEmpty?: [boolean, boolean];

  /** Callback when value changes */
  onChange?: (dates: [Date | null, Date | null] | null, dateStrings: [string, string]) => void;

  /** Callback when calendar changes */
  onCalendarChange?: (
    dates: [Date | null, Date | null],
    dateStrings: [string, string],
    info: { range: 'start' | 'end' }
  ) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a date to string using simple patterns
 */
export function formatDate(date: Date | null, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Parse a string to Date
 */
export function parseDate(dateString: string, format: string = 'YYYY-MM-DD'): Date | null {
  if (!dateString) return null;

  // Simple parse for common formats
  const formatParts = format.match(/(YYYY|MM|DD|HH|mm|ss)/g) ?? [];
  const dateParts = dateString.match(/\d+/g) ?? [];

  if (formatParts.length !== dateParts.length) return null;

  const result: Record<string, number> = { YYYY: 0, MM: 1, DD: 1, HH: 0, mm: 0, ss: 0 };

  formatParts.forEach((part, index) => {
    result[part] = parseInt(dateParts[index], 10);
  });

  return new Date(result.YYYY, result.MM - 1, result.DD, result.HH, result.mm, result.ss);
}

/**
 * Convert DateValue to Date object
 */
export function toDate(value: DateValue): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
}

/**
 * Check if date is same day
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date is in range
 */
export function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
