/**
 * Alert Component Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Alert> = {
  title: 'Primitives/Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'The type of alert',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the icon',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the alert can be closed',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    message: 'This is an informational message',
    type: 'info',
  },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Alert type="info" message="Info Alert" description="This is an info alert" />
      <Alert type="success" message="Success Alert" description="This is a success alert" />
      <Alert type="warning" message="Warning Alert" description="This is a warning alert" />
      <Alert type="error" message="Error Alert" description="This is an error alert" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    type: 'success',
    message: 'Success!',
    description: 'Your operation was completed successfully. You can now proceed with the next step.',
  },
};

export const Closable: Story = {
  args: {
    type: 'warning',
    message: 'This alert can be closed',
    description: 'Click the X button to dismiss this alert.',
    closable: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    type: 'info',
    message: 'Alert without icon',
    showIcon: false,
  },
};

export const CustomIcon: Story = {
  args: {
    type: 'info',
    message: 'Custom icon alert',
    icon: <span>🎉</span>,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Alert across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Alert rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Alert}
      props={{ type: 'success', message: 'Success Alert', description: 'This is a success alert message.', closable: true }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all types across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Alert}
      baseProps={{ message: 'Alert Message', description: 'This is an alert description.' }}
      variantProp="type"
      variants={['info', 'success', 'warning', 'error']}
    />
  ),
};
