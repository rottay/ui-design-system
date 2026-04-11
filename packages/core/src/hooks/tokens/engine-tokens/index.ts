/**
 * @fileoverview Engine Token Overrides - Rottay Design System
 * @description Defines per-engine visual token values for borderRadius, shadows,
 * surface treatment, motion, and density so that Classic, Modern, and Rustic
 * engines produce visually distinct output from the same component tree.
 *
 * @module System/Hooks/Tokens/EngineTokens
 * @category System
 * @package @rottay/design-system
 */

import type { SurfaceTokens, MotionTokens } from '../../../contracts';

/**
 * Token overrides that differentiate one engine from another.
 * The token resolution pipeline in `useTokens` layers these under
 * product-profile and tenant overrides.
 */
export interface EngineTokenOverrides {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  surface: SurfaceTokens;
  motion: MotionTokens;
  /** Spacing density multiplier (< 1 = compact, 1 = normal, > 1 = spacious) */
  densityScale: number;
}

/**
 * Classic engine: Enterprise, structured, corporate.
 * Visible borders, subtle multi-layer shadows, compact spacing, fast transitions, no gradients.
 */
// Classic uses smaller radii and multi-layer shadows to create depth through
// layering rather than bold visual effects. The 0.9375 density scale gives
// enterprise UIs ~6% tighter spacing than the 1.0 baseline.
const CLASSIC_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    md: '0 2px 4px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.06)',
    lg: '0 4px 6px rgba(0,0,0,0.03), 0 10px 15px rgba(0,0,0,0.06), 0 20px 25px rgba(0,0,0,0.04)',
    xl: '0 10px 15px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.06), 0 25px 50px rgba(0,0,0,0.08)',
  },
  surface: {
    borderWidth: '1px',
    borderStyle: 'solid',
    useGradients: false,
    useGlass: false,
  },
  motion: {
    hover: '150ms ease',
    transform: 'none',
    spring: 'ease',
    durationScale: 0.8,
  },
  densityScale: 0.9375,
};

/**
 * Modern engine: Contemporary, rounded, glassmorphism.
 * No visible borders, color-tinted bold shadows, gradient backgrounds, spring animations.
 */
// Modern uses larger radii and color-tinted shadows (via primary-50/100 CSS vars)
// to create a softer, more contemporary feel. The translateY(-1px) hover transform
// and spring cubic-bezier give interactive elements a tactile "lift" effect.
const MODERN_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.04), 0 4px 6px var(--ds-color-primary-50, rgba(0,0,0,0.02))',
    md: '0 4px 6px rgba(0,0,0,0.03), 0 10px 20px var(--ds-color-primary-50, rgba(0,0,0,0.04))',
    lg: '0 10px 25px rgba(0,0,0,0.05), 0 20px 40px var(--ds-color-primary-100, rgba(0,0,0,0.06))',
    xl: '0 15px 35px rgba(0,0,0,0.06), 0 25px 60px var(--ds-color-primary-100, rgba(0,0,0,0.08))',
  },
  surface: {
    borderWidth: '0',
    borderStyle: 'none',
    useGradients: true,
    useGlass: true,
  },
  motion: {
    hover: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
    transform: 'translateY(-1px)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    durationScale: 1.0,
  },
  densityScale: 1.0,
};

/**
 * Rustic engine: Minimal, spacious, understated.
 * Ultra-subtle borders, barely-there shadows, max whitespace, thin typography, minimal motion.
 */
// Rustic deliberately minimizes visual effects: barely-visible shadows, minimal
// radii, and faster-than-default transitions (0.6 duration scale). The 1.125
// density scale adds extra whitespace to let content breathe.
const RUSTIC_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.02)',
    md: '0 1px 3px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.02)',
    lg: '0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
    xl: '0 4px 8px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)',
  },
  surface: {
    borderWidth: '1px',
    borderStyle: 'solid',
    useGradients: false,
    useGlass: false,
  },
  motion: {
    hover: '120ms ease',
    transform: 'none',
    spring: 'ease',
    durationScale: 0.6,
  },
  densityScale: 1.125,
};

/** Lookup table of all engine token sets, keyed by engine name. */
export const ENGINE_TOKENS: Record<string, EngineTokenOverrides> = {
  classic: CLASSIC_TOKENS,
  modern: MODERN_TOKENS,
  rustic: RUSTIC_TOKENS,
};

/**
 * Resolve engine token overrides by name. Falls back to classic if the
 * engine name is not recognized.
 *
 * @param engine - Engine identifier ('classic', 'modern', or 'rustic')
 * @returns The corresponding token overrides
 */
export function getEngineTokens(engine: string): EngineTokenOverrides {
  // Classic is the safe default because it has the most conservative visual
  // settings -- visible borders, subtle shadows, compact spacing -- so unknown
  // engine names never produce an unexpectedly flashy UI.
  return ENGINE_TOKENS[engine] || CLASSIC_TOKENS;
}
