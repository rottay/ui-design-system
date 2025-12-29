/**
 * Transfer Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Transfer } from '../';

// Mock the engine factory
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTransfer = ({
      dataSource,
      targetKeys,
      defaultTargetKeys,
      onChange,
      onSelectChange,
      onSearch,
      titles,
      operations,
      showSearch,
      filterOption,
      render: renderItem,
      disabled,
      listStyle,
      locale,
      showSelectAll,
      oneWay,
      pagination,
      className,
      style,
    }: any) => {
      const currentTargetKeys = targetKeys ?? defaultTargetKeys ?? [];
      const [leftTitle, rightTitle] = titles ?? ['Source', 'Target'];
      const [toRight, toLeft] = operations ?? ['>', '<'];

      const sourceItems = dataSource?.filter((item: any) => !currentTargetKeys.includes(item.key)) ?? [];
      const targetItems = dataSource?.filter((item: any) => currentTargetKeys.includes(item.key)) ?? [];

      return (
        <div
          data-testid="transfer"
          data-disabled={disabled}
          data-show-search={showSearch}
          data-show-select-all={showSelectAll}
          data-one-way={oneWay}
          data-pagination={!!pagination}
          className={className}
          style={style}
        >
          {/* Source Panel */}
          <div data-testid="source-panel" style={listStyle}>
            <div data-testid="source-title">{leftTitle}</div>
            {showSelectAll && (
              <input type="checkbox" data-testid="source-select-all" />
            )}
            {showSearch && (
              <input
                data-testid="source-search"
                placeholder={locale?.searchPlaceholder || 'Search'}
                onChange={(e) => onSearch?.('left', e.target.value)}
              />
            )}
            <div data-testid="source-list">
              {sourceItems.length ? (
                sourceItems.map((item: any) => (
                  <div
                    key={item.key}
                    data-testid={`source-item-${item.key}`}
                    data-disabled={item.disabled}
                  >
                    <input
                      type="checkbox"
                      data-testid={`source-checkbox-${item.key}`}
                      disabled={item.disabled || disabled}
                      onChange={() => onSelectChange?.([item.key], [])}
                    />
                    {renderItem ? renderItem(item) : item.title}
                  </div>
                ))
              ) : (
                <div data-testid="source-empty">{locale?.notFoundContent || 'No data'}</div>
              )}
            </div>
            <div data-testid="source-count">
              {sourceItems.length} {sourceItems.length === 1 ? locale?.itemUnit || 'item' : locale?.itemsUnit || 'items'}
            </div>
          </div>

          {/* Operation Buttons */}
          <div data-testid="transfer-operations">
            <button
              data-testid="btn-to-right"
              disabled={disabled}
              onClick={() => onChange?.(currentTargetKeys, 'right', [])}
            >
              {toRight}
            </button>
            {!oneWay && (
              <button
                data-testid="btn-to-left"
                disabled={disabled}
                onClick={() => onChange?.(currentTargetKeys, 'left', [])}
              >
                {toLeft}
              </button>
            )}
          </div>

          {/* Target Panel */}
          <div data-testid="target-panel" style={listStyle}>
            <div data-testid="target-title">{rightTitle}</div>
            {showSelectAll && (
              <input type="checkbox" data-testid="target-select-all" />
            )}
            {showSearch && (
              <input
                data-testid="target-search"
                placeholder={locale?.searchPlaceholder || 'Search'}
                onChange={(e) => onSearch?.('right', e.target.value)}
              />
            )}
            <div data-testid="target-list">
              {targetItems.length ? (
                targetItems.map((item: any) => (
                  <div
                    key={item.key}
                    data-testid={`target-item-${item.key}`}
                    data-disabled={item.disabled}
                  >
                    <input
                      type="checkbox"
                      data-testid={`target-checkbox-${item.key}`}
                      disabled={item.disabled || disabled}
                    />
                    {renderItem ? renderItem(item) : item.title}
                  </div>
                ))
              ) : (
                <div data-testid="target-empty">{locale?.notFoundContent || 'No data'}</div>
              )}
            </div>
            <div data-testid="target-count">
              {targetItems.length} {targetItems.length === 1 ? locale?.itemUnit || 'item' : locale?.itemsUnit || 'items'}
            </div>
          </div>
        </div>
      );
    };
    MockTransfer.displayName = 'Transfer';
    return MockTransfer;
  },
}));

const defaultDataSource = [
  { key: '1', title: 'Item 1' },
  { key: '2', title: 'Item 2' },
  { key: '3', title: 'Item 3' },
  { key: '4', title: 'Item 4' },
];

describe('Transfer', () => {
  it('renders correctly', () => {
    render(<Transfer dataSource={defaultDataSource} />);
    expect(screen.getByTestId('transfer')).toBeInTheDocument();
  });

  it('renders source and target panels', () => {
    render(<Transfer dataSource={defaultDataSource} />);
    expect(screen.getByTestId('source-panel')).toBeInTheDocument();
    expect(screen.getByTestId('target-panel')).toBeInTheDocument();
  });

  it('renders operation buttons', () => {
    render(<Transfer dataSource={defaultDataSource} />);
    expect(screen.getByTestId('btn-to-right')).toBeInTheDocument();
    expect(screen.getByTestId('btn-to-left')).toBeInTheDocument();
  });

  describe('dataSource', () => {
    it('renders all items in source by default', () => {
      render(<Transfer dataSource={defaultDataSource} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByText('Item 4')).toBeInTheDocument();
    });
  });

  describe('targetKeys prop', () => {
    it('moves items to target panel', () => {
      render(<Transfer dataSource={defaultDataSource} targetKeys={['2', '3']} />);
      expect(screen.getByTestId('target-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('target-item-3')).toBeInTheDocument();
    });

    it('removes items from source panel', () => {
      render(<Transfer dataSource={defaultDataSource} targetKeys={['1', '2']} />);
      expect(screen.queryByTestId('source-item-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('source-item-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('source-item-3')).toBeInTheDocument();
    });
  });

  describe('titles prop', () => {
    it('renders custom titles', () => {
      render(<Transfer dataSource={defaultDataSource} titles={['Available', 'Selected']} />);
      expect(screen.getByTestId('source-title')).toHaveTextContent('Available');
      expect(screen.getByTestId('target-title')).toHaveTextContent('Selected');
    });
  });

  describe('operations prop', () => {
    it('renders custom operation buttons', () => {
      render(<Transfer dataSource={defaultDataSource} operations={['Add →', '← Remove']} />);
      expect(screen.getByTestId('btn-to-right')).toHaveTextContent('Add →');
      expect(screen.getByTestId('btn-to-left')).toHaveTextContent('← Remove');
    });
  });

  describe('disabled prop', () => {
    it('disables the transfer', () => {
      render(<Transfer dataSource={defaultDataSource} disabled />);
      expect(screen.getByTestId('transfer')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('btn-to-right')).toBeDisabled();
      expect(screen.getByTestId('btn-to-left')).toBeDisabled();
    });
  });

  describe('showSearch prop', () => {
    it('shows search inputs', () => {
      render(<Transfer dataSource={defaultDataSource} showSearch />);
      expect(screen.getByTestId('transfer')).toHaveAttribute('data-show-search', 'true');
      expect(screen.getByTestId('source-search')).toBeInTheDocument();
      expect(screen.getByTestId('target-search')).toBeInTheDocument();
    });
  });

  describe('showSelectAll prop', () => {
    it('shows select all checkboxes', () => {
      render(<Transfer dataSource={defaultDataSource} showSelectAll />);
      expect(screen.getByTestId('source-select-all')).toBeInTheDocument();
      expect(screen.getByTestId('target-select-all')).toBeInTheDocument();
    });
  });

  describe('oneWay prop', () => {
    it('hides left button', () => {
      render(<Transfer dataSource={defaultDataSource} oneWay />);
      expect(screen.getByTestId('transfer')).toHaveAttribute('data-one-way', 'true');
      expect(screen.getByTestId('btn-to-right')).toBeInTheDocument();
      expect(screen.queryByTestId('btn-to-left')).not.toBeInTheDocument();
    });
  });

  describe('disabled items', () => {
    it('renders disabled item', () => {
      const dataSource = [
        { key: '1', title: 'Item 1' },
        { key: '2', title: 'Item 2', disabled: true },
      ];
      render(<Transfer dataSource={dataSource} />);
      expect(screen.getByTestId('source-item-2')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('source-checkbox-2')).toBeDisabled();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when moving to right', () => {
      const onChange = vi.fn();
      render(<Transfer dataSource={defaultDataSource} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('btn-to-right'));
      expect(onChange).toHaveBeenCalledWith([], 'right', []);
    });
  });

  describe('onSearch callback', () => {
    it('calls onSearch when typing in source search', () => {
      const onSearch = vi.fn();
      render(<Transfer dataSource={defaultDataSource} showSearch onSearch={onSearch} />);

      fireEvent.change(screen.getByTestId('source-search'), { target: { value: 'test' } });
      expect(onSearch).toHaveBeenCalledWith('left', 'test');
    });

    it('calls onSearch when typing in target search', () => {
      const onSearch = vi.fn();
      render(<Transfer dataSource={defaultDataSource} showSearch onSearch={onSearch} />);

      fireEvent.change(screen.getByTestId('target-search'), { target: { value: 'test' } });
      expect(onSearch).toHaveBeenCalledWith('right', 'test');
    });
  });

  describe('onSelectChange callback', () => {
    it('calls onSelectChange when selecting item', () => {
      const onSelectChange = vi.fn();
      render(<Transfer dataSource={defaultDataSource} onSelectChange={onSelectChange} />);

      fireEvent.click(screen.getByTestId('source-checkbox-1'));
      expect(onSelectChange).toHaveBeenCalledWith(['1'], []);
    });
  });

  describe('locale prop', () => {
    it('shows custom locale text', () => {
      render(
        <Transfer
          dataSource={[]}
          locale={{ notFoundContent: 'Nothing here', searchPlaceholder: 'Find...' }}
          showSearch
        />
      );
      expect(screen.getByTestId('source-empty')).toHaveTextContent('Nothing here');
      expect(screen.getByTestId('source-search')).toHaveAttribute('placeholder', 'Find...');
    });
  });

  describe('empty state', () => {
    it('shows empty message when no items', () => {
      render(<Transfer dataSource={[]} />);
      expect(screen.getByTestId('source-empty')).toHaveTextContent('No data');
    });
  });

  it('applies custom className', () => {
    render(<Transfer dataSource={defaultDataSource} className="custom-transfer" />);
    expect(screen.getByTestId('transfer')).toHaveClass('custom-transfer');
  });

  it('applies custom style', () => {
    render(<Transfer dataSource={defaultDataSource} style={{ width: 600 }} />);
    expect(screen.getByTestId('transfer')).toHaveStyle({ width: '600px' });
  });
});

describe('Transfer engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Transfer engine={engine} dataSource={defaultDataSource} />);
    expect(screen.getByTestId('transfer')).toBeInTheDocument();
  });
});

describe('Transfer tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Transfer dataSource={defaultDataSource} />);
    expect(screen.getByTestId('transfer')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
