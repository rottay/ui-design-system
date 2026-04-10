/**
 * @fileoverview Shared color math utilities.
 *
 * Canonical implementation of color manipulation used by both the runtime
 * ThemeProvider (inline CSS variable injection) and the static generator
 * (CSS file generation). Previously duplicated in both locations.
 *
 * Consolidation target for R2.
 */

/** Validate that a color is a short or full hex code. */
export function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/** Expand shorthand hex (#abc) to full form (#aabbcc). */
export function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) return value;
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

/** Clamp a color channel to 0-255. */
function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Parse hex -> RGB. Returns null for non-hex inputs. */
export function hexToRgb(value: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(value);
  if (!isHexColor(normalized)) return null;
  const n = Number.parseInt(normalized.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** RGB -> 6-digit hex string. */
export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((c) => clampChannel(c).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Linearly interpolate between two hex colors. Returns baseColor if either is non-hex. */
export function mixColor(baseColor: string, mixWith: string, mixRatio: number): string {
  const baseRgb = hexToRgb(baseColor);
  const mixRgb = hexToRgb(mixWith);
  if (!baseRgb || !mixRgb) return baseColor;
  return rgbToHex({
    r: baseRgb.r + (mixRgb.r - baseRgb.r) * mixRatio,
    g: baseRgb.g + (mixRgb.g - baseRgb.g) * mixRatio,
    b: baseRgb.b + (mixRgb.b - baseRgb.b) * mixRatio,
  });
}

type ColorScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;

/** Generate a 10-step light color scale from a single base color. */
export function buildRuntimeScale(baseColor: string): ColorScale {
  return {
    50: mixColor(baseColor, '#ffffff', 0.92),
    100: mixColor(baseColor, '#ffffff', 0.82),
    200: mixColor(baseColor, '#ffffff', 0.68),
    300: mixColor(baseColor, '#ffffff', 0.48),
    400: mixColor(baseColor, '#ffffff', 0.2),
    500: normalizeHexColor(baseColor),
    600: mixColor(baseColor, '#000000', 0.12),
    700: mixColor(baseColor, '#000000', 0.24),
    800: mixColor(baseColor, '#000000', 0.36),
    900: mixColor(baseColor, '#000000', 0.48),
  };
}

/** Generate a 10-step dark color scale. Steps 50-300 mix toward dark slate, 400-500 toward white. */
export function buildDarkRuntimeScale(baseColor: string): ColorScale {
  const darkBase = '#020617';
  return {
    50: mixColor(baseColor, darkBase, 0.88),
    100: mixColor(baseColor, darkBase, 0.76),
    200: mixColor(baseColor, darkBase, 0.60),
    300: mixColor(baseColor, darkBase, 0.36),
    400: mixColor(baseColor, '#ffffff', 0.30),
    500: normalizeHexColor(baseColor),
    600: baseColor,
    700: mixColor(baseColor, '#000000', 0.20),
    800: mixColor(baseColor, '#000000', 0.35),
    900: mixColor(baseColor, '#000000', 0.50),
  };
}

/** Pick readable foreground color (black or white) using NTSC luminance. */
export function getReadableForegroundColor(baseColor: string): string {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return '#ffffff';
  const luminance = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  return luminance > 186 ? '#0a0a0a' : '#ffffff';
}
