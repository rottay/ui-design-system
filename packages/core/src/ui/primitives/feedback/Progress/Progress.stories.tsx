/**
 * Progress Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

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
      options: ['classic', 'modern', 'rustic'],
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
// Modern Engine Craft Stories
// ============================================================================

/**
 * Indeterminate mode on both types (modern engine): the sliding line bar and
 * the spinning circle arc take their cadence from the motion authority and
 * collapse to a calm static bar/arc under reduced motion.
 */
export const ModernIndeterminate: Story = {
  name: '⏳ Modern Indeterminate',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 400 }}>
      <Progress engine="modern" percent={0} indeterminate />
      <Progress engine="modern" percent={0} indeterminate status="error" />
      <div style={{ display: 'flex', gap: 24 }}>
        <Progress engine="modern" percent={0} type="circle" indeterminate />
        <Progress engine="modern" percent={0} type="circle" indeterminate status="success" />
      </div>
    </div>
  ),
};

/**
 * Token geometry: the circle diameter rides --ds-progress-circle-size, the
 * thickness honors an explicit strokeWidth, and gradient strokeColor now
 * paints through the resolved-fill background (the drained DaisyUI arc could
 * only render currentColor).
 */
export const ModernTokenGeometry: Story = {
  name: '📐 Modern Token Geometry',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Progress engine="modern" percent={72} type="circle" strokeWidth={6} />
      <Progress engine="modern" percent={48} type="circle" strokeColor="linear-gradient(90deg, #8b5cf6, #06b6d4)" />
      <div style={{ ['--ds-progress-circle-size' as string]: '4rem' }}>
        <Progress engine="modern" percent={88} type="circle" status="success" />
      </div>
    </div>
  ),
};

/**
 * RTL smoke test: line fill, label and circle arc read naturally mirrored.
 */
export const ModernRTL: Story = {
  name: '🔄 Modern RTL',
  render: () => (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Progress engine="modern" percent={35} />
      <Progress engine="modern" percent={70} status="success" />
      <Progress engine="modern" percent={0} indeterminate />
    </div>
  ),
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
        story: 'Compare the same Progress rendered by Classic (Ant Design), Modern (token skin), and Rustic (Vanilla CSS).',
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
