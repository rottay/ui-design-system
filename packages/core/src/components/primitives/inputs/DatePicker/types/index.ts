/**
 * DatePicker Types
 */
import type { ReactNode, CSSProperties } from 'react';
import type { SizeType, StatusType } from '../../../../../types/common';

export type DatePickerSize = SizeType;
export type DatePickerStatus = StatusType;
export type DatePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export type DatePickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year';

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

export interface RangePickerProps extends Omit<DatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'placeholder'> {
  /** Current value as [start, end] */
  value?: [Date | string | null, Date | string | null] | null;
  /** Default value as [start, end] */
  defaultValue?: [Date | string, Date | string];
  /** Placeholders for [start, end] */
  placeholder?: [string, string];
  /** Separator between dates */
  separator?: ReactNode;
  /** Disabled dates */
  disabledDate?: (currentDate: Date) => boolean;
  /** Callback when value changes */
  onChange?: (dates: [Date | null, Date | null] | null, dateStrings: [string, string]) => void;
  /** Which input is active */
  activePickerIndex?: 0 | 1;
}

export const DATE_PICKER_DEFAULTS: Partial<DatePickerProps> = {
  picker: 'date',
  size: 'default',
  allowClear: true,
  showToday: true,
  bordered: true,
  variant: 'outlined',
  placement: 'bottomLeft',
};
