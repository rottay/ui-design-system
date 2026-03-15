'use client';

/**
 * Surface profile defaults
 *
 * The DS already resolves tokens through engine -> product profile -> tenant.
 * Surfaces, however, still need a tiny set of higher-level defaults that are
 * not pure CSS tokens:
 * - default list view
 * - qualitative density
 * - default tabs treatment
 * - compactness hints for dense comparison/list screens
 *
 * This file intentionally stays small. The goal is not to invent another
 * configuration system, only to make the existing product profile layer
 * materially affect the page-level surfaces.
 */

import { useMemo } from 'react';
import { useTokens } from '../../hooks';
import { useProductProfile } from '../../product-profiles';
import type { CardVariant } from '../primitives/display/Card/Card.types';
import type { TabsType } from '../primitives/navigation/Tabs';
import type { ListSurfaceView } from './types';

export type SurfaceDensity = 'compact' | 'comfortable' | 'spacious';
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

export function useSurfaceProfileDefaults(): ResolvedSurfaceProfileDefaults {
  const { profile } = useProductProfile();
  const tokens = useTokens();

  return useMemo<ResolvedSurfaceProfileDefaults>(() => {
    const density =
      normalizeSurfaceDensity(tokens.personality.card.paddingDensity) ??
      normalizeSurfaceDensity(profile.surfaceDefaults?.density) ??
      'comfortable';

    const sectionSpacing: SurfaceSectionSpacing =
      density === 'compact' ? 'sm' : density === 'spacious' ? 'lg' : 'md';

    return {
      density,
      listView: profile.surfaceDefaults?.listView ?? 'table',
      schedulerView: profile.surfaceDefaults?.schedulerView ?? 'month',
      tabsType: resolveSurfaceTabsType(density),
      listCompact: density === 'compact',
      listCardMinWidth: resolveListCardMinWidth(density),
      compareCompact: density === 'compact',

      // Personality-driven
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
