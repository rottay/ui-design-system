/**
 * @fileoverview One calendar: the grid follows the locale's week start, names
 * follow the locale, and the grid keyboard is the APG date grid in both directions.
 */

import { describe, expect, it } from 'vitest';

import {
  formatCalendarDate,
  formatMonthNames,
  formatWeekdayNames,
  generateCalendarGrid,
  resolveCalendarKeyDate,
  resolveEnabledCalendarKeyDate,
  resolveWeekStartsOn,
  weekdayOrder,
} from '..';

const sameDay = (date: Date | null) => (date ? [date.getFullYear(), date.getMonth(), date.getDate()] : null);

describe('calendar grid', () => {
  it('starts every grid on the requested weekday and keeps six whole weeks', () => {
    for (const weekStartsOn of [0, 1, 6] as const) {
      const grid = generateCalendarGrid(2026, 2, undefined, { weekStartsOn });
      expect(grid).toHaveLength(42);
      expect(grid[0].date.getDay()).toBe(weekStartsOn);
      const inMonth = grid.filter((cell) => cell.isCurrentMonth).map((cell) => cell.day);
      expect(inMonth).toEqual(Array.from({ length: 31 }, (_, index) => index + 1));
    }
  });

  it('keeps the Sunday-first grid when no week start is given', () => {
    const grid = generateCalendarGrid(2026, 1);
    expect(grid[0].date.getDay()).toBe(0);
    expect(sameDay(grid[0].date)).toEqual([2026, 1, 1]);
  });

  it('marks disabled dates through the predicate, outside days included', () => {
    const grid = generateCalendarGrid(2026, 2, (date) => date.getDate() === 1, { weekStartsOn: 1 });
    expect(grid.filter((cell) => cell.isDisabled).every((cell) => cell.day === 1)).toBe(true);
    expect(grid.some((cell) => cell.isDisabled && !cell.isCurrentMonth)).toBe(true);
  });
});

describe('locale geometry', () => {
  it('resolves the first weekday by region, then by language', () => {
    expect(resolveWeekStartsOn(undefined)).toBe(0);
    expect(resolveWeekStartsOn('en')).toBe(0);
    expect(resolveWeekStartsOn('en-GB')).toBe(1);
    expect(resolveWeekStartsOn('es')).toBe(1);
    expect(resolveWeekStartsOn('pt-BR')).toBe(0);
    expect(resolveWeekStartsOn('ar')).toBe(6);
    expect(resolveWeekStartsOn('ar-MA')).toBe(1);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('names weekdays and months in the locale, with the English floor', () => {
    expect(formatWeekdayNames('es', { weekStartsOn: 1, width: 'short' })[0]).toMatch(/^lun/);
    expect(formatWeekdayNames(undefined)).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    expect(formatMonthNames('fr')[0]).toBe('janvier');
    expect(formatMonthNames(undefined, 'short')[11]).toBe('Dec');
    expect(formatCalendarDate(new Date(2026, 2, 14), 'es')).toMatch(/14 de marzo de 2026/);
    expect(formatCalendarDate(new Date(2026, 2, 14))).toBe('2026-03-14');
  });
});

describe('APG date-grid keyboard', () => {
  const saturday = new Date(2026, 2, 14);

  it('moves a day with the arrows and mirrors them under RTL', () => {
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'ArrowRight' }))).toEqual([2026, 2, 15]);
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'ArrowRight' }, { rtl: true }))).toEqual([2026, 2, 13]);
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'ArrowDown' }))).toEqual([2026, 2, 21]);
    expect(resolveCalendarKeyDate(saturday, { key: 'Enter' })).toBeNull();
  });

  it('jumps to the week edges of the locale', () => {
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'Home' }))).toEqual([2026, 2, 8]);
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'Home' }, { weekStartsOn: 1 }))).toEqual([2026, 2, 9]);
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'End' }, { weekStartsOn: 1 }))).toEqual([2026, 2, 15]);
  });

  it('pages a month, or a year with Shift, clamping to the shorter month', () => {
    const endOfMonth = new Date(2026, 2, 31);
    expect(sameDay(resolveCalendarKeyDate(endOfMonth, { key: 'PageUp' }))).toEqual([2026, 1, 28]);
    expect(sameDay(resolveCalendarKeyDate(saturday, { key: 'PageDown', shiftKey: true }))).toEqual([2027, 2, 14]);
  });

  it('steps past disabled dates and refuses when every date that way is disabled', () => {
    const weekendsOff = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const friday = new Date(2026, 2, 13);
    expect(sameDay(resolveEnabledCalendarKeyDate(friday, { key: 'ArrowRight' }, weekendsOff))).toEqual([2026, 2, 16]);
    expect(resolveEnabledCalendarKeyDate(friday, { key: 'ArrowRight' }, () => true)).toBeNull();
  });
});
