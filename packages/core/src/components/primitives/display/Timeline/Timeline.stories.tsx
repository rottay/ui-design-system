/**
 * Timeline Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Timeline> = {
  title: 'Primitives/Display/Timeline',
  component: Timeline,
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
Timeline component for displaying a sequence of events or activities in chronological order.

## Features
- **Three display modes**: left, right, and alternate
- **Custom dot colors**: Use preset colors or custom CSS values
- **Custom dot elements**: Replace dots with icons or custom components
- **Labels**: Display timestamps or metadata opposite to content
- **Pending state**: Show loading indicator for upcoming items
- **Reversible order**: Display items in reverse chronological order
- **Multi-engine support**: Works with Classic (Ant Design), Modern (DaisyUI), and Rustic (vanilla)
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['left', 'right', 'alternate'],
      description: 'Display mode for timeline items',
    },
    reverse: {
      control: 'boolean',
      description: 'Reverse the order of items',
    },
    pending: {
      control: 'text',
      description: 'Content for pending item',
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
type Story = StoryObj<typeof Timeline>;

/**
 * Default timeline with basic items.
 */
export const Default: Story = {
  args: {
    mode: 'left',
  },
  render: (args) => (
    <Timeline {...args}>
      <Timeline.Item>Create a services site 2024-01-01</Timeline.Item>
      <Timeline.Item>Solve initial network problems 2024-01-01</Timeline.Item>
      <Timeline.Item>Technical testing 2024-01-01</Timeline.Item>
      <Timeline.Item>Network problems being solved 2024-01-01</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline with colored dots to indicate status.
 */
export const WithColors: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item color="green">Task completed successfully</Timeline.Item>
      <Timeline.Item color="blue">Task in progress</Timeline.Item>
      <Timeline.Item color="red">Task failed - retrying</Timeline.Item>
      <Timeline.Item color="gray">Task pending</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline in alternate mode with items on both sides.
 */
export const AlternateMode: Story = {
  render: () => (
    <Timeline mode="alternate">
      <Timeline.Item label="2024-01-01">Project kickoff meeting</Timeline.Item>
      <Timeline.Item label="2024-01-15">Design phase completed</Timeline.Item>
      <Timeline.Item label="2024-02-01">Development started</Timeline.Item>
      <Timeline.Item label="2024-03-01">Beta release</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline with a pending item at the end.
 */
export const WithPending: Story = {
  render: () => (
    <Timeline pending="Recording...">
      <Timeline.Item color="green">Create a services site 2024-01-01</Timeline.Item>
      <Timeline.Item color="green">Solve initial network problems 2024-01-01</Timeline.Item>
      <Timeline.Item>Technical testing 2024-01-01</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline with reversed item order.
 */
export const Reversed: Story = {
  render: () => (
    <Timeline reverse>
      <Timeline.Item color="green">First event</Timeline.Item>
      <Timeline.Item color="blue">Second event</Timeline.Item>
      <Timeline.Item color="red">Third event</Timeline.Item>
      <Timeline.Item color="gray">Fourth event</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline with custom dot elements.
 */
export const WithCustomDots: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item dot={<span style={{ fontSize: '16px' }}>&#10003;</span>} color="green">
        Completed task
      </Timeline.Item>
      <Timeline.Item dot={<span style={{ fontSize: '16px' }}>&#9881;</span>} color="blue">
        In progress
      </Timeline.Item>
      <Timeline.Item dot={<span style={{ fontSize: '16px' }}>&#9888;</span>} color="red">
        Needs attention
      </Timeline.Item>
      <Timeline.Item dot={<span style={{ fontSize: '16px' }}>&#9679;</span>} color="gray">
        Pending
      </Timeline.Item>
    </Timeline>
  ),
};

/**
 * Timeline using the items prop instead of children.
 */
export const WithItemsProp: Story = {
  args: {
    items: [
      { children: 'Create project structure', color: 'green' },
      { children: 'Set up development environment', color: 'green' },
      { children: 'Implement core features', color: 'blue' },
      { children: 'Write documentation', color: 'gray' },
    ],
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Timeline across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Timeline rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Timeline}
      props={{
        items: [
          { children: 'Task completed', color: 'green' },
          { children: 'Task in progress', color: 'blue' },
          { children: 'Task pending', color: 'gray' },
        ],
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all modes across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant x Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Complete matrix of all Timeline modes across all engines.',
      },
    },
  },
  render: () => (
    <VariantEngineMatrix
      component={Timeline}
      baseProps={{
        items: [
          { children: 'First event' },
          { children: 'Second event' },
          { children: 'Third event' },
        ],
      }}
      variantProp="mode"
      variants={['left', 'right', 'alternate']}
    />
  ),
};

/**
 * Timeline with labels showing timestamps.
 */
export const WithLabels: Story = {
  render: () => (
    <Timeline mode="left">
      <Timeline.Item label="09:00 AM" color="green">
        Morning standup meeting
      </Timeline.Item>
      <Timeline.Item label="11:00 AM" color="blue">
        Code review session
      </Timeline.Item>
      <Timeline.Item label="02:00 PM" color="blue">
        Feature development
      </Timeline.Item>
      <Timeline.Item label="04:30 PM" color="gray">
        Documentation update
      </Timeline.Item>
    </Timeline>
  ),
};

/**
 * Right-aligned timeline.
 */
export const RightMode: Story = {
  render: () => (
    <Timeline mode="right">
      <Timeline.Item>Create a services site</Timeline.Item>
      <Timeline.Item>Solve initial network problems</Timeline.Item>
      <Timeline.Item>Technical testing</Timeline.Item>
      <Timeline.Item>Network problems being solved</Timeline.Item>
    </Timeline>
  ),
};

/**
 * Complex timeline with all features combined.
 */
export const ComplexExample: Story = {
  render: () => (
    <Timeline mode="alternate" pending="Awaiting next milestone...">
      <Timeline.Item
        label="Q1 2024"
        color="green"
        dot={<span style={{ fontSize: '14px' }}>&#10003;</span>}
      >
        <strong>Project Kickoff</strong>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Initial planning and team assembly completed
        </p>
      </Timeline.Item>
      <Timeline.Item
        label="Q2 2024"
        color="green"
        dot={<span style={{ fontSize: '14px' }}>&#10003;</span>}
      >
        <strong>Design Phase</strong>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          UI/UX designs approved by stakeholders
        </p>
      </Timeline.Item>
      <Timeline.Item label="Q3 2024" color="blue">
        <strong>Development</strong>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Core features implementation in progress
        </p>
      </Timeline.Item>
      <Timeline.Item label="Q4 2024" color="gray">
        <strong>Launch</strong>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Planned public release
        </p>
      </Timeline.Item>
    </Timeline>
  ),
};
