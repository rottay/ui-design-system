/**
 * @fileoverview Slider Types - Rottay Design System
 * @description Type definitions for the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the Slider component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `SliderProps` - Main component props interface
 * - `SliderMarks` - Marks configuration type
 *
 * **Configuration Constants:**
 * - `SLIDER_DEFAULTS` - Default prop values
 *
 * **Value Types:**
 * - Single: `number` for single handle
 * - Range: `[number, number]` for dual handles
 *
 * **Marks Configuration:**
 * ```tsx
 * marks: {
 *   0: 'Start',                    // Simple label
 *   50: { label: 'Middle' },       // Object with label
 *   100: { label: 'End', style: { color: 'red' } }  // With custom style
 * }
 * ```
 *
 * @example Type Usage
 * ```tsx
 * import type { SliderProps, SliderMarks } from '@rottay/design-system';
 *
 * const marks: SliderMarks = {
 *   0: 'Min',
 *   100: 'Max',
 * };
 * ```
 *
 * @see {@link Slider} for the main component
 * @module SliderTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

export interface SliderMarks {
  [key: number]: ReactNode | { style?: CSSProperties; label: ReactNode };
}

export interface SliderProps {
  /** Current value (single or range) */
  value?: number | [number, number];
  /** Default value */
  defaultValue?: number | [number, number];
  /** Callback when value changes */
  onChange?: (value: number | [number, number]) => void;
  /** Callback when slider is released */
  onChangeComplete?: (value: number | [number, number]) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number | null;
  /** Enable range mode (dual handles) */
  range?: boolean;
  /** Marks on the slider */
  marks?: SliderMarks;
  /** Include marks endpoints */
  included?: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Vertical mode */
  vertical?: boolean;
  /** Reverse direction */
  reverse?: boolean;
  /** Custom tooltip */
  tooltip?: {
    open?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    formatter?: ((value?: number) => ReactNode) | null;
  };
  /** Allow keyboard interaction */
  keyboard?: boolean;
  /** Dots on each step */
  dots?: boolean;
  /** Track style */
  trackStyle?: CSSProperties | CSSProperties[];
  /** Rail style */
  railStyle?: CSSProperties;
  /** Handle style */
  handleStyle?: CSSProperties | CSSProperties[];
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /**
   * Accessible name for the single-mode native input when no surrounding
   * label provides one (without a name, a standalone slider fails the axe
   * `label` rule, critical). Range mode ignores this prop and uses the
   * localized per-handle defaults instead.
   */
  'aria-label'?: string;
}

export const SLIDER_DEFAULTS: Partial<SliderProps> = {
  min: 0,
  max: 100,
  step: 1,
  range: false,
  included: true,
  disabled: false,
  vertical: false,
  reverse: false,
  keyboard: true,
  dots: false,
};
