/**
 * @fileoverview Space (layout gap) component token mirrors.
 *
 * Provides small/middle/large size presets used by the Space component to
 * control gap between inline or stacked children.
 */

// Space Sizes
export const spaceSize = {
  small: 'var(--ds-space-small-size)',
  middle: 'var(--ds-space-middle-size)',
  large: 'var(--ds-space-large-size)',
} as const;

// Combined space tokens
export const spaceTokens = {
  size: spaceSize,
  defaultSize: 'var(--ds-space-default-size)',
} as const;

// Type exports
export type SpaceSize = keyof typeof spaceSize;
