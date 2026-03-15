import type { EngineAwareProps } from '../../../../types';

export type ColorPalettePickerPreset = 'grid' | 'compact';

export interface ColorPalette {
  key: string;
  label: string;
  colors: string[];
}

export interface ColorPalettePickerProps extends EngineAwareProps {
  preset?: ColorPalettePickerPreset;
  palettes: ColorPalette[];
  value?: string;
  onChange?: (color: string) => void;
  recentColors?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const COLOR_PALETTE_PICKER_DEFAULTS = {
  preset: 'grid' as ColorPalettePickerPreset,
};
