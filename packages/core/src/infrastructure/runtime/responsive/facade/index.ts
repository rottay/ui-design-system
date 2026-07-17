/**
 * @fileoverview Responsive runtime — breakpoint provider, context, and
 * hook for viewport-aware rendering across all DS components.
 *
 * @category Runtime
 */

export {
  ResponsiveProvider,
  ResponsiveContext,
  useResponsive,
} from '../composition/react/provider';
export type {
  ResponsiveProviderProps,
  ResponsiveContextValue,
  ResolvedResponsiveContextValue,
  DeviceClass,
  PointerType,
  Orientation,
} from '../composition/react/provider';

// Low-level media subscription and high-level responsive composition hooks.
// Keeping these beside the provider makes responsive behavior one cohesive
// runtime capability instead of a disconnected generic hooks tree.
export { useMediaQuery } from '../runtime/media-query';
export { useBreakpoints } from '../composition/react/provider/breakpoint-state';
export type { UseBreakpointsResult } from '../composition/react/provider/breakpoint-state';
export { useResponsiveValue } from '../composition/react/provider/responsive-value';
export type { ResponsiveValueConfig } from '../composition/react/provider/responsive-value';

export {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  buildMinWidthQuery,
  buildRangeQuery,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
export type {
  ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
