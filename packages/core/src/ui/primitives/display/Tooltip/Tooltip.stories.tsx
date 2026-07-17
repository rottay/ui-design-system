/**
 * Tooltip Stories
 * Colocated with component following approved architecture.
 *
 * @module Tooltip/stories
 * @description Storybook stories for the Tooltip component demonstrating
 * all features, variants, placements, and engine implementations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Tooltip component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Display/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Tooltip component for displaying contextual information on hover, focus, or click.
Supports multiple placement positions, trigger types, and color variants.

**Features:**
- 12 placement positions
- Multiple trigger types (hover, click, focus, manual)
- Color variants (default, primary, secondary, success, warning, error)
- Controlled and uncontrolled modes
- Configurable show/hide delays
- Arrow indicator support
- Three engine implementations (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
      ],
      description: 'Position of the tooltip relative to the trigger element',
    },
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus', 'manual'],
      description: 'How the tooltip is triggered',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
      description: 'Color variant of the tooltip',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled',
    },
    showDelay: {
      control: 'number',
      description: 'Delay in ms before showing the tooltip',
    },
    hideDelay: {
      control: 'number',
      description: 'Delay in ms before hiding the tooltip',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Default tooltip with basic configuration.
 */
export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
    placement: 'top',
  },
};

/**
 * Tooltip placements demonstration.
 * Shows all 12 available placement positions.
 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', width: '400px' }}>
      {/* Top row */}
      <div />
      <Tooltip content="Top" placement="top">
        <button style={{ padding: '8px 16px', width: '100%' }}>Top</button>
      </Tooltip>
      <div />

      {/* Middle row */}
      <Tooltip content="Left" placement="left">
        <button style={{ padding: '8px 16px', width: '100%' }}>Left</button>
      </Tooltip>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Placements
      </div>
      <Tooltip content="Right" placement="right">
        <button style={{ padding: '8px 16px', width: '100%' }}>Right</button>
      </Tooltip>

      {/* Bottom row */}
      <div />
      <Tooltip content="Bottom" placement="bottom">
        <button style={{ padding: '8px 16px', width: '100%' }}>Bottom</button>
      </Tooltip>
      <div />
    </div>
  ),
};

/**
 * Color variants demonstration.
 * Shows all available color options.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const).map((color) => (
        <Tooltip key={color} content={`${color} tooltip`} color={color}>
          <button style={{ padding: '8px 16px', textTransform: 'capitalize' }}>{color}</button>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * Trigger types demonstration.
 * Shows hover, click, and focus triggers.
 */
export const TriggerTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Tooltip content="Hover triggered" trigger="hover">
        <button style={{ padding: '8px 16px' }}>Hover</button>
      </Tooltip>
      <Tooltip content="Click triggered" trigger="click">
        <button style={{ padding: '8px 16px' }}>Click</button>
      </Tooltip>
      <Tooltip content="Focus triggered" trigger="focus">
        <button style={{ padding: '8px 16px' }}>Focus (Tab)</button>
      </Tooltip>
    </div>
  ),
};

/**
 * Arrow options demonstration.
 * Shows tooltip with and without arrow indicator.
 */
export const ArrowOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Tooltip content="With arrow" arrow={true}>
        <button style={{ padding: '8px 16px' }}>With Arrow</button>
      </Tooltip>
      <Tooltip content="Without arrow" arrow={false}>
        <button style={{ padding: '8px 16px' }}>No Arrow</button>
      </Tooltip>
    </div>
  ),
};

/**
 * Delay configuration demonstration.
 * Shows tooltips with custom show/hide delays.
 */
export const WithDelays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Tooltip content="Instant" showDelay={0} hideDelay={0}>
        <button style={{ padding: '8px 16px' }}>Instant</button>
      </Tooltip>
      <Tooltip content="500ms show delay" showDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Show</button>
      </Tooltip>
      <Tooltip content="500ms hide delay" hideDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Hide</button>
      </Tooltip>
    </div>
  ),
};

/**
 * Rich content demonstration.
 * Shows tooltip with complex React content.
 */
export const RichContent: Story = {
  render: () => (
    <Tooltip
      content={
        <div style={{ maxWidth: '200px' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Rich Tooltip</strong>
          <p style={{ margin: 0, fontSize: '12px' }}>
            Tooltips can contain rich content including text, links, and formatting.
          </p>
        </div>
      }
    >
      <button style={{ padding: '8px 16px' }}>Rich Content</button>
    </Tooltip>
  ),
};

/**
 * Disabled state demonstration.
 * Shows that disabled tooltips do not appear.
 */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Tooltip content="This tooltip is enabled" disabled={false}>
        <button style={{ padding: '8px 16px' }}>Enabled</button>
      </Tooltip>
      <Tooltip content="This tooltip is disabled" disabled={true}>
        <button style={{ padding: '8px 16px' }}>Disabled</button>
      </Tooltip>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tooltip across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tooltip rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Tooltip}
      props={{
        content: 'This is a tooltip message',
        children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
        placement: 'top',
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all color variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Tooltip color variants across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Tooltip}
      baseProps={{
        content: 'Tooltip content',
        children: <button style={{ padding: '8px 16px' }}>Hover</button>,
      }}
      variantProp="color"
      variants={['default', 'primary', 'secondary', 'success', 'warning', 'error']}
    />
  ),
};

/**
 * Interactive tooltip demonstration.
 * Shows tooltip that allows interaction with its content.
 */
export const Interactive: Story = {
  render: () => (
    <Tooltip
      content={
        <div>
          <p style={{ margin: '0 0 8px 0' }}>Interactive tooltip content</p>
          <button
            style={{ padding: '4px 8px', cursor: 'pointer' }}
            onClick={() => alert('Button clicked!')}
          >
            Click me
          </button>
        </div>
      }
      interactive={true}
      trigger="click"
    >
      <button style={{ padding: '8px 16px' }}>Click for Interactive</button>
    </Tooltip>
  ),
};

/**
 * On different elements demonstration.
 * Shows tooltip on various element types.
 */
export const OnDifferentElements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Tooltip content="On a button">
        <button style={{ padding: '8px 16px' }}>Button</button>
      </Tooltip>
      <Tooltip content="On a span">
        <span style={{ padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          Span
        </span>
      </Tooltip>
      <Tooltip content="On an icon">
        <span style={{ fontSize: '24px', cursor: 'help' }}>?</span>
      </Tooltip>
      <Tooltip content="On a link">
        <a href="#" style={{ color: '#1677ff' }}>Link</a>
      </Tooltip>
    </div>
  ),
};
