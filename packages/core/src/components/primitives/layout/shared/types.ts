/**
 * @fileoverview Shared responsive types for layout primitives
 * @description Provides the ResponsiveValue<T> generic type used by Box, Flex,
 * Stack, and Grid to accept breakpoint-keyed objects for any prop.
 *
 * @module Layout/Shared/Types
 * @category Layout
 * @package @rottay/design-system
 */

import type { ResponsiveBreakpointKey } from '../../../../hooks/responsive/breakpoints';

/**
 * A value that can vary across responsive breakpoints.
 *
 * When a plain T is passed the value applies at all screen sizes (current
 * behaviour, fully backward compatible). When an object keyed by breakpoint
 * names is passed, each key sets the value at that min-width and above
 * (mobile-first cascade).
 *
 * Semantic aliases are provided for convenience:
 * - `phone`   -> maps to `xs` (0 px, the base/mobile tier)
 * - `tablet`  -> maps to `sm` (640 px+)
 * - `desktop` -> maps to `lg` (1024 px+)
 *
 * @example
 * ```tsx
 * // Plain value (backward compatible)
 * <Box p="md" />
 *
 * // Responsive object
 * <Box p={{ base: 'sm', md: 'lg', xl: '2xl' }} />
 *
 * // Semantic aliases
 * <Flex direction={{ phone: 'column', tablet: 'row' }} />
 * ```
 */
export type ResponsiveValue<T> = T | {
  /** Extra small / mobile baseline (0 px). Alias: `phone` */
  base?: T;
  /** Extra small screens (0 px) - same as base */
  xs?: T;
  /** Small screens, 640 px+. Alias: `tablet` */
  sm?: T;
  /** Medium screens, 768 px+ */
  md?: T;
  /** Large screens, 1024 px+. Alias: `desktop` */
  lg?: T;
  /** Extra large screens, 1280 px+ */
  xl?: T;
  /** 2x Extra large screens, 1536 px+ */
  '2xl'?: T;
  /** Alias for base (0-639 px) */
  phone?: T;
  /** Alias for sm (640 px+) */
  tablet?: T;
  /** Alias for lg (1024 px+) */
  desktop?: T;
};

/**
 * All keys that can appear in a ResponsiveValue object, including aliases.
 */
export type ResponsiveValueKey = ResponsiveBreakpointKey | 'base' | 'phone' | 'tablet' | 'desktop';

/**
 * Maps semantic alias keys to their canonical breakpoint key.
 */
export const RESPONSIVE_ALIAS_MAP: Record<string, ResponsiveBreakpointKey> = {
  base: 'xs',
  phone: 'xs',
  tablet: 'sm',
  desktop: 'lg',
};
