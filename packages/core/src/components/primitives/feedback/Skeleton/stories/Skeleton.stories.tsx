/**
 * Skeleton Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Skeleton> = {
  title: 'Primitives/Feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
    active: {
      control: 'boolean',
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
    rows: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    variant: 'text',
    width: 200,
    height: 20,
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Skeleton variant="text" width={150} height={16} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Text</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Skeleton variant="circular" width={48} height={48} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Circular</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Skeleton variant="rectangular" width={100} height={60} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Rectangular</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Skeleton variant="rounded" width={100} height={60} />
        <p style={{ marginTop: 8, fontSize: 12 }}>Rounded</p>
      </div>
    </div>
  ),
};

export const Animation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 14 }}>Pulse Animation</p>
        <Skeleton animation="pulse" width={200} height={20} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 14 }}>Wave Animation</p>
        <Skeleton animation="wave" width={200} height={20} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 14 }}>No Animation</p>
        <Skeleton animation={false} width={200} height={20} />
      </div>
    </div>
  ),
};

export const AvatarWithText: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="60%" height={14} />
      </div>
    </div>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <div style={{ width: 300, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
      <Skeleton variant="rectangular" width="100%" height={140} style={{ marginBottom: 16 }} />
      <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="80%" height={14} />
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1 }}>
            <Skeleton width="30%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="80%" height={12} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const WithChildren: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <p style={{ marginBottom: 8 }}>Loading...</p>
          <Skeleton active>
            <p>This content is loading</p>
          </Skeleton>
        </div>
        <div>
          <p style={{ marginBottom: 8 }}>Loaded!</p>
          <Skeleton active={false}>
            <p style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              This content has loaded
            </p>
          </Skeleton>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Skeleton across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Skeleton rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Skeleton}
      props={{ variant: 'text', width: 200, height: 20 }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all variants across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Skeleton}
      baseProps={{ width: 80, height: 80 }}
      variantProp="variant"
      variants={['text', 'circular', 'rectangular', 'rounded']}
    />
  ),
};
