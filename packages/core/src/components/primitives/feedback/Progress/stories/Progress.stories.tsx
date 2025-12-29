/**
 * Progress Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Progress> = {
  title: 'Primitives/Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    percent: {
      control: { type: 'range', min: 0, max: 100 },
    },
    type: {
      control: 'select',
      options: ['line', 'circle'],
    },
    status: {
      control: 'select',
      options: ['normal', 'success', 'error', 'active'],
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
    },
    showInfo: {
      control: 'boolean',
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 20 },
    },
    strokeColor: {
      control: 'color',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    percent: 50,
    type: 'line',
  },
};

export const LineProgress: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={30} />
      <Progress percent={50} status="active" />
      <Progress percent={70} status="error" />
      <Progress percent={100} />
    </div>
  ),
};

export const CircleProgress: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Progress type="circle" percent={30} />
      <Progress type="circle" percent={70} status="error" />
      <Progress type="circle" percent={100} />
    </div>
  ),
};

export const Status: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={50} status="normal" />
      <Progress percent={50} status="active" />
      <Progress percent={50} status="success" />
      <Progress percent={50} status="error" />
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress percent={50} strokeColor="#8b5cf6" />
      <Progress percent={70} strokeColor="#06b6d4" />
      <Progress percent={90} strokeColor="#f59e0b" />
    </div>
  ),
};

export const WithoutInfo: Story = {
  args: {
    percent: 50,
    showInfo: false,
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Progress across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Progress rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Progress}
      props={{ percent: 60, type: 'line' }}
      showDescriptions
      direction="vertical"
    />
  ),
};

/**
 * Matrix showing all status types across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Progress}
      baseProps={{ percent: 60 }}
      variantProp="status"
      variants={['normal', 'active', 'success', 'error']}
    />
  ),
};
