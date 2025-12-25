import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Tag, Space, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';
import type { BulkAction } from './types';
import { useState } from 'react';

const meta = {
  title: 'Composite/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
interface User {
  key: string;
  id: number;
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  department: string;
  salary: number;
}

const generateUsers = (count: number): User[] => {
  const roles = ['Admin', 'Developer', 'Designer', 'Manager', 'Analyst'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  const names = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown',
    'Diana Prince', 'Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Davis',
    'Ivy Chen', 'Jack Taylor', 'Kate Anderson', 'Leo Martinez', 'Mary Garcia',
    'Nathan White', 'Olivia Moore', 'Paul Jackson', 'Quinn Harris', 'Rachel King',
  ];

  return Array.from({ length: count }, (_, i) => ({
    key: `user-${i}`,
    id: i + 1,
    name: names[i % names.length],
    age: Math.floor(Math.random() * 40) + 25,
    email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@company.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 50000,
  }));
};

const users: User[] = generateUsers(30);

// Basic columns
const basicColumns: any[] = [
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    sorter: (a: User, b: User) => a.id - b.id,
    hideable: false,
  },
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: (a: User, b: User) => a.name.localeCompare(b.name),
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: User, b: User) => a.age - b.age,
    width: 100,
    hideable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    hideable: true,
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    hideable: true,
  },
];

// Columns with custom render
const columnsWithRender: any[] = [
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    sorter: (a: User, b: User) => a.id - b.id,
    hideable: false,
  },
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    render: (name: string) => (
      <Space>
        <UserOutlined />
        <strong>{name}</strong>
      </Space>
    ),
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    sorter: (a: User, b: User) => a.age - b.age,
    width: 100,
    hideable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    hideable: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sorter: (a: User, b: User) => a.status.localeCompare(b.status),
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
        {status.toUpperCase()}
      </Tag>
    ),
    hideable: true,
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    render: (role: string) => (
      <Tag color={role === 'Admin' ? 'blue' : role === 'Developer' ? 'cyan' : role === 'Designer' ? 'purple' : 'default'}>
        {role}
      </Tag>
    ),
    hideable: true,
  },
  {
    key: 'department',
    title: 'Department',
    dataIndex: 'department',
    hideable: true,
  },
  {
    key: 'salary',
    title: 'Salary',
    dataIndex: 'salary',
    sorter: (a: User, b: User) => a.salary - b.salary,
    render: (salary: number) => `$${salary.toLocaleString()}`,
    hideable: true,
  },
];

// Columns with actions
const columnsWithActions: any[] = [
  ...columnsWithRender,
  {
    key: 'actions',
    title: 'Actions',
    render: () => (
      <Space>
        <Button size="small" icon={<EditOutlined />}>Edit</Button>
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Space>
    ),
    width: 150,
    hideable: false,
  },
];

// Bulk actions
const bulkActions: BulkAction<User>[] = [
  {
    key: 'delete',
    label: 'Delete',
    icon: <DeleteOutlined />,
    danger: true,
    onClick: (keys, rows) => {
      message.success(`Deleted ${keys.length} users`);
      console.log('Delete:', keys, rows);
    },
  },
  {
    key: 'export',
    label: 'Export Selected',
    icon: <DownloadOutlined />,
    onClick: (keys, rows) => {
      message.success(`Exporting ${rows.length} users`);
      console.log('Export:', rows);
    },
  },
  {
    key: 'activate',
    label: 'Activate',
    onClick: (keys, rows) => {
      message.success(`Activated ${keys.length} users`);
    },
    disabled: (keys, rows) => rows.every(r => r.status === 'active'),
  },
];

// ========== STORIES ==========

export const Default: Story = {
  args: {
    columns: basicColumns,
    data: users,
  },
};

export const WithSearch: Story = {
  args: {
    columns: basicColumns,
    data: users,
    showSearch: true,
    onSearch: (value) => console.log('Search:', value),
  },
};

export const WithSelection: Story = {
  args: {
    columns: basicColumns,
    data: users,
    showSelection: true,
    onSelectionChange: (keys, rows) => console.log('Selected:', keys, rows),
  },
};

// ========== NEW: 10 ENHANCED FEATURES ==========

export const WithCSVExport: Story = {
  name: '📄 CSV/Excel Export',
  args: {
    columns: columnsWithRender,
    data: users,
    enableCSVExport: true,
    enableExcelExport: true,
    exportFilename: 'users-data',
  },
};

export const WithColumnToggle: Story = {
  name: '👁️ Show/Hide Columns',
  args: {
    columns: columnsWithRender,
    data: users,
    showColumnToggle: true,
  },
};

export const WithBulkActions: Story = {
  name: '☑️ Bulk Actions',
  args: {
    columns: columnsWithRender,
    data: users,
    showSelection: true,
    bulkActions: bulkActions,
  },
};

export const WithExpandableRows: Story = {
  name: '📦 Expandable Rows',
  args: {
    columns: columnsWithRender.slice(0, 5),
    data: users,
    expandable: {
      expandedRowRender: (record: User) => (
        <div style={{ padding: '16px', background: '#fafafa' }}>
          <h4 style={{ marginTop: 0 }}>Additional Information</h4>
          <p><strong>Full Email:</strong> {record.email}</p>
          <p><strong>Department:</strong> {record.department}</p>
          <p><strong>Annual Salary:</strong> ${record.salary.toLocaleString()}</p>
          <p><strong>Age:</strong> {record.age}</p>
          <p><strong>Status:</strong> {record.status}</p>
        </div>
      ),
      rowExpandable: (record: User) => record.status !== 'inactive',
    },
  },
};

export const WithDensityModes: Story = {
  name: '🎨 Density Modes',
  args: {
    columns: columnsWithRender,
    data: users,
    showDensityToggle: true,
    defaultDensity: 'default',
  },
};

export const WithStickyHeader: Story = {
  name: '📍 Sticky Header',
  args: {
    columns: columnsWithRender,
    data: generateUsers(50), // More data to test scrolling
    stickyHeader: true,
    stickyOffset: 0,
  },
};

export const WithStatePersistence: Story = {
  name: '💾 State Persistence',
  args: {
    columns: columnsWithRender,
    data: users,
    showColumnToggle: true,
    showDensityToggle: true,
    saveState: true,
    stateKey: 'storybook-datatable-demo',
  },
};

export const WithRefreshButton: Story = {
  name: '🔄 Refresh Button',
  render: (args) => {
    const [data, setData] = useState(generateUsers(20));
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
      setLoading(true);
      message.info('Refreshing data...');
      setTimeout(() => {
        setData(generateUsers(20));
        setLoading(false);
        message.success('Data refreshed!');
      }, 1500);
    };

    return (
      <DataTable
        {...args}
        data={data}
        loading={loading}
        onRefresh={handleRefresh}
      />
    );
  },
  args: {
    columns: columnsWithRender,
    showRefresh: true,
  },
};

export const WithResponsiveMode: Story = {
  name: '📱 Responsive Mode',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    columns: columnsWithRender.slice(0, 5),
    data: users.slice(0, 10),
    responsive: true,
    responsiveBreakpoint: 768,
    showSearch: true,
    showRefresh: true,
    onRefresh: () => message.info('Refreshing...'),
    renderCard: (record: User) => (
      <div>
        <h3 style={{ marginTop: 0 }}>{record.name}</h3>
        <p><strong>Email:</strong> {record.email}</p>
        <p><strong>Role:</strong> <Tag color="blue">{record.role}</Tag></p>
        <p><strong>Status:</strong> <Tag color={record.status === 'active' ? 'green' : 'orange'}>{record.status}</Tag></p>
        <p><strong>Salary:</strong> ${record.salary.toLocaleString()}</p>
      </div>
    ),
  },
};

export const AllEnhancedFeatures: Story = {
  name: '🚀 All Enhanced Features',
  render: (args) => {
    const [data, setData] = useState(generateUsers(50));
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
      setLoading(true);
      message.info('Refreshing data...');
      setTimeout(() => {
        setData(generateUsers(50));
        setLoading(false);
        message.success('Data refreshed successfully!');
      }, 1500);
    };

    return (
      <div>
        <div style={{
          padding: '16px',
          background: '#f0f2f5',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h3 style={{ marginTop: 0 }}>✨ All 10 Enhanced Features Enabled</h3>
          <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
            <li>✅ Column sorting</li>
            <li>📄 CSV/Excel export</li>
            <li>👁️ Show/hide columns</li>
            <li>☑️ Bulk actions (Delete, Export, Activate)</li>
            <li>📦 Expandable rows</li>
            <li>🎨 Density modes (Compact/Default/Comfortable)</li>
            <li>📍 Sticky header</li>
            <li>💾 State persistence (localStorage)</li>
            <li>🔄 Refresh button</li>
            <li>📱 Responsive mode (resize to see cards)</li>
          </ul>
        </div>
        <DataTable
          {...args}
          data={data}
          loading={loading}
          onRefresh={handleRefresh}
        />
      </div>
    );
  },
  args: {
    columns: columnsWithActions,
    showSearch: true,
    enableCSVExport: true,
    enableExcelExport: true,
    exportFilename: 'users-complete',
    showColumnToggle: true,
    showSelection: true,
    bulkActions: bulkActions,
    expandable: {
      expandedRowRender: (record: User) => (
        <div style={{ padding: '16px', background: '#fafafa' }}>
          <h4 style={{ marginTop: 0 }}>Additional Information</h4>
          <p><strong>Full Email:</strong> {record.email}</p>
          <p><strong>Department:</strong> {record.department}</p>
          <p><strong>Annual Salary:</strong> ${record.salary.toLocaleString()}</p>
          <p><strong>Age:</strong> {record.age}</p>
          <p><strong>Status:</strong> {record.status}</p>
        </div>
      ),
      rowExpandable: (record: User) => record.status !== 'inactive',
    },
    showDensityToggle: true,
    defaultDensity: 'default',
    stickyHeader: true,
    stickyOffset: 0,
    saveState: true,
    stateKey: 'storybook-all-features',
    showRefresh: true,
    responsive: true,
    responsiveBreakpoint: 768,
    renderCard: (record: User) => (
      <div>
        <h3 style={{ marginTop: 0 }}>{record.name}</h3>
        <p><strong>Email:</strong> {record.email}</p>
        <p><strong>Role:</strong> <Tag color="blue">{record.role}</Tag></p>
        <p><strong>Status:</strong> <Tag color={record.status === 'active' ? 'green' : 'orange'}>{record.status}</Tag></p>
        <p><strong>Department:</strong> {record.department}</p>
        <p><strong>Salary:</strong> ${record.salary.toLocaleString()}</p>
      </div>
    ),
  },
};

// Legacy stories
export const WithExport: Story = {
  args: {
    columns: basicColumns,
    data: users,
    showExport: true,
    onExport: () => message.info('Custom export triggered'),
  },
};

export const WithSearchAndExport: Story = {
  args: {
    columns: columnsWithRender,
    data: users,
    showSearch: true,
    showExport: true,
    onSearch: (value) => console.log('Search:', value),
    onExport: () => message.info('Custom export triggered'),
  },
};

export const WithAllFeatures: Story = {
  name: 'Legacy: All Features',
  args: {
    columns: columnsWithActions,
    data: users,
    showSearch: true,
    showExport: true,
    showSelection: true,
    onSearch: (value) => console.log('Search:', value),
    onExport: () => message.info('Exporting data...'),
    onSelectionChange: (keys, rows) => console.log('Selected:', keys, rows),
  },
};

export const Loading: Story = {
  args: {
    columns: basicColumns,
    data: users,
    loading: true,
    showSearch: true,
  },
};

export const Empty: Story = {
  args: {
    columns: basicColumns,
    data: [],
    showSearch: true,
    enableCSVExport: true,
  },
};
