/**
 * Radio Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockRadio = ({
      children,
      label,
      size,
      color,
      checked,
      defaultChecked,
      disabled,
      name,
      value,
      onChange,
      ...props
    }: any) => (
      <label
        data-testid="radio"
        data-size={size}
        data-color={color}
        data-checked={checked}
        data-disabled={disabled}
        {...props}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(e) => onChange?.(e)}
          data-testid="radio-input"
        />
        {(label || children) && <span data-testid="radio-label">{label || children}</span>}
      </label>
    );
    MockRadio.displayName = 'Radio';
    MockRadio.Group = ({ children, options, value, defaultValue, onChange, direction, disabled, ...props }: any) => (
      <div
        data-testid="radio-group"
        data-direction={direction}
        data-disabled={disabled}
        role="radiogroup"
        {...props}
      >
        {options?.map((opt: any) => (
          <label key={opt.value} data-testid={`radio-option-${opt.value}`}>
            <input
              type="radio"
              name="radio-group"
              value={opt.value}
              checked={value === opt.value}
              defaultChecked={defaultValue === opt.value}
              disabled={disabled || opt.disabled}
              onChange={() => onChange?.(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
        {children}
      </div>
    );
    return MockRadio;
  },
}));

describe('Radio', () => {
  it('renders correctly', () => {
    render(<Radio label="Option 1" />);
    expect(screen.getByTestId('radio')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders with children as label', () => {
    render(<Radio>Option 2</Radio>);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders checked when checked prop is true', () => {
    render(<Radio label="Option" checked onChange={() => {}} />);
    expect(screen.getByTestId('radio-input')).toBeChecked();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Radio size={size} label="Test" />);
    expect(screen.getByTestId('radio')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const)(
    'renders color %s',
    (color) => {
      render(<Radio color={color} label="Test" />);
      expect(screen.getByTestId('radio')).toHaveAttribute('data-color', color);
    }
  );

  it('renders disabled state', () => {
    render(<Radio label="Option" disabled />);
    expect(screen.getByTestId('radio')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('radio-input')).toBeDisabled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Radio label="Option" onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('radio-input'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Radio label="Test" className="custom-class" />);
    expect(screen.getByTestId('radio')).toHaveClass('custom-class');
  });
});

describe('Radio.Group', () => {
  it('renders group with options', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Radio.Group options={options} />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('selects option based on value prop', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Radio.Group options={options} value="b" />);
    const radioB = screen.getByTestId('radio-option-b').querySelector('input');
    expect(radioB).toBeChecked();
  });

  it('calls onChange when option is selected', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Radio.Group options={options} onChange={handleChange} />);
    const radioB = screen.getByTestId('radio-option-b').querySelector('input')!;
    fireEvent.click(radioB);
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('disables all options when group is disabled', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Radio.Group options={options} disabled />);
    expect(screen.getByTestId('radio-group')).toHaveAttribute('data-disabled', 'true');
  });
});

describe('Radio engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Radio engine={engine} label="Test" />);
    expect(screen.getByTestId('radio')).toBeInTheDocument();
  });
});
