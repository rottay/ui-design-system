/**
 * Cascader Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from '../';
import type { CascaderOption, CascaderValue } from '../types';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Cascader> = {
  title: 'Primitives/Inputs/Cascader',
  component: Cascader,
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
        component: 'Cascader component for hierarchical multi-level selection.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the input',
    },
    status: {
      control: 'select',
      options: ['error', 'warning'],
      description: 'Validation status',
    },
    expandTrigger: {
      control: 'select',
      options: ['click', 'hover'],
      description: 'Expand trigger method',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    multiple: {
      control: 'boolean',
      description: 'Support multiple selection',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input',
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the selection',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Cascader>;

const defaultOptions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'West Lake' },
          { value: 'xiasha', label: 'Xiasha' },
        ],
      },
      {
        value: 'ningbo',
        label: 'Ningbo',
        children: [
          { value: 'jiangbei', label: 'Jiangbei' },
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
      {
        value: 'suzhou',
        label: 'Suzhou',
        children: [
          { value: 'gusu', label: 'Gusu' },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: 'Please select location',
    style: { width: 300 },
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<CascaderValue>([]);

    return (
      <div>
        <Cascader
          options={defaultOptions}
          value={value}
          onChange={(val) => setValue(val as CascaderValue)}
          placeholder="Select location"
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {value.length ? value.join(' / ') : '(none)'}
        </div>
      </div>
    );
  },
};

export const DefaultValue: Story = {
  args: {
    options: defaultOptions,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    style: { width: 300 },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <span style={{ display: 'inline-block', width: 80 }}>{size}:</span>
          <Cascader
            options={defaultOptions}
            size={size}
            placeholder={`Size ${size}`}
            style={{ width: 250 }}
          />
        </div>
      ))}
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Error:</span>
        <Cascader
          options={defaultOptions}
          status="error"
          placeholder="Error state"
          style={{ width: 250 }}
        />
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Warning:</span>
        <Cascader
          options={defaultOptions}
          status="warning"
          placeholder="Warning state"
          style={{ width: 250 }}
        />
      </div>
    </div>
  ),
};

export const ExpandTriggers: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Click:</span>
        <Cascader
          options={defaultOptions}
          expandTrigger="click"
          placeholder="Expand on click"
          style={{ width: 250 }}
        />
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Hover:</span>
        <Cascader
          options={defaultOptions}
          expandTrigger="hover"
          placeholder="Expand on hover"
          style={{ width: 250 }}
        />
      </div>
    </div>
  ),
};

export const WithSearch: Story = {
  args: {
    options: defaultOptions,
    showSearch: true,
    placeholder: 'Search locations',
    style: { width: 300 },
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    defaultValue: ['zhejiang', 'hangzhou'],
    style: { width: 300 },
  },
};

export const DisabledOptions: Story = {
  args: {
    options: [
      {
        value: 'enabled',
        label: 'Enabled Option',
        children: [
          { value: 'child1', label: 'Child 1' },
        ],
      },
      {
        value: 'disabled',
        label: 'Disabled Option',
        disabled: true,
        children: [
          { value: 'child2', label: 'Child 2' },
        ],
      },
    ],
    placeholder: 'Some options are disabled',
    style: { width: 300 },
  },
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<CascaderValue[]>([]);

    return (
      <div>
        <Cascader
          options={defaultOptions}
          value={value}
          onChange={(val) => setValue(val as CascaderValue[])}
          multiple
          placeholder="Select multiple locations"
          style={{ width: 400 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {value.length ? value.map((v) => v.join('/')).join(', ') : '(none)'}
        </div>
      </div>
    );
  },
};

export const CustomDisplayRender: Story = {
  args: {
    options: defaultOptions,
    defaultValue: ['zhejiang', 'hangzhou', 'xihu'],
    displayRender: (labels: string[]) => labels.join(' > '),
    style: { width: 300 },
  },
};

export const Loading: Story = {
  args: {
    options: [],
    loading: true,
    placeholder: 'Loading options...',
    style: { width: 300 },
  },
};

export const NoData: Story = {
  args: {
    options: [],
    notFoundContent: 'No locations available',
    placeholder: 'Select location',
    style: { width: 300 },
  },
};

export const WithClear: Story = {
  args: {
    options: defaultOptions,
    defaultValue: ['jiangsu', 'nanjing', 'zhonghuamen'],
    allowClear: true,
    placeholder: 'Select location',
    style: { width: 300 },
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Cascader
            engine={engine}
            options={defaultOptions}
            placeholder={`${engine} engine`}
            style={{ width: 300 }}
          />
        </div>
      ))}
    </div>
  ),
};
