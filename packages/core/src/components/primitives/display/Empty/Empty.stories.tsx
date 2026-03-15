/**
 * Empty Component - Storybook Stories
 *
 * This file contains all Storybook stories for the Empty component.
 * Stories demonstrate various use cases and configurations across
 * all three rendering engines (Classic, Modern, Rustic).
 *
 * @module Empty/stories
 * @category Display
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from './';
import { DesignSystemProvider } from '../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Empty> = {
  title: 'Primitives/Display/Empty',
  component: Empty,
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
The Empty component is used to display a placeholder when there is no data available.
It typically appears in data tables, search results, or any container that may be empty.

## Features
- Multiple image variants (default, simple, custom)
- Customizable description text
- Support for action buttons
- Works with all three engines (Classic, Modern, Rustic)
- Accessible with proper ARIA attributes
        `,
      },
    },
  },
  argTypes: {
    image: {
      control: 'select',
      options: ['default', 'simple'],
      description: 'The image variant to display',
      table: {
        type: { summary: 'ReactNode | "default" | "simple"' },
        defaultValue: { summary: 'default' },
      },
    },
    description: {
      control: 'text',
      description: 'The description text to display below the image',
      table: {
        type: { summary: 'ReactNode' },
        defaultValue: { summary: 'No Data' },
      },
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'The rendering engine to use',
      table: {
        type: { summary: 'EngineType' },
        defaultValue: { summary: 'classic' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  args: {
    description: 'No Data',
  },
};

export const SimpleImage: Story = {
  args: {
    image: 'simple',
    description: 'No Data Available',
  },
};

export const CustomDescription: Story = {
  args: {
    description: 'No results found for your search',
  },
};

export const WithAction: Story = {
  args: {
    description: 'Your cart is empty',
  },
  render: (args) => (
    <Empty {...args}>
      <button
        style={{
          padding: '8px 16px',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Start Shopping
      </button>
    </Empty>
  ),
};

export const NoDescription: Story = {
  args: {
    description: false,
  },
};

export const CustomImage: Story = {
  args: {
    image: (
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="45" stroke="#d9d9d9" strokeWidth="2" fill="#fafafa" />
        <path
          d="M35 50L45 60L65 40"
          stroke="#bfbfbf"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    description: 'Custom icon example',
  },
};

export const CompareEngines: Story = {
  name: 'Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Empty rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Empty}
      props={{
        description: 'No Data Available',
      }}
      showDescriptions
    />
  ),
};

export const VariantMatrix: Story = {
  name: 'Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Empty image variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Empty}
      baseProps={{
        description: 'No Data',
      }}
      variantProp="image"
      variants={['default', 'simple']}
    />
  ),
};

export const ImageVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '48px', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 16px 0' }}>Default Image</h4>
        <Empty image="default" description="Default variant" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 16px 0' }}>Simple Image</h4>
        <Empty image="simple" description="Simple variant" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of the default and simple image variants.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    description: 'Styled empty state',
    style: {
      backgroundColor: '#f6f8fa',
      borderRadius: '12px',
      padding: '48px',
      border: '1px dashed #d9d9d9',
    },
    imageStyle: {
      opacity: 0.5,
    },
  },
};

export const SearchResultsEmpty: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
      }}
    >
      <Empty
        image="simple"
        description="No results found for 'example query'"
      >
        <div style={{ marginTop: '8px' }}>
          <p style={{ color: '#8c8c8c', fontSize: '12px', margin: '0 0 12px 0' }}>
            Try adjusting your search or filter to find what you are looking for.
          </p>
          <button
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: '#1890ff',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      </Empty>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example of an empty search results state with helpful actions.',
      },
    },
  },
};

export const TableEmpty: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #e8e8e8',
          padding: '12px 16px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        <span>Name</span>
        <span>Email</span>
        <span>Role</span>
        <span>Status</span>
      </div>
      <Empty description="No users found">
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Add User
        </button>
      </Empty>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of an empty data table with a call-to-action button.',
      },
    },
  },
};
