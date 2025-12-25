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
 * Hook conveniente para breakpoints comunes.
 * Usa un sistema mobile-first basado en Tailwind CSS breakpoints.
 *
 * Breakpoints:
 * - Mobile: 0-639px
 * - Tablet: 640-1023px (sm)
 * - Desktop: 1024px+ (lg)
 *
 * @returns Object con flags booleanos para cada breakpoint
 *
 * @example
 * ```tsx
 * const { isMobile, isDesktop, isTouchDevice } = useBreakpoints();
 *
 * return (
 *   <div>
 *     {isMobile && <MobileNav />}
 *     {isDesktop && <DesktopNav />}
 *     {isTouchDevice && <TouchOptimizedButton />}
 *   </div>
 * );
 * ```
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
