/**
 * Titan TimePicker Engine
 *
 * Adapter that converts unified TimePickerProps to Ant Design TimePicker.
 */

'use client';

import { TimePicker as AntTimePicker } from 'antd';
import dayjs from 'dayjs';
import type { TimePickerProps } from '../../../../types/components/timepicker';
import { toTime } from '../../../../types/components/timepicker';

/**
 * Convert Date to dayjs for AntD
 */
function toDayjs(value: Date | string | null | undefined): dayjs.Dayjs | null {
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
 * Titan TimePicker - Ant Design implementation with unified TimePickerProps
 */
function TitanTimePicker({
  value,
  defaultValue,
  placeholder,
  disabled,
  format,
  use12Hours,
  hourStep,
  minuteStep,
  secondStep,
  hideDisabledOptions,
  showNow,
  size,
  status,
  allowClear,
  bordered,
  variant,
  suffixIcon,
  clearIcon,
  open,
  placement,
  popupClassName,
  popupStyle,
  getPopupContainer,
  disabledHours,
  disabledMinutes,
  disabledSeconds,
  onChange,
  onOpenChange,
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
  renderExtraFooter,
  needConfirm,
}: TimePickerProps) {
  // Handle onChange
  const handleChange = onChange
    ? (time: dayjs.Dayjs | null, timeString: string | string[]) => {
        const timeValue = fromDayjs(time);
        const stringValue = Array.isArray(timeString) ? timeString[0] : timeString;
        onChange(timeValue, stringValue);
      }
    : undefined;

  // Build disabled time object for AntD
  const disabledTime = () => ({
    disabledHours,
    disabledMinutes,
    disabledSeconds,
  });

  return (
    <AntTimePicker
      value={toDayjs(toTime(value ?? null))}
      defaultValue={toDayjs(toTime(defaultValue ?? null))}
      placeholder={placeholder}
      disabled={disabled}
      format={format}
      use12Hours={use12Hours}
      hourStep={hourStep}
      minuteStep={minuteStep}
      secondStep={secondStep}
      hideDisabledOptions={hideDisabledOptions}
      showNow={showNow}
      size={size}
      status={status}
      allowClear={allowClear}
      bordered={bordered}
      variant={variant}
      suffixIcon={suffixIcon}
      clearIcon={clearIcon}
      open={open}
      placement={placement}
      popupClassName={popupClassName}
      popupStyle={popupStyle}
      getPopupContainer={getPopupContainer}
      disabledTime={disabledTime}
      onChange={handleChange}
      onOpenChange={onOpenChange}
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
      renderExtraFooter={renderExtraFooter}
      needConfirm={needConfirm}
    />
  );
}

TitanTimePicker.displayName = 'TitanTimePicker';

export default TitanTimePicker;
