/**
 * Steps Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Steps> = {
  title: 'Primitives/Navigation/Steps',
  component: Steps,
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
        component: 'Steps component for displaying progress through a sequence of steps.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Steps direction',
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size of the steps',
    },
    type: {
      control: 'select',
      options: ['default', 'navigation', 'inline'],
      description: 'Type of steps',
    },
    labelPlacement: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Label placement relative to icon',
    },
    status: {
      control: 'select',
      options: ['wait', 'process', 'finish', 'error'],
      description: 'Current step status',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Steps>;

const defaultItems = [
  { title: 'Login', description: 'Login to your account' },
  { title: 'Verification', description: 'Verify your identity' },
  { title: 'Complete', description: 'Done' },
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
        <Steps
          items={defaultItems}
          current={current}
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
        <Steps items={defaultItems} direction="horizontal" current={1} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Vertical</h4>
        <Steps items={defaultItems} direction="vertical" current={1} />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Default</h4>
        <Steps items={defaultItems} size="default" current={1} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Small</h4>
        <Steps items={defaultItems} size="small" current={1} />
      </div>
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['default', 'navigation', 'inline'] as const).map((type) => (
        <div key={type}>
          <h4 style={{ margin: '0 0 16px 0', textTransform: 'capitalize' }}>{type}</h4>
          <Steps items={defaultItems} type={type} current={1} />
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
        <Steps items={defaultItems} labelPlacement="horizontal" current={1} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 16px 0' }}>Vertical Labels</h4>
        <Steps items={defaultItems} labelPlacement="vertical" current={1} />
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
      { title: 'Step 1', description: 'Description', subTitle: 'Left 00:01:00' },
      { title: 'Step 2', description: 'Description', subTitle: 'Left 00:02:00' },
      { title: 'Step 3', description: 'Description', subTitle: 'Left 00:03:00' },
    ],
    current: 1,
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
  },
};

export const WithErrorStatus: Story = {
  args: {
    items: [
      { title: 'Login', status: 'finish' as const },
      { title: 'Verify', status: 'error' as const, description: 'Verification failed' },
      { title: 'Complete', status: 'wait' as const },
    ],
    current: 1,
  },
};

export const NavigationType: Story = {
  render: function NavigationTypeStory() {
    const [current, setCurrent] = useState(0);

    return (
      <Steps
        items={[
          { title: 'Step 1', subTitle: '00:01:00' },
          { title: 'Step 2', subTitle: '00:02:00' },
          { title: 'Step 3', subTitle: '00:03:00' },
        ]}
        type="navigation"
        current={current}
        onChange={(step) => setCurrent(step)}
      />
    );
  },
};

export const ProgressDot: Story = {
  args: {
    items: defaultItems,
    progressDot: true,
    current: 1,
  },
};

export const VerticalWithContent: Story = {
  render: function VerticalWithContentStory() {
    const [current, setCurrent] = useState(0);

    const stepContent = [
      <div key={0} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Login</h4>
        <p>Please enter your credentials to continue.</p>
      </div>,
      <div key={1} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Verification</h4>
        <p>We sent a code to your email. Please verify.</p>
      </div>,
      <div key={2} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
        <h4>Complete</h4>
        <p>You have successfully completed the process.</p>
      </div>,
    ];

    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <Steps
          items={defaultItems}
          direction="vertical"
          current={current}
          onChange={(step) => setCurrent(step)}
        />
        <div style={{ flex: 1 }}>
          {stepContent[current]}
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
      </div>
    );
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 16px 0', textTransform: 'capitalize' }}>{engine}</h4>
          <Steps
            engine={engine}
            items={defaultItems}
            current={1}
          />
        </div>
      ))}
    </div>
  ),
};
