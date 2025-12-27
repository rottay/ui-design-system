/**
 * DataTable Custom Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  SimpleDataTable,
  SearchableDataTable,
  SelectableDataTable,
  FullDataTable,
} from '../';
import { DesignSystemProvider } from '../../../../system/providers/root';

const meta: Meta = {
  title: 'Custom/DataTable',
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Data table presets for displaying tabular data with various features.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

const sampleColumns = [
  { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'email', title: 'Email', dataIndex: 'email' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value: string) => (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          backgroundColor: value === 'Active' ? '#dcfce7' : '#fee2e2',
          color: value === 'Active' ? '#166534' : '#991b1b',
        }}
      >
        {value}
      </span>
    ),
  },
];

const sampleData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

export const Simple: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic table with rows only, no additional features.',
      },
    },
  },
};

export const Searchable: StoryObj = {
  render: () => (
    <SearchableDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      searchable
      searchPlaceholder="Search users..."
      onSearch={(query) => console.log('Search:', query)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with global search functionality.',
      },
    },
  },
};

export const Selectable: StoryObj = {
  render: () => (
    <SelectableDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      selectable
      selectedRowKeys={['1', '3']}
      onSelectionChange={(keys, records) => console.log('Selected:', keys, records)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with row selection support.',
      },
    },
  },
};

export const Full: StoryObj = {
  render: () => (
    <FullDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      searchable
      searchPlaceholder="Search..."
      selectable
      pagination={{
        current: 1,
        pageSize: 10,
        total: 50,
        onChange: (page, size) => console.log('Page:', page, 'Size:', size),
      }}
      striped
      bordered
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-featured table with search, selection, and pagination.',
      },
    },
  },
};

export const Loading: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={[]}
      rowKey="id"
      loading
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table in loading state.',
      },
    },
  },
};

export const Empty: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={[]}
      rowKey="id"
      emptyText="No users found"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with empty state.',
      },
    },
  },
};

export const Striped: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      striped
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with striped rows for better readability.',
      },
    },
  },
};

export const Bordered: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      bordered
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with visible borders.',
      },
    },
  },
};

export const ClickableRows: StoryObj = {
  render: () => (
    <SimpleDataTable
      columns={sampleColumns}
      data={sampleData}
      rowKey="id"
      onRowClick={(record, index) => alert(`Clicked row ${index + 1}: ${record.name}`)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table with clickable rows.',
      },
    },
  },
};
