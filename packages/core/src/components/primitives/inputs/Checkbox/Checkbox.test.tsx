/**
 * Checkbox Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockCheckbox = ({
      children,
      label,
      checked,
      defaultChecked,
      indeterminate,
      disabled,
      size,
      color,
      onChange,
      ...props
    }: any) => {
      const displayLabel = label || children;
      return (
        <label
          data-testid="checkbox"
          data-size={size}
          data-color={color}
          data-checked={checked}
          data-indeterminate={indeterminate}
          data-disabled={disabled}
          {...props}
        >
          <input
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked, e)}
            data-testid="checkbox-input"
          />
          {displayLabel && <span data-testid="checkbox-label">{displayLabel}</span>}
        </label>
      );
    };
    MockCheckbox.displayName = 'Checkbox';
    MockCheckbox.Group = ({ children, options, value, onChange, direction, disabled, ...props }: any) => (
      <div
        data-testid="checkbox-group"
        data-direction={direction}
        data-disabled={disabled}
        role="group"
        {...props}
      >
        {options
          ? options.map((opt: any) => (
              <label key={opt.value} data-testid={`checkbox-option-${opt.value}`}>
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={value?.includes(opt.value)}
                  disabled={disabled || opt.disabled}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), opt.value]
                      : (value || []).filter((v: any) => v !== opt.value);
                    onChange?.(newValue);
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))
          : children}
      </div>
    );
    return MockCheckbox;
  },
}));

describe('Checkbox', () => {
  it('renders correctly', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders with label prop', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByTestId('checkbox-label')).toHaveTextContent('Accept terms');
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-checked', 'true');
  });

  it('renders indeterminate state', () => {
    render(<Checkbox indeterminate>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-indeterminate', 'true');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Checkbox size={size}>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const)(
    'renders color %s',
    (color) => {
      render(<Checkbox color={color}>Test</Checkbox>);
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-color', color);
    }
  );

  it('renders disabled state', () => {
    render(<Checkbox disabled>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('checkbox-input')).toBeDisabled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange}>Test</Checkbox>);
    fireEvent.click(screen.getByTestId('checkbox-input'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Checkbox className="custom-class">Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toHaveClass('custom-class');
  });
});

describe('Checkbox.Group', () => {
  it('renders group with options', () => {
    const options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    render(<Checkbox.Group options={options} />);
    expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders with selected values', () => {
    const options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    render(<Checkbox.Group options={options} value={['apple']} />);
    const appleInput = screen.getByTestId('checkbox-option-apple').querySelector('input');
    expect(appleInput).toBeChecked();
  });

  it('calls onChange with updated values', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    render(<Checkbox.Group options={options} value={[]} onChange={handleChange} />);
    const appleInput = screen.getByTestId('checkbox-option-apple').querySelector('input')!;
    fireEvent.click(appleInput);
    expect(handleChange).toHaveBeenCalledWith(['apple']);
  });

  it('disables all options when group is disabled', () => {
    const options = [{ value: 'apple', label: 'Apple' }];
    render(<Checkbox.Group options={options} disabled />);
    expect(screen.getByTestId('checkbox-group')).toHaveAttribute('data-disabled', 'true');
  });
});

describe('Checkbox engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Checkbox engine={engine}>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });
});

describe('Checkbox tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Checkbox>Test</Checkbox>);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
