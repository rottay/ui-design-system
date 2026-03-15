'use client';

/**
 * TimePicker - Classic Engine (Ant Design)
 */
import React from 'react';
import { TimePicker as AntTimePicker } from 'antd';
import type { TimePickerProps, TimeRangePickerProps } from '../../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker: AntTimeRangePicker } = AntTimePicker;

// Convert Date/string to dayjs
const toDayjs = (value: Date | string | null | undefined): Dayjs | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    // If it's a time string like "14:30:00", parse it
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      return dayjs(`2000-01-01 ${value}`);
    }
  }
  return dayjs(value);
};

// Convert dayjs to Date
const toDate = (value: Dayjs | null | undefined): Date | null => {
  if (!value) return null;
  return value.toDate();
};

const TimePickerBase = React.forwardRef<unknown, TimePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format,
    hourStep,
    minuteStep,
    secondStep,
    use12Hours,
    showHour: _showHour,
    showMinute: _showMinute,
    showSecond: _showSecond,
    showNow,
    disabled,
    size,
    status,
    placeholder,
    placement,
    popupClassName,
    popupStyle,
    allowClear,
    open,
    prefix,
    suffixIcon,
    clearIcon,
    disabledTime,
    hideDisabledOptions,
    onChange,
    onOpenChange,
    className,
    style,
    autoFocus,
    id,
    name,
    variant,
    renderExtraFooter,
    cellRender,
  } = props;

  const popupClassNames = popupClassName
    ? ({ popup: { root: popupClassName } } as const)
    : undefined;
  const popupStyles = popupStyle
    ? ({ popup: { root: popupStyle } } as const)
    : undefined;

  const handleChange = (time: Dayjs | null, timeString: string | string[]) => {
    onChange?.(toDate(time), Array.isArray(timeString) ? timeString[0] : timeString);
  };

  return (
    <AntTimePicker
      ref={ref as any}
      value={toDayjs(value)}
      defaultValue={toDayjs(defaultValue)}
      format={format}
      hourStep={hourStep as any}
      minuteStep={minuteStep as any}
      secondStep={secondStep as any}
      use12Hours={use12Hours}
      showNow={showNow}
      disabled={disabled}
      size={size === 'default' ? 'middle' : size}
      status={status}
      placeholder={placeholder}
      placement={placement}
      classNames={popupClassNames as any}
      styles={popupStyles as any}
      allowClear={allowClear}
      open={open}
      prefix={prefix}
      suffixIcon={suffixIcon}
      clearIcon={clearIcon}
      disabledTime={disabledTime}
      hideDisabledOptions={hideDisabledOptions}
      onChange={handleChange}
      onOpenChange={onOpenChange}
      className={className}
      style={style}
      autoFocus={autoFocus}
      id={id}
      name={name}
      variant={variant}
      renderExtraFooter={renderExtraFooter}
      cellRender={cellRender as any}
    />
  );
});

TimePickerBase.displayName = 'TimePicker.Classic';

// TimeRangePicker component
const TimeRangePicker = React.forwardRef<unknown, TimeRangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    format,
    hourStep,
    minuteStep,
    secondStep,
    use12Hours,
    showHour: _showHour2,
    showMinute: _showMinute2,
    showSecond: _showSecond2,
    disabled,
    size,
    status,
    placeholder,
    placement,
    popupClassName,
    popupStyle,
    allowClear,
    open,
    suffixIcon,
    separator,
    order,
    onChange,
    onOpenChange,
    className,
    style,
    autoFocus,
    id,
    variant,
    renderExtraFooter,
  } = props;

  const popupClassNames = popupClassName
    ? ({ popup: { root: popupClassName } } as const)
    : undefined;
  const popupStyles = popupStyle
    ? ({ popup: { root: popupStyle } } as const)
    : undefined;

  const handleChange = (times: [Dayjs | null, Dayjs | null] | null, timeStrings: [string, string]) => {
    if (!times) {
      onChange?.(null, timeStrings);
    } else {
      onChange?.([toDate(times[0]), toDate(times[1])], timeStrings);
    }
  };

  return (
    <AntTimeRangePicker
      ref={ref as any}
      value={value ? [toDayjs(value[0]) || null, toDayjs(value[1]) || null] : undefined}
      defaultValue={defaultValue ? [toDayjs(defaultValue[0]) || null, toDayjs(defaultValue[1]) || null] : undefined}
      format={format}
      hourStep={hourStep as any}
      minuteStep={minuteStep as any}
      secondStep={secondStep as any}
      use12Hours={use12Hours}
      disabled={disabled}
      size={size === 'default' ? 'middle' : size}
      status={status}
      placeholder={placeholder}
      placement={placement}
      classNames={popupClassNames as any}
      styles={popupStyles as any}
      allowClear={allowClear}
      open={open}
      suffixIcon={suffixIcon}
      separator={separator}
      order={order}
      onChange={handleChange}
      onOpenChange={onOpenChange}
      className={className}
      style={style}
      autoFocus={autoFocus}
      id={id}
      variant={variant}
      renderExtraFooter={renderExtraFooter}
    />
  );
});

TimeRangePicker.displayName = 'TimePicker.RangePicker.Classic';

// Compound component
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
