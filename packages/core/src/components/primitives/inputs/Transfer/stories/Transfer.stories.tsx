/**
 * Transfer Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Transfer } from '../';
import type { TransferItem } from '../types';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Transfer> = {
  title: 'Primitives/Inputs/Transfer',
  component: Transfer,
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
        component: 'Transfer component for moving items between two lists.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the transfer is disabled',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input',
    },
    showSelectAll: {
      control: 'boolean',
      description: 'Show select all checkbox',
    },
    oneWay: {
      control: 'boolean',
      description: 'One way transfer (only left to right)',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Transfer>;

const defaultDataSource: TransferItem[] = [
  { key: '1', title: 'Item 1', description: 'Description 1' },
  { key: '2', title: 'Item 2', description: 'Description 2' },
  { key: '3', title: 'Item 3', description: 'Description 3' },
  { key: '4', title: 'Item 4', description: 'Description 4' },
  { key: '5', title: 'Item 5', description: 'Description 5' },
  { key: '6', title: 'Item 6', description: 'Description 6' },
];

export const Default: Story = {
  args: {
    dataSource: defaultDataSource,
    style: { width: 600 },
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [targetKeys, setTargetKeys] = useState<string[]>(['2', '4']);

    const handleChange = (newTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => {
      console.log('Change:', { newTargetKeys, direction, moveKeys });
      setTargetKeys(newTargetKeys);
    };

    return (
      <div>
        <Transfer
          dataSource={defaultDataSource}
          targetKeys={targetKeys}
          onChange={handleChange}
          style={{ width: 600 }}
        />
        <div style={{ marginTop: 16 }}>
          Target keys: {targetKeys.join(', ') || '(none)'}
        </div>
      </div>
    );
  },
};

export const WithSearch: Story = {
  args: {
    dataSource: defaultDataSource,
    showSearch: true,
    style: { width: 600 },
  },
};

export const CustomTitles: Story = {
  args: {
    dataSource: defaultDataSource,
    titles: ['Available Items', 'Selected Items'],
    operations: ['Add →', '← Remove'],
    style: { width: 600 },
  },
};

export const Disabled: Story = {
  args: {
    dataSource: defaultDataSource,
    targetKeys: ['1', '2'],
    disabled: true,
    style: { width: 600 },
  },
};

export const DisabledItems: Story = {
  args: {
    dataSource: [
      { key: '1', title: 'Can be moved' },
      { key: '2', title: 'Disabled item', disabled: true },
      { key: '3', title: 'Can be moved' },
      { key: '4', title: 'Disabled item', disabled: true },
    ],
    style: { width: 600 },
  },
};

export const OneWay: Story = {
  args: {
    dataSource: defaultDataSource,
    oneWay: true,
    style: { width: 600 },
  },
};

export const WithPagination: Story = {
  args: {
    dataSource: Array.from({ length: 20 }, (_, i) => ({
      key: String(i + 1),
      title: `Item ${i + 1}`,
    })),
    pagination: { pageSize: 5 },
    style: { width: 600 },
  },
};

export const CustomRender: Story = {
  args: {
    dataSource: [
      { key: '1', title: 'John Doe', description: 'john@example.com' },
      { key: '2', title: 'Jane Smith', description: 'jane@example.com' },
      { key: '3', title: 'Bob Wilson', description: 'bob@example.com' },
    ],
    render: (item: TransferItem) => (
      <span>
        <strong>{item.title}</strong>
        <br />
        <small>{item.description}</small>
      </span>
    ),
    style: { width: 600 },
  },
};

export const CustomLocale: Story = {
  args: {
    dataSource: [],
    showSearch: true,
    locale: {
      itemUnit: 'element',
      itemsUnit: 'elements',
      notFoundContent: 'No elements available',
      searchPlaceholder: 'Find elements...',
    },
    style: { width: 600 },
  },
};

export const WithSelectAll: Story = {
  render: function SelectAllStory() {
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<{ source: string[]; target: string[] }>({
      source: [],
      target: [],
    });

    return (
      <div>
        <Transfer
          dataSource={defaultDataSource}
          targetKeys={targetKeys}
          showSelectAll
          onChange={(keys) => setTargetKeys(keys)}
          onSelectChange={(sourceKeys, targetKeys) =>
            setSelectedKeys({ source: sourceKeys, target: targetKeys })
          }
          style={{ width: 600 }}
        />
        <div style={{ marginTop: 16 }}>
          <div>Source selected: {selectedKeys.source.join(', ') || '(none)'}</div>
          <div>Target selected: {selectedKeys.target.join(', ') || '(none)'}</div>
        </div>
      </div>
    );
  },
};

export const AsyncSearch: Story = {
  render: function AsyncSearchStory() {
    const [dataSource, setDataSource] = useState(defaultDataSource);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    const handleSearch = (direction: 'left' | 'right', value: string) => {
      console.log(`Searching ${direction}: ${value}`);
      // In a real app, you'd filter or fetch data here
    };

    return (
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        showSearch
        onChange={(keys) => setTargetKeys(keys)}
        onSearch={handleSearch}
        style={{ width: 600 }}
      />
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Transfer
            engine={engine}
            dataSource={defaultDataSource.slice(0, 4)}
            targetKeys={['2']}
            style={{ width: 500 }}
          />
        </div>
      ))}
    </div>
  ),
};
