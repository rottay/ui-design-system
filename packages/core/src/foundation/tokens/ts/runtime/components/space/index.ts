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
//
// The canonical, publicly-exported Space size prop type is `SpaceSize` in
// `components/primitives/layout/Space/Space.types.ts` (derived from the shared `Size`
// union). Tokens is the foundation layer components import FROM, never the reverse; this
// file's own size-key type -- the legacy 'small' | 'middle' | 'large' spelling this token
// map defines entries for -- is named distinctly so the two do not share a name.
export type SpaceSizeToken = keyof typeof spaceSize;
