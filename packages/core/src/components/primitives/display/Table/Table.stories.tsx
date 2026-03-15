/**
 * Table Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './';
import type { ColumnType, TableProps } from './Table.types';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

// Sample data types
interface User {
  key: string;
  name: string;
  age: number;
  address: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

// Sample columns
const columns: ColumnType<User>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
    align: 'center',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    ellipsis: true,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => {
      const colors: Record<string, string> = {
        active: '#52c41a',
        inactive: '#d9d9d9',
        pending: '#faad14',
      };
      return (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: colors[value as string] || '#f0f0f0',
            color: value === 'active' ? '#fff' : '#333',
            fontSize: '12px',
          }}
        >
          {String(value).toUpperCase()}
        </span>
      );
    },
  },
];

// Sample data
const data: User[] = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: '123 Main Street, New York, NY 10001',
    email: 'john.doe@example.com',
    status: 'active',
  },
  {
    key: '2',
    name: 'Jane Smith',
    age: 28,
    address: '456 Oak Avenue, Los Angeles, CA 90001',
    email: 'jane.smith@example.com',
    status: 'active',
  },
  {
    key: '3',
    name: 'Bob Johnson',
    age: 45,
    address: '789 Pine Road, Chicago, IL 60601',
    email: 'bob.johnson@example.com',
    status: 'inactive',
  },
  {
    key: '4',
    name: 'Alice Williams',
    age: 35,
    address: '321 Elm Street, Houston, TX 77001',
    email: 'alice.williams@example.com',
    status: 'pending',
  },
  {
    key: '5',
    name: 'Charlie Brown',
    age: 52,
    address: '654 Maple Lane, Phoenix, AZ 85001',
    email: 'charlie.brown@example.com',
    status: 'active',
  },
];

// Extended data for pagination demos
const extendedData: User[] = Array.from({ length: 50 }, (_, i) => ({
  key: String(i + 1),
  name: `User ${i + 1}`,
  age: 20 + (i % 40),
  address: `${100 + i} Street Name, City, State ${10000 + i}`,
  email: `user${i + 1}@example.com`,
  status: ['active', 'inactive', 'pending'][i % 3] as User['status'],
}));

const meta: Meta<typeof Table<User>> = {
  title: 'Primitives/Display/Table',
  component: Table,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A data table component for displaying tabular data with support for sorting, filtering, pagination, row selection, and expandable rows. Supports multiple rendering engines.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the table',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show table borders',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the table is in loading state',
    },
    showHeader: {
      control: 'boolean',
      description: 'Whether to show table header',
    },
    rowHoverable: {
      control: 'boolean',
      description: 'Whether rows should have hover effect',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

export const Default: Story = {
  args: {
    dataSource: data,
    columns: columns,
    size: 'default',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['small', 'default', 'large'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>
            {size}
          </h4>
          <Table<User>
            dataSource={data.slice(0, 3)}
            columns={columns.slice(0, 3)}
            size={size}
            pagination={false}
          />
        </div>
      ))}
    </div>
  ),
};

export const Bordered: Story = {
  args: {
    dataSource: data,
    columns: columns,
    bordered: true,
  },
};

export const Loading: Story = {
  args: {
    dataSource: data,
    columns: columns,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    dataSource: [],
    columns: columns,
    locale: { emptyText: 'No records found' },
  },
};

export const WithRowSelection: Story = {
  args: {
    dataSource: data,
    columns: columns,
    rowSelection: {
      type: 'checkbox',
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('Selected:', selectedRowKeys, selectedRows);
      },
    },
  },
};

export const WithRadioSelection: Story = {
  args: {
    dataSource: data,
    columns: columns,
    rowSelection: {
      type: 'radio',
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('Selected:', selectedRowKeys, selectedRows);
      },
    },
  },
};

export const WithPagination: Story = {
  args: {
    dataSource: extendedData,
    columns: columns,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    },
  },
};

export const NoPagination: Story = {
  args: {
    dataSource: data,
    columns: columns,
    pagination: false,
  },
};

export const WithSorting: Story = {
  render: () => {
    const sortableColumns: ColumnType<User>[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        showSorterTooltip: true,
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => a.status.localeCompare(b.status),
      },
    ];
    return (
      <Table<User>
        dataSource={data}
        columns={sortableColumns}
        pagination={false}
      />
    );
  },
};

export const WithCustomRender: Story = {
  render: () => {
    const customColumns: ColumnType<User>[] = [
      {
        title: 'User Info',
        key: 'userInfo',
        render: (_, record) => (
          <div>
            <strong>{record.name}</strong>
            <br />
            <span style={{ color: '#666', fontSize: '12px' }}>
              {record.email}
            </span>
          </div>
        ),
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        render: (value) => <span>{String(value)} years</span>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value) => {
          const colors: Record<string, { bg: string; text: string }> = {
            active: { bg: '#e6f7e6', text: '#52c41a' },
            inactive: { bg: '#f5f5f5', text: '#999' },
            pending: { bg: '#fff7e6', text: '#faad14' },
          };
          const style = colors[value as string] || colors.inactive;
          return (
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                backgroundColor: style.bg,
                color: style.text,
                fontWeight: 500,
              }}
            >
              {String(value)}
            </span>
          );
        },
      },
    ];
    return (
      <Table<User>
        dataSource={data}
        columns={customColumns}
        pagination={false}
      />
    );
  },
};

export const WithHiddenColumns: Story = {
  render: () => {
    const columnsWithHidden: ColumnType<User>[] = [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
      { title: 'Address', dataIndex: 'address', key: 'address', hidden: true },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Status', dataIndex: 'status', key: 'status', hidden: true },
    ];
    return (
      <div>
        <p style={{ marginBottom: 16 }}>
          <em>Address and Status columns are hidden</em>
        </p>
        <Table<User>
          dataSource={data}
          columns={columnsWithHidden}
          pagination={false}
        />
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Table across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Table rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Table}
      props={{
        dataSource: data.slice(0, 3),
        columns: columns.slice(0, 4),
        size: 'small',
        bordered: true,
        pagination: false,
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Table sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Table}
      baseProps={{
        dataSource: data.slice(0, 2),
        columns: columns.slice(0, 3),
        pagination: false,
        bordered: true,
      }}
      variantProp="size"
      variants={['small', 'default', 'large']}
    />
  ),
};

export const WithColumnAlignment: Story = {
  render: () => {
    const alignedColumns: ColumnType<User>[] = [
      { title: 'Name (left)', dataIndex: 'name', key: 'name', align: 'left' },
      { title: 'Age (center)', dataIndex: 'age', key: 'age', align: 'center' },
      {
        title: 'Status (right)',
        dataIndex: 'status',
        key: 'status',
        align: 'right',
      },
    ];
    return (
      <Table<User>
        dataSource={data}
        columns={alignedColumns}
        pagination={false}
        bordered
      />
    );
  },
};

export const WithFixedWidth: Story = {
  render: () => {
    const fixedWidthColumns: ColumnType<User>[] = [
      { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
      { title: 'Age', dataIndex: 'age', key: 'age', width: 80 },
      { title: 'Address', dataIndex: 'address', key: 'address', width: 300 },
      { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
      { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    ];
    return (
      <div style={{ maxWidth: '600px', overflow: 'auto' }}>
        <Table<User>
          dataSource={data}
          columns={fixedWidthColumns}
          pagination={false}
          scroll={{ x: 830 }}
        />
      </div>
    );
  },
};

export const CustomRowKey: Story = {
  args: {
    dataSource: data.map(({ key, ...rest }) => rest) as any,
    columns: columns,
    rowKey: (record: any) => record.email,
    pagination: false,
  },
};

export const NoHeader: Story = {
  args: {
    dataSource: data,
    columns: columns,
    showHeader: false,
    pagination: false,
  },
};

export const Striped: Story = {
  args: {
    dataSource: data,
    columns: columns,
    rowHoverable: true,
    pagination: false,
  },
};
