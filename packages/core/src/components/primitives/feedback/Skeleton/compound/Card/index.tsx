/**
 * @fileoverview Skeleton Card Compound Component - Rottay Design System
 * @description Card placeholder component for the Skeleton primitive.
 * Displays a card-shaped loading indicator with optional image and text lines.
 *
 * @remarks
 * The SkeletonCard renders a bordered card container with an optional image
 * placeholder at the top, a wider title line, and a configurable number of
 * body text lines. It reuses the shared shimmer animation for consistency
 * with other skeleton sub-components.
 *
 * **Key Features:**
 * - Optional image area (140px tall) at the top of the card
 * - Configurable number of body text lines
 * - Last body line rendered at 80% width for realistic appearance
 * - Themed via CSS custom properties (border, padding, shimmer)
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton.Card />
 * ```
 *
 * @example With Image
 * ```tsx
 * <Skeleton.Card hasImage lines={4} />
 * ```
 *
 * @example In a Grid Layout
 * ```tsx
 * function ProductGridLoading() {
 *   return (
 *     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
 *       <Skeleton.Card hasImage lines={2} />
 *       <Skeleton.Card hasImage lines={2} />
 *       <Skeleton.Card hasImage lines={2} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonCardProps} - Component props interface
 * @see {@link SkeletonListItem} - List item skeleton companion
 * @see {@link SkeletonTable} - Table skeleton companion
 * @module Skeleton/Compound/Card
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonCard component.
 *
 * @interface SkeletonCardProps
 *
 * @example
 * ```tsx
 * const props: SkeletonCardProps = {
 *   hasImage: true,
 *   lines: 4,
 *   className: 'my-card-skeleton',
 * };
 * ```
 */
export interface SkeletonCardProps {
  /**
   * Whether to show an image placeholder at the top of the card.
   * @default false
   */
  hasImage?: boolean;

  /**
   * Number of text lines to display in the card body.
   * @default 3
   */
  lines?: number;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the card skeleton.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Shared Styles
// ============================================================================

/**
 * Shared shimmer animation styles reused by all skeleton elements.
 * Uses a sweeping gradient that animates horizontally via `backgroundSize: 200%`.
 * @internal
 */
const shimmerStyle: React.CSSProperties = {
  background:
    'var(--ds-skeleton-wave-gradient, linear-gradient(90deg, var(--ds-skeleton-bg) 25%, var(--ds-skeleton-highlight) 50%, var(--ds-skeleton-bg) 75%))',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading var(--ds-skeleton-animation-duration, 1.5s) infinite',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Card compound component.
 *
 * @description
 * Renders an animated card-shaped placeholder with optional image area
 * and configurable text lines. Mimics a typical content card layout
 * with a title line at 60% width and body lines filling the remaining space.
 *
 * @remarks
 * - Image placeholder is 140px tall when enabled
 * - Title line is 20px tall (taller than body lines at 14px)
 * - Last body line renders at 80% width for visual variety
 * - Uses CSS custom properties for border, padding, and shimmer theming
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-card` class for styling hooks
 *
 * @param props - {@link SkeletonCardProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered card skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonCard hasImage lines={3} className="product-card-skeleton" />
 * ```
 */
export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { hasImage = false, lines = 3, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Container styles with rounded corners and themed border.
     * Overflow hidden ensures the image placeholder respects border-radius.
     */
    const containerStyle: React.CSSProperties = {
      borderRadius: 'var(--ds-radius-lg, 8px)',
      overflow: 'hidden',
      border: '1px solid var(--ds-skeleton-border, var(--ds-color-border))',
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} className={`rottay-skeleton-card ${className}`} style={containerStyle}>
        {/* Optional image placeholder at top of card */}
        {hasImage && (
          <div
            style={{
              ...shimmerStyle,
              width: '100%',
              height: '140px',
            }}
          />
        )}

        {/* Card body with title and text lines */}
        <div
          style={{
            padding: 'var(--ds-card-body-padding, 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Title line - wider height, partial width */}
          <div
            style={{
              ...shimmerStyle,
              height: '20px',
              width: '60%',
              borderRadius: '4px',
            }}
          />
          {/* Body lines - last line is shorter for realistic appearance */}
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              style={{
                ...shimmerStyle,
                height: '14px',
                width: index === lines - 1 ? '80%' : '100%',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

// Set display name for React DevTools debugging
SkeletonCard.displayName = 'Skeleton.Card';

export default SkeletonCard;
