/**
 * ColorPicker - Engine Router
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
