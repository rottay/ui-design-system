'use client';

/**
 * Shared responsive helpers for split-page surfaces.
 *
 * Most surfaces in this layer use some flavor of "main content + aside". The
 * layout rules should stay consistent across the catalog, so we keep the mobile
 * stacking decision centralized here instead of scattering breakpoint logic.
 */

import { useBreakpoints } from '../../core/hooks/responsive/useBreakpoints';

export interface SurfaceResponsiveVisualConfig {
  stackOnMobile?: boolean;
  stackOnTablet?: boolean;
}

export function useSurfaceResponsiveLayout(
  visual?: SurfaceResponsiveVisualConfig
): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  shouldStack: boolean;
} {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const shouldStack =
    (isMobile && visual?.stackOnMobile !== false) ||
    (isTablet && visual?.stackOnTablet === true);

  return {
    isMobile,
    isTablet,
    isDesktop,
    shouldStack,
  };
}

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
