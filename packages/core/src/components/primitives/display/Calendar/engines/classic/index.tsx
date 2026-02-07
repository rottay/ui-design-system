'use client';

/**
 * @fileoverview Calendar Classic Engine - Rottay Design System
 * @description Ant Design-based calendar with dayjs integration.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Calendar component with dayjs
 * for date manipulation and full feature support.
 *
 * **Implementation Details:**
 * - Uses `antd/Calendar` for core rendering
 * - Converts Date/string to dayjs internally
 * - Full cell render customization
 * - Header render customization
 * - Locale support via Ant Design
 *
 * **Date Handling:**
 * - Input: Date | string | null
 * - Internal: dayjs objects
 * - Output: Date objects in callbacks
 *
 * **Advantages:**
 * - Full Ant Design theming
 * - Comprehensive localization
 * - Rich cell customization
 * - Consistent date handling
 *
 * @example Basic Usage
 * ```tsx
 * import { Calendar } from '@rottay/design-system';
 *
 * <Calendar
 *   engine="classic"
 *   defaultValue={new Date()}
 *   fullscreen={true}
 * />
 * ```
 *
 * @see {@link Calendar} for the main component
 * @see {@link https://ant.design/components/calendar} Ant Design Calendar
 * @module Calendar/engines/classic
 * @category Display
 * @package @rottay/design-system
 */
import React from 'react';
import { Calendar as AntCalendar } from 'antd';
import type { CalendarProps } from '../../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

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

  const handleDisabledDate = disabledDate
    ? (current: Dayjs) => disabledDate(current.toDate())
    : undefined;

  // Map cell render functions
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
