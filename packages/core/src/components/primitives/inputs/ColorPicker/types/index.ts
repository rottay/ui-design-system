/**
 * @fileoverview ColorPicker Component Types - Rottay Design System
 * @description Type definitions for the ColorPicker component including color formats,
 * preset palettes, trigger behavior, and customization options.
 *
 * @remarks
 * The ColorPicker types provide comprehensive configuration for:
 * - Color formats: HEX, RGB, HSB representation
 * - Preset palettes: Grouped color swatches
 * - Trigger behavior: Click or hover activation
 * - Size variants: Small, middle, large
 * - Alpha control: Transparency with optional disable
 *
 * @example Type Usage
 * ```tsx
 * import type {
 *   ColorPickerProps,
 *   ColorPreset,
 *   ColorFormat,
 * } from '@rottay/design-system';
 *
 * const presets: ColorPreset[] = [
 *   { label: 'Brand', colors: ['#1677ff', '#52c41a'] },
 * ];
 *
 * const config: ColorPickerProps = {
 *   format: 'hex',
 *   presets,
 *   showText: true,
 * };
 * ```
 *
 * @module ColorPicker/Types
 * @category Inputs
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';

/**
 * Color format types supported by the picker.
 * - 'hex': Hexadecimal format (#RRGGBB)
 * - 'rgb': RGB format (rgb(r, g, b))
 * - 'hsb': HSB/HSV format (hsb(h, s%, b%))
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsb';

/**
 * Size variants for the color picker trigger.
 * - 'small': Compact size for dense layouts
 * - 'middle': Default size for most use cases
 * - 'large': Larger size for emphasized selection
 */
export type ColorPickerSize = 'small' | 'middle' | 'large';

/**
 * Trigger behavior for opening the color panel.
 * - 'click': Opens on click (default)
 * - 'hover': Opens on mouse hover
 */
export type ColorPickerTrigger = 'click' | 'hover';

/**
 * Preset color group for quick selection.
 *
 * @example
 * ```tsx
 * const brandColors: ColorPreset = {
 *   label: 'Brand Colors',
 *   colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
 * };
 * ```
 */
export interface ColorPreset {
  /** Label for the preset group */
  label: ReactNode;
  /** Array of color values (hex strings) */
  colors: string[];
}

/**
 * Color object with format conversion methods.
 *
 * @example
 * ```tsx
 * const handleChange = (color: Color) => {
 *   console.log(color.toHexString()); // #1677ff
 *   console.log(color.toRgbString()); // rgb(22, 119, 255)
 *   console.log(color.toHsbString()); // hsb(215, 91%, 100%)
 * };
 * ```
 */
export interface Color {
  /** Convert to hex string format */
  toHexString: () => string;
  /** Convert to RGB string format */
  toRgbString: () => string;
  /** Convert to HSB string format */
  toHsbString: () => string;
}

/**
 * Props for the ColorPicker component.
 *
 * @example Basic usage
 * ```tsx
 * <ColorPicker defaultValue="#1677ff" />
 * ```
 *
 * @example With presets and format
 * ```tsx
 * <ColorPicker
 *   format="rgb"
 *   showText
 *   presets={[{ label: 'Brand', colors: ['#1677ff'] }]}
 *   onChange={(color, hex) => console.log(hex)}
 * />
 * ```
 */
export interface ColorPickerProps {
  /** Current color value (controlled) */
  value?: string | Color;
  /** Default color value (uncontrolled) */
  defaultValue?: string;
  /** Callback when color changes, receives Color object and hex string */
  onChange?: (value: Color, hex: string) => void;
  /** Color format for display and output */
  format?: ColorFormat;
  /** Callback when format changes via format switcher */
  onFormatChange?: (format: ColorFormat) => void;
  /** Preset color palettes for quick selection */
  presets?: ColorPreset[];
  /** Show color value as text (true, false, or custom render function) */
  showText?: boolean | ((color: Color) => ReactNode);
  /** Size of the color picker trigger */
  size?: ColorPickerSize;
  /** Whether the color picker is disabled */
  disabled?: boolean;
  /** Allow clearing the selected color */
  allowClear?: boolean;
  /** How to trigger the color panel (click or hover) */
  trigger?: ColorPickerTrigger;
  /** Open state for controlled panel visibility */
  open?: boolean;
  /** Callback when panel open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable the alpha/transparency slider */
  disabledAlpha?: boolean;
  /** Dropdown placement relative to trigger */
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Custom render function for the color panel */
  panelRender?: (panel: ReactNode) => ReactNode;
  /** Rendering engine override */
  engine?: 'titan' | 'hermes' | 'apollo';
}

/**
 * Default values for ColorPicker props.
 * Used across all engine implementations for consistency.
 */
export const COLORPICKER_DEFAULTS: Partial<ColorPickerProps> = {
  /** Default format is hex */
  format: 'hex',
  /** Default size is middle */
  size: 'middle',
  /** Not disabled by default */
  disabled: false,
  /** No clear button by default */
  allowClear: false,
  /** Click to open by default */
  trigger: 'click',
  /** Alpha slider enabled by default */
  disabledAlpha: false,
  /** Default dropdown placement */
  placement: 'bottomLeft',
  /** Text hidden by default */
  showText: false,
};
