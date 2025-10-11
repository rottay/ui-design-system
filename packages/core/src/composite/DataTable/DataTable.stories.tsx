import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Tag, Space, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}

const users: User[] = [
  { key: '1', name: 'John Doe', age: 32, email: 'john@example.com', status: 'active', role: 'Admin' },
  { key: '2', name: 'Jane Smith', age: 28, email: 'jane@example.com', status: 'active', role: 'User' },
  { key: '3', name: 'Bob Johnson', age: 45, email: 'bob@example.com', status: 'inactive', role: 'User' },
  { key: '4', name: 'Alice Williams', age: 35, email: 'alice@example.com', status: 'active', role: 'Editor' },
  { key: '5', name: 'Charlie Brown', age: 50, email: 'charlie@example.com', status: 'active', role: 'Admin' },
  { key: '6', name: 'Diana Prince', age: 29, email: 'diana@example.com', status: 'inactive', role: 'User' },
  { key: '7', name: 'Eve Anderson', age: 41, email: 'eve@example.com', status: 'active', role: 'Editor' },
  { key: '8', name: 'Frank Miller', age: 38, email: 'frank@example.com', status: 'active', role: 'User' },
  { key: '9', name: 'Grace Lee', age: 33, email: 'grace@example.com', status: 'inactive', role: 'User' },
  { key: '10', name: 'Henry Ford', age: 47, email: 'henry@example.com', status: 'active', role: 'Admin' },
];

// Basic columns
const basicColumns: any[] = [
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
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
  },
];

// Columns with custom render
const columnsWithRender: any[] = [
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
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status.toUpperCase()}
      </Tag>
    ),
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    render: (role: string) => (
      <Tag color={role === 'Admin' ? 'blue' : role === 'Editor' ? 'purple' : 'default'}>
        {role}
      </Tag>
    ),
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
        <Button size="small" icon={<EditOutlined />} />
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Space>
    ),
    width: 120,
  },
];

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

export const WithExport: Story = {
  args: {
    columns: basicColumns,
    data: users,
    showExport: true,
    onExport: () => alert('Exporting data...'),
  },
};

export const WithSearchAndExport: Story = {
  args: {
    columns: columnsWithRender,
    data: users,
    showSearch: true,
    showExport: true,
    onSearch: (value) => console.log('Search:', value),
    onExport: () => alert('Exporting data...'),
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

export const WithAllFeatures: Story = {
  args: {
    columns: columnsWithActions,
    data: users,
    showSearch: true,
    showExport: true,
    showSelection: true,
    onSearch: (value) => console.log('Search:', value),
    onExport: () => alert('Exporting data...'),
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
    showExport: true,
  },
};
