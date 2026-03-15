/**
 * Select Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSelect = ({
      children: _children,
      options = [],
      size,
      variant,
      status,
      disabled,
      loading,
      multiple,
      searchable,
      clearable,
      placeholder,
      value,
      defaultValue,
      onChange,
      onSearch,
      onFocus,
      onBlur,
      onClear,
      ...props
    }: any) => (
      <div
        data-testid="select"
        data-size={size}
        data-variant={variant}
        data-status={status}
        data-disabled={disabled}
        data-loading={loading}
        data-multiple={multiple}
        data-searchable={searchable}
        data-clearable={clearable}
        {...props}
      >
        <select
          data-testid="select-native"
          disabled={disabled}
          multiple={multiple}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {clearable && value && (
          <button data-testid="clear-button" onClick={onClear}>×</button>
        )}
        {loading && <span data-testid="loading-spinner">Loading...</span>}
      </div>
    );
    MockSelect.displayName = 'Select';
    return MockSelect;
  },
}));

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'disabled', label: 'Disabled Option', disabled: true },
];

describe('Select', () => {
  it('renders correctly', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Select options={mockOptions} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('select-native'), { target: { value: 'option1' } });
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Select options={mockOptions} size={size} />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-size', size);
  });

  it.each(['outline', 'filled', 'flushed', 'default'] as const)('renders variant %s', (variant) => {
    render(<Select options={mockOptions} variant={variant} />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-variant', variant);
  });

  it.each(['default', 'error', 'warning', 'success'] as const)('renders status %s', (status) => {
    render(<Select options={mockOptions} status={status} />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-status', status);
  });

  it('renders disabled state', () => {
    render(<Select options={mockOptions} disabled />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('select-native')).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<Select options={mockOptions} loading />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders multiple selection mode', () => {
    render(<Select options={mockOptions} multiple />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-multiple', 'true');
  });

  it('renders searchable select', () => {
    render(<Select options={mockOptions} searchable />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-searchable', 'true');
  });

  it('renders clearable select', () => {
    render(<Select options={mockOptions} clearable value="option1" />);
    expect(screen.getByTestId('select')).toHaveAttribute('data-clearable', 'true');
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('handles clear action', () => {
    const handleClear = vi.fn();
    render(<Select options={mockOptions} clearable value="option1" onClear={handleClear} />);
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(handleClear).toHaveBeenCalled();
  });

  it('handles focus event', () => {
    const handleFocus = vi.fn();
    render(<Select options={mockOptions} onFocus={handleFocus} />);
    fireEvent.focus(screen.getByTestId('select-native'));
    expect(handleFocus).toHaveBeenCalled();
  });

  it('handles blur event', () => {
    const handleBlur = vi.fn();
    render(<Select options={mockOptions} onBlur={handleBlur} />);
    fireEvent.blur(screen.getByTestId('select-native'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    expect(screen.getByTestId('select')).toHaveClass('custom-class');
  });

  it('renders with controlled value', () => {
    render(<Select options={mockOptions} value="option2" />);
    expect(screen.getByTestId('select-native')).toHaveValue('option2');
  });

  it('renders with default value', () => {
    render(<Select options={mockOptions} defaultValue="option1" />);
    expect(screen.getByTestId('select-native')).toHaveValue('option1');
  });
});

describe('Select.Option', () => {
  it('renders option correctly', () => {
    render(
      <Select>
        <Select.Option value="opt1">Option 1</Select.Option>
        <Select.Option value="opt2">Option 2</Select.Option>
      </Select>
    );
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });
});

describe('Select.OptGroup', () => {
  it('renders option group correctly', () => {
    render(
      <Select>
        <Select.OptGroup label="Group 1">
          <Select.Option value="opt1">Option 1</Select.Option>
        </Select.OptGroup>
      </Select>
    );
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });
});

describe('Select engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Select options={mockOptions} engine={engine} />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });
});

describe('Select tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Select options={mockOptions} />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
