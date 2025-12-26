'use client';

/**
 * DatePicker - Titan Engine (Ant Design)
 */
import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps, RangePickerProps } from '../../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker: AntRangePicker } = AntDatePicker;

// Convert Date/string to dayjs
const toDayjs = (value: Date | string | null | undefined): Dayjs | undefined => {
  if (!value) return undefined;
  return dayjs(value);
};

// Convert dayjs to Date
const toDate = (value: Dayjs | null | undefined): Date | null => {
  if (!value) return null;
  return value.toDate();
};

const DatePickerBase = React.forwardRef<unknown, DatePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    picker,
    format,
    showTime,
    showToday,
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
    superPrevIcon,
    superNextIcon,
    prevIcon,
    nextIcon,
    disabledDate,
    onChange,
    onOpenChange,
    onPanelChange,
    className,
    style,
    autoFocus,
    id,
    name,
    variant,
    locale,
    renderExtraFooter,
    cellRender,
  } = props;

  const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
    onChange?.(toDate(date), Array.isArray(dateString) ? dateString[0] : dateString);
  };

  const handlePanelChange = (date: Dayjs, mode: string) => {
    onPanelChange?.(toDate(date) as Date, mode as 'date' | 'week' | 'month' | 'quarter' | 'year');
  };

  const handleDisabledDate = disabledDate
    ? (current: Dayjs) => disabledDate(current.toDate())
    : undefined;

  return (
    <AntDatePicker
      ref={ref as any}
      value={toDayjs(value)}
      defaultValue={toDayjs(defaultValue)}
      picker={picker}
      format={format}
      showTime={showTime}
      showToday={showToday}
      showNow={showNow}
      disabled={disabled}
      size={size === 'default' ? 'middle' : size}
      status={status}
      placeholder={placeholder}
      placement={placement}
      popupClassName={popupClassName}
      popupStyle={popupStyle}
      allowClear={allowClear}
      open={open}
      prefix={prefix}
      suffixIcon={suffixIcon}
      superPrevIcon={superPrevIcon}
      superNextIcon={superNextIcon}
      prevIcon={prevIcon}
      nextIcon={nextIcon}
      disabledDate={handleDisabledDate}
      onChange={handleChange}
      onOpenChange={onOpenChange}
      onPanelChange={handlePanelChange}
      className={className}
      style={style}
      autoFocus={autoFocus}
      id={id}
      name={name}
      variant={variant}
      locale={locale as any}
      renderExtraFooter={renderExtraFooter}
      cellRender={cellRender as any}
    />
  );
});

DatePickerBase.displayName = 'DatePicker.Titan';

// RangePicker component
const RangePicker = React.forwardRef<unknown, RangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    picker,
    format,
    showTime,
    showToday: _showToday,
    showNow: _showNow,
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
    disabledDate,
    onChange,
    onOpenChange,
    onPanelChange: _onPanelChange,
    className,
    style,
    autoFocus,
    id,
    variant,
    locale,
    renderExtraFooter,
    cellRender,
  } = props;

  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (!dates) {
      onChange?.(null, dateStrings);
    } else {
      onChange?.([toDate(dates[0]), toDate(dates[1])], dateStrings);
    }
  };

  const handleDisabledDate = disabledDate
    ? (current: Dayjs) => disabledDate(current.toDate())
    : undefined;

  return (
    <AntRangePicker
      ref={ref as any}
      value={value ? [toDayjs(value[0]) || null, toDayjs(value[1]) || null] : undefined}
      defaultValue={defaultValue ? [toDayjs(defaultValue[0]) || null, toDayjs(defaultValue[1]) || null] : undefined}
      picker={picker}
      format={format}
      showTime={showTime}
      disabled={disabled}
      size={size === 'default' ? 'middle' : size}
      status={status}
      placeholder={placeholder}
      placement={placement}
      popupClassName={popupClassName}
      popupStyle={popupStyle}
      allowClear={allowClear}
      open={open}
      suffixIcon={suffixIcon}
      separator={separator}
      disabledDate={handleDisabledDate}
      onChange={handleChange}
      onOpenChange={onOpenChange}
      className={className}
      style={style}
      autoFocus={autoFocus}
      id={id}
      variant={variant}
      locale={locale as any}
      renderExtraFooter={renderExtraFooter}
      cellRender={cellRender as any}
    />
  );
});

RangePicker.displayName = 'DatePicker.RangePicker.Titan';

// Compound component
export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
