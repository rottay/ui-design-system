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
 * When a `ResponsiveProvider` is present in the tree, this hook reads from
 * the shared context (zero additional matchMedia subscriptions). When no
 * provider exists, it falls back to creating its own per-component listeners
 * for backward compatibility during gradual adoption.
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
import { useContext } from 'react';
import { useMediaQuery } from '../useMediaQuery';
import { buildMinWidthQuery, buildRangeQuery } from '../breakpoints';
import { ResponsiveContext } from '../../../runtime/responsive';

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
 * When wrapped in a `ResponsiveProvider`, reads from shared context (no
 * additional matchMedia subscriptions). Without a provider, creates its
 * own subscriptions for backward compatibility.
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
  const responsiveContext = useContext(ResponsiveContext);

  // Fast path: when a ResponsiveProvider is in the tree, derive everything
  // from the shared context without creating any matchMedia subscriptions.
  if (responsiveContext) {
    return {
      isMobile: responsiveContext.isPhone,
      isTablet: responsiveContext.isTablet,
      isDesktop: responsiveContext.isDesktop,
      isTouchDevice: responsiveContext.isTouchDevice,
      prefersReducedMotion: responsiveContext.prefersReducedMotion,
      isMobileOrTablet: responsiveContext.isPhoneOrTablet,
      isTabletOrDesktop: responsiveContext.isTabletOrDesktop,
    };
  }

  // Fallback path: no provider -- create per-component subscriptions.
  // This preserves backward compatibility so existing code keeps working
  // while the app gradually adopts ResponsiveProvider.
  return useBreakpointsFallback();
}

/**
 * Internal fallback that creates its own matchMedia subscriptions.
 * Only called when no ResponsiveProvider exists in the tree.
 */
function useBreakpointsFallback(): UseBreakpointsResult {
  // Range queries produce mutually exclusive breakpoint tiers. Using
  // buildRangeQuery ensures exactly one of isMobile/isTablet/isDesktop is
  // true at any viewport width, avoiding ambiguity from overlapping queries.
  const isMobile = useMediaQuery(buildRangeQuery('xs', 'sm'));   // 0-639px
  const isTablet = useMediaQuery(buildRangeQuery('sm', 'lg'));   // 640-1023px
  const isDesktop = useMediaQuery(buildMinWidthQuery('lg'));      // 1024px+

  // Device capability queries use CSS Level 4 interaction media features.
  // `hover: none` + `pointer: coarse` together identify true touch devices
  // (not just small screens), while `prefers-reduced-motion` respects the
  // OS-level accessibility setting for motion-sensitive users.
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Derived combinations avoid forcing consumers to write `||` checks repeatedly.
  // These are plain booleans (not hooks), so no additional subscriptions are created.
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
