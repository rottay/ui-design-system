/**
 * Titan DatePicker Engine
 *
 * Adapter that converts unified DatePickerProps to Ant Design DatePicker.
 */

'use client';

import { DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';
import type { DatePickerProps, DatePickerMode } from '../../../../types/components/datepicker';
import { toDate } from '../../../../types/components/datepicker';

const { RangePicker: AntRangePicker } = AntDatePicker;

/**
 * Convert Date to dayjs for AntD
 */
function toDayjs(value: Date | string | number | null | undefined): dayjs.Dayjs | null {
  if (!value) return null;
  return dayjs(value);
}

/**
 * Convert dayjs to Date
 */
function fromDayjs(value: dayjs.Dayjs | null): Date | null {
  if (!value) return null;
  return value.toDate();
}

/**
 * Map unified picker mode to AntD
 */
function mapPickerMode(mode?: DatePickerMode): 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined {
  return mode;
}

/**
 * Titan DatePicker - Ant Design implementation with unified DatePickerProps
 */
function TitanDatePicker({
  value,
  defaultValue,
  placeholder,
  disabled,
  picker,
  showTime,
  showToday,
  showNow,
  size,
  status,
  allowClear,
  bordered,
  variant,
  suffixIcon,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  format,
  open,
  placement,
  popupClassName,
  popupStyle,
  getPopupContainer,
  minDate,
  maxDate,
  disabledDate,
  defaultPickerValue,
  presets,
  onChange,
  onOpenChange,
  onPanelChange,
  onFocus,
  onBlur,
  onKeyDown,
  className,
  style,
  id,
  name,
  autoFocus,
  inputMode,
  tabIndex,
  showWeekNumber,
  cellRender,
  panelRender,
  multiple,
  maxTagCount,
}: DatePickerProps) {
  // Convert presets to AntD format
  const antPresets = presets?.map((preset) => ({
    label: preset.label,
    value: typeof preset.value === 'function' ? dayjs(preset.value()) : dayjs(preset.value),
  }));

  // Handle disabledDate with min/max
  const handleDisabledDate = (current: dayjs.Dayjs) => {
    const currentDate = current.toDate();

    if (minDate && currentDate < minDate) return true;
    if (maxDate && currentDate > maxDate) return true;
    if (disabledDate) return disabledDate(currentDate);

    return false;
  };

  // Handle onChange
  const handleChange = onChange
    ? (date: dayjs.Dayjs | null, dateString: string | string[]) => {
        const dateValue = fromDayjs(date);
        const stringValue = Array.isArray(dateString) ? dateString[0] : dateString;
        onChange(dateValue, stringValue);
      }
    : undefined;

  // Handle onPanelChange
  const handlePanelChange = onPanelChange
    ? (date: dayjs.Dayjs, mode: string) => {
        onPanelChange(date.toDate(), mode as DatePickerMode);
      }
    : undefined;

  // Handle cellRender
  const antCellRender = cellRender
    ? (current: dayjs.Dayjs, info: { type: string }) => {
        return cellRender(current.toDate(), { type: info.type as DatePickerMode });
      }
    : undefined;

  return (
    <AntDatePicker
      value={toDayjs(toDate(value ?? null))}
      defaultValue={toDayjs(toDate(defaultValue ?? null))}
      placeholder={placeholder}
      disabled={disabled}
      picker={mapPickerMode(picker)}
      showTime={showTime}
      showToday={showToday}
      showNow={showNow}
      size={size}
      status={status}
      allowClear={allowClear}
      bordered={bordered}
      variant={variant}
      suffixIcon={suffixIcon}
      prevIcon={prevIcon}
      nextIcon={nextIcon}
      superPrevIcon={superPrevIcon}
      superNextIcon={superNextIcon}
      format={format}
      open={open}
      placement={placement}
      popupClassName={popupClassName}
      popupStyle={popupStyle}
      getPopupContainer={getPopupContainer}
      defaultPickerValue={toDayjs(toDate(defaultPickerValue ?? null)) ?? undefined}
      presets={antPresets}
      disabledDate={handleDisabledDate}
      onChange={handleChange}
      onOpenChange={onOpenChange}
      onPanelChange={handlePanelChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={className}
      style={style}
      id={id}
      name={name}
      autoFocus={autoFocus}
      inputMode={inputMode}
      tabIndex={tabIndex}
      showWeek={showWeekNumber}
      cellRender={antCellRender}
      panelRender={panelRender}
      multiple={multiple}
      maxTagCount={maxTagCount}
    />
  );
}

TitanDatePicker.displayName = 'TitanDatePicker';

export default TitanDatePicker;
