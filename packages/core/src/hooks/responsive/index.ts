/**
 * @fileoverview Responsive Hooks - Rottay Design System
 * @description SSR-safe React hooks for responsive design, media queries,
 * breakpoint detection, and viewport-based value resolution.
 *
 * @remarks
 * The responsive hooks provide:
 *
 * - **useMediaQuery**: Subscribe to any CSS media query
 * - **useBreakpoints**: Detect mobile/tablet/desktop and device capabilities
 * - **useResponsiveValue**: Get breakpoint-specific values (Tailwind-style)
 *
 * All hooks are:
 * - **SSR-safe**: Return false/base on server to prevent hydration mismatches
 * - **Reactive**: Update automatically when viewport changes
 * - **Mobile-first**: Follow Tailwind CSS breakpoint conventions
 *
 * Breakpoints:
 * - base: 0px (mobile, always applies)
 * - sm: 640px (small tablets)
 * - md: 768px (tablets)
 * - lg: 1024px (small desktops)
 * - xl: 1280px (desktops)
 * - 2xl: 1536px (large screens)
 *
 * @example Responsive layout
 * ```tsx
 * function Layout() {
 *   const { isMobile, isDesktop } = useBreakpoints();
 *   const columns = useResponsiveValue({ base: 1, md: 2, lg: 4 });
 *
 *   return (
 *     <Grid columns={columns}>
 *       {isMobile ? <MobileNav /> : <DesktopNav />}
 *     </Grid>
 *   );
 * }
 * ```
 *
 * @see {@link useMediaQuery} - Custom media query detection
 * @see {@link useBreakpoints} - Breakpoint detection
 * @see {@link useResponsiveValue} - Responsive values
 * @module System/Hooks/Responsive
 * @category System
 * @package @rottay/design-system
 */

// Media query hook
export { useMediaQuery } from './useMediaQuery';

// Breakpoint constants and helpers
export {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  buildMinWidthQuery,
  buildRangeQuery,
} from './breakpoints';
export type { ResponsiveBreakpointKey } from './breakpoints';

// Breakpoint detection hook
export { useBreakpoints } from './useBreakpoints';
export type { UseBreakpointsResult } from './useBreakpoints';

// Responsive value hook
export { useResponsiveValue } from './useResponsiveValue';
export type { ResponsiveValueConfig } from './useResponsiveValue';
