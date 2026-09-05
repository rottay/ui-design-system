/**
 * @fileoverview Per-engine visual token override contract.
 * @description The shape of one engine's baseline for the JS token tree. Each
 * engine adapter authors exactly one row of it as `tokenBaseline`; there is no
 * lookup table and no engine-keyed record besides the adapter registry.
 *
 * @module Contracts/Tokens/EngineTokens
 * @category Types
 * @package @rottay/design-system
 */

import type { MotionTokens, SurfaceTokens } from '..';

/**
 * Token values that differentiate one engine from another. `useTokens` layers
 * vertical, product-profile and tenant values on top of the active engine's row.
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
