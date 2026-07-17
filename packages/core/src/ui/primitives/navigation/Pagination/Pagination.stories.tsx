/**
 * Pagination Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Pagination> = {
  title: 'Primitives/Navigation/Pagination',
  component: Pagination,
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
        component: 'Pagination component for navigating through pages of content.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of pagination',
    },
    showSizeChanger: {
      control: 'boolean',
      description: 'Show page size changer',
    },
    showTotal: {
      control: 'boolean',
      description: 'Show total items count',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable pagination',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    current: 1,
    total: 50,
    pageSize: 10,
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          Current page: {current}, Page size: {pageSize}
        </div>
        <Pagination
          current={current}
          total={100}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0' }}>Size: {size}</h4>
          <Pagination current={1} total={100} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const WithSizeChanger: Story = {
  args: {
    current: 1,
    total: 100,
    showSizeChanger: true,
  },
};

export const WithTotal: Story = {
  args: {
    current: 1,
    total: 100,
    showTotal: true,
  },
};

export const Disabled: Story = {
  args: {
    current: 3,
    total: 100,
    disabled: true,
  },
};

export const FewPages: Story = {
  args: {
    current: 1,
    total: 30,
    pageSize: 10,
  },
};

export const ManyPages: Story = {
  args: {
    current: 50,
    total: 1000,
    pageSize: 10,
  },
};

export const CustomPageSize: Story = {
  args: {
    current: 1,
    total: 200,
    pageSize: 20,
    showSizeChanger: true,
  },
};

export const FullFeatured: Story = {
  render: function FullFeaturedStory() {
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const items = Array.from({ length: pageSize }, (_, i) => ({
      id: (current - 1) * pageSize + i + 1,
      name: `Item ${(current - 1) * pageSize + i + 1}`,
    }));

    return (
      <div>
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Items</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
        <Pagination
          current={current}
          total={100}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal
        />
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Pagination across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Pagination rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Pagination}
      props={{
        current: 3,
        total: 100,
        pageSize: 10,
      }}
      showDescriptions
    />
  ),
};
