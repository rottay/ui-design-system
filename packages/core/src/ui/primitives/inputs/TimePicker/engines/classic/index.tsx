'use client';

/**
 * @fileoverview TimePicker Classic Engine -- Ant Design wrapper with dayjs bridging.
 * Converts the DS's `Date | string` value types to/from dayjs instances required
 * by AntD's TimePicker, providing format support, step intervals, and the
 * compound `TimePicker.RangePicker` sub-component.
 *
 * @example
 * ```tsx
 * <TimePicker engine="classic" format="HH:mm" minuteStep={15} />
 * ```
 *
 * @module TimePicker/Engines/Classic
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { TimePicker as AntTimePicker } from 'antd';
import type { TimePickerProps, TimeRangePickerProps } from '../../contracts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker: AntTimeRangePicker } = AntTimePicker;

/**
 * Converts a DS-level `Date | string` value to a dayjs instance.
 * Bare time strings like "14:30:00" are anchored to an arbitrary date
 * (2000-01-01) because dayjs requires a full datetime for parsing.
 */
const toDayjs = (value: Date | string | null | undefined): Dayjs | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      return dayjs(`2000-01-01 ${value}`);
    }
  }
  return dayjs(value);
};

/** Converts a dayjs instance back to a native Date for the DS callback. */
const toDate = (value: Dayjs | null | undefined): Date | null => {
  if (!value) return null;
  return value.toDate();
};

/**
 * Base TimePicker wrapping AntD's TimePicker with Date/string bridging.
 *
 * Converts incoming DS values to dayjs on the way in and back to Date on the
 * way out. The DS `size` value "default" is remapped to AntD's "middle" since
 * AntD uses a three-value enum (small | middle | large).
 *
 * @param props - {@link TimePickerProps} unified time picker props.
 * @returns An AntD TimePicker with DS-compatible value types.
 */
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

  // AntD v5 uses nested classNames/styles objects for popup theming
  const popupClassNames = popupClassName
    ? ({ popup: { root: popupClassName } } as const)
    : undefined;
  const popupStyles = popupStyle
    ? ({ popup: { root: popupStyle } } as const)
    : undefined;

  // Bridge AntD's dayjs-based onChange to the DS's Date-based onChange
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

/**
 * Range variant wrapping AntD's `TimePicker.RangePicker`.
 * Converts DS `[Date|null, Date|null]` tuples to/from dayjs pairs.
 *
 * @param props - {@link TimeRangePickerProps} unified range picker props.
 * @returns An AntD TimeRangePicker with DS-compatible value types.
 */
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

  // Convert the dayjs pair back to native Dates for the DS onChange callback
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

// Compound component: TimePicker.RangePicker follows the AntD compound pattern
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});

export default TimePicker;
