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

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { SegmentedProps } from './contracts';

export { type SegmentedProps, type SegmentedOption, SEGMENTED_DEFAULTS } from './contracts';

/** Segmented control primitive resolved through the active engine. */
export const Segmented = createEngineComponent<SegmentedProps>('Segmented', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Segmented;
