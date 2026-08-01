/**
 * @fileoverview Skeleton Paragraph Compound Component - Rottay Design System
 * @description Paragraph/text block placeholder component for the Skeleton primitive.
 * Displays multiple text lines with a configurable last-line width.
 *
 * @remarks
 * The SkeletonParagraph is distinct from SkeletonText in that it exposes a
 * `lastLineWidth` prop for precise control over the trailing line appearance.
 * All lines are rendered at a uniform 16px height. Non-last lines fill the
 * full container width while the final line uses the configurable width.
 *
 * **Key Features:**
 * - Configurable number of text lines
 * - Customizable last-line width via `lastLineWidth` prop
 * - Uniform 16px line height with 8px vertical gap
 * - Themed via CSS custom properties (shimmer gradient, animation duration)
 *
 * **Versus SkeletonText:**
 * - SkeletonText: overall `width` prop, last line fixed at 60%
 * - SkeletonParagraph: full-width lines, explicit `lastLineWidth` control
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton.Paragraph />
 * ```
 *
 * @example Custom Line Count and Last-Line Width
 * ```tsx
 * <Skeleton.Paragraph lines={5} lastLineWidth="40%" />
 * ```
 *
 * @example In a Content Section
 * ```tsx
 * function ArticleLoading() {
 *   return (
 *     <div>
 *       <Skeleton.Text lines={1} width="50%" />
 *       <Skeleton.Paragraph lines={4} lastLineWidth="70%" style={{ marginTop: 12 }} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonParagraphProps} - Component props interface
 * @see {@link SkeletonText} - Simpler text skeleton (fixed 60% last line)
 * @see {@link SkeletonCard} - Card skeleton that includes text lines
 * @module Skeleton/Compound/Paragraph
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonParagraph component.
 *
 * @interface SkeletonParagraphProps
 *
 * @example
 * ```tsx
 * const props: SkeletonParagraphProps = {
 *   lines: 5,
 *   lastLineWidth: '40%',
 *   className: 'my-paragraph-skeleton',
 * };
 * ```
 */
export interface SkeletonParagraphProps {
  /**
   * Number of text lines to display.
   * @default 3
   */
  lines?: number;

  /**
   * Width of the last line. Accepts any CSS width value.
   * @default '60%'
   */
  lastLineWidth?: string;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the paragraph skeleton.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Shared Styles
// ============================================================================

/**
 * Shared shimmer animation reused by all skeleton elements. The sweeping
 * gradient background + its 200% sizing paint from the unlayered
 * skeleton-compounds skin; only the animation reference (which drives the
 * background-position slide) stays inline.
 * @internal
 */
const shimmerStyle: React.CSSProperties = {
  animation: 'ds-skeleton-shimmer var(--ds-skeleton-animation-duration) infinite',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Paragraph compound component.
 *
 * @description
 * Renders multiple animated text lines with configurable last-line width.
 * All lines are full-width except the final one, which uses the
 * `lastLineWidth` prop for a natural trailing-off effect.
 *
 * @remarks
 * - All lines are 16px tall with 8px vertical gap
 * - Non-last lines span 100% width
 * - Last line width is configurable (default 60%)
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-paragraph` class for styling hooks
 *
 * @param props - {@link SkeletonParagraphProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered paragraph skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonParagraph lines={4} lastLineWidth="45%" />
 * ```
 */
export const SkeletonParagraph = forwardRef<HTMLDivElement, SkeletonParagraphProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { lines = 3, lastLineWidth = '60%', className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    // The column stack, the line gap and the uniform line height paint from
    // the unlayered skeleton-compounds skin; inline style carries only the
    // caller's `style` on the root and, on the trailing line, the instance
    // `lastLineWidth` prop (contract geometry) plus the canon animation.
    const containerStyle: React.CSSProperties = { ...style };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-paragraph ${className}`} style={containerStyle} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            data-part="line"
            style={{
              ...shimmerStyle,
              // Non-last lines stretch to the column (skin-owned); only the
              // trailing line carries the instance `lastLineWidth` prop.
              ...(index === lines - 1 ? { width: lastLineWidth } : {}),
            }}
          />
        ))}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
SkeletonParagraph.displayName = 'Skeleton.Paragraph';

export default SkeletonParagraph;
