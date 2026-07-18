/**
 * @fileoverview APCA text-contrast autocorrect for compiled tenant variables (W4-C1).
 *
 * Pure color-math pass over a compiled `--ds-*` variable map: for each governed
 * text-on-ground pairing whose foreground and ground are both concrete hex
 * colors, the foreground is snapped (OKLCH lightness steps, hue held, chroma
 * gamut-tapered) until it clears its APCA Lc threshold. The stance is
 * AUTO-CORRECT, never reject: a tenant editor mistake must not fail the
 * compile, and every mutation is reported as an adjustment row so the editor
 * can surface it. Pairs that include a non-hex value (var(), color-mix(),
 * light-dark()) cannot be verified at compile time and are reported as
 * unverifiable rows rather than skipped silently.
 *
 * This module knows variable NAMES and hex values only -- it must not import
 * the tenant-theme schema, contract, or compiler. The caller (the compiler)
 * passes the already-normalized appearance; only
 * `general.palette.backgroundMode` is read, and only to pick the deterministic
 * default page ground when the page-background chain is unauthored.
 */
import { APCA_BODY_TEXT_MIN_LC, apcaContrast } from '..';
import { hexToOklch, oklchToHex } from '../../../color/oklch';

/** Lc floor for primary body text on the page ground (stricter than chrome pairs). */
export const TEXT_CONTRAST_PRIMARY_TEXT_MIN_LC = 75;

/** Lightness step per snap iteration, in OKLCH L units. */
export const TEXT_CONTRAST_SNAP_STEP_L = 0.02;

/** Maximum snap iterations before falling back to the extreme candidates. */
export const TEXT_CONTRAST_SNAP_MAX_ITERATIONS = 15;

/**
 * Extreme fallback candidates when stepping cannot reach the threshold
 * (an extreme mid-luminance ground). Near-black is #111113, not #000000, so
 * the fallback stays inside the DS ink range instead of pure black.
 */
export const TEXT_CONTRAST_FALLBACK_CANDIDATES = ['#FFFFFF', '#111113'] as const;

/**
 * Deterministic page grounds used when the page-background chain is
 * unauthored. Must stay byte-identical to the compiler's default grounds
 * (DEFAULT_CHART_GROUNDS / APPEARANCE_RAMP_GROUNDS); `auto` is light-first,
 * matching the Appearance v1 single-palette stance.
 */
export const TEXT_CONTRAST_DEFAULT_PAGE_GROUNDS = {
  light: '#FFFFFF',
  dark: '#0C0C0E',
} as const;

export type TextContrastBackgroundMode = 'light' | 'dark' | 'auto';

/**
 * Structural slice of the compiler's normalized appearance. Kept structural on
 * purpose: this kernel module must not depend on the tenant-theme contract.
 */
export interface TextContrastAppearanceInput {
  general?: {
    palette?: {
      backgroundMode?: TextContrastBackgroundMode;
    };
  };
}

export interface TextContrastPairing {
  /** Foreground (text) variable name. */
  token: string;
  /** Ground candidates, first authored entry wins. */
  groundChain: readonly string[];
  /** APCA |Lc| floor for this pairing. */
  thresholdLc: number;
  /**
   * When true and no chain entry is authored, the pair verifies against the
   * deterministic default page ground instead of being inapplicable.
   */
  pageGroundFallback: boolean;
}

const BUTTON_VARIANTS = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;

/**
 * The governed pairing list. Variable names mirror the chrome emitter's
 * exact output names -- a rename there must be reflected here.
 */
export const TEXT_CONTRAST_PAIRINGS_V1: readonly TextContrastPairing[] = [
  ...BUTTON_VARIANTS.map((variant) => ({
    token: `--ds-button-${variant}-color`,
    groundChain: [`--ds-button-${variant}-bg`],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  })),
  {
    token: '--ds-table-header-color',
    groundChain: ['--ds-table-header-bg'],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  },
  {
    token: '--ds-sidebar-text',
    groundChain: ['--ds-sidebar-bg'],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  },
  {
    token: '--ds-sidebar-item-color-active',
    groundChain: ['--ds-sidebar-item-bg-active'],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  },
  {
    token: '--ds-color-text-primary',
    groundChain: ['--ds-color-bg-primary', '--ds-color-background', '--ds-color-bg'],
    thresholdLc: TEXT_CONTRAST_PRIMARY_TEXT_MIN_LC,
    pageGroundFallback: true,
  },
  {
    token: '--ds-card-title-color',
    groundChain: ['--ds-card-bg'],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  },
  {
    token: '--ds-card-body-color',
    groundChain: ['--ds-card-bg'],
    thresholdLc: APCA_BODY_TEXT_MIN_LC,
    pageGroundFallback: false,
  },
];

/** One applied correction. Shape matches the artifact's adjustments contract. */
export interface TextContrastAdjustment {
  /** Foreground variable that was rewritten. */
  token: string;
  /** Ground variable name, or `default:#RRGGBB` for the default page ground. */
  pairedWith: string;
  /** Original authored foreground value. */
  from: string;
  /** Replacement hex (uppercase 6-digit). */
  to: string;
  /** Signed APCA Lc of the original pair. */
  lcBefore: number;
  /** Signed APCA Lc of the corrected pair. May remain below threshold only
   * when no sRGB color can reach it on that ground (best-effort fallback). */
  lcAfter: number;
}

/** A pair that exists but cannot be machine-verified at compile time. */
export interface TextContrastUnverifiable {
  token: string;
  pairedWith: string;
  /** The non-hex value that blocked verification. */
  value: string;
  reason: 'non-hex-foreground' | 'non-hex-ground';
}

export interface TextContrastResult {
  /** New variable map (input is never mutated); corrected tokens replaced. */
  variables: Record<string, string>;
  adjustments: readonly TextContrastAdjustment[];
  unverifiable: readonly TextContrastUnverifiable[];
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isHex(value: string): boolean {
  return HEX_COLOR.test(value.trim());
}

interface SnapOutcome {
  hex: string;
  lc: number;
}

/**
 * Step the foreground's OKLCH lightness toward the sign that increases |Lc|
 * (ground lighter than fg: darken; otherwise lighten), holding hue and letting
 * the gamut map taper chroma at each step. Falls back to the nearest passing
 * extreme candidate, or the strongest candidate when neither can pass.
 */
function snapForeground(fgHex: string, groundHex: string, thresholdLc: number): SnapOutcome {
  const fg = hexToOklch(fgHex);
  const ground = hexToOklch(groundHex);
  const direction = ground.l > fg.l ? -1 : 1;

  for (let step = 1; step <= TEXT_CONTRAST_SNAP_MAX_ITERATIONS; step += 1) {
    const candidateHex = oklchToHex({
      l: fg.l + direction * TEXT_CONTRAST_SNAP_STEP_L * step,
      c: fg.c,
      h: fg.h,
    });
    const lc = apcaContrast(candidateHex, groundHex);
    if (Math.abs(lc) >= thresholdLc) return { hex: candidateHex, lc };
  }

  const scored = TEXT_CONTRAST_FALLBACK_CANDIDATES.map((hex) => ({
    hex,
    lc: apcaContrast(hex, groundHex),
    lDistance: Math.abs(hexToOklch(hex).l - fg.l),
  }));
  const passing = scored.filter((entry) => Math.abs(entry.lc) >= thresholdLc);

  if (passing.length === 1) return { hex: passing[0].hex, lc: passing[0].lc };
  if (passing.length === 2) {
    if (passing[0].lDistance !== passing[1].lDistance) {
      const nearest = passing[0].lDistance < passing[1].lDistance ? passing[0] : passing[1];
      return { hex: nearest.hex, lc: nearest.lc };
    }
    const stronger = Math.abs(passing[0].lc) >= Math.abs(passing[1].lc) ? passing[0] : passing[1];
    return { hex: stronger.hex, lc: stronger.lc };
  }

  const best = Math.abs(scored[0].lc) >= Math.abs(scored[1].lc) ? scored[0] : scored[1];
  return { hex: best.hex, lc: best.lc };
}

/**
 * Enforce the governed APCA pairings over a compiled variable map.
 *
 * Deterministic and pure: the same inputs always produce byte-identical
 * output, the input map is never mutated, and pair order follows
 * TEXT_CONTRAST_PAIRINGS_V1. A pair participates only when its foreground
 * token is authored; a chrome pair whose ground chain is entirely unauthored
 * is inapplicable (its real ground is a code-owned default unknown here) and
 * produces no row.
 */
export function enforceTextContrast(
  variables: Readonly<Record<string, string>>,
  normalizedAppearance: TextContrastAppearanceInput
): TextContrastResult {
  const out: Record<string, string> = { ...variables };
  const adjustments: TextContrastAdjustment[] = [];
  const unverifiable: TextContrastUnverifiable[] = [];

  for (const pairing of TEXT_CONTRAST_PAIRINGS_V1) {
    const fg = variables[pairing.token];
    if (fg === undefined) continue;

    let groundToken: string | undefined;
    let ground: string | undefined;
    for (const candidate of pairing.groundChain) {
      const value = variables[candidate];
      if (value !== undefined) {
        groundToken = candidate;
        ground = value;
        break;
      }
    }
    if (ground === undefined || groundToken === undefined) {
      if (!pairing.pageGroundFallback) continue;
      const mode = normalizedAppearance.general?.palette?.backgroundMode ?? 'light';
      ground =
        mode === 'dark'
          ? TEXT_CONTRAST_DEFAULT_PAGE_GROUNDS.dark
          : TEXT_CONTRAST_DEFAULT_PAGE_GROUNDS.light;
      groundToken = `default:${ground}`;
    }

    if (!isHex(fg)) {
      unverifiable.push({
        token: pairing.token,
        pairedWith: groundToken,
        value: fg,
        reason: 'non-hex-foreground',
      });
      continue;
    }
    if (!isHex(ground)) {
      unverifiable.push({
        token: pairing.token,
        pairedWith: groundToken,
        value: ground,
        reason: 'non-hex-ground',
      });
      continue;
    }

    const lcBefore = apcaContrast(fg, ground);
    if (Math.abs(lcBefore) >= pairing.thresholdLc) continue;

    const snapped = snapForeground(fg, ground, pairing.thresholdLc);
    out[pairing.token] = snapped.hex;
    adjustments.push({
      token: pairing.token,
      pairedWith: groundToken,
      from: fg,
      to: snapped.hex,
      lcBefore,
      lcAfter: snapped.lc,
    });
  }

  return { variables: out, adjustments, unverifiable };
}
