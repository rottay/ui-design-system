'use client';

/**
 * @fileoverview Shared responsive helpers for split-page surfaces -- Rottay Design System.
 *
 * @description Centralizes the mobile/tablet stacking decision for surfaces that
 * use "main content + aside" layouts. Individual surfaces delegate here instead
 * of scattering breakpoint logic across every surface component.
 *
 * Two helpers are exported:
 * - `useSurfaceResponsiveLayout()` -- a hook that resolves the current breakpoint
 *   into a `shouldStack` boolean for split layouts.
 * - `resolveResponsiveColumnCount()` -- a pure function that maps breakpoints to
 *   column counts for grid-based surfaces (dashboards, galleries, etc.).
 */

import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useResponsive } from '../../../../infrastructure/runtime/responsive';

/**
 * Responsive stacking overrides accepted by surfaces with split layouts.
 *
 * By default, surfaces stack on mobile (opt-out) but do NOT stack on tablet
 * (opt-in). This lets most surfaces work out of the box while giving apps
 * fine-grained control when needed.
 */
export interface SurfaceResponsiveVisualConfig {
  /** Stack content vertically on mobile viewports. Defaults to `true`. */
  stackOnMobile?: boolean;
  /** Stack content vertically on tablet viewports. Defaults to `false`. */
  stackOnTablet?: boolean;
}

/**
 * Resolves the current viewport breakpoint into a stacking decision for
 * surfaces with side-by-side layouts (e.g., detail + sidebar, form + summary).
 *
 * @param visual - Optional stacking overrides from the surface's visual config.
 * @returns Breakpoint flags and the computed `shouldStack` boolean.
 *
 * @example
 * ```tsx
 * const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
 * return shouldStack ? <Stack>{main}{aside}</Stack> : <Flex>{main}{aside}</Flex>;
 * ```
 */
export function useSurfaceResponsiveLayout(
  visual?: SurfaceResponsiveVisualConfig
): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasResolvedViewport: boolean;
  shouldStack: boolean;
} {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
  const { hasResolvedViewport } = useResponsive();

  // Mobile stacking defaults to true (opt-out) because most split layouts
  // are unusable on small screens. Tablet stacking defaults to false (opt-in)
  // because many surfaces work fine at tablet width.
  const shouldStack =
    (isMobile && visual?.stackOnMobile !== false) ||
    (isTablet && visual?.stackOnTablet === true);

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasResolvedViewport,
    shouldStack,
  };
}

/**
 * Resolves a responsive column count based on the current breakpoint.
 *
 * Grid-based surfaces (dashboards, media galleries, kanban boards) use this
 * to adapt their column count across breakpoints without duplicating the
 * fallback logic in every surface.
 *
 * @param input - Object with boolean breakpoint flags (`isMobile`, `isTablet`).
 * @param desktopColumns - Column count at desktop width.
 * @param tabletColumns - Column count at tablet width. Defaults to `min(desktopColumns, 2)`.
 * @param mobileColumns - Column count at mobile width. Defaults to `1`.
 * @returns The resolved column count for the current breakpoint.
 *
 * @example
 * ```ts
 * const cols = resolveResponsiveColumnCount({ isMobile, isTablet }, 4);
 * // desktop -> 4, tablet -> 2, mobile -> 1
 * ```
 */
export function resolveResponsiveColumnCount(
  input: {
    isMobile: boolean;
    isTablet: boolean;
  },
  desktopColumns: number,
  tabletColumns = Math.min(desktopColumns, 2),
  mobileColumns = 1
): number {
  if (input.isMobile) {
    return mobileColumns;
  }

  if (input.isTablet) {
    return tabletColumns;
  }

  return desktopColumns;
}
