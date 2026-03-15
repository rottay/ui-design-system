'use client';

/**
 * @fileoverview Skeleton Table Compound Component - Rottay Design System
 * @description Table placeholder component for the Skeleton primitive.
 * Displays a table-shaped loading indicator with configurable rows and columns.
 *
 * @module Skeleton/Compound/Table
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonTable component.
 */
export interface SkeletonTableProps {
  /**
   * Number of table rows to display.
   * @default 5
   */
  rows?: number;

  /**
   * Number of table columns to display.
   * @default 4
   */
  columns?: number;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the table skeleton.
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
 * Skeleton Table compound component.
 *
 * Renders an animated table-shaped placeholder with header and body rows.
 */
export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  (props, ref) => {
    const { rows = 5, columns = 4, className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--ds-skeleton-border, #e5e7eb)',
      ...style,
    };

    const rowStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '12px',
      padding: '12px 16px',
    };

    return (
      <div ref={ref} className={`rottay-skeleton-table ${className}`} style={containerStyle}>
        {/* Header row */}
        <div
          style={{
            ...rowStyle,
            borderBottom: '1px solid var(--ds-skeleton-border, var(--ds-color-border))',
            backgroundColor: 'var(--ds-skeleton-header-bg, var(--ds-color-bg-secondary))',
          }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={`header-${col}`}
              style={{
                ...shimmerStyle,
                height: '14px',
                width: '70%',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={`row-${row}`}
            style={{
              ...rowStyle,
              borderBottom:
                row < rows - 1
                  ? '1px solid var(--ds-skeleton-border, var(--ds-color-border))'
                  : undefined,
            }}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <div
                key={`cell-${row}-${col}`}
                style={{
                  ...shimmerStyle,
                  height: '12px',
                  width: col === 0 ? '50%' : '80%',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTable.displayName = 'Skeleton.Table';

export default SkeletonTable;
