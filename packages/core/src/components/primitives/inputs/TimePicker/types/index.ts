/**
 * TimePicker Types
 *
 * Type definitions for the TimePicker component and its variants.
 */
import type { ReactNode, CSSProperties } from 'react';
import type { SizeType, StatusType } from '../../../../../types/common';

/** Size options for the TimePicker component */
export type TimePickerSize = SizeType;

/** Validation status for the TimePicker component */
export type TimePickerStatus = StatusType;

/** Placement options for the TimePicker dropdown */
export type TimePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

/**
 * Props for the TimePicker component.
 *
 * @example
 * ```tsx
 * <TimePicker
 *   format="HH:mm"
 *   size="large"
 *   onChange={(time, timeString) => console.log(time, timeString)}
 * />
 * ```
 */
export interface TimePickerProps {
  /** Current controlled value (Date object or time string like "14:30:00") */
  value?: Date | string | null;
  /** Default uncontrolled value */
  defaultValue?: Date | string;
  /** Display format string (e.g., "HH:mm:ss", "h:mm a" for 12-hour) */
  format?: string;
  /** Step interval for hour selection (1-24) */
  hourStep?: number;
  /** Step interval for minute selection (1-60) */
  minuteStep?: number;
  /** Step interval for second selection (1-60) */
  secondStep?: number;
  /** Enable 12-hour format with AM/PM */
  use12Hours?: boolean;
  /** Show hour column in the picker panel */
  showHour?: boolean;
  /** Show minute column in the picker panel */
  showMinute?: boolean;
  /** Show second column in the picker panel */
  showSecond?: boolean;
  /** Show "Now" button in the picker footer */
  showNow?: boolean;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the picker is read-only */
  readOnly?: boolean;
  /** Size of the picker input */
  size?: TimePickerSize;
  /** Validation status (error, warning) */
  status?: TimePickerStatus;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Placement of the dropdown panel */
  placement?: TimePickerPlacement;
  /** Additional class name for the popup panel */
  popupClassName?: string;
  /** Additional styles for the popup panel */
  popupStyle?: CSSProperties;
  /** Whether to show the clear button */
  allowClear?: boolean;
  /** Controlled open state of the picker dropdown */
  open?: boolean;
  /** Custom prefix element for the input */
  prefix?: ReactNode;
  /** Custom suffix icon for the input */
  suffixIcon?: ReactNode;
  /** Custom clear icon */
  clearIcon?: ReactNode;
  /** Function to specify disabled time options */
  disabledTime?: () => {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  };
  /** Hide options that are disabled */
  hideDisabledOptions?: boolean;
  /** Callback fired when the selected time changes */
  onChange?: (time: Date | null, timeString: string) => void;
  /** Callback fired when the dropdown open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional class name for the root element */
  className?: string;
  /** Additional inline styles for the root element */
  style?: CSSProperties;
  /** Whether to focus the input on mount */
  autoFocus?: boolean;
  /** HTML id attribute for the input */
  id?: string;
  /** HTML name attribute for form submission */
  name?: string;
  /** Whether to show the input border */
  bordered?: boolean;
  /** Visual variant of the input */
  variant?: 'outlined' | 'borderless' | 'filled';
  /** Custom renderer for the picker footer */
  renderExtraFooter?: () => ReactNode;
  /** Custom renderer for time cells */
  cellRender?: (current: number, info: { type: 'hour' | 'minute' | 'second' }) => ReactNode;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

/**
 * Props for the TimeRangePicker component.
 *
 * Extends TimePickerProps but with array values for start and end times.
 *
 * @example
 * ```tsx
 * <TimePicker.RangePicker
 *   format="HH:mm"
 *   onChange={(times, timeStrings) => console.log(times, timeStrings)}
 * />
 * ```
 */
export interface TimeRangePickerProps extends Omit<TimePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Current controlled value as [start, end] tuple */
  value?: [Date | string | null, Date | string | null] | null;
  /** Default uncontrolled value as [start, end] tuple */
  defaultValue?: [Date | string, Date | string];
  /** Placeholder text for [start, end] inputs */
  placeholder?: [string, string];
  /** Custom separator element between start and end pickers */
  separator?: ReactNode;
  /** Whether to enforce chronological order */
  order?: boolean;
  /** Callback fired when the selected time range changes */
  onChange?: (times: [Date | null, Date | null] | null, timeStrings: [string, string]) => void;
}

export const TIME_PICKER_DEFAULTS: Partial<TimePickerProps> = {
  size: 'default',
  allowClear: true,
  showNow: true,
  bordered: true,
  variant: 'outlined',
  placement: 'bottomLeft',
  format: 'HH:mm:ss',
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  showHour: true,
  showMinute: true,
  showSecond: true,
};
