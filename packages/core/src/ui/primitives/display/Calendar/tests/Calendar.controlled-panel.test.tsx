import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CalendarModern from '../engines/modern';

// The panel is part of the controlled contract: `mode` follows the owner, the page
// follows a moved `value`, and `onPanelChange` fires for every page move.

function tabStops(): string[] {
  return Array.from(
    screen.getByRole('grid').querySelectorAll<HTMLElement>("[data-part='cell'][tabindex='0']"),
  ).map((cell) => cell.querySelector('span')?.textContent ?? '');
}

describe('Calendar modern — controlled panel', () => {
  it('follows a controlled mode prop and does not fork it from the local toggle', () => {
    const { rerender } = render(
      <CalendarModern mode="month" defaultValue={new Date(2026, 2, 15)} />,
    );
    expect(screen.getByRole('grid', { name: 'Dates grid' })).toBeInTheDocument();

    rerender(<CalendarModern mode="year" defaultValue={new Date(2026, 2, 15)} />);
    expect(screen.getByRole('grid', { name: 'Months grid' })).toBeInTheDocument();

    // The owner still owns the view: pressing the month toggle reports the
    // request but must not switch behind the owner's back.
    fireEvent.click(screen.getByRole('button', { name: /march 2026/i }));
    expect(screen.getByRole('grid', { name: 'Months grid' })).toBeInTheDocument();
  });

  it('keeps the uncontrolled mode contract intact', () => {
    render(<CalendarModern defaultValue={new Date(2026, 2, 15)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Year' }));
    expect(screen.getByRole('grid', { name: 'Months grid' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /march 2026/i }));
    expect(screen.getByRole('grid', { name: 'Dates grid' })).toBeInTheDocument();
  });

  it('re-pages onto a controlled value that moves to another month', () => {
    const { rerender } = render(<CalendarModern value={new Date(2026, 0, 20)} />);
    expect(screen.getByRole('button', { name: /january 2026/i })).toBeInTheDocument();

    rerender(<CalendarModern value={new Date(2026, 5, 3)} />);
    expect(screen.getByRole('button', { name: /june 2026/i })).toBeInTheDocument();
    // The selection is on-panel again, so the roving stop lands on it instead
    // of falling back to the 1st of a stale month.
    expect(tabStops()).toEqual(['3']);
  });

  it('does not fight header browsing away from the selected month', () => {
    render(<CalendarModern value={new Date(2026, 0, 20)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: /february 2026/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: /march 2026/i })).toBeInTheDocument();
  });

  it('survives an unparseable controlled value without re-paging', () => {
    render(<CalendarModern value="not-a-date" />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'Dates grid' })).toBeInTheDocument();
  });

  it('reports every header page move through onPanelChange', () => {
    const onPanelChange = vi.fn();
    render(
      <CalendarModern
        defaultValue={new Date(2026, 2, 15)}
        onPanelChange={onPanelChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onPanelChange).toHaveBeenLastCalledWith(expect.any(Date), 'month');
    let [panelDate] = onPanelChange.mock.calls.at(-1) as [Date, string];
    expect(panelDate.getFullYear()).toBe(2026);
    expect(panelDate.getMonth()).toBe(3);

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    [panelDate] = onPanelChange.mock.calls.at(-1) as [Date, string];
    expect(panelDate.getMonth()).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    [panelDate] = onPanelChange.mock.calls.at(-1) as [Date, string];
    expect(panelDate.getFullYear()).toBe(2027);
    expect(panelDate.getMonth()).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    [panelDate] = onPanelChange.mock.calls.at(-1) as [Date, string];
    expect(panelDate.getFullYear()).toBe(2026);
  });

  it('reports a keyboard page move across a month boundary', () => {
    const onPanelChange = vi.fn();
    render(
      <CalendarModern
        defaultValue={new Date(2026, 2, 31)}
        onPanelChange={onPanelChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });

    expect(onPanelChange).toHaveBeenCalledTimes(1);
    const [panelDate, panelMode] = onPanelChange.mock.calls[0] as [Date, string];
    expect(panelDate.getMonth()).toBe(3);
    expect(panelMode).toBe('month');
  });

  it('carries the year view into the panel signal', () => {
    const onPanelChange = vi.fn();
    render(<CalendarModern mode="year" defaultValue={new Date(2026, 2, 15)} onPanelChange={onPanelChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    const [panelDate, panelMode] = onPanelChange.mock.calls.at(-1) as [Date, string];
    expect(panelDate.getFullYear()).toBe(2027);
    expect(panelMode).toBe('year');
  });
});
