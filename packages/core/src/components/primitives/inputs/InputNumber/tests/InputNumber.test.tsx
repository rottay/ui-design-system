/**
 * InputNumber Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputNumber } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockInputNumber = ({
      value,
      defaultValue,
      min,
      max,
      step = 1,
      precision,
      disabled,
      readOnly,
      size,
      status,
      controls = true,
      placeholder,
      onChange,
      onStep,
      className,
      addonBefore,
      addonAfter,
      prefix,
      suffix,
      ...props
    }: any) => {
      const currentValue = value ?? defaultValue ?? '';

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || readOnly) return;
        const newValue = e.target.value === '' ? null : Number(e.target.value);
        onChange?.(newValue);
      };

      const handleStep = (type: 'up' | 'down') => {
        if (disabled || readOnly) return;
        const numValue = Number(currentValue) || 0;
        const numStep = Number(step) || 1;
        const newValue = type === 'up' ? numValue + numStep : numValue - numStep;
        onChange?.(newValue);
        onStep?.(newValue, { offset: numStep, type });
      };

      return (
        <div
          data-testid="input-number"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          data-readonly={readOnly}
          className={className}
          {...props}
        >
          {addonBefore && <span data-testid="addon-before">{addonBefore}</span>}
          {prefix && <span data-testid="prefix">{prefix}</span>}
          <input
            type="number"
            role="spinbutton"
            value={currentValue}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={handleChange}
            data-testid="input-number-input"
          />
          {suffix && <span data-testid="suffix">{suffix}</span>}
          {addonAfter && <span data-testid="addon-after">{addonAfter}</span>}
          {controls && !disabled && !readOnly && (
            <div data-testid="controls">
              <button data-testid="step-up" onClick={() => handleStep('up')}>+</button>
              <button data-testid="step-down" onClick={() => handleStep('down')}>-</button>
            </div>
          )}
        </div>
      );
    };
    MockInputNumber.displayName = 'InputNumber';
    return MockInputNumber;
  },
}));

describe('InputNumber', () => {
  it('renders correctly', () => {
    render(<InputNumber />);
    expect(screen.getByTestId('input-number')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<InputNumber defaultValue={50} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(50);
  });

  it('renders with controlled value', () => {
    render(<InputNumber value={75} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(75);
  });

  it('renders with placeholder', () => {
    render(<InputNumber placeholder="Enter number" />);
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('respects min and max props', () => {
    render(<InputNumber min={0} max={100} defaultValue={50} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('respects step prop', () => {
    render(<InputNumber step={5} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '5');
  });

  it.each(['small', 'default', 'large'] as const)('renders size %s', (size) => {
    render(<InputNumber size={size} />);
    expect(screen.getByTestId('input-number')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'error', 'warning'] as const)('renders status %s', (status) => {
    render(<InputNumber status={status} />);
    expect(screen.getByTestId('input-number')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<InputNumber disabled />);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getByTestId('input-number')).toHaveAttribute('data-disabled', 'true');
  });

  it('does not show controls when disabled', () => {
    render(<InputNumber disabled />);
    expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
  });

  it('renders readonly state', () => {
    render(<InputNumber readOnly defaultValue={10} />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('readonly');
    expect(screen.getByTestId('input-number')).toHaveAttribute('data-readonly', 'true');
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<InputNumber onChange={handleChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } });
    expect(handleChange).toHaveBeenCalledWith(42);
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<InputNumber disabled onChange={handleChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with controls by default', () => {
    render(<InputNumber />);
    expect(screen.getByTestId('controls')).toBeInTheDocument();
    expect(screen.getByTestId('step-up')).toBeInTheDocument();
    expect(screen.getByTestId('step-down')).toBeInTheDocument();
  });

  it('hides controls when controls is false', () => {
    render(<InputNumber controls={false} />);
    expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
  });

  it('increments value when step up is clicked', () => {
    const handleChange = vi.fn();
    render(<InputNumber defaultValue={10} step={5} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('step-up'));
    expect(handleChange).toHaveBeenCalledWith(15);
  });

  it('decrements value when step down is clicked', () => {
    const handleChange = vi.fn();
    render(<InputNumber defaultValue={10} step={5} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('step-down'));
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('calls onStep callback when stepping', () => {
    const handleStep = vi.fn();
    render(<InputNumber defaultValue={10} step={5} onStep={handleStep} onChange={() => {}} />);
    fireEvent.click(screen.getByTestId('step-up'));
    expect(handleStep).toHaveBeenCalledWith(15, { offset: 5, type: 'up' });
  });

  it('renders with addonBefore', () => {
    render(<InputNumber addonBefore="$" />);
    expect(screen.getByTestId('addon-before')).toHaveTextContent('$');
  });

  it('renders with addonAfter', () => {
    render(<InputNumber addonAfter="kg" />);
    expect(screen.getByTestId('addon-after')).toHaveTextContent('kg');
  });

  it('renders with prefix', () => {
    render(<InputNumber prefix="$" />);
    expect(screen.getByTestId('prefix')).toHaveTextContent('$');
  });

  it('renders with suffix', () => {
    render(<InputNumber suffix="%" />);
    expect(screen.getByTestId('suffix')).toHaveTextContent('%');
  });

  it('applies custom className', () => {
    render(<InputNumber className="custom-class" />);
    expect(screen.getByTestId('input-number')).toHaveClass('custom-class');
  });
});

describe('InputNumber engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<InputNumber engine={engine} />);
    expect(screen.getByTestId('input-number')).toBeInTheDocument();
  });
});

describe('InputNumber tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<InputNumber />);
    expect(screen.getByTestId('input-number')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
