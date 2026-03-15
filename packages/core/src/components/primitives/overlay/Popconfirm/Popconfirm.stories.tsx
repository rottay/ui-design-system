/**
 * Popconfirm Stories
 * Colocated with component following approved architecture.
 *
 * @module Popconfirm/stories
 * @description Storybook stories for the Popconfirm component demonstrating
 * all features, variants, placements, and engine implementations.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popconfirm } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Popconfirm component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Popconfirm> = {
  title: 'Primitives/Overlay/Popconfirm',
  component: Popconfirm,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '150px', display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Popconfirm component for confirming user actions before proceeding.
Displays a confirmation dialog with customizable title, description, and buttons.

**Features:**
- 12 placement positions
- Customizable button text and types
- Description support
- Custom icons
- Async confirmation support with loading state
- Controlled and uncontrolled modes
- Three engine implementations (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top', 'topLeft', 'topRight',
        'bottom', 'bottomLeft', 'bottomRight',
        'left', 'leftTop', 'leftBottom',
        'right', 'rightTop', 'rightBottom',
      ],
      description: 'Position of the popconfirm relative to the trigger element',
    },
    okType: {
      control: 'select',
      options: ['primary', 'danger', 'default'],
      description: 'Type of the confirm button',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    showArrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the popconfirm is disabled',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popconfirm>;

/**
 * Default popconfirm with basic configuration.
 */
export const Default: Story = {
  args: {
    title: 'Are you sure you want to delete this?',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Delete</button>,
    placement: 'top',
  },
};

/**
 * With description demonstration.
 */
export const WithDescription: Story = {
  args: {
    title: 'Delete this item?',
    description: 'This action cannot be undone. All associated data will be permanently removed.',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Delete</button>,
  },
};

/**
 * Button type variants demonstration.
 */
export const ButtonTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popconfirm title="Primary confirmation" okType="primary">
        <button style={{ padding: '8px 16px' }}>Primary</button>
      </Popconfirm>
      <Popconfirm title="Danger confirmation" okType="danger">
        <button style={{ padding: '8px 16px', color: 'red' }}>Danger</button>
      </Popconfirm>
      <Popconfirm title="Default confirmation" okType="default">
        <button style={{ padding: '8px 16px' }}>Default</button>
      </Popconfirm>
    </div>
  ),
};

/**
 * Custom button text demonstration.
 */
export const CustomButtonText: Story = {
  args: {
    title: 'Save changes?',
    okText: 'Save',
    cancelText: 'Discard',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Save</button>,
  },
};

/**
 * Placements demonstration.
 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '400px' }}>
      <Popconfirm title="Confirm?" placement="topLeft">
        <button style={{ padding: '8px', width: '100%' }}>TL</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="top">
        <button style={{ padding: '8px', width: '100%' }}>Top</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="topRight">
        <button style={{ padding: '8px', width: '100%' }}>TR</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="left">
        <button style={{ padding: '8px', width: '100%' }}>Left</button>
      </Popconfirm>
      <div />
      <Popconfirm title="Confirm?" placement="right">
        <button style={{ padding: '8px', width: '100%' }}>Right</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="bottomLeft">
        <button style={{ padding: '8px', width: '100%' }}>BL</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="bottom">
        <button style={{ padding: '8px', width: '100%' }}>Bottom</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" placement="bottomRight">
        <button style={{ padding: '8px', width: '100%' }}>BR</button>
      </Popconfirm>
    </div>
  ),
};

/**
 * Custom icon demonstration.
 */
export const CustomIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popconfirm title="Default icon">
        <button style={{ padding: '8px 16px' }}>Default Icon</button>
      </Popconfirm>
      <Popconfirm title="Custom icon" icon={<span style={{ color: 'red' }}>⚠️</span>}>
        <button style={{ padding: '8px 16px' }}>Custom Icon</button>
      </Popconfirm>
      <Popconfirm title="No icon" icon={null}>
        <button style={{ padding: '8px 16px' }}>No Icon</button>
      </Popconfirm>
    </div>
  ),
};

/**
 * Async confirmation demonstration.
 */
export const AsyncConfirmation: Story = {
  render: () => {
    const handleConfirm = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          alert('Deleted!');
          resolve();
        }, 2000);
      });
    };

    return (
      <Popconfirm
        title="Delete this item?"
        description="This will take 2 seconds to process"
        onConfirm={handleConfirm}
      >
        <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Delete (Async)</button>
      </Popconfirm>
    );
  },
};

/**
 * With callbacks demonstration.
 */
export const WithCallbacks: Story = {
  render: () => (
    <Popconfirm
      title="Confirm action?"
      onConfirm={() => alert('Confirmed!')}
      onCancel={() => alert('Cancelled!')}
    >
      <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Click me</button>
    </Popconfirm>
  ),
};

/**
 * Disabled demonstration.
 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popconfirm title="Confirm?" disabled={false}>
        <button style={{ padding: '8px 16px' }}>Enabled</button>
      </Popconfirm>
      <Popconfirm title="Confirm?" disabled={true}>
        <button style={{ padding: '8px 16px', opacity: 0.5 }}>Disabled</button>
      </Popconfirm>
    </div>
  ),
};

/**
 * Controlled mode demonstration.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <Popconfirm
          title="Controlled popconfirm"
          open={open}
          onOpenChange={setOpen}
        >
          <button style={{ padding: '8px 16px' }}>Click to open</button>
        </Popconfirm>
        <button onClick={() => setOpen(!open)} style={{ padding: '4px 8px' }}>
          External Toggle: {open ? 'Close' : 'Open'}
        </button>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Popconfirm across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Popconfirm rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Popconfirm}
      props={{
        title: 'Are you sure?',
        children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Delete</button>,
      }}
      showDescriptions
    />
  ),
};

/**
 * Delete confirmation pattern demonstration.
 */
export const DeletePattern: Story = {
  render: () => (
    <Popconfirm
      title="Delete this record?"
      description="Once deleted, this record cannot be recovered."
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
      icon={<span style={{ color: '#ff4d4f' }}>🗑️</span>}
      onConfirm={() => alert('Record deleted')}
    >
      <button style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Delete Record
      </button>
    </Popconfirm>
  ),
};
