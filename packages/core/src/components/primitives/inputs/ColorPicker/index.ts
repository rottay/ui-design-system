/**
 * @fileoverview ColorPicker Component - Rottay Design System
 * @description A color selection interface with support for multiple formats,
 * preset palettes, and alpha channel control for design and theming applications.
 *
 * @remarks
 * The ColorPicker component provides comprehensive color selection for:
 * - **Theme customization**: Brand colors, accent colors
 * - **Design tools**: Color palettes, gradients, shadows
 * - **Form inputs**: Color preferences, highlighting
 * - **Data visualization**: Chart colors, heatmaps
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Format options**: HEX, RGB, HSB color formats
 * - **Preset palettes**: Predefined color groups for quick selection
 * - **Alpha channel**: Transparency control with optional disable
 * - **Text display**: Show color value as text
 * - **Controlled/uncontrolled**: Full state management flexibility
 * - **Clear support**: Allow clearing selected color
 *
 * @example Basic color picker
 * ```tsx
 * import { ColorPicker } from '@rottay/design-system';
 *
 * <ColorPicker defaultValue="#1677ff" />
 * ```
 *
 * @example With text display
 * ```tsx
 * <ColorPicker defaultValue="#1677ff" showText />
 * ```
 *
 * @example Different color formats
 * ```tsx
 * // HEX format (default)
 * <ColorPicker format="hex" showText />
 *
 * // RGB format
 * <ColorPicker format="rgb" showText />
 *
 * // HSB format
 * <ColorPicker format="hsb" showText />
 * ```
 *
 * @example With preset palettes
 * ```tsx
 * <ColorPicker
 *   presets={[
 *     { label: 'Primary', colors: ['#1677ff', '#52c41a', '#faad14'] },
 *     { label: 'Neutral', colors: ['#000000', '#666666', '#ffffff'] },
 *   ]}
 * />
 * ```
 *
 * @example Controlled component
 * ```tsx
 * const [color, setColor] = useState('#1677ff');
 *
 * <ColorPicker
 *   value={color}
 *   onChange={(_, hex) => setColor(hex)}
 * />
 * ```
 *
 * @example Without alpha channel
 * ```tsx
 * <ColorPicker defaultValue="#1677ff" disabledAlpha />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <ColorPicker engine="titan" defaultValue="#1677ff" showText />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <ColorPicker engine="hermes" defaultValue="#1677ff" />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <ColorPicker engine="apollo" defaultValue="#1677ff" />
 * ```
 *
 * @see {@link ColorPickerProps} for component props
 * @see {@link Color} for color value interface
 * @see {@link ColorPreset} for preset palette structure
 * @module ColorPicker
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
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
