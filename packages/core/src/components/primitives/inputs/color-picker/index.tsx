'use client';

/**
 * @fileoverview ColorPicker -- color selection input with format options (HEX/RGB/HSB),
 * preset palettes, alpha channel control, and controlled/uncontrolled modes.
 *
 * @example
 * ```tsx
 * import { ColorPicker } from '@rottay/design-system';
 *
 * // Basic with text display
 * <ColorPicker defaultValue="#1677ff" showText format="hex" />
 *
 * // Controlled with preset palettes
 * const [color, setColor] = useState('#1677ff');
 * <ColorPicker
 *   value={color}
 *   onChange={(_, hex) => setColor(hex)}
 *   presets={[{ label: 'Brand', colors: ['#1677ff', '#52c41a'] }]}
 * />
 * ```
 *
 * @module ColorPicker
 * @category Inputs
 */
import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { ColorPickerProps } from './contracts';

export {
  type ColorPickerProps,
  type ColorPreset,
  type Color,
  type ColorFormat,
  type ColorPickerSize,
  type LegacyColorPickerSize,
  type ColorPickerTrigger,
  COLORPICKER_DEFAULTS,
} from './contracts';

/** Color selection primitive resolved through the active engine. */
export const ColorPicker = createEngineComponent<ColorPickerProps>('ColorPicker', {
  /** Ant Design ColorPicker with full panel, presets, and format switching */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind color input with custom swatch UI */
  modern: () => import('./engines/modern'),
  /** Native HTML color input with inline styling */
  rustic: () => import('./engines/rustic'),
});

export default ColorPicker;
