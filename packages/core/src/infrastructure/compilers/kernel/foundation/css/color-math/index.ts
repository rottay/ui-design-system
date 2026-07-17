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

/**
 * Validate that a value is a valid CSS color.
 * Accepts: hex (#fff, #ffffff), rgb(), rgba(), hsl(), hsla(), oklch(),
 * var(--ds-*), color-mix(), named colors (transparent, inherit, currentColor).
 */
export function isValidCssColor(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (isHexColor(v)) return true;
  if (/^(rgb|rgba|hsl|hsla|oklch|lab|lch)\s*\(/.test(v)) return true;
  if (/^var\(--/.test(v)) return true;
  if (/^color-mix\(/.test(v)) return true;
  if (/^(transparent|inherit|currentColor|none|unset|initial)$/i.test(v)) return true;
  return false;
}

/**
 * Validate that a value is a valid CSS dimension (size).
 * Accepts: 0, 12px, 1.5rem, 0.875em, 50%, var(--ds-*).
 */
export function isValidCssDimension(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (v === '0') return true;
  if (/^var\(--/.test(v)) return true;
  if (/^\d+(\.\d+)?(px|rem|em|%|vw|vh|dvh|svh|ch|ex)$/.test(v)) return true;
  return false;
}

/**
 * Clamp a numeric value within bounds. Returns clamped value.
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
    100: mixColor(baseColor, darkBase, 0.74),
    200: mixColor(baseColor, darkBase, 0.6),
    300: mixColor(baseColor, darkBase, 0.42),
    400: mixColor(baseColor, '#ffffff', 0.22),
    500: mixColor(baseColor, '#ffffff', 0.12),
    600: normalizeHexColor(baseColor),
    700: mixColor(baseColor, '#000000', 0.12),
    800: mixColor(baseColor, '#000000', 0.26),
    900: mixColor(baseColor, '#000000', 0.38),
  };
}

/** Pick readable foreground color (black or white) using NTSC luminance. */
export function getReadableForegroundColor(baseColor: string): string {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return '#ffffff';
  const luminance = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  return luminance > 186 ? '#171717' : '#ffffff';
}

/** NTSC perceived luminance (0-255) of a hex surface color; 255 for non-hex. */
export function surfaceLuminance(surfaceColor: string): number {
  const rgb = hexToRgb(surfaceColor);
  if (!rgb) return 255;
  return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

/** A surface is dark when its NTSC luminance falls below the mid threshold. */
export function isDarkSurface(surfaceColor: string): boolean {
  return surfaceLuminance(surfaceColor) < 128;
}

export type ElevationScale = Record<
  | '--ds-elevation-0'
  | '--ds-elevation-1'
  | '--ds-elevation-2'
  | '--ds-elevation-3'
  | '--ds-elevation-4'
  | '--ds-elevation-5',
  string
>;

/**
 * Perceived-depth shadows for a surface, keyed to --ds-elevation-0..5 (0 = flat).
 *
 * A dark surface (NTSC luminance below the mid threshold) resolves to the
 * dark-aware treatment: a top hairline highlight (inset white, stronger at higher
 * elevation) plus a deeper ambient shadow, because pure-black shadows are invisible
 * on a dark canvas; elevation 4-5 add a low-alpha primary glow for floating
 * overlays. A light surface resolves to layered key+ambient black shadows at low
 * alpha. The dark values mirror the tenant-artifact overrides for dark-surface
 * tenants so the runtime path and the committed artifact agree.
 */
export function buildElevationScale(surfaceColor: string): ElevationScale {
  if (isDarkSurface(surfaceColor)) {
    return {
      '--ds-elevation-0': 'none',
      '--ds-elevation-1':
        'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)',
      '--ds-elevation-2':
        'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34)',
      '--ds-elevation-3':
        'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40)',
      '--ds-elevation-4':
        'inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)',
      '--ds-elevation-5':
        'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)',
    };
  }

  return {
    '--ds-elevation-0': 'none',
    '--ds-elevation-1':
      '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.02)',
    '--ds-elevation-2':
      '0 2px 4px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.03)',
    '--ds-elevation-3':
      '0 2px 4px rgba(0, 0, 0, 0.02), 0 4px 8px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.04)',
    '--ds-elevation-4':
      '0 4px 8px rgba(0, 0, 0, 0.02), 0 8px 16px rgba(0, 0, 0, 0.03), 0 16px 32px rgba(0, 0, 0, 0.04), 0 32px 64px rgba(0, 0, 0, 0.06)',
    '--ds-elevation-5':
      '0 8px 16px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.06), 0 32px 64px rgba(0, 0, 0, 0.08)',
  };
}
