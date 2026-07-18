/**
 * @fileoverview WCAG 2.2 scalar colorimetry: relative luminance and contrast ratio.
 *
 * The single home of the WCAG 2.2 luminance transfer function and symmetric
 * contrast ratio, plus the hex parsing they require. Pure and
 * dependency-free. Accessibility modules (branding-contrast, APCA snapping)
 * and color-space modules (oklch chart-series) both consume this owner;
 * `accessibility/branding-contrast` additionally re-exports `contrastRatio`
 * for its established importers.
 *
 * @module Foundation/Kernel/Color/Contrast
 * @package @rottay/design-system
 */

/** 8-bit sRGB components (0-255 per channel). */
export interface Rgb255 {
  r: number;
  g: number;
  b: number;
}

/**
 * Returns true if the string looks like a hex color (#xxx or #xxxxxx).
 * Used to skip CSS variables, rgb(), named colors, etc.
 */
export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Parses a 3- or 6-digit hex color string into RGB components.
 * Returns null for non-hex values.
 */
export function parseHex(hex: string): Rgb255 | null {
  const trimmed = hex.trim();
  if (!isHexColor(trimmed)) return null;

  const cleaned = trimmed.replace(/^#/, '');

  if (cleaned.length === 3) {
    return {
      r: parseInt(cleaned[0] + cleaned[0], 16),
      g: parseInt(cleaned[1] + cleaned[1], 16),
      b: parseInt(cleaned[2] + cleaned[2], 16),
    };
  }

  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

/**
 * Converts a single sRGB channel value (0-255) to its linear representation.
 * Per WCAG 2.2: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function linearizeSrgbChannel(channel: number): number {
  const sRGB = channel / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * WCAG 2.2 relative luminance from sRGB.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  return (
    0.2126 * linearizeSrgbChannel(rgb.r) +
    0.7152 * linearizeSrgbChannel(rgb.g) +
    0.0722 * linearizeSrgbChannel(rgb.b)
  );
}

/**
 * Contrast ratio between two colors (1:1 to 21:1).
 * Returns the ratio as a number >= 1.
 */
export function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
