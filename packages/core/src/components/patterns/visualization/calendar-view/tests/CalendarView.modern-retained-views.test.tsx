process.env.TZ = 'America/Los_Angeles';

import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernCalendarView from '../engines/modern';
import type { CalendarEvent, CalendarViewProps } from '../contracts';

const CURRENT = new Date(2026, 2, 18, 9, 15);
const timeViews: ('week' | 'day')[] = ['week', 'day'];

function props(overrides: Partial<CalendarViewProps<unknown>> = {}): CalendarViewProps<unknown> {
  return { events: [], currentDate: CURRENT, view: 'day', ...overrides };
}

function hour(container: HTMLElement, date: string, value: number, occurrence = 0): HTMLElement {
  const cell = container.querySelector<HTMLElement>(`[role="gridcell"][data-date="${date}"][data-hour="${value}"][data-occurrence="${occurrence}"]`);
  expect(cell, `${date} at ${value}, occurrence ${occurrence}`).not.toBeNull();
  return cell!;
}

describe('CalendarView Modern retained time views', () => {
  it.each(timeViews)('renders a %s hourly layout instead of the month grid', (view) => {
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ view })} /></I18nProvider>);
    const cells = container.querySelectorAll('[role="gridcell"][data-time-slot="true"]');
    expect(cells).toHaveLength(view === 'week' ? 168 : 24);
    expect(screen.getAllByRole('columnheader')).toHaveLength(view === 'week' ? 8 : 2);
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    expect(hour(container, '2026-03-18', 9)).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelectorAll('[data-part="day-cell"] > [data-part="date-label"][aria-hidden="true"]')).toHaveLength(0);
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(25);
    expect(rowHeaders[0]).toHaveTextContent('All day');
    for (const header of rowHeaders) expect(header).toHaveAttribute('data-part', 'date-label');
    expect(rowHeaders[10]).toHaveTextContent(new Date(2026, 2, 18, 9).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }));
    if (view === 'week') {
      expect(hour(container, '2026-03-15', 0)).toBeInTheDocument();
      expect(hour(container, '2026-03-21', 23)).toBeInTheDocument();
      expect(container.querySelector('[data-date="2026-03-22"]')).toBeNull();
    } else {
      expect(container.querySelector('[data-date="2026-03-17"]')).toBeNull();
      expect(container.querySelector('[data-date="2026-03-19"]')).toBeNull();
    }
  });

  it.each(timeViews)('navigates %s by its own calendar interval without mutating controlled input', (view) => {
    const onDateChange = vi.fn();
    const original = CURRENT.getTime();
    render(<I18nProvider locale="en"><ModernCalendarView {...props({ view, onDateChange })} /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: `Next ${view}` }));
    const next: Date = onDateChange.mock.calls[0][0];
    expect(next).toEqual(new Date(2026, 2, view === 'week' ? 25 : 19, 9, 15));
    fireEvent.click(screen.getByRole('button', { name: `Previous ${view}` }));
    const previous: Date = onDateChange.mock.calls[1][0];
    expect(previous).toEqual(new Date(2026, 2, view === 'week' ? 11 : 17, 9, 15));
    expect(CURRENT.getTime()).toBe(original);
    expect(screen.getByRole('grid')).toHaveAccessibleName(view === 'week' ? /Mar 15, 2026.*Mar 21, 2026/ : /Wednesday, March 18, 2026/);
  });

  it.each(timeViews)('preserves the local clock across DST when navigating the %s view', (view) => {
    const onDateChange = vi.fn<(date: Date) => void>();
    const currentDate = new Date(2026, 2, view === 'week' ? 4 : 7, 9);
    const expected = new Date(2026, 2, view === 'week' ? 11 : 8, 9);
    render(<I18nProvider locale="en"><ModernCalendarView {...props({ view, currentDate, onDateChange })} /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: `Next ${view}` }));
    expect(onDateChange).toHaveBeenCalledExactlyOnceWith(expected);
    const delta = onDateChange.mock.calls[0][0].getTime() - currentDate.getTime();
    expect(delta).toBe((view === 'week' ? 167 : 23) * 60 * 60 * 1000);
  });

  it('keeps view and date controlled through selector changes and parent rerenders', () => {
    const onViewChange = vi.fn();
    const first = props({ view: 'month', onViewChange });
    const { container, rerender } = render(<I18nProvider locale="en"><ModernCalendarView {...first} /></I18nProvider>);
    expect(container.querySelectorAll('[data-part="date-label"]')).toHaveLength(31);
    fireEvent.change(screen.getByRole('combobox', { name: 'Calendar view mode' }), { target: { value: 'week' } });
    expect(onViewChange).toHaveBeenCalledExactlyOnceWith('week');
    expect(container.querySelectorAll('[data-part="date-label"]')).toHaveLength(31);
    rerender(<I18nProvider locale="en"><ModernCalendarView {...first} view="week" currentDate={new Date(2026, 2, 31, 9)} /></I18nProvider>);
    expect(hour(container, '2026-04-04', 23)).toBeInTheDocument();
    expect(container.querySelector('[data-date="2026-03-28"]')).toBeNull();
    rerender(<I18nProvider locale="en"><ModernCalendarView {...first} view="day" currentDate={new Date(2026, 3, 1, 9)} /></I18nProvider>);
    expect(hour(container, '2026-04-01', 9)).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelector('[data-date="2026-03-31"]')).toBeNull();
  });

  it('places timed events in their start hour and preserves event/date callbacks and custom content', () => {
    const event: CalendarEvent = { id: 'meeting', title: 'Design review', start: new Date(2026, 2, 18, 9, 30), end: new Date(2026, 2, 18, 11), data: { ticket: 42 } };
    const onEventClick = vi.fn();
    const onDateClick = vi.fn<(date: Date) => void>();
    const renderEvent = vi.fn((value: CalendarEvent) => <span>Custom {value.title}</span>);
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events: [event], onEventClick, onDateClick, renderEvent })} /></I18nProvider>);
    const cell = hour(container, '2026-03-18', 9);
    const button = within(cell).getByRole('button', { name: 'Design review' });
    expect(within(button).getByText('Custom Design review')).toBeInTheDocument();
    expect(within(hour(container, '2026-03-18', 8)).queryByRole('button')).toBeNull();
    fireEvent.click(button);
    expect(onEventClick).toHaveBeenCalledExactlyOnceWith(event);
    expect(onEventClick.mock.calls[0][0]).toBe(event);
    expect(onDateClick).not.toHaveBeenCalled();
    fireEvent.click(hour(container, '2026-03-18', 12));
    expect(onDateClick).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 18, 12));
    expect(renderEvent).toHaveBeenCalledWith(event);
  });

  it('keeps overlapping and start-only events reachable, with end times in default content', () => {
    const events: CalendarEvent[] = [
      { id: 'a', title: 'Long meeting', start: new Date(2026, 2, 18, 9, 30), end: new Date(2026, 2, 18, 11) },
      { id: 'b', title: 'Overlap', start: new Date(2026, 2, 18, 9, 45), end: new Date(2026, 2, 18, 10, 15) },
      { id: 'c', title: 'Point reminder', start: new Date(2026, 2, 18, 9, 50) },
    ];
    const onEventClick = vi.fn();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events, onEventClick })} /></I18nProvider>);
    const cell = hour(container, '2026-03-18', 9);
    const expectedEnd = new Date(2026, 2, 18, 11).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    expect(within(cell).getByRole('button', { name: 'Long meeting' }).textContent).toContain(expectedEnd);
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'F2' });
    expect(within(cell).getByRole('button', { name: 'Long meeting' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(within(cell).getByRole('button', { name: 'Overlap' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(within(cell).getByRole('button', { name: 'Point reminder' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onEventClick).toHaveBeenCalledExactlyOnceWith(events[2]);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(cell).toHaveFocus();
  });

  it('keeps late point and short entries activatable with their real time labels', () => {
    const events: CalendarEvent[] = [
      { id: 'point', title: 'Late point', start: new Date(2026, 2, 18, 23, 50) },
      { id: 'short', title: 'Late short', start: new Date(2026, 2, 18, 23, 52), end: new Date(2026, 2, 18, 23, 55) },
      { id: 'midnight', title: 'Midnight finish', start: new Date(2026, 2, 18, 23, 57), end: new Date(2026, 2, 19) },
    ];
    const onEventClick = vi.fn();
    const onDateClick = vi.fn();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events, onEventClick, onDateClick })} /></I18nProvider>);
    const cell = hour(container, '2026-03-18', 23);
    for (const event of events) {
      const button = within(cell).getByRole('button', { name: event.title });
      expect(button).toHaveTextContent(new Date(event.start).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }));
      fireEvent.click(button);
      expect(onEventClick.mock.calls.at(-1)?.[0]).toBe(event);
    }
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'F2' });
    expect(within(cell).getByRole('button', { name: 'Late point' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onEventClick.mock.calls.at(-1)?.[0]).toBe(events[0]);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(cell).toHaveFocus();
    expect(onDateClick).not.toHaveBeenCalled();
  });

  it('orders reversed late-day visual ties by actual time for rendering and the event stack', () => {
    const midnight: CalendarEvent = { id: 'midnight', title: 'Midnight finish', start: new Date(2026, 2, 18, 23, 57), end: new Date(2026, 2, 19) };
    const short: CalendarEvent = { id: 'short', title: 'Late short', start: new Date(2026, 2, 18, 23, 52), end: new Date(2026, 2, 18, 23, 55) };
    const point: CalendarEvent = { id: 'point', title: 'Late point', start: new Date(2026, 2, 18, 23, 50) };
    const events = [midnight, short, point];
    const onEventClick = vi.fn();
    const onDateClick = vi.fn();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events, onEventClick, onDateClick })} /></I18nProvider>);
    const cell = hour(container, '2026-03-18', 23);
    expect(within(cell).getAllByRole('button').map((button) => button.getAttribute('aria-label')))
      .toEqual(['Late point', 'Late short', 'Midnight finish']);
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'F2' });
    for (const event of [point, short, midnight]) {
      const button = within(cell).getByRole('button', { name: event.title });
      expect(button).toHaveFocus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(onEventClick.mock.calls.at(-1)?.[0]).toBe(event);
      fireEvent.keyDown(button, { key: 'ArrowDown' });
    }
    expect(onEventClick.mock.calls.map(([event]) => event)).toEqual([point, short, midnight]);
    expect(within(cell).getByRole('button', { name: 'Midnight finish' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(within(cell).getByRole('button', { name: 'Late short' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(cell).toHaveFocus();
    expect(onDateClick).not.toHaveBeenCalled();
    expect(events).toEqual([midnight, short, point]);
  });

  it('leaves nested readonly renderer controls in charge of editing, keys and activation', async () => {
    const user = userEvent.setup();
    const onDateClick = vi.fn();
    const onWidgetClick = vi.fn();
    const event: CalendarEvent = { id: 'custom', title: 'Custom controls', start: new Date(2026, 2, 18, 9) };
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({
      view: 'week', events: [event], onDateClick,
      renderEvent: () => <><input aria-label="Event note" defaultValue="abc" /><button onClick={onWidgetClick}>Host action</button></>,
    })} /></I18nProvider>);
    const input = screen.getByRole('textbox', { name: 'Event note' }) as HTMLInputElement;
    await user.click(input);
    input.setSelectionRange(1, 1);
    await user.keyboard('{ArrowRight}X{Enter} ');
    expect(input).toHaveValue('abX c');
    expect(input).toHaveFocus();
    const button = screen.getByRole('button', { name: 'Host action' });
    act(() => button.focus());
    await user.keyboard('{ArrowRight}{ArrowLeft}{ArrowDown}{ArrowUp}{Enter} ');
    expect(button).toHaveFocus();
    expect(onWidgetClick).toHaveBeenCalledTimes(2);
    expect(onDateClick).not.toHaveBeenCalled();
    const cell = hour(container, '2026-03-18', 9);
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'ArrowRight' });
    expect(hour(container, '2026-03-19', 9)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onDateClick).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 19, 9));
  });

  it('does not consume already handled cell keys or invoke date callbacks for them', () => {
    const onDateClick = vi.fn();
    const { container } = render(<div onKeyDownCapture={(event) => event.preventDefault()}><ModernCalendarView {...props({ onDateClick })} /></div>);
    const cell = hour(container, '2026-03-18', 9);
    act(() => cell.focus());
    for (const key of ['ArrowDown', 'Enter', ' ']) fireEvent.keyDown(cell, { key });
    expect(cell).toHaveFocus();
    expect(onDateClick).not.toHaveBeenCalled();
  });

  it('does not turn invalid time values into epoch events and still renders a genuine zero instant', () => {
    const events: CalendarEvent[] = [
      { id: 'invalid', title: 'Invalid start', start: new Date(Number.NaN) },
      { id: 'invalid-end', title: 'Invalid end', start: new Date(0), end: new Date(Number.NaN) },
      { id: 'epoch', title: 'Epoch valid', start: new Date(0) },
    ];
    render(<ModernCalendarView {...props({ currentDate: new Date(0), events })} />);
    expect(screen.getByText('Epoch valid')).toBeInTheDocument();
    expect(screen.queryByText('Invalid start')).toBeNull();
    expect(screen.queryByText('Invalid end')).toBeNull();
  });

  it('clips timed ranges to the visible day and does not repeat an exclusive midnight end', () => {
    const events: CalendarEvent[] = [
      { id: 'cross', title: 'Overnight', start: new Date(2026, 2, 17, 23, 30), end: new Date(2026, 2, 18, 1, 30) },
      { id: 'ended', title: 'Already ended', start: new Date(2026, 2, 17, 23), end: new Date(2026, 2, 18) },
      { id: 'tomorrow', title: 'Tomorrow only', start: new Date(2026, 2, 19, 1) },
    ];
    const { container } = render(<ModernCalendarView {...props({ events })} />);
    expect(within(hour(container, '2026-03-18', 0)).getByText('Overnight')).toBeInTheDocument();
    expect(screen.queryByText('Already ended')).toBeNull();
    expect(screen.queryByText('Tomorrow only')).toBeNull();
    expect(container.querySelectorAll('.ds-pattern-calendar-view__event')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /Overnight/ })).toBeNull();
  });

  it('keeps date-only and explicit all-day ranges in the all-day row, including the named end day', () => {
    const events: CalendarEvent[] = [
      { id: 'date', title: 'Civil day', start: '2026-03-18' },
      { id: 'all', title: 'Conference', start: '2026-03-17', end: '2026-03-19', allDay: true },
    ];
    const { container, rerender } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events })} /></I18nProvider>);
    const allDay = screen.getByRole('gridcell', { name: /March 18, 2026, All day/ });
    expect(within(allDay).getByText('Civil day')).toBeInTheDocument();
    expect(within(allDay).getByText('Conference')).toBeInTheDocument();
    expect(container.querySelector('[data-time-slot="true"] .ds-pattern-calendar-view__event')).toBeNull();
    rerender(<I18nProvider locale="en"><ModernCalendarView {...props({ events, currentDate: new Date(2026, 2, 19) })} /></I18nProvider>);
    expect(screen.queryByText('Civil day')).toBeNull();
    expect(screen.getByText('Conference')).toBeInTheDocument();
    rerender(<I18nProvider locale="en"><ModernCalendarView {...props({ events, currentDate: new Date(2026, 2, 20) })} /></I18nProvider>);
    expect(screen.queryByText('Conference')).toBeNull();
  });

  it('honors an explicit timed flag on a date-only entry instead of moving it into all-day content', () => {
    const events: CalendarEvent[] = [{ id: 'midnight', title: 'Midnight reminder', start: '2026-03-18', allDay: false }];
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ events })} /></I18nProvider>);
    expect(within(hour(container, '2026-03-18', 0)).getByText('Midnight reminder')).toBeInTheDocument();
    expect(within(screen.getByRole('gridcell', { name: /March 18, 2026, All day/ })).queryByText('Midnight reminder')).toBeNull();
  });

  it('uses actual local-hour instants on the spring DST boundary', () => {
    const onDateClick = vi.fn<(date: Date) => void>();
    const { container } = render(<ModernCalendarView {...props({ currentDate: new Date(2026, 2, 8), onDateClick })} />);
    expect(container.querySelectorAll('[data-time-slot="true"]')).toHaveLength(23);
    expect(container.querySelector('[data-hour="2"]')).toBeNull();
    act(() => hour(container, '2026-03-08', 3).focus());
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(hour(container, '2026-03-08', 1)).toHaveFocus();
    fireEvent.click(hour(container, '2026-03-08', 3));
    expect(onDateClick).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 8, 3));
  });

  it('distinguishes both repeated autumn hours and their exact event/callback instants', () => {
    const early = new Date('2026-11-01T01:00:00-07:00');
    const late = new Date('2026-11-01T01:00:00-08:00');
    const events: CalendarEvent[] = [
      { id: 'early', title: 'First occurrence', start: early },
      { id: 'late', title: 'Second occurrence', start: late },
    ];
    const onDateClick = vi.fn<(date: Date) => void>();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ currentDate: new Date(2026, 10, 1), events, onDateClick })} /></I18nProvider>);
    expect(container.querySelectorAll('[data-time-slot="true"]')).toHaveLength(25);
    const first = hour(container, '2026-11-01', 1, 0);
    const second = hour(container, '2026-11-01', 1, 1);
    expect(first.getAttribute('aria-label')).not.toBe(second.getAttribute('aria-label'));
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();
    expect(within(first).getByText('First occurrence')).toBeInTheDocument();
    expect(within(second).getByText('Second occurrence')).toBeInTheDocument();
    fireEvent.click(first);
    fireEvent.click(second);
    expect(onDateClick.mock.calls.map(([date]) => date.getTime())).toEqual([early.getTime(), late.getTime()]);
  });

  it.each(['spring', 'fall'] as const)('labels a mixed-DST %s week axis from the zones actually present in each row', (season) => {
    const fall = season === 'fall';
    const date = fall ? new Date(2026, 10, 4) : new Date(2026, 2, 11);
    const first = fall ? new Date('2026-11-01T01:00:00-07:00') : new Date('2026-03-08T00:00:00-08:00');
    const nextDay = fall ? new Date('2026-11-02T01:00:00-08:00') : new Date('2026-03-09T00:00:00-07:00');
    const format = (value: Date) => value.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    const onDateClick = vi.fn<(date: Date) => void>();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ view: 'week', currentDate: date, onDateClick })} /></I18nProvider>);
    const firstCell = hour(container, fall ? '2026-11-01' : '2026-03-08', fall ? 1 : 0);
    const nextCell = hour(container, fall ? '2026-11-02' : '2026-03-09', fall ? 1 : 0);
    const axis = firstCell.parentElement!.querySelector('[role="rowheader"]')!;
    expect(axis.textContent).toBe(`${format(first)} / ${format(nextDay)}`);
    expect(firstCell.getAttribute('aria-label')).toContain(format(first));
    expect(nextCell.getAttribute('aria-label')).toContain(format(nextDay));
    fireEvent.click(firstCell);
    fireEvent.click(nextCell);
    expect(onDateClick.mock.calls.map(([value]) => value.getTime())).toEqual([first.getTime(), nextDay.getTime()]);
    if (fall) {
      const repeated = hour(container, '2026-11-01', 1, 1);
      const repeatedInstant = new Date('2026-11-01T01:00:00-08:00');
      const repeatedAxis = repeated.parentElement!.querySelector('[role="rowheader"]')!;
      expect(repeatedAxis.textContent).toBe(format(repeatedInstant));
      expect(repeatedAxis.textContent).not.toBe(axis.textContent);
      expect(repeated.getAttribute('aria-label')).toContain(format(repeatedInstant));
      fireEvent.click(repeated);
      expect(onDateClick.mock.calls.at(-1)?.[0].getTime()).toBe(repeatedInstant.getTime());
    } else {
      expect(container.querySelector('[data-date="2026-03-08"][data-hour="2"]')).toBeNull();
      expect(hour(container, '2026-03-09', 2)).toBeInTheDocument();
    }
  });

  it('follows the Spanish week start and labels while keeping exact hour callbacks', () => {
    const onDateClick = vi.fn<(date: Date) => void>();
    const { container } = render(<I18nProvider locale="es"><ModernCalendarView {...props({ view: 'week', onDateClick })} /></I18nProvider>);
    expect(hour(container, '2026-03-16', 0)).toBeInTheDocument();
    expect(hour(container, '2026-03-22', 23)).toBeInTheDocument();
    expect(container.querySelector('[data-date="2026-03-15"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Semana siguiente' })).toBeInTheDocument();
    const selected = hour(container, '2026-03-18', 9);
    expect(selected.getAttribute('aria-label')).toContain('marzo');
    fireEvent.keyDown(selected, { key: 'Enter' });
    expect(onDateClick).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 18, 9));
  });

  it('mirrors inline grid navigation in RTL and keeps vertical movement hourly', () => {
    const { container } = render(<I18nProvider locale="ar"><ModernCalendarView {...props({ view: 'week' })} /></I18nProvider>);
    const start = hour(container, '2026-03-18', 9);
    act(() => start.focus());
    fireEvent.keyDown(start, { key: 'ArrowLeft' });
    expect(hour(container, '2026-03-19', 9)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(start).toHaveFocus();
    fireEvent.keyDown(start, { key: 'ArrowDown' });
    expect(hour(container, '2026-03-18', 10)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(start).toHaveFocus();
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
  });

  it('keeps the custom header/toolbar and names time grids without a missing title reference', () => {
    render(<I18nProvider locale="en"><ModernCalendarView {...props({ header: <h2>Schedule heading</h2>, toolbar: <div>Host toolbar</div> })} /></I18nProvider>);
    expect(screen.getByRole('heading', { name: 'Schedule heading' })).toBeInTheDocument();
    expect(screen.getByText('Host toolbar')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toHaveAccessibleName(/March 18, 2026/);
    expect(screen.getByRole('grid')).not.toHaveAttribute('aria-labelledby');
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it.each(timeViews)('keeps loading %s grids out of the DOM and leaves the root busy', (view) => {
    const { container } = render(<ModernCalendarView {...props({ view, loading: true })} />);
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('grid')).toBeNull();
  });
});

describe('CalendarView Modern retained month behavior and additional events', () => {
  const events: CalendarEvent[] = [5, 2, 4, 1, 3].map((n) => ({ id: String(n), title: `Event ${n}`, start: new Date(2026, 2, 18, n) }));

  it('keeps the month grid/initial earliest3 and exposes later events through an operable disclosure', () => {
    const onEventClick = vi.fn();
    const onDateClick = vi.fn<(date: Date) => void>();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ view: 'month', events, onEventClick, onDateClick })} /></I18nProvider>);
    expect(container.querySelectorAll('[data-part="date-label"]')).toHaveLength(31);
    expect(container.querySelectorAll('[data-time-slot]')).toHaveLength(0);
    const cell = screen.getByRole('gridcell', { name: /March 18, 2026, 5 events/ });
    expect(Array.from(cell.querySelectorAll('.ds-pattern-calendar-view__event'), (chip) => chip.textContent)).toEqual(['Event 1', 'Event 2', 'Event 3']);
    expect(within(cell).queryByRole('button', { name: 'Event 5' })).toBeNull();
    const more = within(cell).getByRole('button', { name: '+2 more' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(onDateClick).not.toHaveBeenCalled();
    expect(within(cell).getByRole('button', { name: 'Show fewer events' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(within(cell).getByRole('button', { name: 'Event 5' }));
    expect(onEventClick).toHaveBeenCalledExactlyOnceWith(events[0]);
    fireEvent.click(within(cell).getByRole('button', { name: 'Show fewer events' }));
    expect(within(cell).queryByRole('button', { name: 'Event 5' })).toBeNull();
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
  });

  it('reaches additional read-only events with F2 and the disclosure keyboard without creating event actions', () => {
    const onDateClick = vi.fn<(date: Date) => void>();
    render(<I18nProvider locale="en"><ModernCalendarView {...props({ view: 'month', events, onDateClick })} /></I18nProvider>);
    const cell = screen.getByRole('gridcell', { name: /March 18, 2026/ });
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'F2' });
    const more = within(cell).getByRole('button', { name: '+2 more' });
    expect(more).toHaveFocus();
    fireEvent.keyDown(more, { key: 'Enter' });
    expect(within(cell).getByText('Event 5')).toBeInTheDocument();
    expect(within(cell).queryByRole('button', { name: 'Event 5' })).toBeNull();
    expect(onDateClick).not.toHaveBeenCalled();
    fireEvent.keyDown(within(cell).getByRole('button', { name: 'Show fewer events' }), { key: 'Escape' });
    expect(cell).toHaveFocus();
  });

  it('keeps month arrow movement and clamped month navigation unchanged', () => {
    const onDateChange = vi.fn();
    const { container } = render(<I18nProvider locale="en"><ModernCalendarView {...props({ view: 'month', currentDate: new Date(2026, 0, 31, 9), onDateChange })} /></I18nProvider>);
    const cell = screen.getByRole('gridcell', { name: /January 15, 2026/ });
    act(() => cell.focus());
    fireEvent.keyDown(cell, { key: 'ArrowDown' });
    expect(screen.getByRole('gridcell', { name: /January 22, 2026/ })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onDateChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 1, 28, 9));
    expect(container.querySelectorAll('[data-part="date-label"]')).toHaveLength(31);
  });
});
