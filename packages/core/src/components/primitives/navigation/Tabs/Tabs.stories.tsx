/**
 * Tabs Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './';
import type { TabItem } from './Tabs.types';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Navigation/Tabs',
  component: Tabs,
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
        component: 'Tabs component for switching between different views or content sections.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'card', 'pills'],
      description: 'Style type of tabs',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of tabs',
    },
    centered: {
      control: 'boolean',
      description: 'Center the tabs',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const defaultItems: TabItem[] = [
  { key: '1', label: 'Tab 1', children: <p>Content of Tab 1</p> },
  { key: '2', label: 'Tab 2', children: <p>Content of Tab 2</p> },
  { key: '3', label: 'Tab 3', children: <p>Content of Tab 3</p> },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    defaultActiveKey: '1',
  },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['line', 'card', 'pills'] as const).map((type) => (
        <div key={type}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{type}</h4>
          <Tabs items={defaultItems} type={type} defaultActiveKey="1" />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0' }}>Size: {size}</h4>
          <Tabs items={defaultItems} size={size} defaultActiveKey="1" />
        </div>
      ))}
    </div>
  ),
};

export const Centered: Story = {
  args: {
    items: defaultItems,
    centered: true,
    defaultActiveKey: '1',
  },
};

export const Disabled: Story = {
  args: {
    items: [
      { key: '1', label: 'Tab 1', children: <p>Content of Tab 1</p> },
      { key: '2', label: 'Tab 2 (Disabled)', children: <p>Content of Tab 2</p>, disabled: true },
      { key: '3', label: 'Tab 3', children: <p>Content of Tab 3</p> },
    ],
    defaultActiveKey: '1',
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', icon: <span>🏠</span>, children: <p>Home content</p> },
      { key: 'profile', label: 'Profile', icon: <span>👤</span>, children: <p>Profile content</p> },
      { key: 'settings', label: 'Settings', icon: <span>⚙️</span>, children: <p>Settings content</p> },
    ],
    defaultActiveKey: 'home',
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [activeKey, setActiveKey] = useState('1');

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setActiveKey('1')} style={{ marginRight: 8 }}>
            Go to Tab 1
          </button>
          <button onClick={() => setActiveKey('2')} style={{ marginRight: 8 }}>
            Go to Tab 2
          </button>
          <button onClick={() => setActiveKey('3')}>Go to Tab 3</button>
        </div>
        <Tabs items={defaultItems} activeKey={activeKey} onChange={setActiveKey} />
      </div>
    );
  },
};

export const ManyTabs: Story = {
  args: {
    items: Array.from({ length: 10 }, (_, i) => ({
      key: String(i + 1),
      label: `Tab ${i + 1}`,
      children: <p>Content of Tab {i + 1}</p>,
    })),
    defaultActiveKey: '1',
  },
};

export const CardWithContent: Story = {
  args: {
    type: 'card',
    items: [
      {
        key: 'overview',
        label: 'Overview',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Overview</h3>
            <p>This is the overview section with detailed information about the product.</p>
          </div>
        ),
      },
      {
        key: 'features',
        label: 'Features',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Features</h3>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        ),
      },
      {
        key: 'pricing',
        label: 'Pricing',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Pricing</h3>
            <p>Starting at $9.99/month</p>
          </div>
        ),
      },
    ],
    defaultActiveKey: 'overview',
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tabs across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tabs rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Tabs}
      props={{
        items: defaultItems,
        defaultActiveKey: '1',
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};
