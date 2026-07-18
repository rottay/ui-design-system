'use client';

/**
 * @fileoverview Per-surface profile defaults override hook.
 * @description Runtime merge helper consumed by every config-driven surface.
 *
 * Merge precedence:
 * 1. Surface visual overrides (highest -- per-surface instance)
 * 2. Personality tokens
 * 3. Product profile
 * 4. Fallback defaults (lowest)
 *
 * When no overrides are provided, the hook returns the base profile defaults unchanged.
 *
 * @see wave-5-surface-expansion.md section 4
 */

import { useMemo } from 'react';
import type { SurfaceVisualOverrides } from '../../../foundation/contracts';
import {
  useSurfaceProfileDefaults,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
  type ResolvedSurfaceProfileDefaults,
  type SurfaceSectionSpacing,
} from '..';

/**
 * Resolve surface profile defaults with per-surface visual overrides.
 *
 * When `overrides` is `undefined` or empty, the hook short-circuits and returns
 * the base defaults without allocating a new object.
 *
 * @param overrides - Optional visual overrides from a surface config's `visual.profileOverrides`.
 * @returns A memoized `ResolvedSurfaceProfileDefaults` with overrides applied.
 *
 */
export function useSurfaceProfileDefaultsWithOverrides(
  overrides?: SurfaceVisualOverrides
): ResolvedSurfaceProfileDefaults {
  const base = useSurfaceProfileDefaults();

  return useMemo(() => {
    if (!overrides) return base;

    // When density is overridden, derived values must be recalculated
    // to stay consistent with the new density level.
    const density = overrides.density ?? base.density;
    const densityChanged = overrides.density != null && overrides.density !== base.density;

    const sectionSpacing: SurfaceSectionSpacing =
      overrides.sectionSpacing ??
      (densityChanged
        ? (density === 'compact' ? 'sm' : density === 'spacious' ? 'lg' : 'md')
        : base.sectionSpacing);

    return {
      // Product-profile-driven defaults (recalculated when density changes)
      density,
      listView: base.listView,
      schedulerView: base.schedulerView,
      tabsType: densityChanged ? resolveSurfaceTabsType(density) : base.tabsType,
      listCompact: densityChanged ? density === 'compact' : base.listCompact,
      listCardMinWidth: densityChanged ? resolveListCardMinWidth(density) : base.listCardMinWidth,
      compareCompact: densityChanged ? density === 'compact' : base.compareCompact,

      // Personality-token-driven visual hints (overridable per-surface)
      cardVariant: overrides.cardVariant ?? base.cardVariant,
      sectionSpacing,
      headerWeight: overrides.headerWeight ?? base.headerWeight,
      animateEntrance: overrides.animateEntrance ?? base.animateEntrance,
      badgeShape: overrides.badgeShape ?? base.badgeShape,
      labelStyle: overrides.labelStyle ?? base.labelStyle,
      accentPosition: base.accentPosition,
      accentBarThickness: base.accentBarThickness,
      accentBarStyle: base.accentBarStyle,
      entranceStyle: overrides.entranceStyle ?? base.entranceStyle,
      entranceDuration: overrides.entranceDuration ?? base.entranceDuration,
      staggerDelay: overrides.staggerDelay ?? base.staggerDelay,
      countUpEnabled: overrides.countUpEnabled ?? base.countUpEnabled,
      pulseSpeed: overrides.pulseSpeed ?? base.pulseSpeed,
    };
  }, [base, overrides]);
}
