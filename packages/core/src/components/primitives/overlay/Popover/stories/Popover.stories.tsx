/**
 * Popover Stories
 * Colocated with component following approved architecture.
 *
 * @module Popover/stories
 * @description Storybook stories for the Popover component demonstrating
 * all features, variants, placements, and engine implementations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

/**
 * Popover component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Popover> = {
  title: 'Primitives/Overlay/Popover',
  component: Popover,
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
Popover component for displaying floating content with rich formatting.
Supports multiple placement positions, trigger types, and content configurations.

**Features:**
- 12 placement positions
- Multiple trigger types (hover, click, focus)
- Title and content sections
- Controlled and uncontrolled modes
- Configurable show/hide delays
- Arrow indicator support
- Three engine implementations (Titan, Hermes, Apollo)
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
      description: 'Position of the popover relative to the trigger element',
    },
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus'],
      description: 'How the popover is triggered',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

/**
 * Default popover with basic configuration.
 */
export const Default: Story = {
  args: {
    content: 'This is the popover content',
    title: 'Popover Title',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
    placement: 'top',
  },
};

/**
 * Popover placements demonstration.
 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '80px', width: '500px' }}>
      {/* Top row */}
      <Popover content="Top Left" placement="topLeft">
        <button style={{ padding: '8px 16px', width: '100%' }}>TL</button>
      </Popover>
      <Popover content="Top" placement="top">
        <button style={{ padding: '8px 16px', width: '100%' }}>Top</button>
      </Popover>
      <Popover content="Top Right" placement="topRight">
        <button style={{ padding: '8px 16px', width: '100%' }}>TR</button>
      </Popover>

      {/* Middle row */}
      <Popover content="Left" placement="left">
        <button style={{ padding: '8px 16px', width: '100%' }}>Left</button>
      </Popover>
      <div />
      <Popover content="Right" placement="right">
        <button style={{ padding: '8px 16px', width: '100%' }}>Right</button>
      </Popover>

      {/* Bottom row */}
      <Popover content="Bottom Left" placement="bottomLeft">
        <button style={{ padding: '8px 16px', width: '100%' }}>BL</button>
      </Popover>
      <Popover content="Bottom" placement="bottom">
        <button style={{ padding: '8px 16px', width: '100%' }}>Bottom</button>
      </Popover>
      <Popover content="Bottom Right" placement="bottomRight">
        <button style={{ padding: '8px 16px', width: '100%' }}>BR</button>
      </Popover>
    </div>
  ),
};

/**
 * Trigger types demonstration.
 */
export const TriggerTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Hover triggered" title="Hover" trigger="hover">
        <button style={{ padding: '8px 16px' }}>Hover</button>
      </Popover>
      <Popover content="Click triggered" title="Click" trigger="click">
        <button style={{ padding: '8px 16px' }}>Click</button>
      </Popover>
      <Popover content="Focus triggered" title="Focus" trigger="focus">
        <button style={{ padding: '8px 16px' }}>Focus (Tab)</button>
      </Popover>
    </div>
  ),
};

/**
 * With title demonstration.
 */
export const WithTitle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Content without title">
        <button style={{ padding: '8px 16px' }}>No Title</button>
      </Popover>
      <Popover content="Content with title" title="Popover Title">
        <button style={{ padding: '8px 16px' }}>With Title</button>
      </Popover>
    </div>
  ),
};

/**
 * Rich content demonstration.
 */
export const RichContent: Story = {
  render: () => (
    <Popover
      title="User Profile"
      content={
        <div style={{ minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              JD
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>John Doe</div>
              <div style={{ fontSize: '12px', color: '#666' }}>john@example.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ flex: 1, padding: '4px 8px', cursor: 'pointer' }}>Message</button>
            <button style={{ flex: 1, padding: '4px 8px', cursor: 'pointer' }}>Follow</button>
          </div>
        </div>
      }
    >
      <button style={{ padding: '8px 16px' }}>User Card</button>
    </Popover>
  ),
};

/**
 * Arrow options demonstration.
 */
export const ArrowOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="With arrow" title="Arrow" arrow={true}>
        <button style={{ padding: '8px 16px' }}>With Arrow</button>
      </Popover>
      <Popover content="Without arrow" title="No Arrow" arrow={false}>
        <button style={{ padding: '8px 16px' }}>No Arrow</button>
      </Popover>
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
        <Popover
          content="Controlled popover content"
          title="Controlled"
          open={open}
          onOpenChange={setOpen}
          trigger="click"
        >
          <button style={{ padding: '8px 16px' }}>Click to toggle</button>
        </Popover>
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
 * Side-by-side comparison of Popover across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Popover rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Popover}
      props={{
        title: 'Popover Title',
        content: 'This is the popover content',
        children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
      }}
      showDescriptions
    />
  ),
};

/**
 * Delay configuration demonstration.
 */
export const WithDelays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Instant" mouseEnterDelay={0} mouseLeaveDelay={0}>
        <button style={{ padding: '8px 16px' }}>Instant</button>
      </Popover>
      <Popover content="500ms show delay" mouseEnterDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Show</button>
      </Popover>
      <Popover content="500ms hide delay" mouseLeaveDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Hide</button>
      </Popover>
    </div>
  ),
};

// Need React for controlled story
import React from 'react';
