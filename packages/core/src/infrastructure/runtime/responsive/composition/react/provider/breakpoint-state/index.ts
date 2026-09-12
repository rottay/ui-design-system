'use client';

/**
 * @fileoverview useBreakpoints — the device-tier projection of the one
 * responsive snapshot.
 *
 * @remarks
 * Reports:
 * - **Breakpoints**: isMobile (0-639), isTablet (640-1023), isDesktop (1024+)
 * - **Combinations**: isMobileOrTablet, isTabletOrDesktop
 * - **Capabilities**: isTouchDevice, prefersReducedMotion
 *
 * This hook derives nothing of its own. It projects `useResponsive()`, which is
 * the single authority for viewport state; the per-component `matchMedia`
 * fallback it used to call CONDITIONALLY (a Rules-of-Hooks violation, and five
 * extra subscriptions per component) is gone.
 *
 * @example Responsive navigation
 * ```tsx
 * const { isMobile, isDesktop, isTouchDevice } = useBreakpoints();
 * return isMobile ? <Drawer /> : <Sidebar />;
 * ```
 *
 * @module Infrastructure/Runtime/Responsive/BreakpointState
 * @category Runtime
 * @package @rottay/design-system
 */
import { useResponsive } from '..';

/**
 * Breakpoint detection results
 */
export interface UseBreakpointsResult {
  /** Mobile devices: max-width 639px */
  isMobile: boolean;
  /** Tablet devices: min-width 640px and max-width 1023px */
  isTablet: boolean;
  /** Desktop devices: min-width 1024px */
  isDesktop: boolean;
  /** Touch devices (uses pointer and hover media features) */
  isTouchDevice: boolean;
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Mobile or Tablet (convenience) */
  isMobileOrTablet: boolean;
  /** Tablet or Desktop (convenience) */
  isTabletOrDesktop: boolean;
}

/**
 * Device-tier flags for the current viewport.
 *
 * Mobile-first tiers, mutually exclusive: mobile 0-639px, tablet 640-1023px,
 * desktop 1024px and above. Touch is `(hover: none) and (pointer: coarse)`, so
 * a small window on a mouse-driven machine is not a touch device.
 *
 * @returns {UseBreakpointsResult} Boolean flags for each tier and capability
 */
export function useBreakpoints(): UseBreakpointsResult {
  const responsive = useResponsive();

  return {
    isMobile: responsive.isPhone,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    isTouchDevice: responsive.isTouchDevice,
    prefersReducedMotion: responsive.prefersReducedMotion,
    isMobileOrTablet: responsive.isPhoneOrTablet,
    isTabletOrDesktop: responsive.isTabletOrDesktop,
  };
}
