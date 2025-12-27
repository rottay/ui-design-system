/**
 * Collapse Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Collapse } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Collapse> = {
  title: 'Primitives/Layout/Collapse',
  component: Collapse,
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
        component: 'Collapse component for expandable/collapsible content panels with multi-engine support.',
      },
    },
  },
  argTypes: {
    accordion: {
      control: 'boolean',
      description: 'Allow only one panel open at a time',
    },
    bordered: {
      control: 'boolean',
      description: 'Show panel borders',
    },
    ghost: {
      control: 'boolean',
      description: 'Transparent background',
    },
    expandIconPosition: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Position of expand icon',
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size of the collapse',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Collapse>;

const text = `
  A dog is a type of domesticated animal. Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

export const Default: Story = {
  render: () => (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel header="This is panel header 1" panelKey="1">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 2" panelKey="2">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 3" panelKey="3">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const Accordion: Story = {
  render: () => (
    <Collapse accordion defaultActiveKey="1">
      <Collapse.Panel header="This is panel header 1" panelKey="1">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 2" panelKey="2">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 3" panelKey="3">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const Borderless: Story = {
  render: () => (
    <Collapse bordered={false} defaultActiveKey={['1']}>
      <Collapse.Panel header="This is panel header 1" panelKey="1">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 2" panelKey="2">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 3" panelKey="3">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const Ghost: Story = {
  render: () => (
    <div style={{ backgroundColor: '#f5f5f5', padding: 24 }}>
      <Collapse ghost defaultActiveKey={['1']}>
        <Collapse.Panel header="This is panel header 1" panelKey="1">
          <p>{text}</p>
        </Collapse.Panel>
        <Collapse.Panel header="This is panel header 2" panelKey="2">
          <p>{text}</p>
        </Collapse.Panel>
        <Collapse.Panel header="This is panel header 3" panelKey="3">
          <p>{text}</p>
        </Collapse.Panel>
      </Collapse>
    </div>
  ),
};

export const ExpandIconPosition: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Icon at Start (default)</h4>
        <Collapse expandIconPosition="start" defaultActiveKey={['1']}>
          <Collapse.Panel header="Panel Header" panelKey="1">
            <p>{text}</p>
          </Collapse.Panel>
        </Collapse>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Icon at End</h4>
        <Collapse expandIconPosition="end" defaultActiveKey={['1']}>
          <Collapse.Panel header="Panel Header" panelKey="1">
            <p>{text}</p>
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{size}</h4>
          <Collapse size={size} defaultActiveKey={['1']}>
            <Collapse.Panel header="Panel Header" panelKey="1">
              <p>{text}</p>
            </Collapse.Panel>
          </Collapse>
        </div>
      ))}
    </div>
  ),
};

export const DisabledPanel: Story = {
  render: () => (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel header="This is panel header 1" panelKey="1">
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 2 (Disabled)" panelKey="2" disabled>
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 3" panelKey="3">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const NoArrow: Story = {
  render: () => (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel header="This panel has no arrow" panelKey="1" showArrow={false}>
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel header="This panel has arrow" panelKey="2">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const ExtraContent: Story = {
  render: () => (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel
        header="Panel with extra"
        panelKey="1"
        extra={
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert('Settings clicked!');
            }}
            style={{ padding: '2px 8px', cursor: 'pointer' }}
          >
            Settings
          </button>
        }
      >
        <p>{text}</p>
      </Collapse.Panel>
      <Collapse.Panel
        header="Another panel"
        panelKey="2"
        extra={<span style={{ color: '#52c41a' }}>Active</span>}
      >
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [activeKey, setActiveKey] = useState<string | string[]>(['1']);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setActiveKey(['1'])} style={{ marginRight: 8 }}>
            Open Panel 1
          </button>
          <button onClick={() => setActiveKey(['2'])} style={{ marginRight: 8 }}>
            Open Panel 2
          </button>
          <button onClick={() => setActiveKey(['1', '2', '3'])} style={{ marginRight: 8 }}>
            Open All
          </button>
          <button onClick={() => setActiveKey([])}>Close All</button>
        </div>
        <Collapse activeKey={activeKey} onChange={setActiveKey}>
          <Collapse.Panel header="This is panel header 1" panelKey="1">
            <p>{text}</p>
          </Collapse.Panel>
          <Collapse.Panel header="This is panel header 2" panelKey="2">
            <p>{text}</p>
          </Collapse.Panel>
          <Collapse.Panel header="This is panel header 3" panelKey="3">
            <p>{text}</p>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  },
};

export const NestedCollapse: Story = {
  render: () => (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel header="This is panel header 1" panelKey="1">
        <Collapse defaultActiveKey={['a']}>
          <Collapse.Panel header="Nested Panel A" panelKey="a">
            <p>Content of nested panel A</p>
          </Collapse.Panel>
          <Collapse.Panel header="Nested Panel B" panelKey="b">
            <p>Content of nested panel B</p>
          </Collapse.Panel>
        </Collapse>
      </Collapse.Panel>
      <Collapse.Panel header="This is panel header 2" panelKey="2">
        <p>{text}</p>
      </Collapse.Panel>
    </Collapse>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Collapse engine={engine} defaultActiveKey={['1']}>
            <Collapse.Panel engine={engine} header="Panel 1" panelKey="1">
              <p>Content for {engine} engine</p>
            </Collapse.Panel>
            <Collapse.Panel engine={engine} header="Panel 2" panelKey="2">
              <p>More content</p>
            </Collapse.Panel>
          </Collapse>
        </div>
      ))}
    </div>
  ),
};
