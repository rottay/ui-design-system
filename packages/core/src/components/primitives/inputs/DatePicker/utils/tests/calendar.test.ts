import { describe, expect, it } from 'vitest';

import {
  applyFormat,
  DAYS_SHORT,
  daysInMonthCount,
  firstDayOfMonth,
  formatDateStr,
  formatDisplay,
  formatTimeStr,
  generateCalendarGrid,
  getKeyboardNavDate,
  isDateInRange,
  isSameDay,
  MONTHS_FULL,
  MONTHS_SHORT,
  pad2,
  parseDateValue,
  stripTime,
} from '../calendar';

describe('DatePicker calendar utilities', () => {
  it('exposes the expected day and month constants', () => {
    expect(DAYS_SHORT).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    expect(MONTHS_FULL[0]).toBe('January');
    expect(MONTHS_SHORT[11]).toBe('Dec');
  });

  it('pads numbers and calculates calendar boundaries', () => {
    expect(pad2(4)).toBe('04');
    expect(pad2(12)).toBe('12');
    expect(daysInMonthCount(2024, 1)).toBe(29);
    expect(daysInMonthCount(2025, 1)).toBe(28);
    expect(firstDayOfMonth(2026, 2)).toBe(new Date(2026, 2, 1).getDay());
  });

  it('compares and normalizes dates without time', () => {
    const morning = new Date('2026-03-14T09:10:11');
    const evening = new Date('2026-03-14T22:45:55');
    const nextDay = new Date('2026-03-15T09:10:11');

    expect(isSameDay(morning, evening)).toBe(true);
    expect(isSameDay(morning, nextDay)).toBe(false);
    expect(stripTime(evening).toISOString()).toBe(new Date('2026-03-14T00:00:00').toISOString());
  });

  it('evaluates inclusive ranges, including reversed boundaries and missing inputs', () => {
    const target = new Date('2026-03-14T12:00:00');
    const start = new Date('2026-03-10T00:00:00');
    const end = new Date('2026-03-20T23:59:59');
    const outside = new Date('2026-04-01T12:00:00');

    expect(isDateInRange(target, start, end)).toBe(true);
    expect(isDateInRange(target, end, start)).toBe(true);
    expect(isDateInRange(outside, start, end)).toBe(false);
    expect(isDateInRange(target, null, end)).toBe(false);
    expect(isDateInRange(target, start, null)).toBe(false);
  });

  it('parses values from date instances and strings while rejecting empty or invalid inputs', () => {
    const instance = new Date('2026-03-14T00:00:00');

    expect(parseDateValue(instance)).toBe(instance);
    expect(parseDateValue('2026-03-14T12:00:00')?.toISOString()).toBe(
      new Date('2026-03-14T12:00:00').toISOString()
    );
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
    expect(parseDateValue('')).toBeNull();
    expect(parseDateValue('not-a-date')).toBeNull();
  });

  it('formats values for raw strings, explicit formats, and picker-specific display modes', () => {
    const date = new Date('2026-03-14T09:08:07');

    expect(formatDateStr(date)).toBe('2026-03-14');
    expect(formatTimeStr(date)).toBe('09:08');
    expect(applyFormat(date, 'YYYY-MMMM-MMM-MM-DD-dd-HH-mm-ss')).toBe(
      '2026-March-Mar-03-14-14-09-08-07'
    );

    expect(formatDisplay(null, undefined, 'date', false)).toBe('');
    expect(formatDisplay(date, 'DD/MM/YYYY HH:mm:ss', 'date', false)).toBe('14/03/2026 09:08:07');
    expect(formatDisplay(date, undefined, 'month', false)).toBe('March 2026');
    expect(formatDisplay(date, undefined, 'year', false)).toBe('2026');
    expect(formatDisplay(date, undefined, 'date', true)).toBe('2026-03-14 09:08');
    expect(formatDisplay(date, undefined, 'date', false)).toBe('2026-03-14');
  });

  it('generates a 42-cell calendar grid with leading, current, trailing, and disabled days', () => {
    const disabledDate = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const grid = generateCalendarGrid(2026, 3, disabledDate);

    expect(grid).toHaveLength(42);
    expect(grid[0].isCurrentMonth).toBe(false);
    expect(grid[0].date.getMonth()).toBe(2);
    expect(grid.some((day) => day.isCurrentMonth && day.day === 14)).toBe(true);
    expect(grid.some((day) => !day.isCurrentMonth && day.date.getMonth() === 4)).toBe(true);
    expect(grid.some((day) => day.isDisabled)).toBe(true);
    expect(grid.some((day) => day.isToday)).toBeTypeOf('boolean');
  });

  it('supports the full keyboard navigation map and ignores unknown keys', () => {
    const current = new Date('2026-03-14T00:00:00');

    expect(getKeyboardNavDate(current, 'ArrowLeft')).toEqual(new Date(2026, 2, 13));
    expect(getKeyboardNavDate(current, 'ArrowRight')).toEqual(new Date(2026, 2, 15));
    expect(getKeyboardNavDate(current, 'ArrowUp')).toEqual(new Date(2026, 2, 7));
    expect(getKeyboardNavDate(current, 'ArrowDown')).toEqual(new Date(2026, 2, 21));
    expect(getKeyboardNavDate(current, 'PageUp')).toEqual(new Date(2026, 1, 14));
    expect(getKeyboardNavDate(current, 'PageDown')).toEqual(new Date(2026, 3, 14));
    expect(getKeyboardNavDate(current, 'Home')).toEqual(new Date(2026, 2, 1));
    expect(getKeyboardNavDate(current, 'End')).toEqual(new Date(2026, 2 + 1, 0));
    expect(getKeyboardNavDate(current, 'Enter')).toBeNull();
  });
});
