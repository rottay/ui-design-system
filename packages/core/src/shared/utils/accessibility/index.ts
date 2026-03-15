/**
 * @fileoverview Color Contrast & Accessibility Utilities - Rottay Design System
 * @description WCAG 2.1 compliant color contrast checking utilities for verifying
 * accessible color combinations across the design system.
 *
 * @remarks
 * Supports:
 * - Hex colors: `#fff`, `#ffffff`
 * - RGB colors: `rgb(255, 255, 255)`
 * - CSS variable references: returns `null` (cannot be statically evaluated)
 *
 * WCAG 2.1 thresholds:
 * - AA normal text: 4.5:1
 * - AA large text (>=18pt or >=14pt bold): 3:1
 * - AAA normal text: 7:1
 * - AAA large text: 4.5:1
 *
 * @example Quick check
 * ```ts
 * import { contrastRatio, meetsContrastLevel } from '@rottay/design-system';
 *
 * const ratio = contrastRatio('#1a1a2e', '#ffffff');
 * const passesAA = meetsContrastLevel(ratio, 'AA');
 * ```
 *
 * @example Full report
 * ```ts
 * import { checkColorAccessibility } from '@rottay/design-system';
 *
 * const report = checkColorAccessibility('#1a1a2e', '#e0e0e0');
 * // { ratio: 10.23, AA: true, AALargeText: true, AAA: true, AAALargeText: true }
 * ```
 *
 * @module Shared/Utils/Accessibility
 * @category Shared
 * @package @rottay/design-system
 */

// ---------------------------------------------------------------------------
// Internal: Color parsing
// ---------------------------------------------------------------------------

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parses a 3- or 6-digit hex color string into RGB components.
 * Returns null if the string is not a valid hex color.
 */
function parseHex(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, '');

  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }

  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r, g, b };
  }

  return null;
}

/**
 * Parses an `rgb(r, g, b)` string into RGB components.
 * Returns null if the string is not a valid rgb() color.
 */
function parseRgb(color: string): RGB | null {
  const match = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (!match) return null;

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  if (r > 255 || g > 255 || b > 255) return null;

  return { r, g, b };
}

/**
 * Returns true if the color string references a CSS variable.
 */
function isCssVariable(color: string): boolean {
  return color.trim().startsWith('var(');
}

/**
 * Parses a color string into RGB components.
 * Supports hex (#xxx, #xxxxxx) and rgb() formats.
 * Returns null for CSS variable references or unrecognized formats.
 */
function parseColor(color: string): RGB | null {
  const trimmed = color.trim();

  if (isCssVariable(trimmed)) return null;

  if (trimmed.startsWith('#')) return parseHex(trimmed);
  if (trimmed.startsWith('rgb(')) return parseRgb(trimmed);

  return null;
}

// ---------------------------------------------------------------------------
// WCAG 2.1 Relative Luminance
// ---------------------------------------------------------------------------

/**
 * Converts a single sRGB channel value (0-255) to its linear representation.
 * Per WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function linearize(channel: number): number {
  const sRGB = channel / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the relative luminance of a color per WCAG 2.1 definition.
 *
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are linearized sRGB values.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Relative luminance in the range [0, 1]
 */
function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculates the contrast ratio between two colors per WCAG 2.1.
 *
 * Contrast ratio ranges from 1:1 (identical) to 21:1 (black on white).
 * Returns `null` if either color is a CSS variable reference or cannot be parsed.
 *
 * @param color1 - First color (hex, rgb, or CSS variable)
 * @param color2 - Second color (hex, rgb, or CSS variable)
 * @returns Contrast ratio (1-21), or null if colors cannot be evaluated
 *
 * @example
 * ```ts
 * contrastRatio('#000000', '#ffffff'); // 21
 * contrastRatio('#777777', '#ffffff'); // ~4.48
 * contrastRatio('var(--ds-color-bg)', '#fff'); // null
 * ```
 */
export function contrastRatio(color1: string, color2: string): number | null {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks whether a given contrast ratio meets the specified WCAG level.
 *
 * WCAG 2.1 thresholds:
 * | Level | Normal text | Large text |
 * |-------|-------------|------------|
 * | AA    | 4.5:1       | 3:1        |
 * | AAA   | 7:1         | 4.5:1      |
 *
 * Large text is defined as 18pt (24px) regular or 14pt (18.67px) bold.
 *
 * @param ratio - Contrast ratio to evaluate
 * @param level - WCAG conformance level ('AA' or 'AAA')
 * @param isLargeText - Whether the text qualifies as "large" (default: false)
 * @returns true if the ratio meets the specified level
 *
 * @example
 * ```ts
 * meetsContrastLevel(4.6, 'AA');           // true
 * meetsContrastLevel(4.6, 'AAA');          // false
 * meetsContrastLevel(3.5, 'AA', true);     // true (large text)
 * ```
 */
export function meetsContrastLevel(
  ratio: number,
  level: 'AA' | 'AAA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  // AAA
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Returns a contrasting text color (black or white) for a given background color.
 * Uses WCAG relative luminance to determine which provides better contrast.
 *
 * Returns `null` if the background color is a CSS variable or cannot be parsed.
 *
 * @param backgroundColor - Background color (hex, rgb, or CSS variable)
 * @returns '#000000' or '#ffffff', or null if the color cannot be evaluated
 *
 * @example
 * ```ts
 * getContrastingTextColor('#1a1a2e'); // '#ffffff'
 * getContrastingTextColor('#f0f0f0'); // '#000000'
 * getContrastingTextColor('var(--bg)'); // null
 * ```
 */
export function getContrastingTextColor(
  backgroundColor: string
): '#000000' | '#ffffff' | null {
  const rgb = parseColor(backgroundColor);
  if (!rgb) return null;

  const luminance = relativeLuminance(rgb.r, rgb.g, rgb.b);

  // Compare contrast with black vs white
  // Black luminance = 0, white luminance = 1
  const contrastWithBlack = (luminance + 0.05) / (0 + 0.05);
  const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);

  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#ffffff';
}

/**
 * Accessibility report for a color pair across all WCAG 2.1 contrast levels.
 */
export interface ColorAccessibilityReport {
  /** Contrast ratio between the two colors (1-21) */
  ratio: number;
  /** Passes WCAG AA for normal text (>= 4.5:1) */
  AA: boolean;
  /** Passes WCAG AA for large text (>= 3:1) */
  AALargeText: boolean;
  /** Passes WCAG AAA for normal text (>= 7:1) */
  AAA: boolean;
  /** Passes WCAG AAA for large text (>= 4.5:1) */
  AAALargeText: boolean;
}

/**
 * Generates a full WCAG 2.1 accessibility report for a foreground/background
 * color pair.
 *
 * Returns `null` if either color is a CSS variable or cannot be parsed.
 *
 * @param foreground - Text/foreground color (hex, rgb, or CSS variable)
 * @param background - Background color (hex, rgb, or CSS variable)
 * @returns Full accessibility report, or null if colors cannot be evaluated
 *
 * @example
 * ```ts
 * const report = checkColorAccessibility('#1a1a2e', '#ffffff');
 * // {
 * //   ratio: 16.75,
 * //   AA: true,
 * //   AALargeText: true,
 * //   AAA: true,
 * //   AAALargeText: true,
 * // }
 * ```
 *
 * @example CSS variable returns null
 * ```ts
 * checkColorAccessibility('var(--ds-color-text)', '#fff'); // null
 * ```
 */
export function checkColorAccessibility(
  foreground: string,
  background: string
): ColorAccessibilityReport | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return null;

  return {
    ratio,
    AA: meetsContrastLevel(ratio, 'AA'),
    AALargeText: meetsContrastLevel(ratio, 'AA', true),
    AAA: meetsContrastLevel(ratio, 'AAA'),
    AAALargeText: meetsContrastLevel(ratio, 'AAA', true),
  };
}
