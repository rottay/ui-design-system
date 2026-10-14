/**
 * Modern-rescue negative drills for the CalendarView modern engine.
 * Every assertion here is the OPPOSITE of what the pre-rescue engine
 * produced, so each one fails without its paired source change.
 */

// A date-only ISO payload names a calendar day. Pinning a zone west of UTC
// is what makes the UTC-midnight re-projection observable at all.
process.env.TZ = 'America/Los_Angeles';

import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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

    const chips = Array.from(container.querySelectorAll('.ds-pattern-calendar-view__event'));
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

    const chip = container.querySelector('.ds-pattern-calendar-view__event') as HTMLElement;
    expect(screen.getByRole('button', { name: 'Standup' })).toBe(chip);
    // APG in-cell interaction mode (elevation wave): a widget inside a
    // gridcell is reached through the cell with F2, so it is programmatically
    // focusable but never its own tab stop.
    expect(chip).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(chip, { key: 'Enter' });
    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a' }),
    );
  });

  it('carries the read-only chip state on its class hook and kernel data-state, never an event part', () => {
    const events: CalendarEvent[] = [{ id: 'a', title: 'Read only A', start: new Date(2026, 2, 5) }];
    const { container } = render(
      <ModernCalendarView
        {...buildProps({ events, currentDate: new Date(2026, 2, 5), renderEvent: (ev) => <button type="button">{ev.title}</button> })}
      />,
    );
    const chip = container.querySelector('.ds-pattern-calendar-view__event') as HTMLElement;
    const paints = (token: string) => chip.matches(chipStateRule(token));

    expect(container.querySelectorAll('[data-part="event"]')).toHaveLength(0);
    expect(chip).not.toHaveAttribute('data-part');
    expect(chip).not.toHaveAttribute('data-state');
    expect(['hovered', 'pressed', 'focus-visible'].filter(paints)).toEqual([]);
    // Selection stays the day cell's; the chip never claims it.
    expect(chip).not.toHaveAttribute('aria-selected');
    expect(chip).not.toHaveAttribute('data-selected');
    const cell = chip.closest('[data-part="day-cell"]') as HTMLElement;
    expect(cell).toHaveAttribute('aria-selected', 'true');
    expect(cell).toHaveAttribute('data-selected', 'true');

    fireEvent.pointerEnter(chip);
    expect(chip).toHaveAttribute('data-state', 'hovered');
    expect(paints('hovered')).toBe(true);
    fireEvent.pointerDown(chip);
    expect(chip).toHaveAttribute('data-state', 'hovered pressed');
    expect(paints('pressed')).toBe(true);
    fireEvent.pointerUp(chip);
    expect(chip).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerLeave(chip);
    expect(chip).not.toHaveAttribute('data-state');
    expect(paints('hovered')).toBe(false);

    const inner = within(chip).getByRole('button', { name: 'Read only A' });
    const matches = inner.matches.bind(inner);
    vi.spyOn(inner, 'matches').mockImplementation((selector: string) => selector === ':focus-visible' || matches(selector));
    act(() => inner.focus());
    expect(chip).toHaveAttribute('data-state', 'focused focus-visible');
    expect(paints('focus-visible')).toBe(true);
    act(() => inner.blur());
    expect(chip).not.toHaveAttribute('data-state');
  });

  it('keeps both chips on one class hook: the interactive chip carries the Button part, never event', () => {
    const events: CalendarEvent[] = [{ id: 'a', title: 'Standup', start: new Date(2026, 2, 5) }];
    const readOnly = render(<ModernCalendarView {...buildProps({ events })} />);
    const interactive = render(<ModernCalendarView {...buildProps({ events, onEventClick: vi.fn() })} />);
    const chips = [readOnly, interactive].map(
      ({ container }) => container.querySelector('.ds-pattern-calendar-view__event') as HTMLElement,
    );

    expect(chips.map((chip) => chip.getAttribute('data-part'))).toEqual([null, 'trigger']);
    for (const chip of chips) fireEvent.pointerEnter(chip);
    expect(chips.map((chip) => chip.getAttribute('data-state'))).toEqual(['hovered', 'hovered']);
    expect(chips.every((chip) => chip.matches(chipStateRule('hovered')))).toBe(true);
  });
});

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/pattern-calendar-view/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** The one skin selector that paints a chip in `token`, read off the live skin (kernel token paired with its pseudo-class). */
function chipStateRule(token: string): string {
  const found = [...new Set([...SKIN.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .map((match) => match[1].trim().replace(/\s+/g, ' '))
    .filter((selector) => selector.endsWith(`__event:is([data-state~='${token}'], :${{ hovered: 'hover', pressed: 'active' }[token] ?? token})`)))];
  // One selector per state (the forced-colors block repeats the focus-visible one verbatim).
  expect(found, token).toHaveLength(1);
  return found[0];
}
