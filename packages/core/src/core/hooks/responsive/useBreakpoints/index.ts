/**
 * @fileoverview useBreakpoints Hook - Rottay Design System
 * @description Convenient React hook for detecting common breakpoints
 * and device capabilities using Tailwind CSS conventions.
 *
 * @remarks
 * Detects:
 * - **Breakpoints**: isMobile, isTablet, isDesktop
 * - **Combinations**: isMobileOrTablet, isTabletOrDesktop
 * - **Capabilities**: isTouchDevice, prefersReducedMotion
 *
 * Breakpoint ranges (Tailwind-compatible):
 * - Mobile: 0-639px
 * - Tablet: 640-1023px
 * - Desktop: 1024px+
 *
 * @example Responsive navigation
 * ```tsx
 * const { isMobile, isDesktop, isTouchDevice } = useBreakpoints();
 * return isMobile ? <Drawer /> : <Sidebar />;
 * ```
 *
 * @module System/Hooks/Responsive/useBreakpoints
 * @category System
 * @package @rottay/design-system
 */
import { useMediaQuery } from '../useMediaQuery';

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
 * Convenient hook for common breakpoint detection.
 *
 * Uses a mobile-first system based on Tailwind CSS breakpoints.
 * SSR-safe: returns false for all breakpoints on the server.
 *
 * Breakpoints:
 * - Mobile: 0-639px (default, no media query needed)
 * - Tablet: 640-1023px (sm breakpoint)
 * - Desktop: 1024px+ (lg breakpoint)
 *
 * Also detects:
 * - Touch devices (via pointer and hover media features)
 * - Reduced motion preference
 *
 * @example
 * ```tsx
 * import { useBreakpoints } from '@rottay/design-system';
 *
 * function ResponsiveLayout() {
 *   const { isMobile, isDesktop, isTouchDevice, prefersReducedMotion } = useBreakpoints();
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileNav />}
 *       {isDesktop && <DesktopNav />}
 *       {isTouchDevice && <TouchOptimizedButton />}
 *       {!prefersReducedMotion && <AnimatedElement />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {UseBreakpointsResult} Object with boolean flags for each breakpoint and device capability
 */
export function useBreakpoints(): UseBreakpointsResult {
  // Core breakpoints (mobile-first)
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Device capabilities
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Convenience combinations
  const isMobileOrTablet = isMobile || isTablet;
  const isTabletOrDesktop = isTablet || isDesktop;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
    isMobileOrTablet,
    isTabletOrDesktop,
  };
}
