/**
 * TreeSelect Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeSelect } from './';

// Mock the engine factory
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockTreeSelect = ({
      treeData,
      value,
      defaultValue,
      onChange,
      multiple,
      treeCheckable,
      treeCheckStrictly,
      showSearch,
      filterTreeNode,
      treeDefaultExpandAll,
      treeDefaultExpandedKeys,
      treeExpandedKeys,
      onTreeExpand,
      placeholder,
      disabled,
      allowClear,
      size,
      maxTagCount,
      status,
      notFoundContent,
      loading,
      open,
      onDropdownVisibleChange,
      fieldNames,
      treeLine,
      className,
      style,
      popupClassName,
    }: any) => {
      const currentValue = value ?? defaultValue;
      const isOpen = open ?? false;

      const getDisplayValue = () => {
        if (!currentValue) return '';
        if (Array.isArray(currentValue)) {
          return currentValue.join(', ');
        }
        return String(currentValue);
      };

      const renderTree = (nodes: any[], level = 0) => {
        return nodes?.map((node: any) => (
          <div
            key={node.value}
            data-testid={`tree-node-${node.value}`}
            data-disabled={node.disabled}
            data-level={level}
            style={{ paddingLeft: level * 16 }}
            onClick={() => {
              if (!node.disabled) {
                const newValue = multiple
                  ? [...(Array.isArray(currentValue) ? currentValue : []), node.value]
                  : node.value;
                onChange?.(newValue, [node.title], { triggerValue: node.value });
              }
            }}
          >
            {treeLine && level > 0 && <span data-testid="tree-line">│</span>}
            {treeCheckable && <input type="checkbox" data-testid={`checkbox-${node.value}`} />}
            <span>{node.title}</span>
            {node.children && renderTree(node.children, level + 1)}
          </div>
        ));
      };

      return (
        <div
          data-testid="tree-select"
          data-size={size}
          data-status={status}
          data-disabled={disabled}
          data-multiple={multiple}
          data-checkable={treeCheckable}
          data-check-strictly={treeCheckStrictly}
          data-show-search={showSearch}
          data-allow-clear={allowClear}
          data-loading={loading}
          data-tree-line={treeLine}
          data-expand-all={treeDefaultExpandAll}
          data-max-tag-count={maxTagCount}
          data-open={isOpen}
          className={className}
          style={style}
        >
          <div data-testid="tree-select-selector" onClick={() => !disabled && onDropdownVisibleChange?.(!isOpen)}>
            {currentValue ? (
              <span data-testid="tree-select-value">{getDisplayValue()}</span>
            ) : (
              <span data-testid="tree-select-placeholder">{placeholder}</span>
            )}
          </div>
          {allowClear && currentValue && (
            <button
              data-testid="tree-select-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(multiple ? [] : undefined, [], { triggerValue: '' });
              }}
            />
          )}
          {isOpen && (
            <div data-testid="tree-select-dropdown" className={popupClassName}>
              {loading ? (
                <div data-testid="tree-select-loading">Loading...</div>
              ) : treeData?.length ? (
                <div data-testid="tree-select-tree">
                  {renderTree(treeData)}
                </div>
              ) : (
                <div data-testid="tree-select-empty">{notFoundContent || 'No data'}</div>
              )}
            </div>
          )}
        </div>
      );
    };
    MockTreeSelect.displayName = 'TreeSelect';
    return MockTreeSelect;
  },
}));

const defaultTreeData = [
  {
    value: 'parent-1',
    title: 'Parent 1',
    children: [
      { value: 'child-1-1', title: 'Child 1-1' },
      { value: 'child-1-2', title: 'Child 1-2' },
    ],
  },
  {
    value: 'parent-2',
    title: 'Parent 2',
    children: [
      { value: 'child-2-1', title: 'Child 2-1' },
    ],
  },
];

describe('TreeSelect', () => {
  it('renders correctly', () => {
    render(<TreeSelect treeData={defaultTreeData} />);
    expect(screen.getByTestId('tree-select')).toBeInTheDocument();
  });

  it('renders placeholder when no value', () => {
    render(<TreeSelect treeData={defaultTreeData} placeholder="Please select" />);
    expect(screen.getByTestId('tree-select-placeholder')).toHaveTextContent('Please select');
  });

  describe('value prop', () => {
    it('renders with controlled value', () => {
      render(<TreeSelect treeData={defaultTreeData} value="parent-1" />);
      expect(screen.getByTestId('tree-select-value')).toHaveTextContent('parent-1');
    });

    it('renders with default value', () => {
      render(<TreeSelect treeData={defaultTreeData} defaultValue="child-1-1" />);
      expect(screen.getByTestId('tree-select-value')).toHaveTextContent('child-1-1');
    });

    it('renders with multiple values', () => {
      render(<TreeSelect treeData={defaultTreeData} value={['parent-1', 'parent-2']} multiple />);
      expect(screen.getByTestId('tree-select-value')).toHaveTextContent('parent-1, parent-2');
    });
  });

  describe('disabled prop', () => {
    it('disables the tree select', () => {
      render(<TreeSelect treeData={defaultTreeData} disabled />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('size prop', () => {
    it.each(['small', 'middle', 'large'] as const)('renders size %s', (size) => {
      render(<TreeSelect treeData={defaultTreeData} size={size} />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-size', size);
    });
  });

  describe('status prop', () => {
    it.each(['error', 'warning'] as const)('renders status %s', (status) => {
      render(<TreeSelect treeData={defaultTreeData} status={status} />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-status', status);
    });
  });

  describe('multiple prop', () => {
    it('enables multiple selection mode', () => {
      render(<TreeSelect treeData={defaultTreeData} multiple />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-multiple', 'true');
    });
  });

  describe('treeCheckable prop', () => {
    it('shows checkboxes', () => {
      render(<TreeSelect treeData={defaultTreeData} treeCheckable open />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-checkable', 'true');
      expect(screen.getByTestId('checkbox-parent-1')).toBeInTheDocument();
    });
  });

  describe('treeLine prop', () => {
    it('shows tree lines', () => {
      render(<TreeSelect treeData={defaultTreeData} treeLine open />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-tree-line', 'true');
    });
  });

  describe('allowClear prop', () => {
    it('shows clear button when value exists', () => {
      render(<TreeSelect treeData={defaultTreeData} value="parent-1" allowClear />);
      expect(screen.getByTestId('tree-select-clear')).toBeInTheDocument();
    });

    it('clears value when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<TreeSelect treeData={defaultTreeData} value="parent-1" allowClear onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tree-select-clear'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when node is selected', () => {
      const onChange = vi.fn();
      render(<TreeSelect treeData={defaultTreeData} open onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tree-node-parent-1'));
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('onDropdownVisibleChange callback', () => {
    it('calls onDropdownVisibleChange when dropdown opens', () => {
      const onDropdownVisibleChange = vi.fn();
      render(<TreeSelect treeData={defaultTreeData} onDropdownVisibleChange={onDropdownVisibleChange} />);

      fireEvent.click(screen.getByTestId('tree-select-selector'));
      expect(onDropdownVisibleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('open state', () => {
    it('shows dropdown when open', () => {
      render(<TreeSelect treeData={defaultTreeData} open />);
      expect(screen.getByTestId('tree-select-dropdown')).toBeInTheDocument();
    });

    it('shows tree nodes in dropdown', () => {
      render(<TreeSelect treeData={defaultTreeData} open />);
      expect(screen.getByText('Parent 1')).toBeInTheDocument();
      expect(screen.getByText('Parent 2')).toBeInTheDocument();
    });

    it('shows nested children', () => {
      render(<TreeSelect treeData={defaultTreeData} open />);
      expect(screen.getByText('Child 1-1')).toBeInTheDocument();
      expect(screen.getByText('Child 1-2')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading state', () => {
      render(<TreeSelect treeData={defaultTreeData} open loading />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-loading', 'true');
      expect(screen.getByTestId('tree-select-loading')).toBeInTheDocument();
    });
  });

  describe('disabled nodes', () => {
    it('renders disabled node', () => {
      const treeData = [
        { value: 'opt1', title: 'Option 1' },
        { value: 'opt2', title: 'Option 2', disabled: true },
      ];
      render(<TreeSelect treeData={treeData} open />);
      expect(screen.getByTestId('tree-node-opt2')).toHaveAttribute('data-disabled', 'true');
    });

    it('does not call onChange for disabled nodes', () => {
      const onChange = vi.fn();
      const treeData = [{ value: 'opt1', title: 'Option 1', disabled: true }];
      render(<TreeSelect treeData={treeData} open onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tree-node-opt1'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('notFoundContent', () => {
    it('shows default not found content when no data', () => {
      render(<TreeSelect treeData={[]} open />);
      expect(screen.getByTestId('tree-select-empty')).toHaveTextContent('No data');
    });

    it('shows custom not found content', () => {
      render(<TreeSelect treeData={[]} open notFoundContent="No items found" />);
      expect(screen.getByTestId('tree-select-empty')).toHaveTextContent('No items found');
    });
  });

  describe('showSearch prop', () => {
    it('enables search mode', () => {
      render(<TreeSelect treeData={defaultTreeData} showSearch />);
      expect(screen.getByTestId('tree-select')).toHaveAttribute('data-show-search', 'true');
    });
  });

  it('applies custom className', () => {
    render(<TreeSelect treeData={defaultTreeData} className="custom-tree-select" />);
    expect(screen.getByTestId('tree-select')).toHaveClass('custom-tree-select');
  });

  it('applies custom style', () => {
    render(<TreeSelect treeData={defaultTreeData} style={{ width: 300 }} />);
    expect(screen.getByTestId('tree-select')).toHaveStyle({ width: '300px' });
  });
});

describe('TreeSelect engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<TreeSelect engine={engine} treeData={defaultTreeData} />);
    expect(screen.getByTestId('tree-select')).toBeInTheDocument();
  });
});

describe('TreeSelect tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<TreeSelect treeData={defaultTreeData} />);
    expect(screen.getByTestId('tree-select')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
