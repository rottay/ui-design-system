/**
 * ColorPicker Component Types
 *
 * Unified type definitions for the ColorPicker component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Color value can be string (hex, rgb, hsl) or object
 */
export type ColorValue = string | null;

/**
 * Color format for display/output
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsb' | 'hsl';

/**
 * Size variants for ColorPicker
 */
export type ColorPickerSize = 'small' | 'middle' | 'large';

/**
 * Trigger type for showing the picker
 */
export type ColorPickerTrigger = 'click' | 'hover';

/**
 * Placement for the dropdown
 */
export type ColorPickerPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';

/**
 * Preset color option
 */
export interface ColorPreset {
  /** Label for the preset group */
  label?: ReactNode;
  /** Colors in this preset group */
  colors: string[];
  /** Whether this is the default open group */
  defaultOpen?: boolean;
}

/**
 * Base props shared by all ColorPicker implementations
 */
export interface ColorPickerBaseProps {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Current value (controlled) */
  value?: ColorValue;

  /** Default value (uncontrolled) */
  defaultValue?: ColorValue;

  /** Whether the picker is disabled */
  disabled?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Format & Display
  // ─────────────────────────────────────────────────────────────────────────────

  /** Color format for the output value */
  format?: ColorFormat;

  /** Show text representation of color */
  showText?: boolean | ((color: string) => ReactNode);

  /** Allow clearing the color */
  allowClear?: boolean;

  /** Show alpha (transparency) slider */
  disabledAlpha?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Appearance
  // ─────────────────────────────────────────────────────────────────────────────

  /** Size of the picker trigger */
  size?: ColorPickerSize;

  /** Trigger mode */
  trigger?: ColorPickerTrigger;

  /** Placement of dropdown */
  placement?: ColorPickerPlacement;

  /** Arrow pointing to trigger */
  arrow?: boolean | { pointAtCenter?: boolean };

  // ─────────────────────────────────────────────────────────────────────────────
  // Presets
  // ─────────────────────────────────────────────────────────────────────────────

  /** Preset colors */
  presets?: ColorPreset[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Dropdown Props
  // ─────────────────────────────────────────────────────────────────────────────

  /** Whether the dropdown is open (controlled) */
  open?: boolean;

  /** Class name for dropdown */
  popupClassName?: string;

  /** Get popup container */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;

  // ─────────────────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────────────────

  /** Callback when color changes */
  onChange?: (color: string | null) => void;

  /** Callback when color changes complete (mouseup) */
  onChangeComplete?: (color: string) => void;

  /** Callback when format changes */
  onFormatChange?: (format: ColorFormat) => void;

  /** Callback when dropdown opens/closes */
  onOpenChange?: (open: boolean) => void;

  /** Callback when color is cleared */
  onClear?: () => void;

  // ─────────────────────────────────────────────────────────────────────────────
  // Styling
  // ─────────────────────────────────────────────────────────────────────────────

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** ID for the input */
  id?: string;

  /** Root class name */
  rootClassName?: string;
}

/**
 * Full ColorPicker props
 */
export interface ColorPickerProps extends ColorPickerBaseProps {
  /** Custom panel render */
  panelRender?: (
    panel: ReactNode,
    extra: { components: { Picker: React.FC; Presets: React.FC } }
  ) => ReactNode;

  /** Custom trigger render */
  children?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Format color to string based on format
 */
export function formatColor(
  color: { r: number; g: number; b: number; a?: number },
  format: ColorFormat
): string {
  const { r, g, b, a = 1 } = color;

  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b);
    case 'rgb':
      return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    case 'hsl': {
      const { h, s, l } = rgbToHsl(r, g, b);
      return a < 1 ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
    }
    case 'hsb':
    default:
      return rgbToHex(r, g, b);
  }
}

/**
 * Parse color string to RGB
 */
export function parseColor(
  color: string
): { r: number; g: number; b: number; a?: number } | null {
  // Try hex
  const hex = hexToRgb(color);
  if (hex) return hex;

  // Try rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  // Try hsl/hsla
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
  if (hslMatch) {
    const rgb = hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10)
    );
    return {
      ...rgb,
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
    };
  }

  return null;
}

/**
 * Check if color is valid
 */
export function isValidColor(color: string | null | undefined): boolean {
  if (!color) return false;
  return parseColor(color) !== null;
}

/**
 * Default preset colors
 */
export const DEFAULT_PRESETS: ColorPreset[] = [
  {
    label: 'Recommended',
    colors: [
      '#F5222D',
      '#FA8C16',
      '#FADB14',
      '#8BBB11',
      '#52C41A',
      '#13A8A8',
      '#1677FF',
      '#2F54EB',
      '#722ED1',
      '#EB2F96',
    ],
  },
  {
    label: 'Recent',
    colors: [],
  },
];
