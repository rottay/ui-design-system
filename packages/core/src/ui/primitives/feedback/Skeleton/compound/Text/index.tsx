/**
 * @fileoverview Skeleton Text Compound Component - Rottay Design System
 * @description Text placeholder component for the Skeleton primitive.
 * Displays multiple lines of loading indicators for text content.
 *
 * @remarks
 * The SkeletonText is a compound component that provides specialized
 * loading placeholders for text paragraphs. It renders independently of
 * the engine system, using CSS animations for the loading effect.
 *
 * **Key Features:**
 * - Configurable number of lines
 * - Custom width support
 * - Last line at 60% width for realistic appearance
 * - Shimmer animation effect
 * - Ref forwarding for DOM access
 *
 * **Line Widths:**
 * | Line | Width |
 * |------|-------|
 * | All except last | 100% or custom |
 * | Last line | 60% (realistic text ending) |
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * // Using compound component syntax
 * <Skeleton.Text lines={3} />
 * ```
 *
 * @example Custom Width
 * ```tsx
 * // Fixed width container
 * <Skeleton.Text lines={4} width={300} />
 *
 * // Percentage width
 * <Skeleton.Text lines={2} width="80%" />
 * ```
 *
 * @example In Content Card
 * ```tsx
 * function ArticleCardLoading() {
 *   return (
 *     <div className="card">
 *       <Skeleton variant="rectangular" width="100%" height={200} />
 *       <div className="content">
 *         <Skeleton.Text lines={1} width="60%" /> {/* Title *\/}
 *         <Skeleton.Text lines={3} />              {/* Description *\/}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonTextProps} - Component props interface
 * @see {@link SkeletonAvatar} - Avatar skeleton companion
 * @see {@link SkeletonButton} - Button skeleton companion
 * @module Skeleton/Compound/Text
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonText component.
 *
 * @interface SkeletonTextProps
 *
 * @example
 * ```tsx
 * const props: SkeletonTextProps = {
 *   lines: 4,
 *   width: '100%',
 *   className: 'my-text-skeleton',
 * };
 * ```
 */
export interface SkeletonTextProps {
  /**
   * Number of text lines to display.
   * @default 3
   */
  lines?: number;

  /**
   * Width of the text lines.
   * Number values are treated as pixels.
   * @default '100%'
   */
  width?: string | number;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the container.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Text compound component.
 *
 * @description
 * Renders animated placeholder lines for text content during loading states.
 * Supports configurable line count and width with a shimmer animation effect.
 *
 * @remarks
 * - Uses CSS gradient animation for shimmer effect
 * - Last line renders at 60% width for realistic text appearance
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-text` class for styling hooks
 *
 * @param props - {@link SkeletonTextProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered text skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonText lines={4} width="100%" className="content-skeleton" />
 * ```
 */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { lines = 3, width = '100%', className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Container styles for vertical line stacking.
     */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style,
    };

    /**
     * Individual line styles. The shimmer gradient background + 200% sizing and
     * the corner radius paint from the unlayered skeleton-compounds skin; only
     * the animation reference (which drives the slide) stays inline.
     */
    const lineStyle: React.CSSProperties = {
      height: '16px',
      animation: 'ds-foundation-skeleton-loading var(--ds-skeleton-animation-duration, 1.5s) infinite',
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-text ${className}`} style={containerStyle}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            data-part="line"
            style={{
              ...lineStyle,
              // Last line is shorter for realistic text appearance
              width: index === lines - 1 ? '60%' : width,
            }}
          />
        ))}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
SkeletonText.displayName = 'Skeleton.Text';

export default SkeletonText;
