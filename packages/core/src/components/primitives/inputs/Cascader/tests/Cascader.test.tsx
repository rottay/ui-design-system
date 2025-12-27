/**
 * Cascader Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cascader } from '../';

// Mock the engine factory
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockCascader = ({
      options,
      value,
      defaultValue,
      onChange,
      displayRender,
      expandTrigger,
      multiple,
      placeholder,
      disabled,
      showSearch,
      allowClear,
      size,
      notFoundContent,
      loading,
      status,
      open,
      onDropdownVisibleChange,
      maxTagCount,
      fieldNames,
      className,
      style,
      popupClassName,
    }: any) => {
      const currentValue = value ?? defaultValue ?? [];
      const isOpen = open ?? false;

      const getDisplayValue = () => {
        if (!currentValue || currentValue.length === 0) return '';
        if (displayRender) {
          return displayRender(currentValue.map(String), []);
        }
        return currentValue.join(' / ');
      };

      return (
        <div
          data-testid="cascader"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          data-multiple={multiple}
          data-allow-clear={allowClear}
          data-show-search={showSearch}
          data-loading={loading}
          data-expand-trigger={expandTrigger}
          data-max-tag-count={maxTagCount}
          data-open={isOpen}
          className={className}
          style={style}
        >
          <div data-testid="cascader-selector" onClick={() => !disabled && onDropdownVisibleChange?.(!isOpen)}>
            {currentValue.length > 0 ? (
              <span data-testid="cascader-value">{getDisplayValue()}</span>
            ) : (
              <span data-testid="cascader-placeholder">{placeholder}</span>
            )}
          </div>
          {allowClear && currentValue.length > 0 && (
            <button
              data-testid="cascader-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.([], []);
              }}
            />
          )}
          {isOpen && (
            <div data-testid="cascader-dropdown" className={popupClassName}>
              {loading ? (
                <div data-testid="cascader-loading">Loading...</div>
              ) : options?.length ? (
                <div data-testid="cascader-menu">
                  {options.map((opt: any) => (
                    <div
                      key={opt.value}
                      data-testid={`option-${opt.value}`}
                      data-disabled={opt.disabled}
                      onClick={() => {
                        if (!opt.disabled) {
                          const newValue = [opt.value];
                          onChange?.(newValue, [opt]);
                        }
                      }}
                    >
                      {opt.label}
                      {opt.children && <span data-testid={`has-children-${opt.value}`}>›</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div data-testid="cascader-empty">{notFoundContent || 'No data'}</div>
              )}
            </div>
          )}
        </div>
      );
    };
    MockCascader.displayName = 'Cascader';
    return MockCascader;
  },
}));

const defaultOptions = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'West Lake' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          { value: 'zhonghuamen', label: 'Zhonghuamen' },
        ],
      },
    ],
  },
];

describe('Cascader', () => {
  it('renders correctly', () => {
    render(<Cascader options={defaultOptions} />);
    expect(screen.getByTestId('cascader')).toBeInTheDocument();
  });

  it('renders placeholder when no value', () => {
    render(<Cascader options={defaultOptions} placeholder="Please select" />);
    expect(screen.getByTestId('cascader-placeholder')).toHaveTextContent('Please select');
  });

  describe('value prop', () => {
    it('renders with controlled value', () => {
      render(<Cascader options={defaultOptions} value={['zhejiang', 'hangzhou']} />);
      expect(screen.getByTestId('cascader-value')).toHaveTextContent('zhejiang / hangzhou');
    });

    it('renders with default value', () => {
      render(<Cascader options={defaultOptions} defaultValue={['jiangsu']} />);
      expect(screen.getByTestId('cascader-value')).toHaveTextContent('jiangsu');
    });
  });

  describe('disabled prop', () => {
    it('disables the cascader', () => {
      render(<Cascader options={defaultOptions} disabled />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
      render(<Cascader options={defaultOptions} size={size} />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-size', size);
    });
  });

  describe('status prop', () => {
    it.each(['error', 'warning'] as const)('renders status %s', (status) => {
      render(<Cascader options={defaultOptions} status={status} />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-status', status);
    });
  });

  describe('multiple prop', () => {
    it('enables multiple selection mode', () => {
      render(<Cascader options={defaultOptions} multiple />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-multiple', 'true');
    });
  });

  describe('expandTrigger prop', () => {
    it.each(['click', 'hover'] as const)('renders expandTrigger %s', (trigger) => {
      render(<Cascader options={defaultOptions} expandTrigger={trigger} />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-expand-trigger', trigger);
    });
  });

  describe('allowClear prop', () => {
    it('shows clear button when value exists', () => {
      render(<Cascader options={defaultOptions} value={['zhejiang']} allowClear />);
      expect(screen.getByTestId('cascader-clear')).toBeInTheDocument();
    });

    it('clears value when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<Cascader options={defaultOptions} value={['zhejiang']} allowClear onChange={onChange} />);

      fireEvent.click(screen.getByTestId('cascader-clear'));
      expect(onChange).toHaveBeenCalledWith([], []);
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when option is selected', () => {
      const onChange = vi.fn();
      render(<Cascader options={defaultOptions} open onChange={onChange} />);

      fireEvent.click(screen.getByTestId('option-zhejiang'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('onDropdownVisibleChange callback', () => {
    it('calls onDropdownVisibleChange when dropdown opens', () => {
      const onDropdownVisibleChange = vi.fn();
      render(<Cascader options={defaultOptions} onDropdownVisibleChange={onDropdownVisibleChange} />);

      fireEvent.click(screen.getByTestId('cascader-selector'));
      expect(onDropdownVisibleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('open state', () => {
    it('shows dropdown when open', () => {
      render(<Cascader options={defaultOptions} open />);
      expect(screen.getByTestId('cascader-dropdown')).toBeInTheDocument();
    });

    it('shows options in dropdown', () => {
      render(<Cascader options={defaultOptions} open />);
      expect(screen.getByText('Zhejiang')).toBeInTheDocument();
      expect(screen.getByText('Jiangsu')).toBeInTheDocument();
    });

    it('shows children indicator', () => {
      render(<Cascader options={defaultOptions} open />);
      expect(screen.getByTestId('has-children-zhejiang')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading state', () => {
      render(<Cascader options={defaultOptions} open loading />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-loading', 'true');
      expect(screen.getByTestId('cascader-loading')).toBeInTheDocument();
    });
  });

  describe('disabled options', () => {
    it('renders disabled option', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2', disabled: true },
      ];
      render(<Cascader options={options} open />);
      expect(screen.getByTestId('option-opt2')).toHaveAttribute('data-disabled', 'true');
    });

    it('does not call onChange for disabled options', () => {
      const onChange = vi.fn();
      const options = [{ value: 'opt1', label: 'Option 1', disabled: true }];
      render(<Cascader options={options} open onChange={onChange} />);

      fireEvent.click(screen.getByTestId('option-opt1'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('notFoundContent', () => {
    it('shows default not found content when no options', () => {
      render(<Cascader options={[]} open />);
      expect(screen.getByTestId('cascader-empty')).toHaveTextContent('No data');
    });

    it('shows custom not found content', () => {
      render(<Cascader options={[]} open notFoundContent="No results found" />);
      expect(screen.getByTestId('cascader-empty')).toHaveTextContent('No results found');
    });
  });

  describe('showSearch prop', () => {
    it('enables search mode', () => {
      render(<Cascader options={defaultOptions} showSearch />);
      expect(screen.getByTestId('cascader')).toHaveAttribute('data-show-search', 'true');
    });
  });

  it('applies custom className', () => {
    render(<Cascader options={defaultOptions} className="custom-cascader" />);
    expect(screen.getByTestId('cascader')).toHaveClass('custom-cascader');
  });

  it('applies custom style', () => {
    render(<Cascader options={defaultOptions} style={{ width: 300 }} />);
    expect(screen.getByTestId('cascader')).toHaveStyle({ width: '300px' });
  });
});
