'use client';

/**
 * @fileoverview Segmented -- segmented control for switching between mutually
 * exclusive options, with icon support, block mode, and size variants.
 *
 * @example
 * ```tsx
 * import { Segmented } from '@rottay/design-system';
 *
 * // Simple string options
 * <Segmented options={['daily', 'weekly', 'monthly']} value={period} onChange={setPeriod} />
 *
 * // Rich options with icons, full-width
 * <Segmented block options={[
 *   { label: 'List', value: 'list', icon: <ListIcon /> },
 *   { label: 'Grid', value: 'grid', icon: <GridIcon /> },
 * ]} />
 * ```
 *
 * @module Segmented
 * @category Navigation
 */

import { createElement, forwardRef } from 'react';
import type { ComponentRef } from 'react';

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import { toSegmentedEngineSize } from './contracts';
import type { SegmentedEngineProps, SegmentedSize } from './contracts';

export { type SegmentedOption, SEGMENTED_DEFAULTS } from './contracts';

/** Props for the Segmented component. */
export interface SegmentedProps extends Omit<SegmentedEngineProps, 'size'> {
  /**
   * Size preset for the segmented control.
   * Affects padding, font size, and overall height.
   *
   * | Value | Use Case |
   * |-------|----------|
   * | `sm` | Compact UIs, toolbars |
   * | `md` | Standard forms (default) |
   * | `lg` | Touch-friendly interfaces |
   *
   * @default 'md'
   */
  size?: SegmentedSize;
}

const SegmentedBase = createEngineComponent<SegmentedEngineProps>('Segmented', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** Rottay-native premium implementation - token-driven, skin-painted */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

/**
 * Segmented control primitive resolved through the active engine. The public
 * `size` step is resolved to the spelling the engines read before an engine is
 * chosen, so the three engines receive the same value.
 */
export const Segmented = forwardRef<ComponentRef<typeof SegmentedBase>, SegmentedProps>(({ size, ...rest }, ref) =>
  createElement(SegmentedBase, { ref, ...rest, size: toSegmentedEngineSize(size) }),
);

Segmented.displayName = 'Segmented';

export default Segmented;
