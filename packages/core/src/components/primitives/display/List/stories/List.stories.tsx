/**
 * List Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { List } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof List> = {
  title: 'Primitives/Display/List',
  component: List,
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
        component: 'List component for displaying a collection of items with support for multiple engines, headers, footers, and item metadata.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the list items',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around the list',
    },
    split: {
      control: 'boolean',
      description: 'Show separator between items',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    itemLayout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout of list items',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof List>;

// Sample data for stories
const sampleData = [
  { title: 'Ant Design', description: 'A design language for background applications' },
  { title: 'React', description: 'A JavaScript library for building user interfaces' },
  { title: 'TypeScript', description: 'TypeScript is a typed superset of JavaScript' },
  { title: 'Vite', description: 'Next Generation Frontend Tooling' },
];

export const Default: Story = {
  render: () => (
    <List bordered>
      <List.Item>Item 1</List.Item>
      <List.Item>Item 2</List.Item>
      <List.Item>Item 3</List.Item>
      <List.Item>Item 4</List.Item>
    </List>
  ),
};

export const WithDataSource: Story = {
  render: () => (
    <List
      bordered
      dataSource={sampleData}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <List
      bordered
      header={<div style={{ fontWeight: 'bold' }}>Header</div>}
      footer={<div>Footer</div>}
      dataSource={['Item 1', 'Item 2', 'Item 3']}
      renderItem={(item) => <List.Item>{item}</List.Item>}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['small', 'default', 'large'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{size}</h4>
          <List size={size} bordered>
            <List.Item>List item in {size} size</List.Item>
            <List.Item>Another item</List.Item>
          </List>
        </div>
      ))}
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <List
      bordered
      dataSource={sampleData}
      renderItem={(item) => (
        <List.Item
          actions={[
            <a key="edit">Edit</a>,
            <a key="more">More</a>,
            <a key="delete" style={{ color: 'red' }}>Delete</a>,
          ]}
        >
          <List.Item.Meta
            title={item.title}
            description={item.description}
          />
        </List.Item>
      )}
    />
  ),
};

export const WithExtra: Story = {
  render: () => (
    <List
      bordered
      itemLayout="vertical"
      dataSource={sampleData}
      renderItem={(item) => (
        <List.Item
          extra={
            <img
              width={272}
              alt="logo"
              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            />
          }
        >
          <List.Item.Meta
            title={item.title}
            description={item.description}
          />
          <div>Additional content goes here...</div>
        </List.Item>
      )}
    />
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <List
      bordered
      dataSource={[
        { name: 'John Doe', email: 'john@example.com', avatar: 'https://i.pravatar.cc/40?img=1' },
        { name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://i.pravatar.cc/40?img=2' },
        { name: 'Bob Wilson', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/40?img=3' },
      ]}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<img src={item.avatar} alt={item.name} style={{ borderRadius: '50%', width: 40, height: 40 }} />}
            title={item.name}
            description={item.email}
          />
        </List.Item>
      )}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <List loading bordered>
      <List.Item>Item 1</List.Item>
      <List.Item>Item 2</List.Item>
      <List.Item>Item 3</List.Item>
    </List>
  ),
};

export const Grid: Story = {
  render: () => (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={[
        { title: 'Card 1', content: 'Content of card 1' },
        { title: 'Card 2', content: 'Content of card 2' },
        { title: 'Card 3', content: 'Content of card 3' },
        { title: 'Card 4', content: 'Content of card 4' },
        { title: 'Card 5', content: 'Content of card 5' },
        { title: 'Card 6', content: 'Content of card 6' },
      ]}
      renderItem={(item) => (
        <List.Item>
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <h4 style={{ margin: 0 }}>{item.title}</h4>
            <p style={{ margin: '8px 0 0' }}>{item.content}</p>
          </div>
        </List.Item>
      )}
    />
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of List across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same List rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={List}
      props={{
        bordered: true,
        dataSource: sampleData.slice(0, 2),
        renderItem: (item: { title: string; description: string }) => (
          <List.Item>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        ),
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
        story: 'Complete matrix of all List sizes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={List}
      baseProps={{
        bordered: true,
        dataSource: ['Item 1', 'Item 2'],
        renderItem: (item: string) => <List.Item>{item}</List.Item>,
      }}
      variantProp="size"
      variants={['small', 'default', 'large']}
    />
  ),
};

export const WithoutBorder: Story = {
  render: () => (
    <List
      dataSource={['Item 1', 'Item 2', 'Item 3', 'Item 4']}
      renderItem={(item) => <List.Item>{item}</List.Item>}
    />
  ),
};

export const WithoutSplit: Story = {
  render: () => (
    <List
      bordered
      split={false}
      dataSource={['Item 1', 'Item 2', 'Item 3', 'Item 4']}
      renderItem={(item) => <List.Item>{item}</List.Item>}
    />
  ),
};
