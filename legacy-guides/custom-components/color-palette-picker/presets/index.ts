import type { ColorPalettePickerPreset, ColorPalettePickerProps } from '../core';
import { GridPreset } from './grid';
import { CompactPreset } from './compact';

export const PRESETS: Record<
  ColorPalettePickerPreset,
  React.ComponentType<ColorPalettePickerProps>
> = {
  grid: GridPreset,
  compact: CompactPreset,
};
