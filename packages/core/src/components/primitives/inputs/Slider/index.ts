/**
 * @fileoverview Slider - Rottay Design System
 * @description Range slider for selecting values within a numeric range.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Slider component provides visual range selection with drag handles,
 * supporting single values or range selection (dual handles). It includes
 * marks, tooltips, and customizable track styling.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Wraps Ant Design Slider with all features
 * - **Hermes**: DaisyUI range input with custom track overlay
 * - **Apollo**: Pure CSS implementation with dual-range support
 *
 * **Key Features:**
 * - Single value or range mode (dual handles)
 * - Min/max bounds with step control
 * - Custom marks with labels
 * - Tooltip display during drag
 * - Vertical orientation support
 * - Dots on each step
 * - Custom track/rail/handle styling
 *
 * **CSS Custom Properties:**
 * - `--slider-rail-bg` - Rail background color
 * - `--slider-track-bg` - Active track color
 * - `--slider-handle-bg` - Handle background
 * - `--slider-handle-border` - Handle border color
 * - `--slider-handle-size` - Handle diameter
 *
 * @example Basic Slider
 * ```tsx
 * import { Slider } from '@rottay/design-system';
 *
 * <Slider
 *   min={0}
 *   max={100}
 *   defaultValue={30}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example Range Slider with Marks
 * ```tsx
 * <Slider
 *   range
 *   min={0}
 *   max={100}
 *   defaultValue={[20, 80]}
 *   marks={{
 *     0: '0%',
 *     50: '50%',
 *     100: '100%',
 *   }}
 * />
 * ```
 *
 * @example Vertical Slider with Step
 * ```tsx
 * <Slider
 *   vertical
 *   min={0}
 *   max={10}
 *   step={1}
 *   dots
 *   defaultValue={5}
 *   style={{ height: 200 }}
 * />
 * ```
 *
 * @see {@link InputNumber} for precise numeric input
 * @see {@link Progress} for read-only progress display
 * @module Slider
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { SliderProps } from './types';

export {
  type SliderProps,
  type SliderMarks,
  SLIDER_DEFAULTS,
} from './types';

export const Slider = createEngineComponent<SliderProps>('Slider', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Slider;
