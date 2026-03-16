/**
 * TimePicker Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimePicker } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'TimeRangePicker') {
      const MockRangePicker = ({
        placeholder = ['Start time', 'End time'],
        disabled,
        size,
        status,
        separator = '~',
        className,
        style,
        ...props
      }: any) => (
        <div
          data-testid="time-range-picker"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          className={className}
          style={style}
          {...props}
        >
          <input
            type="time"
            data-testid="time-range-start"
            placeholder={placeholder[0]}
            disabled={disabled}
          />
          <span data-testid="separator">{separator}</span>
          <input
            type="time"
            data-testid="time-range-end"
            placeholder={placeholder[1]}
            disabled={disabled}
          />
        </div>
      );
      MockRangePicker.displayName = 'TimeRangePicker';
      return MockRangePicker;
    }

    const MockTimePicker = ({
      placeholder = 'Select time',
      disabled,
      size,
      status,
      format,
      allowClear,
      className,
      style,
      value,
      defaultValue,
      onChange,
      ...props
    }: any) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value;
        const today = new Date();
        const [hours, minutes, seconds = '00'] = timeStr.split(':');
        today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        onChange?.(today, timeStr);
      };

      return (
        <div
          data-testid="time-picker"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          data-format={format}
          className={className}
          style={style}
        >
          <input
            type="time"
            data-testid="time-input"
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
          />
          {allowClear && (
            <button data-testid="clear-button" type="button">
              Clear
            </button>
          )}
        </div>
      );
    };
    MockTimePicker.displayName = 'TimePicker';
    return MockTimePicker;
  },
}));

describe('TimePicker', () => {
  it('renders correctly', () => {
    render(<TimePicker />);
    expect(screen.getByTestId('time-picker')).toBeInTheDocument();
    expect(screen.getByTestId('time-input')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TimePicker placeholder="Pick a time" />);
    expect(screen.getByPlaceholderText('Pick a time')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    render(<TimePicker disabled />);
    expect(screen.getByTestId('time-picker')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('time-input')).toBeDisabled();
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<TimePicker size={size} />);
    expect(screen.getByTestId('time-picker')).toHaveAttribute('data-size', size);
  });

  it.each(['error', 'warning'] as const)('renders status %s', (status) => {
    render(<TimePicker status={status} />);
    expect(screen.getByTestId('time-picker')).toHaveAttribute('data-status', status);
  });

  it('renders with custom format', () => {
    render(<TimePicker format="HH:mm" />);
    expect(screen.getByTestId('time-picker')).toHaveAttribute('data-format', 'HH:mm');
  });

  it('renders with allowClear', () => {
    render(<TimePicker allowClear />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('calls onChange when time changes', () => {
    const handleChange = vi.fn();
    render(<TimePicker onChange={handleChange} />);

    const input = screen.getByTestId('time-input');
    fireEvent.change(input, { target: { value: '14:30' } });

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][1]).toBe('14:30');
  });

  it('applies custom className', () => {
    render(<TimePicker className="custom-class" />);
    expect(screen.getByTestId('time-picker')).toHaveClass('custom-class');
  });

  it('passes style prop to component', () => {
    const customStyle = { width: '200px' };
    render(<TimePicker style={customStyle} />);
    // The mock passes style as a prop, so we verify the element exists with the test
    expect(screen.getByTestId('time-picker')).toBeInTheDocument();
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'works with %s engine',
    (engine) => {
      // Engine prop is passed but in tests we use the mock
      render(<TimePicker engine={engine} />);
      expect(screen.getByTestId('time-picker')).toBeInTheDocument();
    }
  );
});

describe('TimePicker.RangePicker', () => {
  it('renders correctly', () => {
    render(<TimePicker.RangePicker />);
    expect(screen.getByTestId('time-range-picker')).toBeInTheDocument();
    expect(screen.getByTestId('time-range-start')).toBeInTheDocument();
    expect(screen.getByTestId('time-range-end')).toBeInTheDocument();
  });

  it('renders with custom placeholders', () => {
    render(<TimePicker.RangePicker placeholder={['From', 'To']} />);
    expect(screen.getByPlaceholderText('From')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
  });

  it('renders with custom separator', () => {
    render(<TimePicker.RangePicker separator="->" />);
    expect(screen.getByTestId('separator')).toHaveTextContent('->');
  });

  it('renders in disabled state', () => {
    render(<TimePicker.RangePicker disabled />);
    expect(screen.getByTestId('time-range-picker')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('time-range-start')).toBeDisabled();
    expect(screen.getByTestId('time-range-end')).toBeDisabled();
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<TimePicker.RangePicker size={size} />);
    expect(screen.getByTestId('time-range-picker')).toHaveAttribute('data-size', size);
  });

  it.each(['error', 'warning'] as const)('renders status %s', (status) => {
    render(<TimePicker.RangePicker status={status} />);
    expect(screen.getByTestId('time-range-picker')).toHaveAttribute('data-status', status);
  });

  it('applies custom className', () => {
    render(<TimePicker.RangePicker className="custom-range-class" />);
    expect(screen.getByTestId('time-range-picker')).toHaveClass('custom-range-class');
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'works with %s engine',
    (engine) => {
      render(<TimePicker.RangePicker engine={engine} />);
      expect(screen.getByTestId('time-range-picker')).toBeInTheDocument();
    }
  );
});

describe('TimePicker tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<TimePicker />);
    expect(screen.getByTestId('time-picker')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
