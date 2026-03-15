'use client';

/**
 * @fileoverview Skeleton Paragraph Compound Component - Rottay Design System
 * @description Paragraph/text block placeholder component for the Skeleton primitive.
 * Displays multiple text lines with a configurable last-line width.
 *
 * @remarks
 * This is distinct from SkeletonText in that it exposes a `lastLineWidth` prop
 * for precise control over the trailing line appearance.
 *
 * @module Skeleton/Compound/Paragraph
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonParagraph component.
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
 * Skeleton Paragraph compound component.
 *
 * Renders multiple animated text lines with configurable last-line width.
 * Useful for representing paragraph content in loading states.
 */
export const SkeletonParagraph = forwardRef<HTMLDivElement, SkeletonParagraphProps>(
  (props, ref) => {
    const { lines = 3, lastLineWidth = '60%', className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-paragraph ${className}`} style={containerStyle}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            style={{
              ...shimmerStyle,
              height: '16px',
              width: index === lines - 1 ? lastLineWidth : '100%',
              borderRadius: '4px',
            }}
          />
        ))}
      </div>
    );
  }
);

SkeletonParagraph.displayName = 'Skeleton.Paragraph';

export default SkeletonParagraph;
