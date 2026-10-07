import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SvgCalendarHeatMapRenderer } from '..';

const VALUES = new Map([
  ['2026-03-02', 4],
  ['2026-03-03', 1],
  ['2026-03-10', 7],
]);

function renderCalendar(onCellClick?: (dateKey: string, value: number) => void) {
  return render(
    <SvgCalendarHeatMapRenderer
      startDate={new Date(2026, 2, 1)}
      endDate={new Date(2026, 2, 14)}
      values={VALUES}
      ariaLabel="Activity"
      responsive={false}
      {...(onCellClick ? { onCellClick } : {})}
    />,
  );
}

describe('calendar heat-map cells activate through the chart interaction controller', () => {
  it('paints no hand-wired click: the cell rect carries no handler and the mark is a roving button', () => {
    const onCellClick = vi.fn();
    const { container } = renderCalendar(onCellClick);
    const marks = [...container.querySelectorAll<SVGGElement>('[data-part="calendar-cell-mark"]')];
    expect(marks.length).toBe(container.querySelectorAll('[data-part="cell"]').length);
    expect(marks.every((mark) => mark.getAttribute('role') === 'button')).toBe(true);
    expect(marks.filter((mark) => mark.getAttribute('tabindex') === '0')).toHaveLength(1);
    const filled = container.querySelector('[data-datum-id][data-part="calendar-cell-mark"] [data-state="filled"]');
    expect(filled?.closest('[data-part="calendar-cell-mark"]')?.getAttribute('aria-label')).toMatch(/^2026-03-0\d: \d+\. Select date$/);
  });

  it('a pointer click on a cell calls onCellClick once with its date and value', () => {
    const onCellClick = vi.fn();
    const { container } = renderCalendar(onCellClick);
    const target = [...container.querySelectorAll<SVGRectElement>('[data-part="cell"]')].find((rect) => rect.querySelector('title')?.textContent === '2026-03-10: 7')!;
    expect(target).toBeDefined();
    fireEvent.pointerDown(target, { button: 0, pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(target, { detail: 1 });
    expect(onCellClick).toHaveBeenCalledTimes(1);
    expect(onCellClick).toHaveBeenCalledWith('2026-03-10', 7);
  });

  it('Enter and Space on the focused cell call onCellClick once each, and arrows rove the grid', () => {
    const onCellClick = vi.fn();
    const { container } = renderCalendar(onCellClick);
    const first = container.querySelector<SVGGElement>('[data-part="calendar-cell-mark"][tabindex="0"]')!;
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const next = container.querySelector<SVGGElement>('[data-part="calendar-cell-mark"][tabindex="0"]')!;
    expect(next).not.toBe(first);
    expect(document.activeElement).toBe(next);
    fireEvent.keyDown(next, { key: 'Enter' });
    fireEvent.keyDown(next, { key: ' ' });
    expect(onCellClick).toHaveBeenCalledTimes(2);
  });

  it('without onCellClick the cells stay static: no mark, no role, no tab stop', () => {
    const { container } = renderCalendar();
    expect(container.querySelector('[data-part="calendar-cell-mark"]')).toBeNull();
    expect(container.querySelector('[data-part="cells"] [tabindex]')).toBeNull();
    expect(container.querySelector('[data-part="cells"] > [data-part="cell"]')).not.toBeNull();
  });
});
