/**
 * DatePicker Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'DateRangePicker') {
      const MockRangePicker = ({
        disabled,
        size,
        status,
        placeholder,
        separator = '~',
        className,
        ...props
      }: any) => (
        <div
          data-testid="range-picker"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          className={className}
          {...props}
        >
          <input
            type="text"
            placeholder={placeholder?.[0]}
            disabled={disabled}
            data-testid="range-picker-start"
          />
          <span data-testid="range-separator">{separator}</span>
          <input
            type="text"
            placeholder={placeholder?.[1]}
            disabled={disabled}
            data-testid="range-picker-end"
          />
        </div>
      );
      MockRangePicker.displayName = 'DatePicker.RangePicker';
      return MockRangePicker;
    }

    const MockDatePicker = ({
      value,
      defaultValue,
      picker = 'date',
      format,
      showTime,
      showToday,
      disabled,
      readOnly,
      size,
      status,
      placeholder,
      allowClear,
      open,
      onChange,
      onOpenChange,
      className,
      ...props
    }: any) => (
      <div
        data-testid="date-picker"
        data-picker={picker}
        data-size={size}
        data-status={status}
        data-disabled={disabled}
        data-readonly={readOnly}
        data-show-time={showTime}
        data-show-today={showToday}
        data-allow-clear={allowClear}
        data-open={open}
        className={className}
        {...props}
      >
        <input
          type="text"
          role="textbox"
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => onChange?.(new Date(e.target.value), e.target.value)}
          data-testid="date-picker-input"
        />
        {allowClear && value && (
          <button data-testid="clear-button" onClick={() => onChange?.(null, '')}>
            ×
          </button>
        )}
      </div>
    );

    MockDatePicker.displayName = 'DatePicker';

    return MockDatePicker;
  },
}));

describe('DatePicker', () => {
  it('renders correctly', () => {
    render(<DatePicker />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<DatePicker placeholder="Select date" />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it.each(['date', 'week', 'month', 'quarter', 'year'] as const)('renders picker mode %s', (picker) => {
    render(<DatePicker picker={picker} />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-picker', picker);
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<DatePicker size={size} />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'error', 'warning'] as const)('renders status %s', (status) => {
    render(<DatePicker status={status} />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<DatePicker disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-disabled', 'true');
  });

  it('renders readonly state', () => {
    render(<DatePicker readOnly />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-readonly', 'true');
  });

  it('renders with showTime enabled', () => {
    render(<DatePicker showTime />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-show-time', 'true');
  });

  it('renders with showToday enabled', () => {
    render(<DatePicker showToday />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-show-today', 'true');
  });

  it('renders with allowClear enabled', () => {
    render(<DatePicker allowClear />);
    expect(screen.getByTestId('date-picker')).toHaveAttribute('data-allow-clear', 'true');
  });

  it('calls onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2024-01-15' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<DatePicker className="custom-class" />);
    expect(screen.getByTestId('date-picker')).toHaveClass('custom-class');
  });
});

describe('DatePicker.RangePicker', () => {
  it('renders correctly', () => {
    render(<DatePicker.RangePicker />);
    expect(screen.getByTestId('range-picker')).toBeInTheDocument();
    expect(screen.getByTestId('range-picker-start')).toBeInTheDocument();
    expect(screen.getByTestId('range-picker-end')).toBeInTheDocument();
  });

  it('renders with placeholders', () => {
    render(<DatePicker.RangePicker placeholder={['Start date', 'End date']} />);
    expect(screen.getByPlaceholderText('Start date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End date')).toBeInTheDocument();
  });

  it('renders with separator', () => {
    render(<DatePicker.RangePicker separator="-" />);
    expect(screen.getByTestId('range-separator')).toHaveTextContent('-');
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<DatePicker.RangePicker size={size} />);
    expect(screen.getByTestId('range-picker')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'error', 'warning'] as const)('renders status %s', (status) => {
    render(<DatePicker.RangePicker status={status} />);
    expect(screen.getByTestId('range-picker')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<DatePicker.RangePicker disabled />);
    expect(screen.getByTestId('range-picker-start')).toBeDisabled();
    expect(screen.getByTestId('range-picker-end')).toBeDisabled();
  });
});

describe('DatePicker engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<DatePicker engine={engine} />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it.each(['classic', 'modern', 'rustic'] as const)('RangePicker works with %s engine', (engine) => {
    render(<DatePicker.RangePicker engine={engine} />);
    expect(screen.getByTestId('range-picker')).toBeInTheDocument();
  });
});

describe('DatePicker tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<DatePicker />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
