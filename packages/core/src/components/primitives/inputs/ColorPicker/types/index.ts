/**
 * ColorPicker Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type ColorFormat = 'hex' | 'rgb' | 'hsb';
export type ColorPickerSize = 'small' | 'middle' | 'large';
export type ColorPickerTrigger = 'click' | 'hover';

export interface ColorPreset {
  label: ReactNode;
  colors: string[];
}

export interface Color {
  toHexString: () => string;
  toRgbString: () => string;
  toHsbString: () => string;
}

export interface ColorPickerProps {
  /** Current color value */
  value?: string | Color;
  /** Default color value */
  defaultValue?: string;
  /** Callback when color changes */
  onChange?: (value: Color, hex: string) => void;
  /** Color format */
  format?: ColorFormat;
  /** Callback when format changes */
  onFormatChange?: (format: ColorFormat) => void;
  /** Preset colors */
  presets?: ColorPreset[];
  /** Show color text */
  showText?: boolean | ((color: Color) => ReactNode);
  /** Size of trigger */
  size?: ColorPickerSize;
  /** Whether disabled */
  disabled?: boolean;
  /** Allow clear */
  allowClear?: boolean;
  /** Trigger method */
  trigger?: ColorPickerTrigger;
  /** Open state (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable alpha channel */
  disabledAlpha?: boolean;
  /** Placement of dropdown */
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Panel render */
  panelRender?: (panel: ReactNode) => ReactNode;
}

export const COLORPICKER_DEFAULTS: Partial<ColorPickerProps> = {
  format: 'hex',
  size: 'middle',
  disabled: false,
  allowClear: false,
  trigger: 'click',
  disabledAlpha: false,
  placement: 'bottomLeft',
  showText: false,
};
