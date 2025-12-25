import type { Meta, StoryObj } from '@storybook/react';
import { Wrap } from './Wrap';
import { Tag } from 'antd';

const meta = {
  title: 'Layout Patterns/Wrap',
  component: Wrap,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Gap between wrapped items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Horizontal distribution of items',
    },
  },
} satisfies Meta<typeof Wrap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gap: 'sm',
    children: (
      <>
        <Tag color="blue">JavaScript</Tag>
        <Tag color="green">React</Tag>
        <Tag color="purple">TypeScript</Tag>
        <Tag color="orange">Node.js</Tag>
        <Tag color="red">MongoDB</Tag>
        <Tag color="cyan">Docker</Tag>
        <Tag color="magenta">GraphQL</Tag>
        <Tag color="gold">AWS</Tag>
        <Tag color="lime">Next.js</Tag>
        <Tag color="volcano">Redis</Tag>
      </>
    ),
  },
};

export const DifferentGaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Gap: xs (4px)</h3>
        <Wrap gap="xs" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} style={{ backgroundColor: '#f0f0f0', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              Item {i + 1}
            </div>
          ))}
        </Wrap>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: sm (8px)</h3>
        <Wrap gap="sm" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} style={{ backgroundColor: '#e6f7ff', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              Item {i + 1}
            </div>
          ))}
        </Wrap>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: md (16px)</h3>
        <Wrap gap="md" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ backgroundColor: '#f6ffed', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              Item {i + 1}
            </div>
          ))}
        </Wrap>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Gap: lg (24px)</h3>
        <Wrap gap="lg" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ backgroundColor: '#fff7e6', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              Item {i + 1}
            </div>
          ))}
        </Wrap>
      </div>
    </div>
  ),
};

export const WithAlignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginTop: 0 }}>Align: start</h3>
        <Wrap gap="md" align="start" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Short
          </div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>
            Tall Item
          </div>
          <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '1rem', borderRadius: '4px' }}>
            Medium
          </div>
        </Wrap>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Align: center</h3>
        <Wrap gap="md" align="center" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Short
          </div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '2rem 1rem', borderRadius: '4px' }}>
            Tall Item
          </div>
          <div style={{ backgroundColor: '#52c41a', color: 'white', padding: '1rem', borderRadius: '4px' }}>
            Medium
          </div>
        </Wrap>
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Justify: center</h3>
        <Wrap gap="md" justify="center" style={{ border: '2px dashed #d9d9d9', padding: '1rem' }}>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Item 1
          </div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Item 2
          </div>
          <div style={{ backgroundColor: '#722ed1', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
            Item 3
          </div>
        </Wrap>
      </div>
    </div>
  ),
};

export const ManyItems: Story = {
  args: {
    gap: 'md',
    style: { maxWidth: '600px' },
    children: Array.from({ length: 30 }, (_, i) => (
      <div
        key={i}
        style={{
          backgroundColor: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2'][i % 6],
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
        }}
      >
        Item {i + 1}
      </div>
    )),
  },
};

export const SkillTags: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginTop: 0 }}>Skills & Technologies</h2>
      <Wrap gap="sm">
        <Tag color="blue">JavaScript</Tag>
        <Tag color="blue">TypeScript</Tag>
        <Tag color="green">React</Tag>
        <Tag color="green">Vue.js</Tag>
        <Tag color="green">Angular</Tag>
        <Tag color="purple">Node.js</Tag>
        <Tag color="purple">Express</Tag>
        <Tag color="orange">MongoDB</Tag>
        <Tag color="orange">PostgreSQL</Tag>
        <Tag color="orange">MySQL</Tag>
        <Tag color="red">Docker</Tag>
        <Tag color="red">Kubernetes</Tag>
        <Tag color="cyan">AWS</Tag>
        <Tag color="cyan">Azure</Tag>
        <Tag color="magenta">GraphQL</Tag>
        <Tag color="magenta">REST API</Tag>
        <Tag color="gold">Next.js</Tag>
        <Tag color="gold">Nuxt.js</Tag>
        <Tag color="lime">TailwindCSS</Tag>
        <Tag color="volcano">Redis</Tag>
      </Wrap>
    </div>
  ),
};

export const FilterTags: Story = {
  render: () => (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Active Filters</h3>
      <Wrap gap="sm">
        <Tag closable color="blue">Category: Electronics</Tag>
        <Tag closable color="green">Price: $100-$500</Tag>
        <Tag closable color="orange">Brand: Apple</Tag>
        <Tag closable color="purple">Rating: 4+ stars</Tag>
        <Tag closable color="cyan">In Stock</Tag>
      </Wrap>
    </div>
  ),
};

export const ButtonGroup: Story = {
  render: () => (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
      <Wrap gap="md">
        <button
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          New Document
        </button>
        <button
          style={{
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Upload File
        </button>
        <button
          style={{
            backgroundColor: '#722ed1',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create Folder
        </button>
        <button
          style={{
            backgroundColor: '#fa8c16',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Import
        </button>
        <button
          style={{
            backgroundColor: '#eb2f96',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Export
        </button>
        <button
          style={{
            backgroundColor: '#13c2c2',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Share
        </button>
      </Wrap>
    </div>
  ),
};

export const ResponsiveCards: Story = {
  render: () => (
    <Wrap gap="lg">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            width: '250px',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '150px',
              backgroundColor: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2'][i % 6],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
            }}
          >
            {i + 1}
          </div>
          <div style={{ padding: '1rem' }}>
            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Card {i + 1}</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              This is a sample card that wraps to new lines automatically
            </p>
          </div>
        </div>
      ))}
    </Wrap>
  ),
};
