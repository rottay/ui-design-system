/**
 * Menu Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './';
import type { MenuItem } from './contracts';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Menu> = {
  title: 'Primitives/Navigation/Menu',
  component: Menu,
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
        component: 'Menu component for navigation with support for submenus, icons, and different modes.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['vertical', 'horizontal', 'inline'],
      description: 'Menu mode',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Menu theme',
    },
    inlineCollapsed: {
      control: 'boolean',
      description: 'Collapse inline menu',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menu>;

const defaultItems: MenuItem[] = [
  { key: '1', label: 'Option 1', icon: <span>🏠</span> },
  { key: '2', label: 'Option 2', icon: <span>📁</span> },
  { key: '3', label: 'Option 3', icon: <span>⚙️</span> },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    defaultSelectedKeys: ['1'],
  },
};

export const Modes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['vertical', 'horizontal', 'inline'] as const).map((mode) => (
        <div key={mode}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{mode}</h4>
          <Menu items={defaultItems} mode={mode} defaultSelectedKeys={['1']} />
        </div>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    items: defaultItems,
    mode: 'horizontal',
    defaultSelectedKeys: ['1'],
  },
};

export const WithSubmenus: Story = {
  args: {
    mode: 'inline',
    defaultOpenKeys: ['sub1'],
    items: [
      {
        key: 'sub1',
        label: 'Navigation One',
        icon: <span>📂</span>,
        children: [
          { key: '1', label: 'Option 1' },
          { key: '2', label: 'Option 2' },
          { key: '3', label: 'Option 3' },
        ],
      },
      {
        key: 'sub2',
        label: 'Navigation Two',
        icon: <span>📂</span>,
        children: [
          { key: '4', label: 'Option 4' },
          { key: '5', label: 'Option 5' },
        ],
      },
      { key: '6', label: 'Option 6', icon: <span>📄</span> },
    ],
  },
};

export const DarkTheme: Story = {
  render: () => (
    <div style={{ backgroundColor: '#001529', padding: 16, width: 256 }}>
      <Menu
        items={defaultItems}
        mode="inline"
        theme="dark"
        defaultSelectedKeys={['1']}
      />
    </div>
  ),
};

export const DisabledItems: Story = {
  args: {
    items: [
      { key: '1', label: 'Enabled Item' },
      { key: '2', label: 'Disabled Item', disabled: true },
      { key: '3', label: 'Another Enabled' },
    ],
    defaultSelectedKeys: ['1'],
  },
};

export const DangerItem: Story = {
  args: {
    items: [
      { key: '1', label: 'Edit', icon: <span>✏️</span> },
      { key: '2', label: 'Copy', icon: <span>📋</span> },
      { key: '3', label: 'Delete', icon: <span>🗑️</span>, danger: true },
    ],
  },
};

export const WithGroups: Story = {
  args: {
    mode: 'inline',
    items: [
      {
        key: 'g1',
        type: 'group',
        label: 'Group 1',
        children: [
          { key: '1', label: 'Option 1' },
          { key: '2', label: 'Option 2' },
        ],
      },
      {
        key: 'g2',
        type: 'group',
        label: 'Group 2',
        children: [
          { key: '3', label: 'Option 3' },
          { key: '4', label: 'Option 4' },
        ],
      },
    ],
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [selectedKeys, setSelectedKeys] = useState(['1']);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          Selected: {selectedKeys.join(', ')}
        </div>
        <Menu
          items={defaultItems}
          selectedKeys={selectedKeys}
          onSelect={({ selectedKeys }) => setSelectedKeys(selectedKeys)}
        />
      </div>
    );
  },
};

export const InlineCollapsed: Story = {
  render: function CollapsedStory() {
    const [collapsed, setCollapsed] = useState(false);

    return (
      <div style={{ width: collapsed ? 80 : 256 }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginBottom: 16 }}
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
        <Menu
          items={defaultItems}
          mode="inline"
          inlineCollapsed={collapsed}
          defaultSelectedKeys={['1']}
        />
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Menu across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Menu rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Menu}
      props={{
        items: defaultItems,
        defaultSelectedKeys: ['1'],
      }}
      showDescriptions
    />
  ),
};
