/**
 * @fileoverview Shared layout primitive utilities
 * @description Re-exports responsive types and CSS generation helpers used by
 * Box, Flex, Stack, and Grid engines.
 *
 * @module Layout/Shared
 * @category Layout
 * @package @rottay/design-system
 */

export type { ResponsiveValue, ResponsiveValueKey } from './types';
export { RESPONSIVE_ALIAS_MAP } from './types';

export {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsivePropEntry,
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
} from './responsive-props';

export {
  scalarOrUndefined,
  scalarOrDefault,
  resolveBoxSpacing,
  collectBoxResponsiveEntries,
  resolveFlexGap,
  collectFlexResponsiveEntries,
  resolveStackSpacing,
  resolveStackDirection,
  collectStackResponsiveEntries,
  renderStackChildren,
  buildStackStyles,
} from './responsive-helpers.js';
