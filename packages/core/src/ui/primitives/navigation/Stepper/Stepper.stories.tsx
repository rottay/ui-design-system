/**
 * Stepper Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Stepper> = {
  title: 'Primitives/Navigation/Stepper',
  component: Stepper,
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
        component: 'Stepper component for guiding users through a multi-step process.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Stepper direction',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the stepper',
    },
    variant: {
      control: 'select',
      options: ['default', 'simple', 'circles'],
      description: 'Visual variant',
    },
    labelPlacement: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Label placement relative to icon',
    },
    clickable: {
      control: 'boolean',
      description: 'Whether steps are clickable',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const defaultItems = [
  { title: 'Step 1', description: 'Account Setup' },
  { title: 'Step 2', description: 'Personal Info' },
  { title: 'Step 3', description: 'Confirmation' },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    current: 0,
  },
};

export const InProgress: Story = {
  args: {
    items: defaultItems,
    current: 1,
  },
};

export const Completed: Story = {
  args: {
    items: defaultItems,
    current: 3,
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [current, setCurrent] = useState(0);

    return (
      <div>
        <Stepper
          items={defaultItems}
          current={current}
          clickable
          onChange={(step) => setCurrent(step)}
        />
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrent(Math.min(defaultItems.length - 1, current + 1))}
            disabled={current === defaultItems.length - 1}
          >
            Next
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          Current step: {current + 1}
        </div>
      </div>
    );
  },
};

export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Horizontal</h4>
        <Stepper items={defaultItems} direction="horizontal" current={1} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Vertical</h4>
        <Stepper items={defaultItems} direction="vertical" current={1} />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 16px 0' }}>Size: {size}</h4>
          <Stepper items={defaultItems} size={size} current={1} />
        </div>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['default', 'simple', 'circles'] as const).map((variant) => (
        <div key={variant}>
          <h4 style={{ margin: '0 0 16px 0', textTransform: 'capitalize' }}>{variant}</h4>
          <Stepper items={defaultItems} variant={variant} current={1} />
        </div>
      ))}
    </div>
  ),
};

export const LabelPlacements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Horizontal Labels</h4>
        <Stepper items={defaultItems} labelPlacement="horizontal" current={1} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Vertical Labels</h4>
        <Stepper items={defaultItems} labelPlacement="vertical" current={1} />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    items: [
      { title: 'Login', description: 'Enter credentials', icon: <span>🔑</span> },
      { title: 'Verify', description: 'Confirm identity', icon: <span>✅</span> },
      { title: 'Done', description: 'Access granted', icon: <span>🎉</span> },
    ],
    current: 1,
  },
};

export const WithSubtitles: Story = {
  args: {
    items: [
      { title: 'Step 1', description: 'Description', subTitle: '(Required)' },
      { title: 'Step 2', description: 'Description', subTitle: '(Optional)' },
      { title: 'Step 3', description: 'Description', subTitle: '(Required)' },
    ],
    current: 0,
  },
};

export const WithDisabledSteps: Story = {
  args: {
    items: [
      { title: 'Step 1', description: 'Enabled' },
      { title: 'Step 2', description: 'Enabled' },
      { title: 'Step 3', description: 'Disabled', disabled: true },
    ],
    current: 0,
    clickable: true,
  },
};

export const WithErrorStatus: Story = {
  args: {
    items: [
      { title: 'Step 1', status: 'finish' as const },
      { title: 'Step 2', status: 'error' as const, description: 'Validation failed' },
      { title: 'Step 3', status: 'wait' as const },
    ],
    current: 1,
  },
};

export const ClickableSteps: Story = {
  render: function ClickableStory() {
    const [current, setCurrent] = useState(0);

    return (
      <div>
        <Stepper
          items={[
            { title: 'Step 1', description: 'Click to select' },
            { title: 'Step 2', description: 'Click to select' },
            { title: 'Step 3', description: 'Click to select' },
            { title: 'Step 4', description: 'This is disabled', disabled: true },
          ]}
          current={current}
          clickable
          onChange={(step) => setCurrent(step)}
        />
        <div style={{ marginTop: 16 }}>
          Selected step: {current + 1}
        </div>
      </div>
    );
  },
};

export const VerticalWithContent: Story = {
  render: function VerticalWithContentStory() {
    const [current, setCurrent] = useState(0);

    const stepContent = [
      <div key={0} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Account Setup</h4>
        <p>Create your account with email and password.</p>
      </div>,
      <div key={1} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Personal Information</h4>
        <p>Tell us a bit about yourself.</p>
      </div>,
      <div key={2} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Confirmation</h4>
        <p>Review and confirm your details.</p>
      </div>,
    ];

    return (
      <div>
        <Stepper
          items={defaultItems}
          direction="vertical"
          current={current}
          clickable
          onChange={(step) => setCurrent(step)}
        />
        <div style={{ marginTop: 24 }}>
          {stepContent[current]}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrent(Math.min(2, current + 1))}
            disabled={current === 2}
          >
            Next
          </button>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Stepper across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Stepper rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Stepper}
      props={{
        items: defaultItems,
        current: 1,
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};
