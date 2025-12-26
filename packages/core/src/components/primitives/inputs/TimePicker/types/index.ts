/**
 * TimePicker Types
 */
import type { ReactNode, CSSProperties } from 'react';
import type { SizeType, StatusType } from '../../../../../types/common';

export type TimePickerSize = SizeType;
export type TimePickerStatus = StatusType;
export type TimePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

export interface TimePickerProps {
  /** Current value */
  value?: Date | string | null;
  /** Default value */
  defaultValue?: Date | string;
  /** Format for display */
  format?: string;
  /** Hour step */
  hourStep?: number;
  /** Minute step */
  minuteStep?: number;
  /** Second step */
  secondStep?: number;
  /** Whether to use 12-hour format */
  use12Hours?: boolean;
  /** Show hour column */
  showHour?: boolean;
  /** Show minute column */
  showMinute?: boolean;
  /** Show second column */
  showSecond?: boolean;
  /** Show now button */
  showNow?: boolean;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the picker is read-only */
  readOnly?: boolean;
  /** Size of the picker */
  size?: TimePickerSize;
  /** Status of the picker */
  status?: TimePickerStatus;
  /** Placeholder text */
  placeholder?: string;
  /** Popup placement */
  placement?: TimePickerPlacement;
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
  /** Clear icon */
  clearIcon?: ReactNode;
  /** Disabled times */
  disabledTime?: () => {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  };
  /** Hide disabled options */
  hideDisabledOptions?: boolean;
  /** Callback when value changes */
  onChange?: (time: Date | null, timeString: string) => void;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
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
  /** Render extra footer */
  renderExtraFooter?: () => ReactNode;
  /** Custom cell render */
  cellRender?: (current: number, info: { type: 'hour' | 'minute' | 'second' }) => ReactNode;
}

export interface TimeRangePickerProps extends Omit<TimePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Current value as [start, end] */
  value?: [Date | string | null, Date | string | null] | null;
  /** Default value as [start, end] */
  defaultValue?: [Date | string, Date | string];
  /** Placeholders for [start, end] */
  placeholder?: [string, string];
  /** Separator between times */
  separator?: ReactNode;
  /** Order of columns */
  order?: boolean;
  /** Callback when value changes */
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
