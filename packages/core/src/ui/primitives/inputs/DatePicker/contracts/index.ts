/**
 * @fileoverview DatePicker Component Types - Rottay Design System
 * @description Type definitions for the DatePicker component including picker modes,
 * placements, range selection, and customization options.
 *
 * @remarks
 * The DatePicker types provide comprehensive configuration for:
 * - Picker modes: Date, week, month, quarter, year selection
 * - Time support: Combined date-time picking
 * - Range selection: Start and end date pairs
 * - Validation: Disabled dates, status indicators
 * - Customization: Formats, locales, icons, cell rendering
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   DatePickerProps,
 *   RangePickerProps,
 *   DatePickerMode,
 * } from '@rottay/design-system';
 *
 * const dateConfig: DatePickerProps = {
 *   picker: 'month',
 *   format: 'MMMM YYYY',
 *   placeholder: 'Select month',
 * };
 *
 * const rangeConfig: RangePickerProps = {
 *   placeholder: ['Start', 'End'],
 *   separator: '→',
 * };
 * ```
 *
 * @module DatePicker/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';
import type { LegacySizeAlias, Size, StatusType } from '../../../../../foundation/contracts/kernel/common';

/**
 * Size variants for the DatePicker input.
 * @remarks Canonical values are the {@link Size} subset `'sm' | 'md' | 'lg'`. The legacy Ant
 * Design-style spellings (`'small' | 'middle' | 'large' | 'default'`) are accepted for one
 * release via {@link LegacySizeAlias} and are deprecated; prefer the canonical spelling in new
 * code.
 */
export type DatePickerSize = Extract<Size, 'sm' | 'md' | 'lg'> | LegacySizeAlias;

/**
 * Validation status for the DatePicker.
 */
export type DatePickerStatus = StatusType;

/**
 * Dropdown placement options for the calendar popup.
 *
 * @example
 * ```tsx
 * <DatePicker placement="topRight" />
 * ```
 */
export type DatePickerPlacement =
  | 'bottomLeft'
  | 'bottomRight'
  | 'topLeft'
  | 'topRight';

/**
 * Picker mode determining the selection granularity.
 *
 * @example
 * ```tsx
 * // Date picker (default)
 * <DatePicker picker="date" />
 *
 * // Month picker
 * <DatePicker picker="month" format="MMMM YYYY" />
 *
 * // Year picker
 * <DatePicker picker="year" />
 * ```
 */
export type DatePickerMode =
  /** Select a specific date (default) */
  | 'date'
  /** Select a week */
  | 'week'
  /** Select a month */
  | 'month'
  /** Select a quarter */
  | 'quarter'
  /** Select a year */
  | 'year';

/**
 * Props for the DatePicker component.
 *
 * @example Basic usage
 * ```tsx
 * <DatePicker
 *   placeholder="Select date"
 *   onChange={(date, dateString) => setDate(date)}
 * />
 * ```
 *
 * @example With time picker
 * ```tsx
 * <DatePicker
 *   showTime={{ format: 'HH:mm' }}
 *   format="YYYY-MM-DD HH:mm"
 * />
 * ```
 *
 * @example Controlled component
 * ```tsx
 * <DatePicker
 *   value={selectedDate}
 *   onChange={(date) => setSelectedDate(date)}
 *   disabledDate={(d) => d < new Date()}
 * />
 * ```
 */
export interface DatePickerProps {
  /** Current value (Date object, string, or dayjs) */
  value?: Date | string | null;
  /** Default value */
  defaultValue?: Date | string;
  /** Picker mode */
  picker?: DatePickerMode;
  /** Format for display */
  format?: string;
  /** Whether to show time picker */
  showTime?: boolean | object;
  /** Whether to show today button */
  showToday?: boolean;
  /** Whether to show now button (with showTime) */
  showNow?: boolean;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the picker is read-only */
  readOnly?: boolean;
  /** Size of the picker */
  size?: DatePickerSize;
  /** Status of the picker */
  status?: DatePickerStatus;
  /** Placeholder text */
  placeholder?: string;
  /** Popup placement */
  placement?: DatePickerPlacement;
  /** Popup class name */
  popupClassName?: string;
  /** Popup style */
  popupStyle?: CSSProperties;
  /** Whether to allow clear */
  allowClear?: boolean;
  /** Whether picker is open */
  open?: boolean;
  /** Input prefix */
  prefix?: ReactNode;
  /** Input suffix */
  suffixIcon?: ReactNode;
  /** Super previous icon */
  superPrevIcon?: ReactNode;
  /** Super next icon */
  superNextIcon?: ReactNode;
  /** Previous icon */
  prevIcon?: ReactNode;
  /** Next icon */
  nextIcon?: ReactNode;
  /** Disabled dates */
  disabledDate?: (currentDate: Date) => boolean;
  /** Callback when value changes */
  onChange?: (date: Date | null, dateString: string) => void;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Callback when panel changes */
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** ID attribute */
  id?: string;
  /** Name attribute for forms */
  name?: string;
  /** Whether input is bordered */
  bordered?: boolean;
  /** Variant style */
  variant?: 'outlined' | 'borderless' | 'filled';
  /** Locale config */
  locale?: object;
  /** Extra footer content */
  renderExtraFooter?: () => ReactNode;
  /** Cell render customization */
  cellRender?: (current: Date, info: { originNode: ReactNode; today: Date; range?: 'start' | 'end' }) => ReactNode;
}

/**
 * Props for the RangePicker component.
 *
 * @example Basic range picker
 * ```tsx
 * <DatePicker.RangePicker
 *   placeholder={['Start date', 'End date']}
 *   onChange={(dates, dateStrings) => {
 *     console.log('Range:', dates);
 *   }}
 * />
 * ```
 *
 * @example With separator and format
 * ```tsx
 * <DatePicker.RangePicker
 *   separator="→"
 *   format="DD MMM YYYY"
 *   placeholder={['From', 'To']}
 * />
 * ```
 */
export interface RangePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  /**
   * Current value as [start, end] date tuple.
   * @example value={[startDate, endDate]}
   */
  value?: [Date | string | null, Date | string | null] | null;

  /**
   * Default value as [start, end] date tuple.
   * @example defaultValue={[new Date(), new Date()]}
   */
  defaultValue?: [Date | string, Date | string];

  /**
   * Placeholder text for [start, end] inputs.
   * @example placeholder={['Start date', 'End date']}
   */
  placeholder?: [string, string];

  /**
   * Separator element between the two date inputs.
   * @default '~'
   * @example separator="→"
   */
  separator?: ReactNode;

  /**
   * Function to determine which dates should be disabled.
   * @param currentDate - The date being evaluated
   * @returns Whether the date should be disabled
   */
  disabledDate?: (currentDate: Date) => boolean;

  /**
   * Callback fired when the date range changes.
   * @param dates - Tuple of [start, end] Date objects (or null)
   * @param dateStrings - Tuple of formatted date strings
   */
  onChange?: (dates: [Date | null, Date | null] | null, dateStrings: [string, string]) => void;

  /**
   * Index of the currently active picker input (0 = start, 1 = end).
   */
  activePickerIndex?: 0 | 1;
}

/**
 * Default values for DatePicker props.
 * Used across all engine implementations for consistency.
 */
export const DATE_PICKER_DEFAULTS: Partial<DatePickerProps> = {
  /** Default picker mode */
  picker: 'date',
  /** Default size variant */
  size: 'default',
  /** Allow clearing the selected date */
  allowClear: true,
  /** Show today button in footer */
  showToday: true,
  /** Show border around input */
  bordered: true,
  /** Default input variant */
  variant: 'outlined',
  /** Default dropdown placement */
  placement: 'bottomLeft',
};
