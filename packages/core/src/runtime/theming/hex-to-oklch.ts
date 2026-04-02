/**
 * Convert hex color to oklch() CSS string for DaisyUI 5 integration.
 *
 * DaisyUI 5 requires colors in oklch() format. When tenants provide
 * branding colors as hex values, this converter bridges the gap.
 *
 * Uses the CSS Color Level 4 oklch color space:
 * - L: Lightness (0% to 100%)
 * - C: Chroma (0 to ~0.4)
 * - H: Hue (0 to 360)
 *
 * @module System/Theming/HexToOklch
 * @category System
 * @package @rottay/design-system
 */

// ─────────────────────────────────────────────────────────────────
// COLOR SPACE CONVERSION PIPELINE: sRGB -> Linear RGB -> XYZ D65 -> Oklab -> Oklch
// ─────────────────────────────────────────────────────────────────

/** Convert a single sRGB channel (0-1) to linear-light value. */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Convert linear RGB to CIE XYZ (D65 illuminant). */
function linearRgbToXyz(r: number, g: number, b: number): [number, number, number] {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
    0.0193339 * r + 0.1191920 * g + 0.9503041 * b,
  ];
}

/** Convert CIE XYZ (D65) to Oklab perceptual color space. */
function xyzToOklab(x: number, y: number, z: number): [number, number, number] {
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

/** Convert Oklab (L, a, b) to Oklch (L, C, H) polar form. */
function oklabToOklch(L: number, a: number, b: number): [number, number, number] {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return [L, C, h];
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/**
 * Convert a hex color string to oklch() CSS value.
 *
 * @param hex - Color in #RRGGBB or #RGB format
 * @returns oklch() CSS string, e.g. "oklch(72.3% 0.150 165)"
 */
export function hexToOklch(hex: string): string {
  // Normalize hex: strip # and expand shorthand
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];

  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255);

  const [x, y, z] = linearRgbToXyz(r, g, b);
  const [L, a_, b_] = xyzToOklab(x, y, z);
  const [lch_L, lch_C, lch_H] = oklabToOklch(L, a_, b_);

  // Format: oklch(L% C H) - L as percentage, C and H as numbers
  const lPct = (lch_L * 100).toFixed(1);
  const c = lch_C.toFixed(3);
  const hue = lch_H.toFixed(0);

  return `oklch(${lPct}% ${c} ${hue})`;
}

/**
 * Extract the oklch lightness component (0-1) from a hex color.
 * Used internally to determine whether content text should be dark or light.
 */
function getOklchLightness(hex: string): number {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];

  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255);

  const [x, y, z] = linearRgbToXyz(r, g, b);
  const [L] = xyzToOklab(x, y, z);

  return L;
}

/**
 * Generate DaisyUI 5 color variable overrides from a tenant's branding.
 * Returns a Record of --color-* variable name -> oklch() value pairs.
 *
 * DaisyUI 5 expects `--color-primary`, `--color-secondary`, `--color-accent`,
 * and their `-content` counterparts to be in oklch() format. This function
 * converts tenant hex colors and auto-generates readable content colors.
 *
 * @param primaryColor - Tenant's primary brand color (hex)
 * @param secondaryColor - Tenant's secondary color (hex, optional)
 * @param accentColor - Tenant's accent color (hex, optional)
 * @returns CSS variable overrides ready for style.setProperty()
 */
export function buildDaisyUiColorOverrides(
  primaryColor?: string | null,
  secondaryColor?: string | null,
  accentColor?: string | null,
): Record<string, string> {
  const overrides: Record<string, string> = {};

  if (primaryColor) {
    overrides['--color-primary'] = hexToOklch(primaryColor);
    // Auto-generate content color using perceptual oklch lightness.
    // If lightness > 0.6, the background is "light" so use dark text; otherwise light text.
    const lightness = getOklchLightness(primaryColor);
    overrides['--color-primary-content'] = lightness > 0.6
      ? 'oklch(7% 0.01 260)'
      : 'oklch(96% 0.008 100)';
  }

  if (secondaryColor) {
    overrides['--color-secondary'] = hexToOklch(secondaryColor);
    const lightness = getOklchLightness(secondaryColor);
    overrides['--color-secondary-content'] = lightness > 0.6
      ? 'oklch(7% 0.01 260)'
      : 'oklch(96% 0.008 100)';
  }

  if (accentColor) {
    overrides['--color-accent'] = hexToOklch(accentColor);
    const lightness = getOklchLightness(accentColor);
    overrides['--color-accent-content'] = lightness > 0.6
      ? 'oklch(7% 0.01 260)'
      : 'oklch(96% 0.008 100)';
  }

  return overrides;
}
