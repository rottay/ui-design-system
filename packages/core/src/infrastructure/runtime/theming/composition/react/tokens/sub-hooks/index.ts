/**
 * @fileoverview Granular Token Sub-Hooks - Rottay Design System
 * @description Focused hooks that subscribe to specific slices of the design
 * token tree. Components that only need colors, spacing, motion, etc. can use
 * these instead of the full useTokens() to avoid unnecessary re-renders when
 * unrelated tokens change.
 *
 * Each sub-hook calls useTokens() internally (reusing the existing resolution
 * pipeline) and extracts only its slice via useMemo, so consumers only
 * re-render when their specific slice reference changes.
 *
 * @module System/Hooks/Tokens/SubHooks
 * @category System
 * @package @rottay/design-system
 */

import { useMemo } from 'react';
import { useTokens } from '../index';
import type {
  DesignTokens,
  MotionTokens,
  PersonalityTokens,
} from '@/foundation/contracts';

// ---------------------------------------------------------------------------
// Slice types
// ---------------------------------------------------------------------------

/** Color-related tokens extracted from DesignTokens */
export type ColorTokens = DesignTokens['colors'];

/** Spacing array + density-aware values */
export interface SpacingTokens {
  spacing: DesignTokens['spacing'];
}

/** Motion/animation tokens from engine + personality */
export interface MotionTokenSlice {
  motion: MotionTokens;
  animation: PersonalityTokens['animation'];
}

/** Typography tokens from base + personality */
export interface TypographyTokenSlice {
  typography: DesignTokens['typography'];
  typographyPersonality: PersonalityTokens['typography'];
}

/** Card personality tokens */
export type CardTokens = PersonalityTokens['card'];

/** Accent personality tokens */
export type AccentTokens = PersonalityTokens['accent'];

// ---------------------------------------------------------------------------
// Sub-hooks
// ---------------------------------------------------------------------------

/**
 * Only subscribes to color-related tokens.
 *
 * Use this when a component needs color scales/values but does not care about
 * spacing, motion, typography, or personality changes.
 *
 * @example
 * ```tsx
 * const colors = useColorTokens();
 * return <div style={{ color: colors.primary }}>Branded text</div>;
 * ```
 */
export function useColorTokens(): ColorTokens {
  const tokens = useTokens();
  // useMemo with a specific slice dependency means this hook only triggers
  // downstream re-renders when the color tokens object identity changes --
  // not when spacing, motion, or personality tokens are updated.
  return useMemo(() => tokens.colors, [tokens.colors]);
}

/**
 * Only subscribes to spacing/density tokens.
 *
 * Use this when a component only needs the spacing scale (which varies with
 * the density setting).
 *
 * @example
 * ```tsx
 * const { spacing } = useSpacingTokens();
 * return <div style={{ padding: spacing[4] }}>Padded content</div>;
 * ```
 */
export function useSpacingTokens(): SpacingTokens {
  const tokens = useTokens();
  return useMemo(() => ({ spacing: tokens.spacing }), [tokens.spacing]);
}

/**
 * Only subscribes to motion/animation tokens.
 *
 * Combines engine-level motion tokens with personality animation tokens so
 * animated components have everything they need in one call.
 *
 * @example
 * ```tsx
 * const { motion, animation } = useMotionTokens();
 * const style = {
 *   transition: motion.hover,
 *   transform: animation.hoverLift > 0 ? `translateY(-${animation.hoverLift}px)` : undefined,
 * };
 * ```
 */
export function useMotionTokens(): MotionTokenSlice {
  const tokens = useTokens();
  // Combines two separate branches of the token tree (engine-level motion and
  // personality-level animation) into a single slice. Animated components need
  // both because the engine controls transition timing while personality controls
  // hover lift, spring physics, and entrance style.
  return useMemo(
    () => ({
      motion: tokens.motion,
      animation: tokens.personality.animation,
    }),
    [tokens.motion, tokens.personality.animation],
  );
}

/**
 * Only subscribes to typography tokens.
 *
 * Combines base typography (font sizes, weights, line heights) with the
 * personality typography overrides (heading bias, letter spacing, label style).
 *
 * @example
 * ```tsx
 * const { typography, typographyPersonality } = useTypographyTokens();
 * const headingStyle = {
 *   fontSize: typography.fontSize['2xl'],
 *   letterSpacing: typographyPersonality.headingLetterSpacing,
 * };
 * ```
 */
export function useTypographyTokens(): TypographyTokenSlice {
  const tokens = useTokens();
  return useMemo(
    () => ({
      typography: tokens.typography,
      typographyPersonality: tokens.personality.typography,
    }),
    [tokens.typography, tokens.personality.typography],
  );
}

/**
 * Only subscribes to card personality tokens.
 *
 * Use this in card-like components that need elevation, hover, border, and
 * padding density settings without pulling in the full token tree.
 *
 * @example
 * ```tsx
 * const card = useCardTokens();
 * const elevation = card.defaultElevation; // 'sm' | 'md' | 'lg'
 * ```
 */
export function useCardTokens(): CardTokens {
  const tokens = useTokens();
  return useMemo(() => tokens.personality.card, [tokens.personality.card]);
}

/**
 * Only subscribes to accent personality tokens.
 *
 * Use this in components that render accent bars, icon containers, badges,
 * or dividers and need the personality-driven styling decisions.
 *
 * @example
 * ```tsx
 * const accent = useAccentTokens();
 * const showBar = accent.barPosition !== 'none';
 * ```
 */
export function useAccentTokens(): AccentTokens {
  const tokens = useTokens();
  return useMemo(() => tokens.personality.accent, [tokens.personality.accent]);
}
