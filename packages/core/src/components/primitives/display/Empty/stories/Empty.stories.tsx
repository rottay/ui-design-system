/**
 * Empty Component - Storybook Stories
 *
 * This file contains all Storybook stories for the Empty component.
 * Stories demonstrate various use cases and configurations across
 * all three rendering engines (Titan, Hermes, Apollo).
 *
 * @module Empty/stories
 * @category Display
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

/**
 * The Empty component displays a placeholder when there is no data
 * to show. It supports multiple image variants and can include
 * action buttons for user interaction.
 */
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
- Works with all three engines (Titan, Hermes, Apollo)
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
      options: ['titan', 'hermes', 'apollo'],
      description: 'The rendering engine to use',
      table: {
        type: { summary: 'EngineType' },
        defaultValue: { summary: 'titan' },
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

/**
 * Default empty state with standard image and description.
 */
export const Default: Story = {
  args: {
    description: 'No Data',
  },
};

/**
 * Empty state with simple image variant for less prominent placement.
 */
export const SimpleImage: Story = {
  args: {
    image: 'simple',
    description: 'No Data Available',
  },
};

/**
 * Empty state with custom description text.
 */
export const CustomDescription: Story = {
  args: {
    description: 'No results found for your search',
  },
};

/**
 * Empty state with an action button to encourage user interaction.
 */
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

/**
 * Empty state without any description, showing only the image.
 */
export const NoDescription: Story = {
  args: {
    description: false,
  },
};

/**
 * Empty state with custom image element.
 */
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

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Empty across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Empty rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
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

/**
 * Matrix showing all image variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
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

/**
 * Image variants comparison showing default and simple images.
 */
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

/**
 * Empty state with custom styling applied via style prop.
 */
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

/**
 * Example use case: Empty search results.
 */
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

/**
 * Example use case: Empty data table.
 */
export const TableEmpty: Story = {
  render: () => (
    <div
      style={{
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Table header */}
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
      {/* Empty state */}
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
