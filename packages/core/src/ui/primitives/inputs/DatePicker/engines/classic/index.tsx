'use client';

/**
 * @fileoverview DatePicker Classic Engine (Ant Design) - Rottay Design System.
 * Thin wrapper around `antd/DatePicker` that bridges native `Date` objects
 * to Ant Design's internal `dayjs` representation. Consumers interact
 * exclusively with `Date | null` while antd handles locale-aware rendering,
 * panel transitions, and built-in accessibility.
 *
 * @example
 * ```tsx
 * <DatePicker engine="classic" onChange={(date) => console.log(date)} showTime />
 * ```
 *
 * @module ClassicDatePicker
 * @category Inputs
 * @package @rottay/design-system
 */
import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps, RangePickerProps } from '../../contracts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { toCanonicalSize, toLegacySize } from '../../../../../../foundation/contracts/kernel/common';

const { RangePicker: AntRangePicker } = AntDatePicker;

/**
 * Resolves any accepted `size` spelling (canonical `sm | md | lg` or the
 * deprecated `small | middle | large | default`) to AntD's three-value size
 * enum. Byte-identical to the previous `size === 'default' ? 'middle' : size`
 * for every value that was legal before this migration.
 */
const toAntSize = (size: DatePickerProps['size']) => toLegacySize(toCanonicalSize(size));

// The DS normalizes on native Date objects, but antd uses dayjs internally.
// These bridge functions convert at the boundary so consumers never see dayjs.
const toDayjs = (value: Date | string | null | undefined): Dayjs | undefined => {
  if (!value) return undefined;
  return dayjs(value);
};

const toDate = (value: Dayjs | null | undefined): Date | null => {
  if (!value) return null;
  return value.toDate();
};

/**
 * Classic (Ant Design) DatePicker engine.
 *
 * Converts Rottay DS `DatePickerProps` (which use native `Date` objects) into
 * antd's dayjs-based API, and normalizes antd's onChange output back to `Date`.
 * Supports date, week, month, quarter, and year picker modes, plus showTime.
 *
 * @param props - Rottay DatePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the underlying antd DatePicker element.
 * @returns The rendered Ant Design DatePicker component.
 */
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

  // Antd v5.x changed its popup API to use a nested object structure
  // for classNames and styles. We wrap the flat DS prop into that shape.
  const popupClassNames = popupClassName
    ? ({ popup: { root: popupClassName } } as const)
    : undefined;
  const popupStyles = popupStyle
    ? ({ popup: { root: popupStyle } } as const)
    : undefined;

  // Antd passes dateString as string[] for some picker modes (week/quarter).
  // We normalize to a single string for the DS onChange contract.
  const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
    onChange?.(toDate(date), Array.isArray(dateString) ? dateString[0] : dateString);
  };

  const handlePanelChange = (date: Dayjs, mode: string) => {
    onPanelChange?.(toDate(date) as Date, mode as 'date' | 'week' | 'month' | 'quarter' | 'year');
  };

  // Wrap the consumer's Date-based predicate to match antd's Dayjs signature.
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
      // DS uses "default" for the base size; antd calls it "middle".
      size={toAntSize(size)}
      status={status}
      placeholder={placeholder}
      placement={placement}
      classNames={popupClassNames as any}
      styles={popupStyles as any}
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

DatePickerBase.displayName = 'DatePicker.Classic';

/**
 * Classic (Ant Design) RangePicker engine.
 *
 * Wraps antd's `RangePicker` with the same Date<->Dayjs bridging as the
 * base DatePicker. The value prop accepts a `[Date | null, Date | null]`
 * tuple and the onChange fires with the same tuple shape.
 *
 * @param props - Rottay RangePickerProps (engine-agnostic interface).
 * @param ref   - Forwarded to the underlying antd RangePicker element.
 * @returns The rendered Ant Design RangePicker component.
 */
const RangePicker = React.forwardRef<unknown, RangePickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    picker,
    format,
    showTime,
    // showToday/showNow are not supported on antd's RangePicker, so we
    // destructure them here to keep them out of the spread to avoid warnings.
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

  // Same antd v5 popup object wrapping as the base DatePicker (see above).
  const popupClassNames = popupClassName
    ? ({ popup: { root: popupClassName } } as const)
    : undefined;
  const popupStyles = popupStyle
    ? ({ popup: { root: popupStyle } } as const)
    : undefined;

  // Antd returns null for the dates tuple when the range is cleared,
  // so we guard against that before converting to native Date objects.
  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    if (!dates) {
      onChange?.(null, dateStrings);
    } else {
      onChange?.([toDate(dates[0]), toDate(dates[1])], dateStrings);
    }
  };

  // Same Dayjs->Date bridge for the disabled date predicate.
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
      size={toAntSize(size)}
      status={status}
      placeholder={placeholder}
      placement={placement}
      classNames={popupClassNames as any}
      styles={popupStyles as any}
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

RangePicker.displayName = 'DatePicker.RangePicker.Classic';

// Object.assign creates a compound component pattern (DatePicker.RangePicker)
// while preserving the forwardRef on the base component.
export const DatePicker = Object.assign(DatePickerBase, {
  RangePicker,
});

export default DatePicker;
