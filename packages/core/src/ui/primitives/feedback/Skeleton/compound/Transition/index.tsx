/**
 * @fileoverview Skeleton Transition Compound Component - Rottay Design System
 * @description Opacity-only crossfade between a Skeleton placeholder and the
 * real content it stands in for, so incoming content never "pops" over the
 * skeleton -- both layers are always mounted, stacked in the same CSS grid
 * cell, and swap opacity on `--ds-motion-fast`.
 *
 * @module Skeleton/Compound/Transition
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { useBreakpoints } from '@/infrastructure/runtime/responsive';

// ============================================================================
// Types
// ============================================================================

export interface SkeletonTransitionProps {
  /**
   * Whether the loading (skeleton) state is currently active. Both the
   * skeleton and the content stay mounted across changes to this flag --
   * only their opacity/interactivity swap -- so a `useSurfaceState`-driven
   * surface can flip it without unmounting either layer.
   */
  loading: boolean;

  /** Skeleton placeholder shown while `loading` is true. */
  skeleton: ReactNode;

  /** Real content, shown once `loading` becomes false. */
  children: ReactNode;

  /** Additional CSS class name for the outer wrapper. */
  className?: string;

  /** Inline styles for the outer wrapper. */
  style?: CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Crossfades a Skeleton placeholder into its real content.
 *
 * Both `skeleton` and `children` occupy the same CSS grid cell
 * (`gridArea: '1 / 1'`) for the lifetime of the component, so the swap is a
 * pure opacity transition with zero layout shift -- content never appears on
 * top of a still-visible skeleton with no transition (a "pop"), and the
 * outgoing skeleton is never removed from the DOM before the incoming
 * content has faded in.
 *
 * Under `prefers-reduced-motion: reduce` the crossfade is disabled: the swap
 * is instant, still with zero layout shift.
 *
 * @example
 * ```tsx
 * <Skeleton.Transition loading={isLoading} skeleton={<Skeleton.Card />}>
 *   <ProfileCard user={user} />
 * </Skeleton.Transition>
 * ```
 */
export const SkeletonTransition = forwardRef<HTMLDivElement, SkeletonTransitionProps>(
  ({ loading, skeleton, children, className, style }, ref) => {
    const { prefersReducedMotion } = useBreakpoints();

    const opacityTransition = prefersReducedMotion
      ? 'none'
      : 'opacity var(--ds-motion-fast) var(--ds-motion-ease-out)';

    const layerBase: CSSProperties = {
      gridArea: '1 / 1',
      minWidth: 0,
      transition: opacityTransition,
    };

    return (
      <div ref={ref} className={className} style={{ display: 'grid', ...style }}>
        <div
          aria-hidden={!loading}
          style={{
            ...layerBase,
            opacity: loading ? 1 : 0,
            pointerEvents: loading ? 'auto' : 'none',
          }}
        >
          {skeleton}
        </div>
        <div
          aria-hidden={loading}
          style={{
            ...layerBase,
            opacity: loading ? 0 : 1,
            pointerEvents: loading ? 'none' : 'auto',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

SkeletonTransition.displayName = 'Skeleton.Transition';

export default SkeletonTransition;
