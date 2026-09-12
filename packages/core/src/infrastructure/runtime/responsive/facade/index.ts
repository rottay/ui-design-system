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
export { usePhoneBreakpoint } from '../composition/react/provider/phone-state';

// The CSS-channel projection (`generateResponsiveCSS`, `ResponsivePropEntry`)
// and the pure resolution (`resolveResponsiveValue`) are deliberately NOT
// re-exported here. They are the mechanism an ENGINE uses; an application
// consumes `useResponsiveValue` and the layout primitives' responsive props.
// Publishing them would widen the package surface for no consumer.

export {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  buildMinWidthQuery,
  buildRangeQuery,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
export type {
  ResponsiveBreakpointKey,
} from '@/foundation/contracts/kernel/responsive/breakpoints';
