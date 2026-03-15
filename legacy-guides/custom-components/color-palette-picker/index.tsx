import type { ColorPalettePickerProps } from './core';
import { COLOR_PALETTE_PICKER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ColorPalettePickerProps, ColorPalettePickerPreset, ColorPalette } from './core';
export { COLOR_PALETTE_PICKER_DEFAULTS } from './core';

export function ColorPalettePicker(props: ColorPalettePickerProps): React.ReactElement {
  const preset = props.preset ?? COLOR_PALETTE_PICKER_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ColorPalettePicker.displayName = 'ColorPalettePicker';
