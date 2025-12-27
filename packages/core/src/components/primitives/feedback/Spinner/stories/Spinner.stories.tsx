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
 * - Engine comparison (Titan, Hermes, Apollo)
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
      options: ['titan', 'hermes', 'apollo'],
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

/**
 * Compares spinner rendering across all three engines.
 */
export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine} style={{ textAlign: 'center' }}>
          <Spinner engine={engine} size="lg" />
          <p style={{ marginTop: 8, textTransform: 'capitalize' }}>{engine}</p>
        </div>
      ))}
    </div>
  ),
};
