/**
 * Mentions Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mentions } from '../';

// Mock the engine factory
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockMentions = ({
      options,
      value,
      defaultValue,
      onChange,
      onSelect,
      onSearch,
      prefix,
      split,
      placeholder,
      disabled,
      readOnly,
      autoSize,
      rows,
      status,
      placement,
      notFoundContent,
      loading,
      filterOption,
      className,
      style,
      textareaClassName,
      popupClassName,
    }: any) => {
      const currentValue = value ?? defaultValue ?? '';
      const prefixChar = Array.isArray(prefix) ? prefix[0] : prefix || '@';

      // Check if dropdown should be shown (when prefix is typed)
      const showDropdown = currentValue.includes(prefixChar);

      return (
        <div
          data-testid="mentions"
          data-status={status}
          data-disabled={disabled}
          data-readonly={readOnly}
          data-loading={loading}
          data-placement={placement}
          data-prefix={prefixChar}
          data-split={split}
          data-rows={rows}
          data-auto-size={autoSize}
          className={className}
          style={style}
        >
          <textarea
            data-testid="mentions-textarea"
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={textareaClassName}
            onChange={(e) => {
              onChange?.(e.target.value);
              // Check if search should be triggered
              const val = e.target.value;
              const lastPrefixIndex = val.lastIndexOf(prefixChar);
              if (lastPrefixIndex >= 0) {
                const searchText = val.slice(lastPrefixIndex + 1);
                onSearch?.(searchText, prefixChar);
              }
            }}
          />
          {showDropdown && !loading && (
            <div data-testid="mentions-dropdown" className={popupClassName}>
              {options?.length ? (
                options.map((opt: any) => (
                  <div
                    key={opt.value}
                    data-testid={`option-${opt.value}`}
                    data-disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onSelect?.(opt, prefixChar);
                        onChange?.(currentValue + opt.value + (split || ' '));
                      }
                    }}
                  >
                    {opt.label || opt.value}
                  </div>
                ))
              ) : (
                <div data-testid="mentions-empty">{notFoundContent || 'No suggestions'}</div>
              )}
            </div>
          )}
          {showDropdown && loading && (
            <div data-testid="mentions-loading">Loading...</div>
          )}
        </div>
      );
    };
    MockMentions.displayName = 'Mentions';
    return MockMentions;
  },
}));

const defaultOptions = [
  { value: 'john', label: 'John Doe' },
  { value: 'jane', label: 'Jane Smith' },
  { value: 'bob', label: 'Bob Wilson' },
];

describe('Mentions', () => {
  it('renders correctly', () => {
    render(<Mentions />);
    expect(screen.getByTestId('mentions')).toBeInTheDocument();
  });

  it('renders textarea', () => {
    render(<Mentions />);
    expect(screen.getByTestId('mentions-textarea')).toBeInTheDocument();
  });

  describe('value prop', () => {
    it('renders with controlled value', () => {
      render(<Mentions value="Hello @" />);
      expect(screen.getByTestId('mentions-textarea')).toHaveValue('Hello @');
    });

    it('renders with default value', () => {
      render(<Mentions defaultValue="Hi @" />);
      expect(screen.getByTestId('mentions-textarea')).toHaveValue('Hi @');
    });
  });

  describe('placeholder prop', () => {
    it('renders placeholder', () => {
      render(<Mentions placeholder="Type @ to mention" />);
      expect(screen.getByTestId('mentions-textarea')).toHaveAttribute('placeholder', 'Type @ to mention');
    });
  });

  describe('disabled prop', () => {
    it('disables the textarea', () => {
      render(<Mentions disabled />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('mentions-textarea')).toBeDisabled();
    });
  });

  describe('readOnly prop', () => {
    it('makes textarea readonly', () => {
      render(<Mentions readOnly />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-readonly', 'true');
    });
  });

  describe('rows prop', () => {
    it('sets textarea rows', () => {
      render(<Mentions rows={5} />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-rows', '5');
    });
  });

  describe('status prop', () => {
    it.each(['error', 'warning'] as const)('renders status %s', (status) => {
      render(<Mentions status={status} />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-status', status);
    });
  });

  describe('placement prop', () => {
    it.each(['top', 'bottom'] as const)('renders placement %s', (placement) => {
      render(<Mentions placement={placement} />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('prefix prop', () => {
    it('uses default @ prefix', () => {
      render(<Mentions />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-prefix', '@');
    });

    it('uses custom prefix', () => {
      render(<Mentions prefix="#" />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-prefix', '#');
    });
  });

  describe('dropdown', () => {
    it('shows dropdown when prefix is typed', () => {
      render(<Mentions options={defaultOptions} value="Hello @" />);
      expect(screen.getByTestId('mentions-dropdown')).toBeInTheDocument();
    });

    it('shows options in dropdown', () => {
      render(<Mentions options={defaultOptions} value="Hello @" />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when typing', () => {
      const onChange = vi.fn();
      render(<Mentions onChange={onChange} />);

      fireEvent.change(screen.getByTestId('mentions-textarea'), { target: { value: 'Hello @' } });
      expect(onChange).toHaveBeenCalledWith('Hello @');
    });
  });

  describe('onSearch callback', () => {
    it('calls onSearch when typing after prefix', () => {
      const onSearch = vi.fn();
      render(<Mentions onSearch={onSearch} />);

      fireEvent.change(screen.getByTestId('mentions-textarea'), { target: { value: '@john' } });
      expect(onSearch).toHaveBeenCalledWith('john', '@');
    });
  });

  describe('onSelect callback', () => {
    it('calls onSelect when option is selected', () => {
      const onSelect = vi.fn();
      render(<Mentions options={defaultOptions} value="@" onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('option-john'));
      expect(onSelect).toHaveBeenCalledWith(defaultOptions[0], '@');
    });
  });

  describe('disabled options', () => {
    it('renders disabled option', () => {
      const options = [
        { value: 'john', label: 'John' },
        { value: 'jane', label: 'Jane', disabled: true },
      ];
      render(<Mentions options={options} value="@" />);
      expect(screen.getByTestId('option-jane')).toHaveAttribute('data-disabled', 'true');
    });

    it('does not call onSelect for disabled options', () => {
      const onSelect = vi.fn();
      const options = [{ value: 'john', disabled: true }];
      render(<Mentions options={options} value="@" onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('option-john'));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows loading state', () => {
      render(<Mentions value="@" loading />);
      expect(screen.getByTestId('mentions')).toHaveAttribute('data-loading', 'true');
      expect(screen.getByTestId('mentions-loading')).toBeInTheDocument();
    });
  });

  describe('notFoundContent', () => {
    it('shows default not found content when no options', () => {
      render(<Mentions options={[]} value="@" />);
      expect(screen.getByTestId('mentions-empty')).toHaveTextContent('No suggestions');
    });

    it('shows custom not found content', () => {
      render(<Mentions options={[]} value="@" notFoundContent="No users found" />);
      expect(screen.getByTestId('mentions-empty')).toHaveTextContent('No users found');
    });
  });

  it('applies custom className', () => {
    render(<Mentions className="custom-mentions" />);
    expect(screen.getByTestId('mentions')).toHaveClass('custom-mentions');
  });

  it('applies custom style', () => {
    render(<Mentions style={{ width: 400 }} />);
    expect(screen.getByTestId('mentions')).toHaveStyle({ width: '400px' });
  });
});

describe('Mentions engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Mentions engine={engine} />);
    expect(screen.getByTestId('mentions')).toBeInTheDocument();
  });
});

describe('Mentions tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Mentions />);
    expect(screen.getByTestId('mentions')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
