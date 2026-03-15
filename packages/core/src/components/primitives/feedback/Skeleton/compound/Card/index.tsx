'use client';

/**
 * @fileoverview Skeleton Card Compound Component - Rottay Design System
 * @description Card placeholder component for the Skeleton primitive.
 * Displays a card-shaped loading indicator with optional image and text lines.
 *
 * @module Skeleton/Compound/Card
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonCard component.
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
 * Renders an animated card-shaped placeholder with optional image area
 * and configurable text lines.
 */
export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (props, ref) => {
    const { hasImage = false, lines = 3, className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--ds-skeleton-border, #e5e7eb)',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-card ${className}`} style={containerStyle}>
        {hasImage && (
          <div
            style={{
              ...shimmerStyle,
              width: '100%',
              height: '140px',
            }}
          />
        )}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Title line */}
          <div
            style={{
              ...shimmerStyle,
              height: '20px',
              width: '60%',
              borderRadius: '4px',
            }}
          />
          {/* Body lines */}
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

SkeletonCard.displayName = 'Skeleton.Card';

export default SkeletonCard;
