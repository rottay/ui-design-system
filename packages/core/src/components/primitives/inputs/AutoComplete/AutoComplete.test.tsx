/**
 * AutoComplete Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutoComplete } from './';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockAutoComplete = ({
      options,
      value,
      defaultValue,
      onChange,
      onSearch,
      onSelect,
      filterOption,
      placeholder,
      disabled,
      allowClear,
      autoFocus,
      defaultOpen,
      open,
      onDropdownVisibleChange,
      size,
      status,
      notFoundContent,
      popupClassName,
      popupMatchSelectWidth,
      className,
      style,
    }: any) => {
      const currentValue = value ?? defaultValue ?? '';
      const isOpen = open ?? defaultOpen ?? false;

      return (
        <div
          data-testid="autocomplete"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          data-allow-clear={allowClear}
          data-auto-focus={autoFocus}
          data-open={isOpen}
          data-popup-match-width={popupMatchSelectWidth}
          className={className}
          style={style}
        >
          <input
            data-testid="autocomplete-input"
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={(e) => {
              onChange?.(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
          {allowClear && currentValue && (
            <button
              data-testid="autocomplete-clear"
              onClick={() => onChange?.('')}
            />
          )}
          {isOpen && (
            <div data-testid="autocomplete-dropdown" className={popupClassName}>
              {options?.length ? (
                options.map((opt: any) => (
                  <div
                    key={opt.value}
                    data-testid={`option-${opt.value}`}
                    data-disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange?.(opt.value);
                        onSelect?.(opt.value, opt);
                        onDropdownVisibleChange?.(false);
                      }
                    }}
                  >
                    {opt.label || opt.value}
                  </div>
                ))
              ) : (
                <div data-testid="not-found">{notFoundContent || 'No data'}</div>
              )}
            </div>
          )}
        </div>
      );
    };
    MockAutoComplete.displayName = 'AutoComplete';
    return MockAutoComplete;
  },
}));

const defaultOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('AutoComplete', () => {
  it('renders correctly', () => {
    render(<AutoComplete options={defaultOptions} />);
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
  });

  it('renders input element', () => {
    render(<AutoComplete options={defaultOptions} />);
    expect(screen.getByTestId('autocomplete-input')).toBeInTheDocument();
  });

  describe('value prop', () => {
    it('renders with controlled value', () => {
      render(<AutoComplete options={defaultOptions} value="test" />);
      expect(screen.getByTestId('autocomplete-input')).toHaveValue('test');
    });

    it('renders with default value', () => {
      render(<AutoComplete options={defaultOptions} defaultValue="default" />);
      expect(screen.getByTestId('autocomplete-input')).toHaveValue('default');
    });
  });

  describe('placeholder prop', () => {
    it('renders placeholder', () => {
      render(<AutoComplete options={defaultOptions} placeholder="Type to search" />);
      expect(screen.getByTestId('autocomplete-input')).toHaveAttribute('placeholder', 'Type to search');
    });
  });

  describe('disabled prop', () => {
    it('disables the input', () => {
      render(<AutoComplete options={defaultOptions} disabled />);
      expect(screen.getByTestId('autocomplete')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('autocomplete-input')).toBeDisabled();
    });
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
      render(<AutoComplete options={defaultOptions} size={size} />);
      expect(screen.getByTestId('autocomplete')).toHaveAttribute('data-size', size);
    });
  });

  describe('status prop', () => {
    it.each(['error', 'warning'] as const)('renders status %s', (status) => {
      render(<AutoComplete options={defaultOptions} status={status} />);
      expect(screen.getByTestId('autocomplete')).toHaveAttribute('data-status', status);
    });
  });

  describe('allowClear prop', () => {
    it('shows clear button when value exists', () => {
      render(<AutoComplete options={defaultOptions} value="test" allowClear />);
      expect(screen.getByTestId('autocomplete-clear')).toBeInTheDocument();
    });

    it('clears value when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<AutoComplete options={defaultOptions} value="test" allowClear onChange={onChange} />);

      fireEvent.click(screen.getByTestId('autocomplete-clear'));
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when input value changes', () => {
      const onChange = vi.fn();
      render(<AutoComplete options={defaultOptions} onChange={onChange} />);

      fireEvent.change(screen.getByTestId('autocomplete-input'), { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalledWith('new value');
    });
  });

  describe('onSearch callback', () => {
    it('calls onSearch when typing', () => {
      const onSearch = vi.fn();
      render(<AutoComplete options={defaultOptions} onSearch={onSearch} />);

      fireEvent.change(screen.getByTestId('autocomplete-input'), { target: { value: 'search' } });
      expect(onSearch).toHaveBeenCalledWith('search');
    });
  });

  describe('onSelect callback', () => {
    it('calls onSelect when option is selected', () => {
      const onSelect = vi.fn();
      render(<AutoComplete options={defaultOptions} open onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('option-option1'));
      expect(onSelect).toHaveBeenCalledWith('option1', defaultOptions[0]);
    });
  });

  describe('open state', () => {
    it('shows dropdown when open', () => {
      render(<AutoComplete options={defaultOptions} open />);
      expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
    });

    it('shows options in dropdown', () => {
      render(<AutoComplete options={defaultOptions} open />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  describe('disabled options', () => {
    it('renders disabled option', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2', disabled: true },
      ];
      render(<AutoComplete options={options} open />);
      expect(screen.getByTestId('option-opt2')).toHaveAttribute('data-disabled', 'true');
    });

    it('does not call onSelect for disabled options', () => {
      const onSelect = vi.fn();
      const options = [{ value: 'opt1', disabled: true }];
      render(<AutoComplete options={options} open onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('option-opt1'));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('notFoundContent', () => {
    it('shows default not found content when no options', () => {
      render(<AutoComplete options={[]} open />);
      expect(screen.getByTestId('not-found')).toHaveTextContent('No data');
    });

    it('shows custom not found content', () => {
      render(<AutoComplete options={[]} open notFoundContent="No results" />);
      expect(screen.getByTestId('not-found')).toHaveTextContent('No results');
    });
  });

  it('applies custom className', () => {
    render(<AutoComplete options={defaultOptions} className="custom-autocomplete" />);
    expect(screen.getByTestId('autocomplete')).toHaveClass('custom-autocomplete');
  });

  it('applies custom style', () => {
    render(<AutoComplete options={defaultOptions} style={{ width: 200 }} />);
    expect(screen.getByTestId('autocomplete')).toHaveStyle({ width: '200px' });
  });
});

describe('AutoComplete engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<AutoComplete engine={engine} options={defaultOptions} />);
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
  });
});

describe('AutoComplete tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<AutoComplete options={defaultOptions} />);
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
