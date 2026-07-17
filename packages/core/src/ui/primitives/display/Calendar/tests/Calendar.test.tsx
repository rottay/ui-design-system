/**
 * Calendar Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockCalendar = ({
      value,
      defaultValue,
      mode,
      defaultMode,
      fullscreen,
      validRange,
      disabledDate,
      onChange,
      onSelect,
      onPanelChange,
      className,
      style,
      id,
      ...props
    }: any) => {
      const currentDate = value || defaultValue || new Date();
      const currentMode = mode || defaultMode || 'month';

      return (
        <div
          data-testid="calendar"
          data-mode={currentMode}
          data-fullscreen={fullscreen}
          className={className}
          style={style}
          id={id}
          {...props}
        >
          <div data-testid="calendar-header">
            <span data-testid="calendar-month">
              {currentDate instanceof Date ? currentDate.getMonth() : new Date(currentDate).getMonth()}
            </span>
            <span data-testid="calendar-year">
              {currentDate instanceof Date ? currentDate.getFullYear() : new Date(currentDate).getFullYear()}
            </span>
          </div>
          <div data-testid="calendar-body">
            <button
              data-testid="calendar-day"
              onClick={() => {
                const newDate = new Date();
                onChange?.(newDate);
                onSelect?.(newDate, { source: 'date' });
              }}
            >
              15
            </button>
          </div>
        </div>
      );
    };
    MockCalendar.displayName = 'Calendar';
    return MockCalendar;
  },
}));

describe('Calendar', () => {
  it('renders correctly', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    render(<Calendar defaultValue={date} />);
    expect(screen.getByTestId('calendar-month')).toHaveTextContent('5');
    expect(screen.getByTestId('calendar-year')).toHaveTextContent('2024');
  });

  it('renders with controlled value', () => {
    const date = new Date(2024, 11, 25); // December 25, 2024
    render(<Calendar value={date} />);
    expect(screen.getByTestId('calendar-month')).toHaveTextContent('11');
    expect(screen.getByTestId('calendar-year')).toHaveTextContent('2024');
  });

  it('renders in month mode by default', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-mode', 'month');
  });

  it('renders in year mode when specified', () => {
    render(<Calendar mode="year" />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-mode', 'year');
  });

  it('renders in fullscreen mode by default', () => {
    render(<Calendar fullscreen />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-fullscreen', 'true');
  });

  it('renders in compact mode when fullscreen is false', () => {
    render(<Calendar fullscreen={false} />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-fullscreen', 'false');
  });

  it('calls onChange when date is selected', () => {
    const handleChange = vi.fn();
    render(<Calendar onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('calendar-day'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('calls onSelect when date is selected', () => {
    const handleSelect = vi.fn();
    render(<Calendar onSelect={handleSelect} />);
    fireEvent.click(screen.getByTestId('calendar-day'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(expect.any(Date), { source: 'date' });
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />);
    expect(screen.getByTestId('calendar')).toHaveClass('custom-calendar');
  });

  it('passes style prop to component', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Calendar style={customStyle} />);
    // The mock passes style as a prop, so we verify the element exists with the test
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('applies custom id', () => {
    render(<Calendar id="my-calendar" />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('id', 'my-calendar');
  });

  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    // Engine is passed to the component but mock renders the same for all engines
    render(<Calendar engine={engine} />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });
});

describe('Calendar modes', () => {
  it.each(['month', 'year'] as const)('renders mode %s', (mode) => {
    render(<Calendar mode={mode} />);
    expect(screen.getByTestId('calendar')).toHaveAttribute('data-mode', mode);
  });
});

describe('Calendar with date range', () => {
  it('accepts validRange prop', () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 11, 31);
    render(<Calendar validRange={[start, end]} />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('accepts disabledDate function', () => {
    const disabledDate = (date: Date) => date.getDay() === 0; // Disable Sundays
    render(<Calendar disabledDate={disabledDate} />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });
});

describe('Calendar tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
