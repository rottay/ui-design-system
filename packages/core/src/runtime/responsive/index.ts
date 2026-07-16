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
} from './ResponsiveProvider';
export type {
  ResponsiveProviderProps,
  ResponsiveContextValue,
  ResolvedResponsiveContextValue,
  DeviceClass,
  PointerType,
  Orientation,
} from './ResponsiveProvider';
