/**
 * @file Descriptions Stories
 * @description Storybook stories for the Descriptions component.
 * Colocated with component following approved architecture.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Descriptions } from './';
import { DesignSystemProvider } from '../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Descriptions> = {
  title: 'Primitives/Display/Descriptions',
  component: Descriptions,
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
        component:
          'Descriptions component for displaying key-value pairs in a structured layout. Supports multiple engines (Classic, Modern, Rustic), horizontal/vertical layouts, bordered styles, and responsive column configurations.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Title displayed at the top of the descriptions block',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show borders around the descriptions',
    },
    column: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Number of columns per row',
    },
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction for label-value pairs',
    },
    size: {
      control: 'select',
      options: ['default', 'small', 'middle'],
      description: 'Size variant affecting spacing and font sizes',
    },
    colon: {
      control: 'boolean',
      description: 'Whether to display a colon after labels',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Descriptions>;

/**
 * Default story showing basic usage with title and items.
 */
export const Default: Story = {
  args: {
    title: 'User Information',
    bordered: true,
    column: 3,
  },
  render: (args) => (
    <Descriptions {...args}>
      <Descriptions.Item label="UserName">John Doe</Descriptions.Item>
      <Descriptions.Item label="Phone">+1 234 567 890</Descriptions.Item>
      <Descriptions.Item label="Email">john.doe@example.com</Descriptions.Item>
      <Descriptions.Item label="Address" span={2}>
        123 Main Street, New York, NY 10001
      </Descriptions.Item>
      <Descriptions.Item label="Status">Active</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * Bordered variant with visible borders around items.
 */
export const Bordered: Story = {
  render: () => (
    <Descriptions title="Product Details" bordered>
      <Descriptions.Item label="Product">Cloud Database</Descriptions.Item>
      <Descriptions.Item label="Billing Mode">Prepaid</Descriptions.Item>
      <Descriptions.Item label="Auto Renewal">Yes</Descriptions.Item>
      <Descriptions.Item label="Order Time">2024-01-15 12:00:00</Descriptions.Item>
      <Descriptions.Item label="Usage Time" span={2}>
        2024-01-15 12:00:00 - 2025-01-15 12:00:00
      </Descriptions.Item>
      <Descriptions.Item label="Status">Running</Descriptions.Item>
      <Descriptions.Item label="Negotiated Amount">$120.00</Descriptions.Item>
      <Descriptions.Item label="Discount">$0.00</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * Vertical layout with labels above values.
 */
export const VerticalLayout: Story = {
  render: () => (
    <Descriptions title="Employee Profile" layout="vertical" bordered>
      <Descriptions.Item label="Full Name">Jane Smith</Descriptions.Item>
      <Descriptions.Item label="Department">Engineering</Descriptions.Item>
      <Descriptions.Item label="Position">Senior Developer</Descriptions.Item>
      <Descriptions.Item label="Start Date">March 2022</Descriptions.Item>
      <Descriptions.Item label="Manager">Bob Wilson</Descriptions.Item>
      <Descriptions.Item label="Location">Remote</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * Different size variants.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Descriptions title="Small Size" size="small" bordered>
        <Descriptions.Item label="Name">Small Item</Descriptions.Item>
        <Descriptions.Item label="Value">Compact</Descriptions.Item>
      </Descriptions>

      <Descriptions title="Default Size" size="default" bordered>
        <Descriptions.Item label="Name">Default Item</Descriptions.Item>
        <Descriptions.Item label="Value">Normal</Descriptions.Item>
      </Descriptions>

      <Descriptions title="Middle Size" size="middle" bordered>
        <Descriptions.Item label="Name">Middle Item</Descriptions.Item>
        <Descriptions.Item label="Value">Medium</Descriptions.Item>
      </Descriptions>
    </div>
  ),
};

/**
 * Column configurations showing different layouts.
 */
export const ColumnConfigurations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Descriptions title="2 Columns" column={2} bordered>
        <Descriptions.Item label="Field 1">Value 1</Descriptions.Item>
        <Descriptions.Item label="Field 2">Value 2</Descriptions.Item>
        <Descriptions.Item label="Field 3">Value 3</Descriptions.Item>
        <Descriptions.Item label="Field 4">Value 4</Descriptions.Item>
      </Descriptions>

      <Descriptions title="4 Columns" column={4} bordered>
        <Descriptions.Item label="A">1</Descriptions.Item>
        <Descriptions.Item label="B">2</Descriptions.Item>
        <Descriptions.Item label="C">3</Descriptions.Item>
        <Descriptions.Item label="D">4</Descriptions.Item>
      </Descriptions>
    </div>
  ),
};

/**
 * Item spanning multiple columns.
 */
export const ItemSpan: Story = {
  render: () => (
    <Descriptions title="Order Summary" column={3} bordered>
      <Descriptions.Item label="Order ID">ORD-2024-001</Descriptions.Item>
      <Descriptions.Item label="Customer">John Doe</Descriptions.Item>
      <Descriptions.Item label="Date">2024-01-15</Descriptions.Item>
      <Descriptions.Item label="Shipping Address" span={3}>
        123 Main Street, Apartment 4B, New York, NY 10001, United States
      </Descriptions.Item>
      <Descriptions.Item label="Notes" span={2}>
        Please deliver before 5 PM. Ring the doorbell twice.
      </Descriptions.Item>
      <Descriptions.Item label="Total">$299.99</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * With extra content in header.
 */
export const WithExtra: Story = {
  render: () => (
    <Descriptions
      title="Account Settings"
      extra={
        <button
          style={{
            padding: '4px 12px',
            borderRadius: '4px',
            border: '1px solid #1890ff',
            background: 'transparent',
            color: '#1890ff',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      }
      bordered
    >
      <Descriptions.Item label="Username">johndoe</Descriptions.Item>
      <Descriptions.Item label="Email">john@example.com</Descriptions.Item>
      <Descriptions.Item label="Role">Administrator</Descriptions.Item>
      <Descriptions.Item label="Created">Jan 15, 2024</Descriptions.Item>
      <Descriptions.Item label="Last Login">Today</Descriptions.Item>
      <Descriptions.Item label="2FA">Enabled</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * Without colon after labels.
 */
export const WithoutColon: Story = {
  render: () => (
    <Descriptions title="Technical Specs" colon={false} bordered>
      <Descriptions.Item label="CPU">Intel Core i9</Descriptions.Item>
      <Descriptions.Item label="RAM">32 GB DDR5</Descriptions.Item>
      <Descriptions.Item label="Storage">1 TB NVMe SSD</Descriptions.Item>
      <Descriptions.Item label="GPU">RTX 4090</Descriptions.Item>
      <Descriptions.Item label="Display">27" 4K</Descriptions.Item>
      <Descriptions.Item label="Ports">USB-C, HDMI</Descriptions.Item>
    </Descriptions>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Descriptions across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Descriptions rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Descriptions}
      props={{
        title: 'User Profile',
        bordered: true,
        column: 2,
        items: [
          { label: 'Name', children: 'John Doe' },
          { label: 'Email', children: 'john@example.com' },
        ],
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing all size variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Descriptions size variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Descriptions}
      baseProps={{
        title: 'Details',
        bordered: true,
        items: [
          { label: 'Key', children: 'Value' },
          { label: 'Status', children: 'Active' },
        ],
      }}
      variantProp="size"
      variants={['small', 'default', 'middle']}
    />
  ),
};

/**
 * Custom styling with the styles prop.
 */
export const CustomStyling: Story = {
  render: () => (
    <Descriptions
      title="Styled Descriptions"
      bordered
      styles={{
        label: { fontWeight: 600, backgroundColor: '#fafafa' },
        content: { color: '#1890ff' }
      }}
    >
      <Descriptions.Item label="Primary">Blue Text</Descriptions.Item>
      <Descriptions.Item
        label="Custom"
        styles={{
          label: { color: 'green' },
          content: { color: 'red' }
        }}
      >
        Red Content
      </Descriptions.Item>
      <Descriptions.Item label="Normal">Standard</Descriptions.Item>
    </Descriptions>
  ),
};

/**
 * Unbounded (no borders) minimal style.
 */
export const Unbounded: Story = {
  render: () => (
    <Descriptions title="Minimal Style" bordered={false} column={2}>
      <Descriptions.Item label="Project">Design System</Descriptions.Item>
      <Descriptions.Item label="Version">1.0.0</Descriptions.Item>
      <Descriptions.Item label="Author">Team</Descriptions.Item>
      <Descriptions.Item label="License">MIT</Descriptions.Item>
    </Descriptions>
  ),
};
