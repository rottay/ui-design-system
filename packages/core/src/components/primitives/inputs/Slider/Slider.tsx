'use client';

/**
 * @fileoverview Slider -- range slider for selecting single values or ranges
 * within numeric bounds, with marks, tooltips, and vertical orientation support.
 *
 * @example
 * ```tsx
 * import { Slider } from '@rottay/design-system';
 *
 * // Single value
 * <Slider min={0} max={100} defaultValue={30} onChange={(v) => console.log(v)} />
 *
 * // Range with labeled marks
 * <Slider range defaultValue={[20, 80]} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
 * ```
 *
 * @module Slider
 * @category Inputs
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { SliderProps } from './Slider.types';

export {
  type SliderProps,
  type SliderMarks,
  SLIDER_DEFAULTS,
} from './Slider.types';

/** Range slider primitive resolved through the active engine. */
export const Slider = createEngineComponent<SliderProps>('Slider', {
  /** Ant Design Slider with full mark, tooltip, and range support */
  classic: () => import('./engines/classic'),
  /** DaisyUI range input with custom track overlay */
  modern: () => import('./engines/modern'),
  /** Pure CSS slider with dual-range handle support */
  rustic: () => import('./engines/rustic'),
});

export default Slider;
