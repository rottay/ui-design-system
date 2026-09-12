'use client';

import {
  RESPONSIVE_BREAKPOINTS,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
import { useResponsive } from '@/infrastructure/runtime/responsive';

export interface SpatialViewportSnapshot {
  readonly phone: boolean;
  readonly tablet: boolean;
}

const CONSERVATIVE_SNAPSHOT: SpatialViewportSnapshot = Object.freeze({
  phone: true,
  tablet: true,
});

const PHONE_SNAPSHOT: SpatialViewportSnapshot = Object.freeze({
  phone: true,
  tablet: true,
});

const TABLET_SNAPSHOT: SpatialViewportSnapshot = Object.freeze({
  phone: false,
  tablet: true,
});

const WIDE_SNAPSHOT: SpatialViewportSnapshot = Object.freeze({
  phone: false,
  tablet: false,
});

/**
 * Hydration-safe viewport evidence, read from the ONE responsive snapshot.
 *
 * This hook used to own two `matchMedia` subscriptions and two thresholds of
 * its own (`767px`, `1024px`) -- a second responsive derivation whose phone
 * band did not agree with the ladder's. It now projects `useResponsive()`:
 * phone is below the `md` step, and the wide scene starts at `lg`, which are
 * the same two edges the old queries were reaching for.
 *
 * Until the browser has published a real snapshot the answer stays
 * conservative, exactly as before: only attached viewport evidence may upgrade
 * the scene.
 */
export function useSpatialViewport(): SpatialViewportSnapshot {
  const { activeBreakpoint, hasResolvedViewport } = useResponsive();

  if (!hasResolvedViewport) return CONSERVATIVE_SNAPSHOT;

  const width = RESPONSIVE_BREAKPOINTS[activeBreakpoint];
  if (width < RESPONSIVE_BREAKPOINTS.md) return PHONE_SNAPSHOT;
  if (width < RESPONSIVE_BREAKPOINTS.lg) return TABLET_SNAPSHOT;
  return WIDE_SNAPSHOT;
}
