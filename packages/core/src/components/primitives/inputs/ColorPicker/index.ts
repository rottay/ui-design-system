/**
 * ColorPicker - Engine Router
 *
 * This module exports the ColorPicker component with multi-engine support.
 * ColorPicker provides a color selection interface with presets and format options.
 *
 * @module ColorPicker
 * @example
 * ```tsx
 * import { ColorPicker } from '@rottay/design-system';
 *
 * // Basic usage
 * <ColorPicker defaultValue="#1677ff" />
 *
 * // With text display
 * <ColorPicker defaultValue="#1677ff" showText />
 *
 * // Different formats
 * <ColorPicker format="rgb" showText />
 *
 * // With presets
 * <ColorPicker
 *   presets={[
 *     { label: 'Primary', colors: ['#1677ff', '#52c41a'] },
 *   ]}
 * />
 *
 * // Controlled
 * <ColorPicker
 *   value={color}
 *   onChange={(_, hex) => setColor(hex)}
 * />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { ColorPickerProps } from './types';

export {
  type ColorPickerProps,
  type ColorPreset,
  type Color,
  type ColorFormat,
  type ColorPickerSize,
  type ColorPickerTrigger,
  COLORPICKER_DEFAULTS,
} from './types';

export const ColorPicker = createEngineComponent<ColorPickerProps>('ColorPicker', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default ColorPicker;
