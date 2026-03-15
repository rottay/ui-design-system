/**
 * Space Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Space CSS custom properties.
 * Use these for type-safe Space token references.
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
