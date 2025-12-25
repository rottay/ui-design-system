/**
 * Layout Tokens
 * Breakpoints, z-index, container sizes, and layout utilities
 */

// ==================== Breakpoints ====================
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Breakpoint values as numbers (for JS comparisons)
export const breakpointValues = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  // Max-width variants
  maxXs: `@media (max-width: ${breakpointValues.xs - 1}px)`,
  maxSm: `@media (max-width: ${breakpointValues.sm - 1}px)`,
  maxMd: `@media (max-width: ${breakpointValues.md - 1}px)`,
  maxLg: `@media (max-width: ${breakpointValues.lg - 1}px)`,
  maxXl: `@media (max-width: ${breakpointValues.xl - 1}px)`,
  max2xl: `@media (max-width: ${breakpointValues['2xl'] - 1}px)`,
} as const;

// ==================== Z-Index Scale ====================
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
} as const;

// ==================== Container Sizes ====================
export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// ==================== Max Widths ====================
export const maxWidth = {
  none: 'none',
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  full: '100%',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',
  prose: '65ch',
  screen: {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl'],
  },
} as const;

// ==================== Min/Max Heights ====================
export const height = {
  auto: 'auto',
  full: '100%',
  screen: '100vh',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',
} as const;

export const width = {
  auto: 'auto',
  full: '100%',
  screen: '100vw',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',
} as const;

// ==================== Aspect Ratios ====================
export const aspectRatio = {
  auto: 'auto',
  square: '1 / 1',
  video: '16 / 9',
  portrait: '3 / 4',
  landscape: '4 / 3',
  ultrawide: '21 / 9',
} as const;

// ==================== Layout Presets ====================
export const layoutPresets = {
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  hstack: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
  },
  absolute: {
    position: 'absolute' as const,
  },
  fixed: {
    position: 'fixed' as const,
  },
  sticky: {
    position: 'sticky' as const,
  },
} as const;

// ==================== Utility Functions ====================

/**
 * Check if window width matches breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof typeof breakpointValues): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpointValues[breakpoint];
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): keyof typeof breakpointValues | null {
  if (typeof window === 'undefined') return null;

  const width = window.innerWidth;
  const breakpointKeys = Object.keys(breakpointValues) as Array<keyof typeof breakpointValues>;

  // Sort from largest to smallest
  const sortedKeys = breakpointKeys.sort((a, b) => breakpointValues[b] - breakpointValues[a]);

  for (const key of sortedKeys) {
    if (width >= breakpointValues[key]) {
      return key;
    }
  }

  return 'xs';
}

/**
 * Create media query string
 */
export function createMediaQuery(
  breakpoint: keyof typeof breakpoints,
  type: 'min' | 'max' = 'min'
): string {
  const value = type === 'min' ? breakpoints[breakpoint] : `${breakpointValues[breakpoint] - 1}px`;
  return `@media (${type}-width: ${value})`;
}

/**
 * Create container with max-width and centered
 */
export function createContainer(maxWidthValue: keyof typeof containerSizes = 'xl') {
  return {
    width: '100%',
    maxWidth: containerSizes[maxWidthValue],
    marginLeft: 'auto',
    marginRight: 'auto',
  };
}

// ==================== Type Exports ====================
export type BreakpointKey = keyof typeof breakpoints;
export type ZIndexKey = keyof typeof zIndex;
export type ContainerSizeKey = keyof typeof containerSizes;
export type MaxWidthKey = keyof typeof maxWidth;
export type AspectRatioKey = keyof typeof aspectRatio;
