'use client';

/**
 * @fileoverview Per-surface profile defaults override hook.
 * @description Runtime merge helper consumed by every config-driven surface.
 *
 * Merge precedence:
 * 1. Tenant decisions (highest -- the resolved theme)
 * 2. Admitted surface visual selections (per-surface instance)
 * 3. Product profile
 * 4. Fallback defaults (lowest)
 *
 * An instance selection is admitted only when the catalog models its value and
 * the tenant left the channel it speaks for undecided, so a surface config can
 * narrow a default but can never contradict the tenant. When nothing is
 * admitted the hook returns the base profile defaults unchanged.
 *
 * @see SURFACE_VISUAL_OVERRIDE_CATALOG for the admitted domains and channels.
 */

import { useMemo } from 'react';
import { useTenantContext } from '@/infrastructure/runtime/tenant/foundation/context';
import type { SurfaceVisualOverrides } from '../../../contracts';
import {
  useSurfaceProfileDefaults,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
  type ResolvedSurfaceProfileDefaults,
  type SurfaceSectionSpacing,
} from '..';
import {
  admitInstanceOverrides,
  adjudicateInstanceOverrides,
  resolveTenantDecidedChannels,
  type SurfaceVisualOverrideVerdict,
} from './catalog';

export {
  SURFACE_VISUAL_OVERRIDE_CATALOG,
  SURFACE_VISUAL_OVERRIDE_FIELDS,
  SURFACE_VISUAL_OVERRIDE_TENANT_CHANNELS,
  adjudicateInstanceOverrides,
  admitInstanceOverrides,
  isAdmittedOverrideValue,
  resolveTenantDecidedChannels,
  type SurfaceVisualOverrideAdmission,
  type SurfaceVisualOverrideVerdict,
  type TenantPersonalityChannel,
} from './catalog';

/**
 * Adjudicate a surface's declared visual selections against the catalog and
 * the active tenant, without applying them.
 *
 * Exposed because a refusal is a product fact a customization surface has to
 * be able to show ("this tenant already decided entrance motion"), and because
 * the alternative is every caller re-deriving the tenant's decisions.
 */
export function useSurfaceVisualOverrideVerdicts(
  overrides?: SurfaceVisualOverrides,
): readonly SurfaceVisualOverrideVerdict[] {
  const { config } = useTenantContext();
  return useMemo(
    () => adjudicateInstanceOverrides(overrides, resolveTenantDecidedChannels(config)),
    [config, overrides],
  );
}

/**
 * Resolve surface profile defaults with the admitted per-surface visual
 * selections applied.
 *
 * When `overrides` is `undefined`, or when every selection it declares is
 * refused, the hook returns the base defaults without allocating a new object.
 *
 * @param overrides - Optional visual selections from a surface config's `visual.profileOverrides`.
 * @returns A memoized `ResolvedSurfaceProfileDefaults`.
 */
export function useSurfaceProfileDefaultsWithOverrides(
  overrides?: SurfaceVisualOverrides
): ResolvedSurfaceProfileDefaults {
  const base = useSurfaceProfileDefaults();
  const { config } = useTenantContext();

  const admitted = useMemo(
    () => admitInstanceOverrides(overrides, resolveTenantDecidedChannels(config)),
    [config, overrides],
  );

  return useMemo(() => {
    if (Object.keys(admitted).length === 0) return base;

    // When density is admitted, derived values must be recalculated
    // to stay consistent with the new density level.
    const density = admitted.density ?? base.density;
    const densityChanged = admitted.density != null && admitted.density !== base.density;

    const sectionSpacing: SurfaceSectionSpacing =
      admitted.sectionSpacing ??
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

      // Personality-token-driven visual hints (narrowable per-surface only on
      // channels the tenant left open)
      cardVariant: admitted.cardVariant ?? base.cardVariant,
      sectionSpacing,
      headerWeight: admitted.headerWeight ?? base.headerWeight,
      animateEntrance: admitted.animateEntrance ?? base.animateEntrance,
      badgeShape: admitted.badgeShape ?? base.badgeShape,
      labelStyle: admitted.labelStyle ?? base.labelStyle,
      accentPosition: base.accentPosition,
      accentBarThickness: base.accentBarThickness,
      accentBarStyle: base.accentBarStyle,
      entranceStyle: admitted.entranceStyle ?? base.entranceStyle,
      entranceDuration: admitted.entranceDuration ?? base.entranceDuration,
      staggerDelay: admitted.staggerDelay ?? base.staggerDelay,
      countUpEnabled: admitted.countUpEnabled ?? base.countUpEnabled,
      pulseSpeed: admitted.pulseSpeed ?? base.pulseSpeed,
    };
  }, [admitted, base]);
}
