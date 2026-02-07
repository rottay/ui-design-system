/**
 * @fileoverview Spinner Component Stories - Rottay Design System
 * @description Storybook stories for the Spinner component demonstrating
 * various configurations, sizes, and engine implementations.
 *
 * @remarks
 * These stories showcase:
 * - Default spinner behavior
 * - Size variants (sm, md, lg, xl)
 * - Label text support
 * - Custom color configuration
 * - Engine comparison (Classic, Modern, Rustic)
 *
 * @example Running Storybook
 * ```bash
 * npm run storybook
 * # Navigate to Primitives/Feedback/Spinner
 * ```
 *
 * @module Spinner/Stories
 * @category Feedback
 * @package @rottay/design-system
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

// ============================================================================
// Meta Configuration
// ============================================================================

/**
 * Storybook meta configuration for the Spinner component.
 */
const meta: Meta<typeof Spinner> = {
  title: 'Primitives/Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
    color: {
      control: 'color',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// ============================================================================
// Stories
// ============================================================================

/**
 * Default spinner with medium size.
 */
export const Default: Story = {
  args: {
    size: 'md',
  },
};

/**
 * Demonstrates all available size variants side by side.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ textAlign: 'center' }}>
          <Spinner size={size} />
          <p style={{ marginTop: 8, fontSize: 12 }}>{size}</p>
        </div>
      ))}
    </div>
  ),
};

/**
 * Spinner with descriptive label text.
 */
export const WithLabel: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
};

/**
 * Spinner with custom brand color.
 */
export const CustomColor: Story = {
  args: {
    size: 'lg',
    color: '#8b5cf6',
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Spinner across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Spinner rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Spinner}
      props={{ size: 'lg' }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all sizes across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Spinner}
      baseProps={{}}
      sizeProp="size"
      sizes={['sm', 'md', 'lg', 'xl']}
    />
  ),
};
