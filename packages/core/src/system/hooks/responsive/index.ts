/**
 * Responsive hooks - Media queries and breakpoint detection
 *
 * These hooks provide SSR-safe responsive behavior detection:
 * - useMediaQuery: Custom media query detection
 * - useBreakpoints: Common breakpoint detection (mobile/tablet/desktop)
 * - useResponsiveValue: Responsive values based on current breakpoint
 *
 * @example
 * ```tsx
 * import { useBreakpoints, useResponsiveValue } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const { isMobile, isDesktop } = useBreakpoints();
 *   const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
 *
 *   return (
 *     <Grid columns={columns}>
 *       {isMobile ? <MobileNav /> : <DesktopNav />}
 *     </Grid>
 *   );
 * }
 * ```
 */

// Media query hook
export { useMediaQuery } from './useMediaQuery';

// Breakpoint detection hook
export { useBreakpoints } from './useBreakpoints';
export type { UseBreakpointsResult } from './useBreakpoints';

// Responsive value hook
export { useResponsiveValue } from './useResponsiveValue';
export type { ResponsiveValueConfig } from './useResponsiveValue';
