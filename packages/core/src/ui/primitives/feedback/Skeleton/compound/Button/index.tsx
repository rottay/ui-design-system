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
 * | sm | 64px | 24px |
 * | md | 80px | 32px (default) |
 * | lg | 96px | 40px |
 *
 * **Shape Options:**
 * | Shape | Border Radius |
 * |-------|---------------|
 * | default | 4px |
 * | circle | 50% (square button) |
 * | round | height / 2 (pill shape) |
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
 * Maps semantic size names to dimension values.
 *
 * @internal
 */
const SIZE_MAP = {
  /** Small button - 64x24px */
  sm: { width: 64, height: 24 },
  /** Medium button - 80x32px (default) */
  md: { width: 80, height: 32 },
  /** Large button - 96x40px */
  lg: { width: 96, height: 40 },
};

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
 * - Round shape uses half-height for border-radius (pill)
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

    // Calculate border-radius based on shape. The round case is emitted as an
    // explicit px string (not a bare number) because it rides the
    // --ds-skeleton-button-radius custom-property hatch, which — unlike a React
    // style value — is not auto-suffixed with px.
    const borderRadius = shape === 'circle'
      ? '50%'
      : shape === 'round'
        ? `${dimensions.height / 2}px`
        : '4px';

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
      // Circle shape uses height for both dimensions
      width: shape === 'circle' ? dimensions.height : dimensions.width,
      height: dimensions.height,
      '--ds-skeleton-button-radius': borderRadius,
      animation: 'skeleton-loading var(--ds-skeleton-animation-duration, 1.5s) infinite',
      ...style,
    } as React.CSSProperties;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-button ${className}`} style={buttonStyle} />
    );
  }
);

// Set display name for React DevTools debugging
SkeletonButton.displayName = 'Skeleton.Button';

export default SkeletonButton;
