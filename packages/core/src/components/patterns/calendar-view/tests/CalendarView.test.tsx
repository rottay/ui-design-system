import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../testing/helpers/engine-test-utils';
import type { CalendarViewProps, CalendarEvent } from '../CalendarView.types';
import ClassicCalendarView from '../engines/classic';
import ModernCalendarView from '../engines/modern';
import RusticCalendarView from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<CalendarViewProps<unknown>>> = {
  classic: ClassicCalendarView,
  modern: ModernCalendarView,
  rustic: RusticCalendarView,
};

// Fixed date: March 2026 has 31 days, starts on Sunday
const MARCH_2026 = new Date(2026, 2, 1); // month is 0-indexed

const sampleEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'Team Standup', start: new Date(2026, 2, 5) },
  { id: 'ev-2', title: 'Sprint Review', start: new Date(2026, 2, 12), color: '#e11d48' },
  { id: 'ev-3', title: 'Design Sync', start: new Date(2026, 2, 5) },
  { id: 'ev-4', title: 'All Hands', start: new Date(2026, 2, 20) },
];

function createProps(overrides: Partial<CalendarViewProps<unknown>> = {}): CalendarViewProps<unknown> {
  return {
    events: sampleEvents,
    currentDate: MARCH_2026,
    view: 'month',
    ...overrides,
  };
}

describe('PatternCalendarView', () => {
  // -----------------------------------------------------------------------
  // Month view: correct day headers
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders month view with correct day headers in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (const day of dayNames) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    },
  );

  // -----------------------------------------------------------------------
  // Month view: renders correct number of days
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders all days of March 2026 in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      // March 2026 has 31 days
      for (let d = 1; d <= 31; d++) {
        expect(screen.getByText(String(d))).toBeInTheDocument();
      }
    },
  );

  // -----------------------------------------------------------------------
  // Month header display
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'displays the month and year in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      // toLocaleString('default', { month: 'long', year: 'numeric' }) for March 2026
      expect(screen.getByText(/March/)).toBeInTheDocument();
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Navigation: prev/next month
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'calls onDateChange when navigating to previous month in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDateChange = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDateChange })} />,
        engine,
      );

      // The "<" button navigates to previous month
      const prevButton = screen.getByText('<');
      fireEvent.click(prevButton);

      expect(onDateChange).toHaveBeenCalledTimes(1);
      const calledDate = onDateChange.mock.calls[0][0] as Date;
      // Should navigate to February 2026
      expect(calledDate.getMonth()).toBe(1); // February = 1
      expect(calledDate.getFullYear()).toBe(2026);
    },
  );

  it.each(STABLE_ENGINES)(
    'calls onDateChange when navigating to next month in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDateChange = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDateChange })} />,
        engine,
      );

      // The ">" button navigates to next month
      const nextButton = screen.getByText('>');
      fireEvent.click(nextButton);

      expect(onDateChange).toHaveBeenCalledTimes(1);
      const calledDate = onDateChange.mock.calls[0][0] as Date;
      // Should navigate to April 2026
      expect(calledDate.getMonth()).toBe(3); // April = 3
      expect(calledDate.getFullYear()).toBe(2026);
    },
  );

  // -----------------------------------------------------------------------
  // Today button
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'calls onDateChange with current date on Today button click in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDateChange = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDateChange })} />,
        engine,
      );

      const todayButton = screen.getByText('Today');
      fireEvent.click(todayButton);

      expect(onDateChange).toHaveBeenCalledTimes(1);
      const calledDate = onDateChange.mock.calls[0][0] as Date;
      expect(calledDate).toBeInstanceOf(Date);
    },
  );

  // -----------------------------------------------------------------------
  // Event rendering
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders events on the calendar in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Team Standup')).toBeInTheDocument();
      expect(screen.getByText('Sprint Review')).toBeInTheDocument();
      expect(screen.getByText('Design Sync')).toBeInTheDocument();
      expect(screen.getByText('All Hands')).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Event click handler
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'fires onEventClick when an event is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onEventClick = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onEventClick })} />,
        engine,
      );

      fireEvent.click(screen.getByText('Sprint Review'));

      expect(onEventClick).toHaveBeenCalledTimes(1);
      expect(onEventClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'ev-2', title: 'Sprint Review' }),
      );
    },
  );

  // -----------------------------------------------------------------------
  // Date click handler
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'fires onDateClick when a date cell is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDateClick = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDateClick })} />,
        engine,
      );

      // Click on day 15 (no events on that day, so click targets the cell directly)
      fireEvent.click(screen.getByText('15'));

      expect(onDateClick).toHaveBeenCalledTimes(1);
      const calledDate = onDateClick.mock.calls[0][0] as Date;
      expect(calledDate.getDate()).toBe(15);
      expect(calledDate.getMonth()).toBe(2); // March
    },
  );

  // -----------------------------------------------------------------------
  // Custom event renderer
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'uses renderEvent when provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component
          {...createProps({
            renderEvent: (event) => <span data-testid={`custom-${event.id}`}>{event.title.toUpperCase()}</span>,
          })}
        />,
        engine,
      );

      expect(screen.getByTestId('custom-ev-1')).toBeInTheDocument();
      expect(screen.getByText('TEAM STANDUP')).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders loading state in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ loading: true })} />, engine);

      // In loading state, the calendar grid events should not be visible
      // (classic wraps in Spin, modern/rustic show a loading indicator)
      if (engine === 'classic') {
        // Classic uses Ant's Spin but still renders grid underneath
        expect(screen.getByText(/March/)).toBeInTheDocument();
      } else {
        // Modern and Rustic replace the grid with a loading indicator
        expect(screen.queryByText('Team Standup')).not.toBeInTheDocument();
      }
    },
  );

  // -----------------------------------------------------------------------
  // "+N more" overflow
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'shows overflow indicator when more than 3 events on a single day in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const manyEvents: CalendarEvent[] = [
        { id: 'a', title: 'Event A', start: new Date(2026, 2, 10) },
        { id: 'b', title: 'Event B', start: new Date(2026, 2, 10) },
        { id: 'c', title: 'Event C', start: new Date(2026, 2, 10) },
        { id: 'd', title: 'Event D', start: new Date(2026, 2, 10) },
        { id: 'e', title: 'Event E', start: new Date(2026, 2, 10) },
      ];
      renderWithEngine(
        <Component {...createProps({ events: manyEvents })} />,
        engine,
      );

      // Only first 3 events are rendered, with a "+2 more" overflow
      expect(screen.getByText('Event A')).toBeInTheDocument();
      expect(screen.getByText('Event B')).toBeInTheDocument();
      expect(screen.getByText('Event C')).toBeInTheDocument();
      expect(screen.queryByText('Event D')).not.toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    },
  );

  // -----------------------------------------------------------------------
  // Grid structure: 7-column layout
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders a 7-column grid structure in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(
        <Component {...createProps()} />,
        engine,
      );

      // All engines use a CSS grid with 7 columns
      const grid = container.querySelector(
        '[style*="grid-template-columns"],.grid-cols-7',
      );
      expect(grid).not.toBeNull();
    },
  );

  // -----------------------------------------------------------------------
  // className and style passthrough
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'passes className and style to the root element in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container } = renderWithEngine(
        <Component
          {...createProps({ className: 'cal-custom', style: { maxWidth: 800 } })}
        />,
        engine,
      );

      const root = container.querySelector('.cal-custom');
      expect(root).not.toBeNull();
    },
  );

  // -----------------------------------------------------------------------
  // Empty events array
  // -----------------------------------------------------------------------
  it.each(STABLE_ENGINES)(
    'renders correctly with no events in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ events: [] })} />, engine);

      // Calendar still shows day headers and day numbers
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    },
  );
});
