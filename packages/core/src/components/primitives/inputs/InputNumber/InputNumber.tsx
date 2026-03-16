'use client';

/**
 * @fileoverview InputNumber -- numeric input with step controls, min/max bounds,
 * decimal precision, and custom formatter/parser support.
 *
 * @example
 * ```tsx
 * import { InputNumber } from '@rottay/design-system';
 *
 * // Basic bounded input
 * <InputNumber min={0} max={100} defaultValue={50} onChange={(v) => console.log(v)} />
 *
 * // Currency formatter with precision
 * <InputNumber
 *   min={0} max={1000} step={0.01} precision={2} prefix="$"
 *   formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
 * />
 * ```
 *
 * @module InputNumber
 * @category Inputs
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { InputNumberProps } from './InputNumber.types';

export {
  type InputNumberProps,
  type InputNumberSize,
  type InputNumberStatus,
  INPUT_NUMBER_DEFAULTS,
} from './InputNumber.types';

/** Numeric input primitive resolved through the active engine. */
export const InputNumber = createEngineComponent<InputNumberProps>('InputNumber', {
  /** Ant Design InputNumber with full step controls and addons */
  classic: () => import('./engines/classic'),
  /** DaisyUI input with custom increment/decrement buttons */
  modern: () => import('./engines/modern'),
  /** Native HTML number input with inline styling */
  rustic: () => import('./engines/rustic'),
});
