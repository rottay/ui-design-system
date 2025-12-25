/**
 * TimePicker Component Types
 *
 * Unified type definitions for the TimePicker component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Time value type
 */
export type TimeValue = Date | string | null;

/**
 * Size variants for TimePicker
 */
export type TimePickerSize = 'small' | 'middle' | 'large';

/**
 * Status variants for TimePicker
 */
export type TimePickerStatus = 'error' | 'warning';

/**
 * Placement for the dropdown
 */
export type TimePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Base props shared by all TimePicker implementations
 */
export interface TimePickerBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current value (controlled) */
  value?: TimeValue;

  /** Default value (uncontrolled) */
  defaultValue?: TimeValue;

  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Whether the input is read-only */
  readOnly?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Time Format
  // ─────────────────────────────────────────────────────────────────────────────

  /** Time format string (e.g., 'HH:mm:ss') */
  format?: string;

  /** Use 12-hour format */
  use12Hours?: boolean;

  /** Hour step */
  hourStep?: number;

  /** Minute step */
  minuteStep?: number;

  /** Second step */
  secondStep?: number;

  /** Hide disabled options */
  hideDisabledOptions?: boolean;

  /** Show "Now" button */
  showNow?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the input */
  size?: TimePickerSize;

  /** Status of the input (error/warning styling) */
  status?: TimePickerStatus;

  /** Allow clearing the input */
  allowClear?: boolean;

  /** Whether the input has a border */
  bordered?: boolean;

  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';

  /** Custom suffix icon */
  suffixIcon?: ReactNode;

  /** Custom clear icon */
  clearIcon?: ReactNode;

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Placement of dropdown */
  placement?: TimePickerPlacement;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Style for dropdown */
  popupStyle?: CSSProperties;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // ─────────────────────────────────────────────────────────────────────────────
  // Time Restrictions
  // ─────────────────────────────────────────────────────────────────────────────

  /** Disabled hours */
  disabledHours?: () => number[];

  /** Disabled minutes */
  disabledMinutes?: (selectedHour: number) => number[];

  /** Disabled seconds */
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when value changes */
  onChange?: (time: Date | null, timeString: string) => void;

  /** Callback when dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;

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
 * Full TimePicker props
 */
export interface TimePickerProps extends TimePickerBaseProps {
  /** Render extra footer */
  renderExtraFooter?: () => ReactNode;

  /** Need confirm button */
  needConfirm?: boolean;
}

/**
 * TimeRangePicker props
 */
export interface TimeRangePickerProps
  extends Omit<TimePickerBaseProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Current value [start, end] */
  value?: [TimeValue, TimeValue] | null;

  /** Default value [start, end] */
  defaultValue?: [TimeValue, TimeValue];

  /** Placeholder [start, end] */
  placeholder?: [string, string];

  /** Separator between start and end */
  separator?: ReactNode;

  /** Callback when value changes */
  onChange?: (times: [Date | null, Date | null] | null, timeStrings: [string, string]) => void;

  /** Order the start and end values */
  order?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a time to string
 */
export function formatTime(date: Date | null, format: string = 'HH:mm:ss'): string {
  if (!date) return '';

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const hours12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';

  return format
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('H', String(hours))
    .replace('hh', String(hours12).padStart(2, '0'))
    .replace('h', String(hours12))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('m', String(minutes))
    .replace('ss', String(seconds).padStart(2, '0'))
    .replace('s', String(seconds))
    .replace('A', ampm)
    .replace('a', ampm.toLowerCase());
}

/**
 * Parse a time string to Date
 */
export function parseTime(timeString: string, format: string = 'HH:mm:ss'): Date | null {
  if (!timeString) return null;

  // Extract time parts from string
  const timeParts = timeString.match(/\d+/g);
  if (!timeParts) return null;

  const formatParts = format.match(/(HH?|hh?|mm?|ss?)/g) ?? [];

  const result: Record<string, number> = { H: 0, m: 0, s: 0 };

  formatParts.forEach((part, index) => {
    if (timeParts[index]) {
      const key = part.charAt(0).toLowerCase() === 'h' ? 'H' : part.charAt(0).toLowerCase();
      result[key] = parseInt(timeParts[index], 10);
    }
  });

  // Handle AM/PM
  const isPM = timeString.toLowerCase().includes('pm');
  const isAM = timeString.toLowerCase().includes('am');
  if (isPM && result.H < 12) result.H += 12;
  if (isAM && result.H === 12) result.H = 0;

  const date = new Date();
  date.setHours(result.H, result.m, result.s, 0);
  return date;
}

/**
 * Convert TimeValue to Date object
 */
export function toTime(value: TimeValue): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // Try parsing as ISO or simple time string
    const parsed = parseTime(value);
    if (parsed) return parsed;
    return new Date(value);
  }
  return null;
}

/**
 * Generate array of hours (0-23 or 1-12 for 12-hour format)
 */
export function generateHours(use12Hours: boolean = false): number[] {
  if (use12Hours) {
    return Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  }
  return Array.from({ length: 24 }, (_, i) => i);
}

/**
 * Generate array of minutes/seconds (0-59)
 */
export function generateMinutesOrSeconds(step: number = 1): number[] {
  const result: number[] = [];
  for (let i = 0; i < 60; i += step) {
    result.push(i);
  }
  return result;
}
