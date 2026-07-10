/**
 * @fileoverview OKLCH <-> sRGB color math (WO-TOK-02).
 *
 * Pure, dependency-free conversion between hex sRGB and the OKLab/OKLCH
 * perceptual color space (Björn Ottosson's OKLab -- the space CSS Color 4's
 * `oklch()` function uses: https://bottosson.github.io/posts/oklab/). Used
 * to derive perceptually-even color ramps from a single tenant seed color.
 *
 * The matrices below are the published, versioned OKLab constants -- the
 * same ones the CSS Color 4 spec and browser `oklch()` implementations use
 * -- reproduced as literals so this module carries zero new runtime
 * dependency.
 *
 * Gamut mapping reduces chroma (holding lightness and hue fixed) via binary
 * search until a color re-enters the sRGB gamut: the "reduce C" strategy
 * CSS Color 4 recommends, which moves an out-of-gamut color toward gray
 * along a constant-lightness, constant-hue line -- the least perceptually
 * disruptive single-axis reduction.
 */

export interface Oklab {
  /** Perceptual lightness, nominally 0 (black) to 1 (white). */
  l: number;
  /** Green-red axis. */
  a: number;
  /** Blue-yellow axis. */
  b: number;
}

export interface Oklch {
  /** Perceptual lightness, nominally 0 (black) to 1 (white). */
  l: number;
  /** Chroma, >= 0 (unbounded; sRGB-representable colors are typically 0-0.4). */
  c: number;
  /** Hue in degrees, 0-360. Meaningless (reported as 0) when c is ~0. */
  h: number;
}

export interface RgbFloat {
  /** 0-1. May fall outside [0,1] before gamut mapping. */
  r: number;
  g: number;
  b: number;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

// ---------------------------------------------------------------------------
// hex <-> RGB float
// ---------------------------------------------------------------------------

export function hexToRgbFloat(hex: string): RgbFloat {
  const cleaned = hex.trim().replace(/^#/, '');
  const full = cleaned.length === 3 ? cleaned.split('').map((ch) => ch + ch).join('') : cleaned;
  const int = parseInt(full, 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}

export function rgbFloatToHex({ r, g, b }: RgbFloat): string {
  const toHex = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// sRGB companding (IEC 61966-2-1). Signed variants so intermediate,
// not-yet-gamut-mapped linear values (which can go negative) still round
// trip through the transfer curve instead of producing NaN.
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.04045 ? c / 12.92 : Math.sign(c) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.0031308 ? c * 12.92 : Math.sign(c) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
}

// ---------------------------------------------------------------------------
// OKLab (Björn Ottosson's published sRGB<->OKLab matrices)
// ---------------------------------------------------------------------------

function linearRgbToOklab(r: number, g: number, b: number): Oklab {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToLinearRgb({ l, a, b }: Oklab): RgbFloat {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  };
}

export function hexToOklab(hex: string): Oklab {
  const { r, g, b } = hexToRgbFloat(hex);
  return linearRgbToOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
}

function oklabToRgbFloat(lab: Oklab): RgbFloat {
  const linear = oklabToLinearRgb(lab);
  return {
    r: linearToSrgb(linear.r),
    g: linearToSrgb(linear.g),
    b: linearToSrgb(linear.b),
  };
}

// ---------------------------------------------------------------------------
// OKLCH (polar form of OKLab)
// ---------------------------------------------------------------------------

export function oklabToOklch({ l, a, b }: Oklab): Oklch {
  const c = Math.sqrt(a * a + b * b);
  if (c < 1e-6) return { l, c: 0, h: 0 };
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l, c, h };
}

export function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const hRad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(hRad), b: c * Math.sin(hRad) };
}

export function hexToOklch(hex: string): Oklch {
  return oklabToOklch(hexToOklab(hex));
}

// ---------------------------------------------------------------------------
// sRGB gamut mapping
// ---------------------------------------------------------------------------

const GAMUT_EPSILON = 1e-4;

function isRgbInGamut({ r, g, b }: RgbFloat): boolean {
  return (
    r >= -GAMUT_EPSILON && r <= 1 + GAMUT_EPSILON &&
    g >= -GAMUT_EPSILON && g <= 1 + GAMUT_EPSILON &&
    b >= -GAMUT_EPSILON && b <= 1 + GAMUT_EPSILON
  );
}

/**
 * Reduce chroma (holding lightness and hue fixed) via binary search until
 * the color re-enters the sRGB gamut. Lightness itself is expected to
 * already be in [0,1] -- no chroma reduction can fix an out-of-range
 * lightness, so a caller-supplied out-of-range `l` collapses to c=0 (pure
 * gray at that lightness) rather than searching forever.
 */
export function gamutMapToSrgb(oklch: Oklch): Oklch {
  const atZero = oklabToRgbFloat(oklchToOklab({ ...oklch, c: 0 }));
  if (!isRgbInGamut(atZero)) return { ...oklch, c: 0 };

  const atFull = oklabToRgbFloat(oklchToOklab(oklch));
  if (isRgbInGamut(atFull)) return oklch;

  let lo = 0;
  let hi = oklch.c;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = oklabToRgbFloat(oklchToOklab({ ...oklch, c: mid }));
    if (isRgbInGamut(candidate)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { ...oklch, c: lo };
}

/** Convert OKLCH to a gamut-mapped sRGB hex string. */
export function oklchToHex(oklch: Oklch): string {
  const mapped = gamutMapToSrgb({ ...oklch, l: clamp01(oklch.l) });
  return rgbFloatToHex(oklabToRgbFloat(oklchToOklab(mapped)));
}
