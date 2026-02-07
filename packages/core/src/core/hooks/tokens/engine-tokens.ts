/**
 * Engine-specific token overrides.
 * Each engine gets DIFFERENT visual values for borderRadius, shadows, surface, and motion
 * so that Classic, Modern, and Rustic actually look distinct.
 */

import type { SurfaceTokens, MotionTokens } from '../../types';

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
    sm: '0 1px 3px rgba(0,0,0,0.04), 0 4px 6px var(--color-primary-50, rgba(0,0,0,0.02))',
    md: '0 4px 6px rgba(0,0,0,0.03), 0 10px 20px var(--color-primary-50, rgba(0,0,0,0.04))',
    lg: '0 10px 25px rgba(0,0,0,0.05), 0 20px 40px var(--color-primary-100, rgba(0,0,0,0.06))',
    xl: '0 15px 35px rgba(0,0,0,0.06), 0 25px 60px var(--color-primary-100, rgba(0,0,0,0.08))',
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

export const ENGINE_TOKENS: Record<string, EngineTokenOverrides> = {
  classic: CLASSIC_TOKENS,
  modern: MODERN_TOKENS,
  rustic: RUSTIC_TOKENS,
};

/** Get engine token overrides, defaults to classic if unknown */
export function getEngineTokens(engine: string): EngineTokenOverrides {
  return ENGINE_TOKENS[engine] || CLASSIC_TOKENS;
}
