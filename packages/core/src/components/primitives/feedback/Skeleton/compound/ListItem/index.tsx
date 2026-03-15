'use client';

/**
 * @fileoverview Skeleton ListItem Compound Component - Rottay Design System
 * @description List item placeholder component for the Skeleton primitive.
 * Displays a list item loading indicator with optional avatar and text lines.
 *
 * @module Skeleton/Compound/ListItem
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonListItem component.
 */
export interface SkeletonListItemProps {
  /**
   * Whether to show an avatar placeholder on the left.
   * @default false
   */
  hasAvatar?: boolean;

  /**
   * Number of text lines to display.
   * @default 2
   */
  lines?: number;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the list item skeleton.
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
 * Skeleton ListItem compound component.
 *
 * Renders an animated list item placeholder with optional avatar and
 * configurable text lines.
 */
export const SkeletonListItem = forwardRef<HTMLDivElement, SkeletonListItemProps>(
  (props, ref) => {
    const { hasAvatar = false, lines = 2, className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-list-item ${className}`} style={containerStyle}>
        {hasAvatar && (
          <div
            style={{
              ...shimmerStyle,
              width: 40,
              height: 40,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              style={{
                ...shimmerStyle,
                height: index === 0 ? '14px' : '12px',
                width: index === 0 ? '40%' : index === lines - 1 ? '60%' : '80%',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

SkeletonListItem.displayName = 'Skeleton.ListItem';

export default SkeletonListItem;
