import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CalendarModern from '../engines/modern';

function tabStops(): HTMLElement[] {
  return Array.from(
    screen.getByRole('grid').querySelectorAll<HTMLElement>("[data-part='cell'][tabindex='0']"),
  );
}

function dayOf(cell: HTMLElement): string {
  return cell.querySelector('span')?.textContent ?? '';
}

describe('Calendar modern roving tab stop', () => {
  it('keeps exactly one tab stop after header navigation leaves the keyboard-focused month', () => {
    render(<CalendarModern defaultValue={new Date(2026, 2, 15)} />);
    const grid = screen.getByRole('grid');

    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(tabStops().map(dayOf)).toEqual(['22']);

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));

    // The focused date (March 22) is no longer rendered. Without a re-anchor
    // every April cell falls to tabindex -1 and the grid is unreachable by Tab.
    expect(tabStops().map(dayOf)).toEqual(['1']);
  });

  it('re-anchors on the header-navigated month rather than the stale selection', () => {
    render(<CalendarModern defaultValue={new Date(2026, 2, 15)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(tabStops().map(dayOf)).toEqual(['1']);

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(tabStops().map(dayOf)).toEqual(['15']);
  });

  it('follows keyboard navigation across a month boundary and moves DOM focus with it', () => {
    render(<CalendarModern defaultValue={new Date(2026, 2, 31)} />);
    const grid = screen.getByRole('grid');

    fireEvent.keyDown(grid, { key: 'ArrowRight' });

    expect(screen.getByRole('button', { name: /april 2026/i })).toBeInTheDocument();
    const stops = tabStops();
    expect(stops.map(dayOf)).toEqual(['1']);
    expect(document.activeElement).toBe(stops[0]);
  });

  it('mirrors the arrow axis under dir=rtl', () => {
    render(
      <div dir="rtl">
        <CalendarModern defaultValue={new Date(2026, 2, 15)} />
      </div>,
    );
    const grid = screen.getByRole('grid');

    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(tabStops().map(dayOf)).toEqual(['16']);

    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(tabStops().map(dayOf)).toEqual(['15']);
  });
});
