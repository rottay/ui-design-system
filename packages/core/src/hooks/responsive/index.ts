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

// -- Media query hook --
// Low-level primitive: subscribes to any CSS media query string.
// Other responsive hooks are built on top of this.
export { useMediaQuery } from './useMediaQuery';

// -- Breakpoint constants and helpers --
// Shared scale and query builders consumed by useBreakpoints and useResponsiveValue.
// Also available to consumers who need custom range or min-width queries.
export {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  buildMinWidthQuery,
  buildRangeQuery,
} from './breakpoints';
export type { ResponsiveBreakpointKey } from './breakpoints';

// -- Breakpoint detection hook --
// High-level hook returning named boolean flags (isMobile, isTablet, isDesktop, etc.)
export { useBreakpoints } from './useBreakpoints';
export type { UseBreakpointsResult } from './useBreakpoints';

// -- Responsive value hook --
// Returns a breakpoint-specific value from a config map, following Tailwind cascade.
export { useResponsiveValue } from './useResponsiveValue';
export type { ResponsiveValueConfig } from './useResponsiveValue';
