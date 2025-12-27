/**
 * Space Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Space CSS custom properties.
 * Use these for type-safe Space token references.
 */

// Space Sizes
export const spaceSize = {
  small: 'var(--space-small-size)',
  middle: 'var(--space-middle-size)',
  large: 'var(--space-large-size)',
} as const;

// Combined space tokens
export const spaceTokens = {
  size: spaceSize,
  defaultSize: 'var(--space-default-size)',
} as const;

// Type exports
export type SpaceSize = keyof typeof spaceSize;
