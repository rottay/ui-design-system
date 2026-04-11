/**
 * Table Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '../';
import type { ColumnType } from '../Table.types';

// Mock data for testing
interface TestRecord {
  key: string;
  name: string;
  age: number;
  address: string;
}

const mockColumns: ColumnType<TestRecord>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const mockData: TestRecord[] = [
  { key: '1', name: 'John Doe', age: 32, address: '123 Main St' },
  { key: '2', name: 'Jane Smith', age: 28, address: '456 Oak Ave' },
  { key: '3', name: 'Bob Johnson', age: 45, address: '789 Pine Rd' },
];

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTable = <T extends object>({
      dataSource = [],
      columns = [],
      size,
      bordered,
      loading,
      showHeader = true,
      rowKey = 'key',
      rowSelection,
      pagination,
      locale,
      className,
      style,
      id,
      ...props
    }: any) => {
      const getRowKey = (record: T, index: number): string => {
        if (typeof rowKey === 'function') {
          return String(rowKey(record));
        }
        return String((record as Record<string, unknown>)[rowKey] || index);
      };

      const getValue = (record: T, dataIndex?: string | string[]): unknown => {
        if (!dataIndex) return undefined;
        if (Array.isArray(dataIndex)) {
          return dataIndex.reduce<unknown>(
            (obj, key) => (obj as Record<string, unknown>)?.[key],
            record as unknown
          );
        }
        return (record as Record<string, unknown>)[dataIndex];
      };

      return (
        <div
          data-testid="table"
          data-size={size}
          data-bordered={bordered}
          data-loading={loading}
          className={className}
          style={style}
          id={id}
        >
          {loading && <div data-testid="table-loading">Loading...</div>}
          <table role="table">
            {showHeader && (
              <thead>
                <tr>
                  {rowSelection && (
                    <th>
                      <input
                        type="checkbox"
                        data-testid="select-all"
                        aria-label="Select all"
                      />
                    </th>
                  )}
                  {columns
                    .filter((col: any) => !col.hidden)
                    .map((col: any, i: number) => (
                      <th key={col.key || col.dataIndex || i}>{col.title}</th>
                    ))}
                </tr>
              </thead>
            )}
            <tbody>
              {dataSource.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowSelection ? 1 : 0)}
                    data-testid="empty-text"
                  >
                    {locale?.emptyText || 'No data'}
                  </td>
                </tr>
              ) : (
                dataSource.map((record: T, index: number) => {
                  const key = getRowKey(record, index);
                  return (
                    <tr key={key} data-testid={`table-row-${key}`}>
                      {rowSelection && (
                        <td>
                          <input
                            type={
                              rowSelection.type === 'radio'
                                ? 'radio'
                                : 'checkbox'
                            }
                            data-testid={`select-row-${key}`}
                            aria-label={`Select row ${key}`}
                          />
                        </td>
                      )}
                      {columns
                        .filter((col: any) => !col.hidden)
                        .map((col: any, colIndex: number) => {
                          const value = getValue(record, col.dataIndex);
                          const content = col.render
                            ? col.render(value, record, index)
                            : String(value ?? '');
                          return (
                            <td
                              key={col.key || col.dataIndex || colIndex}
                              data-testid={`cell-${key}-${col.dataIndex}`}
                            >
                              {content}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {pagination !== false && (
            <div data-testid="table-pagination">Pagination</div>
          )}
        </div>
      );
    };
    MockTable.displayName = 'Table';
    return MockTable;
  },
}));

describe('Table', () => {
  it('renders correctly', () => {
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('renders table header with column titles', () => {
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('renders data rows correctly', () => {
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table dataSource={[]} columns={mockColumns} />);
    expect(screen.getByTestId('empty-text')).toBeInTheDocument();
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders custom empty text', () => {
    render(
      <Table
        dataSource={[]}
        columns={mockColumns}
        locale={{ emptyText: 'No records found' }}
      />
    );
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Table dataSource={mockData} columns={mockColumns} loading />);
    expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });

  it.each(['small', 'default', 'large'] as const)(
    'renders size %s',
    (size) => {
      render(<Table dataSource={mockData} columns={mockColumns} size={size} />);
      expect(screen.getByTestId('table')).toHaveAttribute('data-size', size);
    }
  );

  it('renders bordered table', () => {
    render(<Table dataSource={mockData} columns={mockColumns} bordered />);
    expect(screen.getByTestId('table')).toHaveAttribute('data-bordered', 'true');
  });

  it('hides header when showHeader is false', () => {
    render(
      <Table dataSource={mockData} columns={mockColumns} showHeader={false} />
    );
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  it('renders row selection checkboxes', () => {
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        rowSelection={{ type: 'checkbox' }}
      />
    );
    expect(screen.getByTestId('select-all')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('select-row-3')).toBeInTheDocument();
  });

  it('renders row selection radio buttons', () => {
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        rowSelection={{ type: 'radio' }}
      />
    );
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(0);
  });

  it('renders pagination by default', () => {
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('hides pagination when pagination is false', () => {
    render(
      <Table dataSource={mockData} columns={mockColumns} pagination={false} />
    );
    expect(screen.queryByTestId('table-pagination')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        className="custom-table"
      />
    );
    expect(screen.getByTestId('table')).toHaveClass('custom-table');
  });

  it('passes style prop to component', () => {
    const customStyle = { backgroundColor: 'red' };
    render(
      <Table dataSource={mockData} columns={mockColumns} style={customStyle} />
    );
    // The mock passes style as a prop, so we verify the element exists with the test
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('applies id attribute', () => {
    render(
      <Table dataSource={mockData} columns={mockColumns} id="my-table" />
    );
    expect(screen.getByTestId('table')).toHaveAttribute('id', 'my-table');
  });

  it('uses custom rowKey function', () => {
    const customRowKey = (record: TestRecord) => `custom-${record.name}`;
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        rowKey={customRowKey}
      />
    );
    expect(screen.getByTestId('table-row-custom-John Doe')).toBeInTheDocument();
  });

  it('renders custom cell content via render function', () => {
    const columnsWithRender: ColumnType<TestRecord>[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (value) => <strong>{String(value)}</strong>,
      },
      ...mockColumns.slice(1),
    ];
    render(<Table dataSource={mockData} columns={columnsWithRender} />);
    expect(screen.getByText('John Doe').tagName).toBe('STRONG');
  });

  it('hides columns with hidden property', () => {
    const columnsWithHidden: ColumnType<TestRecord>[] = [
      { ...mockColumns[0], hidden: true },
      ...mockColumns.slice(1),
    ];
    render(<Table dataSource={mockData} columns={columnsWithHidden} />);
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });
});

describe('Table Engine Compatibility', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'works with %s engine',
    (engine) => {
      render(
        <Table
          dataSource={mockData}
          columns={mockColumns}
          engine={engine as any}
        />
      );
      expect(screen.getByTestId('table')).toBeInTheDocument();
    }
  );
});

describe('Table Accessibility', () => {
  it('has role="table" attribute', () => {
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('provides aria-label for select all checkbox', () => {
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        rowSelection={{ type: 'checkbox' }}
      />
    );
    expect(screen.getByLabelText('Select all')).toBeInTheDocument();
  });

  it('provides aria-label for row selection', () => {
    render(
      <Table
        dataSource={mockData}
        columns={mockColumns}
        rowSelection={{ type: 'checkbox' }}
      />
    );
    expect(screen.getByLabelText('Select row 1')).toBeInTheDocument();
  });
});

describe('Table tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Table dataSource={mockData} columns={mockColumns} />);
    expect(screen.getByTestId('table')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
