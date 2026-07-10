/**
 * @fileoverview WCAG 2.2 Branding Contrast Validator - Wave 6.2 Accessibility Guardian
 *
 * Validates tenant branding color combinations against WCAG 2.2 contrast
 * requirements and suggests accessible alternatives when violations are found.
 *
 * Accepts hex colors (#xxx or #xxxxxx). Non-hex values (CSS variables, rgb(),
 * named colors, etc.) are skipped gracefully -- pairs that include a non-hex
 * value are omitted from the result rather than treated as failures.
 *
 * @module Internal/A11y/Contrast
 * @package @rottay/design-system
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContrastViolation {
  /** Human-readable pair label, e.g. 'primary-on-background' */
  pair: string;
  /** Foreground hex color */
  foreground: string;
  /** Background hex color */
  background: string;
  /** Actual contrast ratio */
  ratio: number;
  /** Required contrast ratio (4.5 for AA normal text, 3 for AA large/UI) */
  required: number;
  /** WCAG conformance level */
  level: 'AA' | 'AAA';
}

export interface ContrastSuggestion {
  /** Same pair label as the corresponding violation */
  pair: string;
  /** Original foreground color that failed */
  originalColor: string;
  /** Suggested replacement foreground color that meets the required ratio */
  suggestedColor: string;
  /** Contrast ratio of the suggested color against the background */
  newRatio: number;
}

export interface ContrastValidationResult {
  /** True when every checkable pair passes its required ratio */
  valid: boolean;
  /** All pairs that fail their required contrast ratio */
  violations: ContrastViolation[];
  /** One suggestion per violation with an adjusted foreground color */
  suggestions: ContrastSuggestion[];
}

export interface BrandingColors {
  /** Primary brand color */
  primary: string;
  /** Page background color */
  background: string;
  /** Main text color */
  text?: string;
  /** Muted/secondary text color */
  textMuted?: string;
  /** Card/surface background color */
  surfaceCard?: string;
  /** Secondary brand color */
  secondary?: string;
  /** Accent color */
  accent?: string;
}

// ---------------------------------------------------------------------------
// Internal: hex parsing
// ---------------------------------------------------------------------------

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Returns true if the string looks like a hex color (#xxx or #xxxxxx).
 * Used to skip CSS variables, rgb(), named colors, etc.
 */
function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Parses a 3- or 6-digit hex color string into RGB components.
 * Returns null for non-hex values.
 */
function parseHex(hex: string): RGB | null {
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
 * Converts RGB components back to a 6-digit hex string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---------------------------------------------------------------------------
// Internal: HSL conversion (hue-preserving adjustment)
// ---------------------------------------------------------------------------

interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

/**
 * Converts RGB to HSL. The canonical hue/saturation/lightness conversion for
 * this package -- callers that need a hue-based separation measurement should
 * reuse this rather than re-implementing HSL conversion.
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s, l };
}

function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

// ---------------------------------------------------------------------------
// WCAG 2.2 relative luminance and contrast ratio
// ---------------------------------------------------------------------------

/**
 * Converts a single sRGB channel value (0-255) to its linear representation.
 * Per WCAG 2.2: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
function linearize(channel: number): number {
  const sRGB = channel / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * WCAG 2.2 relative luminance from sRGB.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
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

// ---------------------------------------------------------------------------
// APCA (Accessible Perceptual Contrast Algorithm), WO-TOK-02
// ---------------------------------------------------------------------------

/**
 * APCA (Lc) contrast, algorithm version 0.1.9 (SAPC-8). This is a from-scratch,
 * dependency-free implementation of the published APCA-W3 0.1.9 constants and
 * formula (https://github.com/Myndex/apca-w3) -- reproduced as literals rather
 * than importing the `apca-w3` package, which is a repo-root dev-only tool
 * dependency (used by `scripts/engine-token-audit.mjs`), not a dependency of
 * this published package. Adding it here would make every consumer of
 * `@rottay/design-system` require it at runtime.
 *
 * Unlike WCAG 2 contrast ratio (symmetric, `contrastRatio` above), APCA is
 * signed and polarity-aware: a positive Lc means dark text on a light
 * background, negative means light text on a dark background, and the two
 * polarities use different exponents/offsets because human contrast
 * perception is not symmetric between them.
 */

const APCA_TRC = 2.4;
const APCA_SR_CO = 0.2126729;
const APCA_SG_CO = 0.7151522;
const APCA_SB_CO = 0.072175;

const APCA_NORM_BG = 0.56;
const APCA_NORM_TXT = 0.57;
const APCA_REV_BG = 0.65;
const APCA_REV_TXT = 0.62;

const APCA_BLACK_THRESHOLD = 0.022;
const APCA_BLACK_CLAMP = 1.414;
const APCA_SCALE = 1.14;
const APCA_LO_BOW_OFFSET = 0.027;
const APCA_LO_WOB_OFFSET = 0.027;
const APCA_DELTA_Y_MIN = 0.0005;
const APCA_LO_CLIP = 0.1;

/** APCA's own sRGB -> "Y" luminance-like value (its own coefficients and
 * gamma; NOT the same as WCAG's `relativeLuminance` -- do not conflate them,
 * mixing the two produces plausible-looking but wrong Lc values. */
function apcaLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const chan = (v: number) => Math.pow(v / 255, APCA_TRC);
  return APCA_SR_CO * chan(rgb.r) + APCA_SG_CO * chan(rgb.g) + APCA_SB_CO * chan(rgb.b);
}

/** Soft clamp near black: APCA does not treat near-black linearly, it lifts
 * very dark values slightly so two near-black colors are not reported as
 * zero contrast. */
function apcaClampY(y: number): number {
  return y > APCA_BLACK_THRESHOLD ? y : y + Math.pow(APCA_BLACK_THRESHOLD - y, APCA_BLACK_CLAMP);
}

/**
 * Signed APCA Lc contrast between a text color and a background color.
 * Positive = normal polarity (dark text on light bg). Negative = reverse
 * polarity (light text on dark bg). Magnitude is what is compared against a
 * threshold; polarity says which way the pair reads.
 */
export function apcaContrast(textHex: string, bgHex: string): number {
  const txtY = apcaClampY(apcaLuminance(textHex));
  const bgY = apcaClampY(apcaLuminance(bgHex));

  if (Math.abs(bgY - txtY) < APCA_DELTA_Y_MIN) return 0;

  if (bgY > txtY) {
    const sapc = (Math.pow(bgY, APCA_NORM_BG) - Math.pow(txtY, APCA_NORM_TXT)) * APCA_SCALE;
    const output = sapc < APCA_LO_CLIP ? 0 : sapc - APCA_LO_BOW_OFFSET;
    return output * 100;
  }

  const sapc = (Math.pow(bgY, APCA_REV_BG) - Math.pow(txtY, APCA_REV_TXT)) * APCA_SCALE;
  const output = sapc > -APCA_LO_CLIP ? 0 : sapc + APCA_LO_WOB_OFFSET;
  return output * 100;
}

/** APCA bronze-tier guidance thresholds (|Lc|): body text needs more contrast
 * than large text / UI components / low-emphasis content. */
export const APCA_BODY_TEXT_MIN_LC = 60;
export const APCA_UI_MIN_LC = 45;

/** True when a text/background pairing clears its APCA Lc threshold. */
export function passesApca(textHex: string, bgHex: string, kind: 'body' | 'ui'): boolean {
  const threshold = kind === 'body' ? APCA_BODY_TEXT_MIN_LC : APCA_UI_MIN_LC;
  return Math.abs(apcaContrast(textHex, bgHex)) >= threshold;
}

// ---------------------------------------------------------------------------
// Suggestion engine: adjust lightness to meet target contrast
// ---------------------------------------------------------------------------

/**
 * Adjusts a foreground color to meet a target contrast ratio against a
 * background color. Preserves hue and saturation, adjusts lightness only.
 *
 * Uses binary search over the HSL lightness channel. Tries darkening first;
 * if darkening cannot reach the target (e.g., dark fg on dark bg), tries
 * lightening instead.
 */
function suggestAccessibleColor(fg: string, bg: string, targetRatio: number): string {
  const fgRgb = parseHex(fg);
  const bgRgb = parseHex(bg);
  if (!fgRgb || !bgRgb) return fg;

  const fgHsl = rgbToHsl(fgRgb);
  const bgLuminance = relativeLuminance(bg);

  // Try a specific lightness direction via binary search
  const tryDirection = (low: number, high: number): string | null => {
    let bestHex: string | null = null;
    let lo = low;
    let hi = high;

    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      const candidate = hslToRgb({ h: fgHsl.h, s: fgHsl.s, l: mid });
      const candidateHex = rgbToHex(candidate.r, candidate.g, candidate.b);
      const candidateLum =
        0.2126 * linearize(candidate.r) +
        0.7152 * linearize(candidate.g) +
        0.0722 * linearize(candidate.b);

      const lighter = Math.max(candidateLum, bgLuminance);
      const darker = Math.min(candidateLum, bgLuminance);
      const ratio = (lighter + 0.05) / (darker + 0.05);

      if (ratio >= targetRatio) {
        bestHex = candidateHex;
        // Try to stay closer to original lightness
        if (low < high) {
          // Darkening: target is on the low end, so raise lo to get closer to original
          lo = mid;
        } else {
          // Lightening: target is on the high end, so lower hi to get closer to original
          hi = mid;
        }
      } else {
        if (low < high) {
          // Darkening: need to go darker
          hi = mid;
        } else {
          // Lightening: need to go lighter
          lo = mid;
        }
      }
    }

    return bestHex;
  };

  // Determine direction: if background is dark, try lightening first; otherwise darken first.
  const bgIsDark = bgLuminance < 0.5;

  if (bgIsDark) {
    // Try lightening (increase lightness from current toward 1)
    const lightened = tryDirection(1, fgHsl.l);
    if (lightened) return lightened;
    // Fallback: try darkening
    const darkened = tryDirection(fgHsl.l, 0);
    if (darkened) return darkened;
  } else {
    // Try darkening (decrease lightness from current toward 0)
    const darkened = tryDirection(fgHsl.l, 0);
    if (darkened) return darkened;
    // Fallback: try lightening
    const lightened = tryDirection(1, fgHsl.l);
    if (lightened) return lightened;
  }

  // Ultimate fallback: return black or white
  return bgIsDark ? '#ffffff' : '#000000';
}

// ---------------------------------------------------------------------------
// Pair definitions for branding validation
// ---------------------------------------------------------------------------

interface PairCheck {
  /** Human-readable label */
  label: string;
  /** Key on BrandingColors for the foreground */
  fgKey: keyof BrandingColors;
  /** Key on BrandingColors for the background */
  bgKey: keyof BrandingColors;
  /** Required WCAG contrast ratio */
  required: number;
  /** WCAG level */
  level: 'AA' | 'AAA';
}

const PAIR_CHECKS: PairCheck[] = [
  // Text on page background (normal text: 4.5:1 AA)
  { label: 'text-on-background', fgKey: 'text', bgKey: 'background', required: 4.5, level: 'AA' },
  { label: 'textMuted-on-background', fgKey: 'textMuted', bgKey: 'background', required: 4.5, level: 'AA' },
  // Primary as UI component on page background (3:1 AA for non-text)
  { label: 'primary-on-background', fgKey: 'primary', bgKey: 'background', required: 3, level: 'AA' },
  // Text on card surface (normal text: 4.5:1 AA)
  { label: 'text-on-surfaceCard', fgKey: 'text', bgKey: 'surfaceCard', required: 4.5, level: 'AA' },
  { label: 'textMuted-on-surfaceCard', fgKey: 'textMuted', bgKey: 'surfaceCard', required: 4.5, level: 'AA' },
  // Primary as UI component on card surface (3:1 AA for non-text)
  { label: 'primary-on-surfaceCard', fgKey: 'primary', bgKey: 'surfaceCard', required: 3, level: 'AA' },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates branding colors against WCAG 2.2 contrast requirements.
 *
 * Checks all meaningful foreground/background pairs and returns violations
 * with suggested accessible alternatives for each failing pair.
 *
 * Non-hex values (CSS variables, rgb(), named colors, etc.) are skipped
 * gracefully -- pairs containing non-hex values are omitted entirely.
 *
 * @param colors - Branding color palette to validate
 * @returns Validation result with violations and per-violation suggestions
 *
 * @example All pairs pass
 * ```ts
 * const result = validateBrandingContrast({
 *   primary: '#1a73e8',
 *   background: '#ffffff',
 *   text: '#1a1a2e',
 * });
 * // result.valid === true
 * // result.violations === []
 * ```
 *
 * @example Violation with suggestion
 * ```ts
 * const result = validateBrandingContrast({
 *   primary: '#cccccc',
 *   background: '#ffffff',
 *   text: '#aaaaaa',
 * });
 * // result.valid === false
 * // result.violations[0].pair === 'text-on-background'
 * // result.suggestions[0].suggestedColor -> darker shade of #aaaaaa
 * ```
 */
export function validateBrandingContrast(colors: BrandingColors): ContrastValidationResult {
  const violations: ContrastViolation[] = [];
  const suggestions: ContrastSuggestion[] = [];

  for (const check of PAIR_CHECKS) {
    const fg = colors[check.fgKey];
    const bg = colors[check.bgKey];

    // Skip if either color is missing or not a parseable hex value
    if (!fg || !bg) continue;
    if (!isHexColor(fg) || !isHexColor(bg)) continue;

    const ratio = contrastRatio(fg, bg);

    if (ratio < check.required) {
      violations.push({
        pair: check.label,
        foreground: fg,
        background: bg,
        ratio: Math.round(ratio * 100) / 100,
        required: check.required,
        level: check.level,
      });

      const suggested = suggestAccessibleColor(fg, bg, check.required);
      const newRatio = contrastRatio(suggested, bg);

      suggestions.push({
        pair: check.label,
        originalColor: fg,
        suggestedColor: suggested,
        newRatio: Math.round(newRatio * 100) / 100,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    suggestions,
  };
}
