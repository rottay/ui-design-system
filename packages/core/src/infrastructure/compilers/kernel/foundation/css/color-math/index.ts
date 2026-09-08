/**
 * @fileoverview CSS-value hygiene and the surface-lightness question.
 *
 * The colorimetry itself is NOT here. `foundation/kernel/color` is the one
 * color owner: this module re-exports its hex predicate and parses through its
 * parser, so a compiler and an accessibility check can never disagree about
 * whether a string is a hex colour or about what its channels are.
 */

import { isHexColor, parseHex } from '@/foundation/kernel/color/contrast';

export { isHexColor };

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

/** Parse hex -> RGB, through the one color owner. Null for non-hex inputs. */
export function hexToRgb(value: string): { r: number; g: number; b: number } | null {
  return parseHex(value);
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

/**
 * NTSC perceived luminance (0-255) of a hex surface color; 255 for non-hex.
 *
 * A LIGHTNESS question, not a contrast one. This is the right metric for "is
 * this canvas dark", which is what `deriveGroundLadder` asks before choosing
 * between white lifts and black sinks. It is emphatically not the metric for
 * "is this ink legible on that canvas" — that pairing is measured by WCAG
 * ratio in `color-math/readable-ink`, and using a luminance threshold for it
 * is the defect this checkpoint removed.
 */
export function surfaceLuminance(surfaceColor: string): number {
  const rgb = hexToRgb(surfaceColor);
  if (!rgb) return 255;
  return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

/** A surface is dark when its perceived luminance falls below the mid threshold. */
export function isDarkSurface(surfaceColor: string): boolean {
  return surfaceLuminance(surfaceColor) < 128;
}

// The `--ds-elevation-0..5` ladder and the two sRGB `buildRuntimeScale` /
// `buildDarkRuntimeScale` ramps left with the runtime tenant-CSS generator
// that was their only caller. The ladder is authored in
// `foundation/tokens/css/foundation/themes/default/index.css`, which is where every
// consumer reads it from; the ramps were replaced by the OKLCH derivation
// (`foundation/kernel/color/oklch/ramp`) that both compilers share. Nothing
// here re-derives either, because a second derivation is how the two stopped
// agreeing the first time.
