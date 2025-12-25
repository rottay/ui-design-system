/**
 * Alert Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../../components/primitives/feedback/alert';
import { DesignSystemProvider } from '../../../system/providers/root';

const meta: Meta<typeof Alert> = {
  title: 'Primitives/Feedback/Alert',
  component: Alert,
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
        component: 'Alert component for displaying feedback messages.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    showIcon: {
      control: 'boolean',
    },
    closable: {
      control: 'boolean',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    type: 'info',
    message: 'Information',
    description: 'This is an informational alert message.',
    showIcon: true,
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Success',
    description: 'Operation completed successfully.',
    showIcon: true,
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Warning',
    description: 'Please review before continuing.',
    showIcon: true,
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Error',
    description: 'Something went wrong. Please try again.',
    showIcon: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" message="Info Alert" showIcon />
      <Alert type="success" message="Success Alert" showIcon />
      <Alert type="warning" message="Warning Alert" showIcon />
      <Alert type="error" message="Error Alert" showIcon />
    </div>
  ),
};

export const Closable: Story = {
  args: {
    type: 'info',
    message: 'Closable Alert',
    description: 'Click the X to close this alert.',
    closable: true,
    showIcon: true,
  },
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Titan</h4>
        <Alert engine="titan" type="success" message="Titan Alert" showIcon />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Hermes</h4>
        <Alert engine="hermes" type="success" message="Hermes Alert" showIcon />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Apollo</h4>
        <Alert engine="apollo" type="success" message="Apollo Alert" showIcon />
      </div>
    </div>
  ),
};
