/**
 * Skeleton Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

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
        story: 'Compare the same Skeleton rendered by Classic (Ant Design), Modern (token skin), and Rustic (Vanilla CSS).',
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

// ============================================================================
// Modern Engine Craft Stories
// ============================================================================

/**
 * Card-shaped skeleton sized exactly like the content it stands in for: the
 * swap reserves identical geometry, so there is no layout jump when content
 * arrives. Cadence comes from the canon shimmer and pins to a static frame
 * under reduced motion.
 */
export const ModernCardSwap: Story = {
  name: '🃏 Modern Card Swap (no layout jump)',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ width: 280 }} aria-hidden="true">
        <Skeleton engine="modern" active avatar avatarSize={40} title paragraph={{ rows: 2 }} />
      </div>
      <div style={{ width: 280, border: '1px dashed var(--ds-color-border, #d9d9d9)', borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ds-color-primary, #1677ff)', color: '#fff', display: 'grid', placeItems: 'center' }}>A</div>
          <div>
            <strong>Loaded card title</strong>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-color-text-secondary, #666)' }}>
              Two body lines of identical rhythm to the skeleton beside this card.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Density retune through skin tokens: the same anatomy at a compact cadence
 * via --ds-skeleton-* geometry overrides (governance hatch, not a new theme).
 */
export const ModernTokenDensity: Story = {
  name: '📐 Modern Token Geometry',
  render: () => (
    <div style={{ ['--ds-skeleton-gap' as string]: '0.5rem', ['--ds-skeleton-line-gap' as string]: '0.25rem', ['--ds-skeleton-line-height' as string]: '0.75rem', ['--ds-skeleton-title-height' as string]: '1rem' }}>
      <Skeleton engine="modern" active avatar avatarSize={32} title paragraph={{ rows: 3 }} />
    </div>
  ),
};
