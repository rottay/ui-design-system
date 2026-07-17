'use client';

/**
 * @fileoverview Surface profile defaults resolved from product profiles and personality tokens.
 * @description Surfaces need a set of higher-level defaults beyond pure CSS tokens:
 * default list view, qualitative density, tabs treatment, entrance animation style,
 * accent bar placement, and more. The `useSurfaceProfileDefaults()` hook merges
 * product profile settings with resolved personality tokens into a single
 * `ResolvedSurfaceProfileDefaults` object consumed by every surface component.
 */

import { useMemo } from 'react';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useProductProfile } from '../../../../infrastructure/runtime/product-profiles';
import type { CardVariant } from '../../../primitives/display/Card/contracts';
import type { TabsType } from '../../../primitives/navigation/Tabs';
import type { ListSurfaceView } from '../../foundation/contracts';

/**
 * Qualitative density levels used across all surfaces.
 * Controls spacing, padding, font sizes, and how much information fits on screen.
 */
export type SurfaceDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Spacing between surface sections, derived directly from `SurfaceDensity`.
 * - `sm` = compact density (tight spacing, more content visible)
 * - `md` = comfortable density (balanced default)
 * - `lg` = spacious density (generous whitespace, content-focused)
 */
export type SurfaceSectionSpacing = 'sm' | 'md' | 'lg';

export interface ResolvedSurfaceProfileDefaults {
  density: SurfaceDensity;
  listView: ListSurfaceView;
  schedulerView: 'month' | 'week' | 'day';
  tabsType: TabsType;
  listCompact: boolean;
  listCardMinWidth: number;
  compareCompact: boolean;

  // -- Personality-driven surface visual hints --

  /** Card variant derived from personality border preference */
  cardVariant: CardVariant;
  /** Spacing between surface sections based on padding density */
  sectionSpacing: SurfaceSectionSpacing;
  /** Heading weight bias from typography personality */
  headerWeight: 'lighter' | 'normal' | 'heavier';
  /** Whether entrance animations should play (intensity > 0.5) */
  animateEntrance: boolean;
  /** Where the accent bar appears on page chrome / cards */
  accentPosition: 'top' | 'left' | 'none';
  /** Badge shape from personality accent tokens */
  badgeShape: 'rounded' | 'pill' | 'square';
  /** Label text transform from typography personality */
  labelStyle: 'uppercase' | 'sentence' | 'capitalize';
  /** Entrance animation style from personality */
  entranceStyle: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  /** Entrance animation duration (ms) */
  entranceDuration: number;
  /** Stagger delay between sequential items (ms) */
  staggerDelay: number;
  /** Whether KPI count-up animation is enabled */
  countUpEnabled: boolean;
  /** Pulse speed for typing/live indicators */
  pulseSpeed: 'none' | 'slow' | 'normal' | 'fast';
  /** Accent bar thickness (px) */
  accentBarThickness: number;
  /** Accent bar style */
  accentBarStyle: 'solid' | 'gradient' | 'animated';
}

/**
 * Product profiles use `comfortable`, while personality tokens currently
 * resolve card padding as `normal`. We normalize both into one shared density
 * vocabulary so surfaces can make stable layout decisions.
 */
export function normalizeSurfaceDensity(input?: string | null): SurfaceDensity | undefined {
  if (!input) {
    return undefined;
  }

  if (input === 'normal') {
    return 'comfortable';
  }

  if (input === 'compact' || input === 'comfortable' || input === 'spacious') {
    return input;
  }

  return undefined;
}

/**
 * Tabs do not need a giant config matrix. A simple density-aware default is
 * enough:
 * - spacious products get card tabs with stronger visual grouping
 * - everything else stays on the simpler line tabs
 */
export function resolveSurfaceTabsType(density: SurfaceDensity): TabsType {
  return density === 'spacious' ? 'card' : 'line';
}

/**
 * Card-heavy list screens need a different minimum width depending on product
 * density. This keeps cards from feeling cramped in media-first products while
 * still allowing compact operator products to fit more information onscreen.
 */
export function resolveListCardMinWidth(density: SurfaceDensity): number {
  switch (density) {
    case 'compact':
      return 240;
    case 'spacious':
      return 320;
    case 'comfortable':
    default:
      return 280;
  }
}

/**
 * Resolves the full set of surface profile defaults for the current product
 * and personality configuration.
 *
 * This hook is the single source of truth for surface-level defaults across
 * the entire component catalog. Individual surfaces read from the returned
 * object rather than querying product profiles or personality tokens directly.
 *
 * Precedence for density:
 * 1. Personality token `card.paddingDensity` (highest)
 * 2. Product profile `surfaceDefaults.density`
 * 3. Fallback to `'comfortable'`
 *
 * @returns A memoized `ResolvedSurfaceProfileDefaults` object.
 */
export function useSurfaceProfileDefaults(): ResolvedSurfaceProfileDefaults {
  const { profile } = useProductProfile();
  const tokens = useTokens();

  return useMemo<ResolvedSurfaceProfileDefaults>(() => {
    // Density resolution: personality tokens take priority over product profile
    // settings because personality is the more specific customization layer.
    const density =
      normalizeSurfaceDensity(tokens.personality.card.paddingDensity) ??
      normalizeSurfaceDensity(profile.surfaceDefaults?.density) ??
      'comfortable';

    // Section spacing maps directly from density to keep surface sections
    // visually proportional to the overall density choice.
    const sectionSpacing: SurfaceSectionSpacing =
      density === 'compact' ? 'sm' : density === 'spacious' ? 'lg' : 'md';

    return {
      // -- Product-profile-driven defaults --
      density,
      listView: profile.surfaceDefaults?.listView ?? 'table',
      schedulerView: profile.surfaceDefaults?.schedulerView ?? 'month',
      tabsType: resolveSurfaceTabsType(density),
      listCompact: density === 'compact',
      listCardMinWidth: resolveListCardMinWidth(density),
      compareCompact: density === 'compact',

      // -- Personality-token-driven visual hints --
      // These translate low-level personality tokens into surface-ready
      // decisions so individual surface components stay declarative.
      cardVariant: tokens.personality.card.showBorder ? 'outlined' : 'elevated',
      sectionSpacing,
      headerWeight: tokens.personality.typography.headingWeightBias,
      animateEntrance: tokens.personality.animation.intensity > 0.5,
      accentPosition: tokens.personality.accent.barPosition,
      badgeShape: tokens.personality.accent.badgeShape,
      labelStyle: tokens.personality.typography.labelStyle,
      entranceStyle: tokens.personality.animation.entrance,
      entranceDuration: tokens.personality.animation.entranceDuration,
      staggerDelay: tokens.personality.animation.staggerDelay,
      countUpEnabled: tokens.personality.animation.countUpEnabled,
      pulseSpeed: tokens.personality.animation.pulseSpeed,
      accentBarThickness: tokens.personality.accent.barThickness,
      accentBarStyle: tokens.personality.accent.barStyle,
    };
  }, [
    profile.surfaceDefaults?.density,
    profile.surfaceDefaults?.listView,
    profile.surfaceDefaults?.schedulerView,
    tokens.personality.card.paddingDensity,
    tokens.personality.card.showBorder,
    tokens.personality.typography.headingWeightBias,
    tokens.personality.typography.labelStyle,
    tokens.personality.animation.intensity,
    tokens.personality.animation.entrance,
    tokens.personality.animation.entranceDuration,
    tokens.personality.animation.staggerDelay,
    tokens.personality.animation.countUpEnabled,
    tokens.personality.animation.pulseSpeed,
    tokens.personality.accent.barPosition,
    tokens.personality.accent.barThickness,
    tokens.personality.accent.barStyle,
    tokens.personality.accent.badgeShape,
  ]);
}
