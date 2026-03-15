/**
 * TreeSelect Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeSelect } from './';
import type { TreeSelectNode, TreeSelectValue } from './types';
import { DesignSystemProvider } from '../../../../design-system';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof TreeSelect> = {
  title: 'Primitives/Inputs/TreeSelect',
  component: TreeSelect,
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
        component: `
TreeSelect component for selecting from hierarchical tree data.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Tree Display | Built-in | Custom | Custom |
| Checkable | Full | Limited | Full |
| Search | Built-in | Custom | Custom |
`,
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
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    multiple: {
      control: 'boolean',
      description: 'Support multiple selection',
    },
    treeCheckable: {
      control: 'boolean',
      description: 'Show checkbox before nodes',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input',
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the selection',
    },
    treeLine: {
      control: 'boolean',
      description: 'Show tree lines',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TreeSelect>;

const defaultTreeData: TreeSelectNode[] = [
  {
    value: 'parent-1',
    title: 'Parent 1',
    children: [
      {
        value: 'child-1-1',
        title: 'Child 1-1',
        children: [
          { value: 'grandchild-1-1-1', title: 'Grandchild 1-1-1' },
          { value: 'grandchild-1-1-2', title: 'Grandchild 1-1-2' },
        ],
      },
      { value: 'child-1-2', title: 'Child 1-2' },
    ],
  },
  {
    value: 'parent-2',
    title: 'Parent 2',
    children: [
      { value: 'child-2-1', title: 'Child 2-1' },
      { value: 'child-2-2', title: 'Child 2-2' },
    ],
  },
  {
    value: 'parent-3',
    title: 'Parent 3 (No Children)',
  },
];

export const Default: Story = {
  args: {
    treeData: defaultTreeData,
    placeholder: 'Please select',
    style: { width: 300 },
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState<TreeSelectValue>();

    return (
      <div>
        <TreeSelect
          treeData={defaultTreeData}
          value={value}
          onChange={(val) => setValue(val)}
          placeholder="Select a node"
          style={{ width: 300 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {value ? String(value) : '(none)'}
        </div>
      </div>
    );
  },
};

export const DefaultValue: Story = {
  args: {
    treeData: defaultTreeData,
    defaultValue: 'child-1-1',
    style: { width: 300 },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <span style={{ display: 'inline-block', width: 80 }}>{size}:</span>
          <TreeSelect
            treeData={defaultTreeData}
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
        <TreeSelect
          treeData={defaultTreeData}
          status="error"
          placeholder="Error state"
          style={{ width: 250 }}
        />
      </div>
      <div>
        <span style={{ display: 'inline-block', width: 80 }}>Warning:</span>
        <TreeSelect
          treeData={defaultTreeData}
          status="warning"
          placeholder="Warning state"
          style={{ width: 250 }}
        />
      </div>
    </div>
  ),
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<TreeSelectValue>([]);

    return (
      <div>
        <TreeSelect
          treeData={defaultTreeData}
          value={value}
          onChange={(val) => setValue(val)}
          multiple
          placeholder="Select multiple nodes"
          style={{ width: 400 }}
        />
        <div style={{ marginTop: 16 }}>
          Selected: {Array.isArray(value) && value.length > 0 ? value.join(', ') : '(none)'}
        </div>
      </div>
    );
  },
};

export const Checkable: Story = {
  render: function CheckableStory() {
    const [value, setValue] = useState<TreeSelectValue>([]);

    return (
      <div>
        <TreeSelect
          treeData={defaultTreeData}
          value={value}
          onChange={(val) => setValue(val)}
          treeCheckable
          placeholder="Check nodes to select"
          style={{ width: 400 }}
        />
        <div style={{ marginTop: 16 }}>
          Checked: {Array.isArray(value) && value.length > 0 ? value.join(', ') : '(none)'}
        </div>
      </div>
    );
  },
};

export const WithSearch: Story = {
  args: {
    treeData: defaultTreeData,
    showSearch: true,
    placeholder: 'Search and select',
    style: { width: 300 },
  },
};

export const WithTreeLines: Story = {
  args: {
    treeData: defaultTreeData,
    treeLine: true,
    placeholder: 'Tree with lines',
    style: { width: 300 },
  },
};

export const ExpandAll: Story = {
  args: {
    treeData: defaultTreeData,
    treeDefaultExpandAll: true,
    placeholder: 'All nodes expanded',
    style: { width: 300 },
  },
};

export const Disabled: Story = {
  args: {
    treeData: defaultTreeData,
    disabled: true,
    defaultValue: 'parent-1',
    style: { width: 300 },
  },
};

export const DisabledNodes: Story = {
  args: {
    treeData: [
      {
        value: 'enabled',
        title: 'Enabled Node',
        children: [
          { value: 'enabled-child', title: 'Enabled Child' },
        ],
      },
      {
        value: 'disabled',
        title: 'Disabled Node',
        disabled: true,
        children: [
          { value: 'disabled-child', title: 'Disabled Child' },
        ],
      },
    ],
    placeholder: 'Some nodes are disabled',
    style: { width: 300 },
  },
};

export const WithClear: Story = {
  args: {
    treeData: defaultTreeData,
    defaultValue: 'child-1-1',
    allowClear: true,
    placeholder: 'Select a node',
    style: { width: 300 },
  },
};

export const Loading: Story = {
  args: {
    treeData: [],
    loading: true,
    placeholder: 'Loading tree data...',
    style: { width: 300 },
  },
};

export const NoData: Story = {
  args: {
    treeData: [],
    notFoundContent: 'No items available',
    placeholder: 'Select a node',
    style: { width: 300 },
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the TreeSelect component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same TreeSelect rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={TreeSelect}
      props={{ treeData: defaultTreeData, placeholder: 'Select node', style: { width: 200 } }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const SizeMatrix: Story = {
  name: '📏 Size × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={TreeSelect}
      baseProps={{ treeData: defaultTreeData, placeholder: 'Select', style: { width: 150 } }}
      sizeProp="size"
      sizes={['small', 'middle', 'large']}
    />
  ),
};

/**
 * Status comparison across engines.
 */
export const StatusMatrix: Story = {
  name: '⚠️ Status × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={TreeSelect}
      baseProps={{ treeData: defaultTreeData, placeholder: 'Select', style: { width: 150 } }}
      variantProp="status"
      variants={['error', 'warning']}
    />
  ),
};
