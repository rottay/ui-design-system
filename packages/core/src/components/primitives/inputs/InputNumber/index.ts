'use client';

/**
 * @fileoverview InputNumber - Rottay Design System
 * @description Numeric input with step controls for precise number entry.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The InputNumber component provides a specialized input for numeric values
 * with increment/decrement controls, min/max bounds, precision control,
 * and custom formatting support.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Wraps Ant Design InputNumber with full feature support
 * - **Hermes**: DaisyUI input with custom step controls
 * - **Apollo**: Pure HTML number input with inline styling
 *
 * **Key Features:**
 * - Step increment/decrement controls
 * - Min/max value bounds
 * - Decimal precision control
 * - Custom formatter and parser
 * - String mode for high precision
 * - Keyboard navigation (Arrow Up/Down)
 * - Prefix/suffix support
 * - Addon before/after slots
 *
 * **CSS Custom Properties:**
 * - `--input-number-height` - Input height
 * - `--input-number-font-size` - Text size
 * - `--input-number-border-color` - Border color
 * - `--input-number-bg` - Background color
 *
 * @example Basic InputNumber
 * ```tsx
 * import { InputNumber } from '@rottay/design-system';
 *
 * <InputNumber
 *   min={0}
 *   max={100}
 *   defaultValue={50}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example With Precision and Formatter
 * ```tsx
 * <InputNumber
 *   min={0}
 *   max={1000}
 *   step={0.01}
 *   precision={2}
 *   prefix="$"
 *   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
 *   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
 * />
 * ```
 *
 * @example Controlled with Step Callback
 * ```tsx
 * const [quantity, setQuantity] = useState(1);
 *
 * <InputNumber
 *   value={quantity}
 *   min={1}
 *   max={99}
 *   onChange={setQuantity}
 *   onStep={(value, info) => console.log(`Step ${info.type}: ${value}`)}
 * />
 * ```
 *
 * @see {@link Input} for text input
 * @see {@link Slider} for visual range selection
 * @module InputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { InputNumberProps } from './types';

export {
  type InputNumberProps,
  type InputNumberSize,
  type InputNumberStatus,
  INPUT_NUMBER_DEFAULTS,
} from './types';

export const InputNumber = createEngineComponent<InputNumberProps>('InputNumber', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
