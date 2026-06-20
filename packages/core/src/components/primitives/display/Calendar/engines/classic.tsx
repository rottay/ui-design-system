'use client';

/**
 * @fileoverview Classic Calendar engine -- Ant Design wrapper with Date/dayjs bridge.
 *
 * Wraps antd's Calendar component and converts between the DS's native `Date`
 * surface and antd's internal `dayjs` objects. Every callback (onChange, onSelect,
 * onPanelChange, cellRender, headerRender) is intercepted to perform the
 * conversion, so consumers never need to import or interact with dayjs directly.
 *
 * Engine: **Ant Design** (`antd/Calendar` + `dayjs`)
 *
 * @example
 * ```tsx
 * <Calendar engine="classic" defaultValue={new Date()} fullscreen onSelect={(d) => setDate(d)} />
 * ```
 *
 * @module Calendar/engines/classic
 * @category Display
 * @package @rottay/design-system
 */
import React from 'react';
import { Calendar as AntCalendar } from 'antd';
import type { CalendarProps } from '../Calendar.types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';

// antd's Calendar renders a full month/year grid and calls dayjs methods
// (`.weekday()`, `.localeData()`, `.week()`) that are not part of the dayjs
// core build. Register the required plugins here -- the single conversion
// boundary that owns the antd<->dayjs bridge -- so the real antd Calendar can
// render instead of throwing `clone.weekday is not a function`. Keeping these
// calls inside this module (which has a used export) ensures the production
// bundler does not tree-shake the registration away. `dayjs.extend` is
// idempotent, so repeated imports of this engine are safe.
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

// ---- Date bridge helpers ----
// The DS surface uses native Date/string; antd uses dayjs internally.
// These two functions are the single conversion boundary so every handler
// and prop mapping goes through the same path.
const toDayjs = (value: Date | string | null | undefined): Dayjs | undefined => {
  if (!value) return undefined;
  return dayjs(value);
};

const toDate = (value: Dayjs | null | undefined): Date | null => {
  if (!value) return null;
  return value.toDate();
};

/**
 * Classic Calendar backed by Ant Design, with automatic Date <-> dayjs bridging.
 *
 * All incoming Date/string props are converted to dayjs before passing to antd,
 * and all outgoing callbacks convert dayjs back to Date, keeping the DS surface
 * library-agnostic.
 *
 * @param props - Unified DS CalendarProps (see Calendar.types.ts)
 * @returns An Ant Design Calendar wrapped in a forwarded-ref div
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const {
    value,
    defaultValue,
    mode,
    defaultMode: _defaultMode,
    fullscreen,
    validRange,
    disabledDate,
    dateCellRender: _dateCellRender,
    monthCellRender: _monthCellRender,
    dateFullCellRender: _dateFullCellRender,
    monthFullCellRender: _monthFullCellRender,
    cellRender,
    fullCellRender,
    headerRender,
    onPanelChange,
    onChange,
    onSelect,
    locale,
    className,
    style,
    id,
  } = props;

  const handlePanelChange = (date: Dayjs, newMode: 'month' | 'year') => {
    onPanelChange?.(toDate(date) as Date, newMode);
  };

  const handleChange = (date: Dayjs) => {
    onChange?.(toDate(date) as Date);
  };

  const handleSelect = (date: Dayjs, info: { source: 'year' | 'month' | 'date' | 'customize' }) => {
    onSelect?.(toDate(date) as Date, info);
  };

  // Wrap disabledDate so the consumer receives native Dates, not dayjs.
  const handleDisabledDate = disabledDate
    ? (current: Dayjs) => disabledDate(current.toDate())
    : undefined;

  // Map cell render functions -- each wrapper converts the dayjs `current` and
  // `today` values to native Dates before calling the consumer's render function.
  // The `as any` casts bridge antd's internal CellRenderInfo generics.
  const handleCellRender = cellRender
    ? (current: Dayjs, info: { originNode: React.ReactNode; today: Dayjs; type: 'date' | 'month' }) =>
        cellRender(current.toDate(), {
          originNode: info.originNode,
          today: info.today.toDate(),
          type: info.type,
        })
    : undefined;

  const handleFullCellRender = fullCellRender
    ? (current: Dayjs, info: { originNode: React.ReactNode; today: Dayjs; type: 'date' | 'month' }) =>
        fullCellRender(current.toDate(), {
          originNode: info.originNode,
          today: info.today.toDate(),
          type: info.type,
        })
    : undefined;

  // headerRender bidirectional bridge: the consumer receives a Date and
  // calls onChange with a Date; we convert in both directions so antd sees dayjs.
  const handleHeaderRender = headerRender
    ? (props: { value: Dayjs; type: 'month' | 'year'; onChange: (date: Dayjs) => void; onTypeChange: (type: 'month' | 'year') => void }) =>
        headerRender({
          value: props.value.toDate(),
          type: props.type,
          onChange: (date: Date) => props.onChange(dayjs(date)),
          onTypeChange: props.onTypeChange,
        })
    : undefined;

  return (
    <div ref={ref} id={id}>
      <AntCalendar
        value={toDayjs(value)}
        defaultValue={toDayjs(defaultValue)}
        mode={mode}
        fullscreen={fullscreen}
        validRange={validRange ? [dayjs(validRange[0]), dayjs(validRange[1])] : undefined}
        disabledDate={handleDisabledDate}
        cellRender={handleCellRender as any}
        fullCellRender={handleFullCellRender as any}
        headerRender={handleHeaderRender}
        onPanelChange={handlePanelChange}
        onChange={handleChange}
        onSelect={handleSelect}
        locale={locale as any}
        className={className}
        style={style}
      />
    </div>
  );
});

Calendar.displayName = 'Calendar.Classic';

export default Calendar;
