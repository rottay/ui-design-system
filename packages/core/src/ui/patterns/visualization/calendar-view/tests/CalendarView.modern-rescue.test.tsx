/**
 * Modern-rescue negative drills for the CalendarView modern engine.
 * Every assertion here is the OPPOSITE of what the pre-rescue engine
 * produced, so each one fails without its paired source change.
 */

// A date-only ISO payload names a calendar day. Pinning a zone west of UTC
// is what makes the UTC-midnight re-projection observable at all.
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

describe('PatternCalendarView modern — rescue drills', () => {
  it('names the grid even when a caller toolbar replaces the default month title', () => {
    render(
      <ModernCalendarView
        {...buildProps({ toolbar: <div>Caller toolbar</div> })}
      />,
    );

    // Before: aria-labelledby pointed at the unrendered default title, so the
    // grid resolved to an empty accessible name.
    expect(screen.getByRole('grid', { name: /March 2026/ })).toBeInTheDocument();
  });

  it('keeps the default toolbar wiring the grid name through the live title id', () => {
    const { container } = render(<ModernCalendarView {...buildProps()} />);
    const grid = container.querySelector('[data-part="grid"]') as HTMLElement;
    const titleId = grid.getAttribute('aria-labelledby');

    expect(titleId).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(titleId as string)}`)).not.toBeNull();
  });

  it('does not skip a month when navigating away from a 31-day month', () => {
    const onDateChange = vi.fn();
    render(
      <ModernCalendarView
        {...buildProps({ currentDate: new Date(2026, 0, 31), onDateChange })}
      />,
    );

    fireEvent.click(screen.getByText('>'));

    // Before: Jan 31 + setMonth(1) overflowed to March 3.
    const forward = onDateChange.mock.calls[0][0] as Date;
    expect(forward.getMonth()).toBe(1);
    expect(forward.getFullYear()).toBe(2026);

    onDateChange.mockClear();
    fireEvent.click(screen.getByText('<'));
    const back = onDateChange.mock.calls[0][0] as Date;
    expect(back.getMonth()).toBe(11);
    expect(back.getFullYear()).toBe(2025);
  });

  it('places a date-only ISO event on the calendar day it names', () => {
    const events: CalendarEvent[] = [{ id: 'iso-1', title: 'Kickoff', start: '2026-03-05' }];
    render(<ModernCalendarView {...buildProps({ events })} />);

    const named = screen.getByRole('gridcell', { name: /March 5, 2026/ });
    expect(within(named).getByText('Kickoff')).toBeInTheDocument();

    // Before: `new Date('2026-03-05')` is UTC midnight, so the chip landed in
    // the March 4 cell everywhere west of UTC.
    const previous = screen.getByRole('gridcell', { name: /March 4, 2026/ });
    expect(within(previous).queryByText('Kickoff')).toBeNull();
  });

  it('does not sell event chips as buttons or tab stops without onEventClick', () => {
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Read only A', start: new Date(2026, 2, 5) },
      { id: 'b', title: 'Read only B', start: new Date(2026, 2, 12) },
    ];
    const { container } = render(<ModernCalendarView {...buildProps({ events })} />);

    const chips = Array.from(container.querySelectorAll('[data-part="event"]'));
    expect(chips).toHaveLength(2);
    for (const chip of chips) {
      expect(chip).not.toHaveAttribute('role');
      expect(chip).not.toHaveAttribute('tabindex');
    }
    // The grid keeps exactly one tab stop (the roving day cell).
    expect(
      container.querySelectorAll('[data-part="grid"] [tabindex="0"]'),
    ).toHaveLength(1);
  });

  it('keeps chips fully operable when onEventClick is wired', () => {
    const onEventClick = vi.fn();
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Standup', start: new Date(2026, 2, 5) },
    ];
    const { container } = render(
      <ModernCalendarView {...buildProps({ events, onEventClick })} />,
    );

    const chip = container.querySelector('[data-part="event"]') as HTMLElement;
    expect(chip).toHaveAttribute('role', 'button');
    expect(chip).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(chip, { key: 'Enter' });
    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a' }),
    );
  });
});
