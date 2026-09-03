/**
 * @fileoverview Per-engine visual token override contract.
 * @description Moved here from `infrastructure/runtime/theming/foundation/engine-tokens`
 * so a foundation contract can name it; the three token rows and `getEngineTokens`
 * stay where they are and re-export this type.
 *
 * @module Contracts/Tokens/EngineTokens
 * @category Types
 * @package @rottay/design-system
 */

import type { MotionTokens, SurfaceTokens } from '..';

/**
 * Token overrides that differentiate one engine from another.
 * The token resolution pipeline in `useTokens` layers these under
 * product-profile and tenant overrides.
 */
export interface EngineTokenOverrides {
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  surface: SurfaceTokens;
  motion: MotionTokens;
  /** Spacing density multiplier (< 1 = compact, 1 = normal, > 1 = spacious) */
  densityScale: number;
}
