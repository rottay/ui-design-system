/**
 * @fileoverview Skeleton Button Compound Component - Rottay Design System
 * @description Button placeholder component for the Skeleton primitive.
 * Displays a button-shaped loading indicator for action areas.
 *
 * @remarks
 * The SkeletonButton is a compound component that provides specialized
 * loading placeholders for button elements. It renders independently of
 * the engine system, using CSS animations for the loading effect.
 *
 * **Key Features:**
 * - Multiple size presets (sm, md, lg)
 * - Shape options (default, circle, round)
 * - Shimmer animation effect
 * - Ref forwarding for DOM access
 *
 * **Size Mapping:**
 * | Size | Width | Height |
 * |------|-------|--------|
 * | sm | 64px | `--ds-button-sm-height` × density |
 * | md | 80px | `--ds-button-md-height` × density (default) |
 * | lg | 96px | `--ds-button-lg-height` × density |
 *
 * **Shape Options:**
 * | Shape | Border Radius |
 * |-------|---------------|
 * | default | `--ds-button-{size}-radius` |
 * | circle | 50% (square button) |
 * | round | `--ds-radius-full` (pill shape) |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * // Using compound component syntax
 * <Skeleton.Button size="md" shape="default" />
 * ```
 *
 * @example Round Button
 * ```tsx
 * // Pill-shaped button skeleton
 * <Skeleton.Button size="lg" shape="round" />
 * ```
 *
 * @example Circle Icon Button
 * ```tsx
 * // Circular button for icon buttons
 * <Skeleton.Button size="md" shape="circle" />
 * ```
 *
 * @example In Form Layout
 * ```tsx
 * function FormLoading() {
 *   return (
 *     <div className="form">
 *       <Skeleton.Text lines={1} width="30%" /> {/* Label *\/}
 *       <Skeleton variant="rectangular" width="100%" height={40} />
 *       <div className="actions">
 *         <Skeleton.Button size="md" shape="round" />
 *         <Skeleton.Button size="md" shape="round" />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonButtonProps} - Component props interface
 * @see {@link SkeletonAvatar} - Avatar skeleton companion
 * @see {@link SkeletonText} - Text skeleton companion
 * @module Skeleton/Compound/Button
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonButton component.
 *
 * @interface SkeletonButtonProps
 *
 * @example
 * ```tsx
 * const props: SkeletonButtonProps = {
 *   size: 'lg',
 *   shape: 'round',
 *   className: 'my-button-skeleton',
 * };
 * ```
 */
export interface SkeletonButtonProps {
  /**
   * Size preset for the button skeleton.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Shape of the button skeleton.
   * - `default`: Rectangular with 4px border-radius
   * - `circle`: Perfect circle (for icon buttons)
   * - `round`: Pill-shaped (full rounded ends)
   * @default 'default'
   */
  shape?: 'default' | 'circle' | 'round';

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the button skeleton.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for button skeleton.
 * Maps semantic size names to the width presets and the button token channel
 * each placeholder mirrors.
 *
 * @internal
 */
const SIZE_MAP = {
  /** Small button - 64px wide at the sm control height */
  sm: { width: 64, height: 24, channel: 'sm' },
  /** Medium button - 80px wide at the md control height (default) */
  md: { width: 80, height: 32, channel: 'md' },
  /** Large button - 96px wide at the lg control height */
  lg: { width: 96, height: 40, channel: 'lg' },
} as const;

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Button compound component.
 *
 * @description
 * Renders an animated placeholder for button elements during loading states.
 * Supports multiple sizes and shapes with a shimmer animation effect.
 *
 * @remarks
 * - Uses CSS gradient animation for shimmer effect
 * - Circle shape uses height for both dimensions (square)
 * - Heights and radii ride the tenant's button channels, so the placeholder
 *   reserves the mounted button's real footprint at any density
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-button` class for styling hooks
 *
 * @param props - {@link SkeletonButtonProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered button skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonButton size="lg" shape="round" className="submit-skeleton" />
 * ```
 */
export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { size = 'md', shape = 'default', className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Dimension Calculation
    // -------------------------------------------------------------------------

    // Get dimensions from size preset
    const dimensions = SIZE_MAP[size];

    // Height and radius track the real button's tenant channels; width keeps
    // the contract preset, density-scaled. Fallbacks are the historical
    // literals, so render is unchanged where the token bundle is absent.
    const height = `calc(var(--ds-button-${dimensions.channel}-height, ${dimensions.height}px) * var(--ds-density-effective-scale, 1))`;
    const width = `calc(${dimensions.width}px * var(--ds-density-effective-scale, 1))`;

    // Calculate border-radius based on shape. The round case rides the
    // tenant's full-radius channel (a pill at any height); the default case
    // follows the size-matched button radius so placeholder and control
    // share the tenant's corner grammar.
    const borderRadius = shape === 'circle'
      ? '50%'
      : shape === 'round'
        ? 'var(--ds-radius-full, 9999px)'
        : `var(--ds-button-${dimensions.channel}-radius, 4px)`;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Button skeleton styles with animation.
     * Uses CSS gradient for shimmer effect.
     */
    // The shimmer gradient background + 200% sizing paint from the unlayered
    // skeleton-compounds skin; the shape-conditional corner radius rides the
    // --ds-skeleton-button-radius hatch; only the animation reference stays inline.
    const buttonStyle = {
      // Circle shape uses the (channel-resolved) height for both dimensions
      width: shape === 'circle' ? height : width,
      height,
      '--ds-skeleton-button-radius': borderRadius,
      animation: 'ds-skeleton-shimmer var(--ds-skeleton-animation-duration) infinite',
      ...style,
    } as React.CSSProperties;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-button ${className}`} style={buttonStyle} aria-hidden="true" />
    );
  }
);

// Set display name for React DevTools debugging
SkeletonButton.displayName = 'Skeleton.Button';

export default SkeletonButton;
