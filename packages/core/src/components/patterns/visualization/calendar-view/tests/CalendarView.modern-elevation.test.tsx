/**
 * Modern-elevation drills for the CalendarView modern engine.
 * Every assertion here is the OPPOSITE of what the pre-elevation engine
 * produced, so each one fails without its paired source change.
 */

process.env.TZ = 'America/Los_Angeles';

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCalendarView from '../engines/modern';
import type { CalendarEvent, CalendarViewProps } from '../contracts';

const MARCH_2026 = new Date(2026, 2, 1);

function buildProps(
  overrides: Partial<CalendarViewProps<unknown>> = {},
): CalendarViewProps<unknown> {
  return {
    events: [],
    currentDate: MARCH_2026,
    view: 'month',
    ...overrides,
  };
}

/** A busy month: three chips a day across the whole grid. */
function busyMonth(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (let day = 1; day <= 31; day += 1) {
    for (let slot = 0; slot < 3; slot += 1) {
      events.push({
        id: `d${day}-s${slot}`,
        title: `Event ${day}.${slot}`,
        start: new Date(2026, 2, day, 9 + slot),
      });
    }
  }
  return events;
}

describe('PatternCalendarView modern — elevation drills', () => {
  it('keeps exactly one grid tab stop even with onEventClick wired', () => {
    const { container } = render(
      <ModernCalendarView
        {...buildProps({ events: busyMonth(), onEventClick: vi.fn() })}
      />,
    );

    // Before: every chip carried tabIndex=0 — 93 tab stops inside a grid that
    // otherwise implements a correct single-stop roving tabindex.
    expect(container.querySelectorAll('[data-part="event"]').length).toBeGreaterThan(80);
    expect(container.querySelectorAll('[data-part="grid"] [tabindex="0"]')).toHaveLength(1);
    for (const chip of container.querySelectorAll('[data-part="event"]')) {
      expect(chip).toHaveAttribute('tabindex', '-1');
    }
  });

  it('enters and exits the cell with F2/Escape without stealing onDateClick', () => {
    const onDateClick = vi.fn();
    const onEventClick = vi.fn();
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Standup', start: new Date(2026, 2, 5, 9) },
      { id: 'b', title: 'Review', start: new Date(2026, 2, 5, 11) },
    ];
    render(
      <ModernCalendarView {...buildProps({ events, onDateClick, onEventClick })} />,
    );

    const cell = screen.getByRole('gridcell', { name: /March 5, 2026/ });
    cell.focus();

    // Enter/Space stay bound to the documented public callback on a cell that
    // carries events — the APG mode did not reassign them.
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onDateClick).toHaveBeenCalledTimes(1);

    // F2 enters the cell (before: F2 did nothing at all).
    fireEvent.keyDown(cell, { key: 'F2' });
    const chips = within(cell).getAllByRole('button');
    expect(chips[0]).toHaveFocus();

    fireEvent.keyDown(chips[0], { key: 'ArrowDown' });
    expect(chips[1]).toHaveFocus();

    fireEvent.keyDown(chips[1], { key: 'Enter' });
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));

    fireEvent.keyDown(chips[1], { key: 'Escape' });
    expect(cell).toHaveFocus();
    // Escaping did not fire the date callback again.
    expect(onDateClick).toHaveBeenCalledTimes(1);
  });

  it('does not move the day grid while focus is inside a cell', () => {
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Only', start: new Date(2026, 2, 5, 9) },
    ];
    render(<ModernCalendarView {...buildProps({ events, onEventClick: vi.fn() })} />);

    const cell = screen.getByRole('gridcell', { name: /March 5, 2026/ });
    cell.focus();
    fireEvent.keyDown(cell, { key: 'F2' });
    const chip = within(cell).getByRole('button');

    fireEvent.keyDown(chip, { key: 'ArrowDown' });
    // Before: the chip had no handler, so ArrowDown bubbled to the cell and
    // jumped a week away from the chip the user was reading.
    expect(chip).toHaveFocus();
  });

  it('names the view-mode control', () => {
    render(<ModernCalendarView {...buildProps()} />);

    // Before: a composed Select with no accessible name at all.
    expect(
      screen.getByRole('combobox', { name: 'Calendar view mode' }),
    ).toBeInTheDocument();
  });

  it('names a renderEvent chip with its event title', () => {
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Standup', start: new Date(2026, 2, 5) },
    ];
    render(
      <ModernCalendarView
        {...buildProps({
          events,
          onEventClick: vi.fn(),
          renderEvent: () => <span aria-hidden="true">•</span>,
        })}
      />,
    );

    // Before: an icon-only chip advertised role="button" with no name.
    expect(screen.getByRole('button', { name: 'Standup' })).toBeInTheDocument();
  });

  it('carries the day agenda weight in the cell name', () => {
    const events: CalendarEvent[] = [
      { id: 'a', title: 'One', start: new Date(2026, 2, 5, 9) },
      { id: 'b', title: 'Two', start: new Date(2026, 2, 5, 11) },
      { id: 'c', title: 'Solo', start: new Date(2026, 2, 6, 9) },
    ];
    render(<ModernCalendarView {...buildProps({ events })} />);

    expect(
      screen.getByRole('gridcell', { name: /March 5, 2026, 2 events/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: /March 6, 2026, 1 event$/ }),
    ).toBeInTheDocument();
    // A quiet day keeps a bare date name.
    expect(
      screen.getByRole('gridcell', { name: /^Saturday, March 7, 2026$/ }),
    ).toBeInTheDocument();
  });

  it('shows the earliest three chips of an overloaded day, not array order', () => {
    const events: CalendarEvent[] = [
      { id: 'late', title: 'Late', start: new Date(2026, 2, 10, 18) },
      { id: 'noon', title: 'Noon', start: new Date(2026, 2, 10, 12) },
      { id: 'dawn', title: 'Dawn', start: new Date(2026, 2, 10, 6) },
      { id: 'mid', title: 'Mid', start: new Date(2026, 2, 10, 9) },
    ];
    render(<ModernCalendarView {...buildProps({ events })} />);

    const cell = screen.getByRole('gridcell', { name: /March 10, 2026/ });
    const chips = Array.from(cell.querySelectorAll('[data-part="event"]')).map(
      (chip) => chip.textContent,
    );

    // Before: insertion order won, so the 18:00 item displaced the 06:00 one.
    expect(chips).toEqual(['Dawn', 'Mid', 'Noon']);
    expect(within(cell).getByText('+1 more')).toBeInTheDocument();
  });

  it('keeps a multi-day event on every day it spans', () => {
    const events: CalendarEvent[] = [
      {
        id: 'trip',
        title: 'Offsite',
        start: new Date(2026, 2, 10, 9),
        end: new Date(2026, 2, 12, 17),
      },
    ];
    render(<ModernCalendarView {...buildProps({ events })} />);

    for (const day of [10, 11, 12]) {
      const cell = screen.getByRole('gridcell', {
        name: new RegExp(`March ${day}, 2026`),
      });
      // Before: only the start day carried the chip; days 11 and 12 read as
      // free time.
      expect(within(cell).getByText('Offsite')).toBeInTheDocument();
    }

    const after = screen.getByRole('gridcell', { name: /March 13, 2026/ });
    expect(within(after).queryByText('Offsite')).toBeNull();
  });

  it('marks the loading root busy', () => {
    const { container } = render(<ModernCalendarView {...buildProps({ loading: true })} />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('renders the overflow floor as copy when no provider is mounted', () => {
    const events: CalendarEvent[] = [1, 2, 3, 4, 5].map((n) => ({
      id: `e${n}`,
      title: `E${n}`,
      start: new Date(2026, 2, 10, 8 + n),
    }));
    render(<ModernCalendarView {...buildProps({ events })} />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('+{count} more')).toBeNull();
  });
});
