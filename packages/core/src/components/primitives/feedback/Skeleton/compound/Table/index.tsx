/**
 * @fileoverview Skeleton Table Compound Component - Rottay Design System
 * @description Table placeholder component for the Skeleton primitive.
 * Displays a table-shaped loading indicator with configurable rows and columns.
 *
 * @remarks
 * The SkeletonTable renders a bordered container with a styled header row
 * and configurable body rows. Each row uses CSS Grid for uniform column
 * distribution. The header row has a distinct background, and the first
 * column cell in each body row is narrower (50%) to mimic ID/key columns.
 *
 * **Key Features:**
 * - Configurable number of rows and columns
 * - Distinct header row with background color
 * - CSS Grid layout for uniform column sizing
 * - Row dividers between body rows
 * - Themed via CSS custom properties (border, background, shimmer)
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton.Table />
 * ```
 *
 * @example Custom Dimensions
 * ```tsx
 * <Skeleton.Table rows={10} columns={6} />
 * ```
 *
 * @example In a Dashboard
 * ```tsx
 * function DashboardLoading() {
 *   return (
 *     <div>
 *       <Skeleton.Text lines={1} width="200px" />
 *       <Skeleton.Table rows={8} columns={5} style={{ marginTop: 16 }} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonTableProps} - Component props interface
 * @see {@link SkeletonListItem} - List item skeleton companion
 * @see {@link SkeletonCard} - Card skeleton companion
 * @module Skeleton/Compound/Table
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonTable component.
 *
 * @interface SkeletonTableProps
 *
 * @example
 * ```tsx
 * const props: SkeletonTableProps = {
 *   rows: 8,
 *   columns: 5,
 *   className: 'my-table-skeleton',
 * };
 * ```
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

/**
 * Shared shimmer animation reused by all skeleton cells. The sweeping gradient
 * background + its 200% sizing paint from the unlayered skeleton-compounds skin;
 * only the animation reference (which drives the background-position slide) stays
 * inline.
 * @internal
 */
const shimmerStyle: React.CSSProperties = {
  animation: 'skeleton-loading var(--ds-skeleton-animation-duration, 1.5s) infinite',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Skeleton Table compound component.
 *
 * @description
 * Renders an animated table-shaped placeholder with a distinct header row
 * and configurable body rows. Uses CSS Grid for uniform column distribution.
 * The first column cell in each body row is narrower (50%) to mimic typical
 * ID/key columns.
 *
 * @remarks
 * - Header row has distinct background and bottom border
 * - Header cells are 14px tall at 70% width
 * - Body cells are 12px tall; first column at 50%, others at 80%
 * - Row dividers appear between body rows (not after the last)
 * - Uses CSS custom properties for border, header background, and shimmer
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-table` class for styling hooks
 *
 * @param props - {@link SkeletonTableProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered table skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={8} columns={5} className="data-table-skeleton" />
 * ```
 */
export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { rows = 5, columns = 4, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Outer container with rounded corners and themed border.
     */
    // Rounded corners + themed border paint from the skeleton-compounds skin
    // (the border-color reaches the tenant (0,4,0) floor there).
    const containerStyle: React.CSSProperties = {
      width: '100%',
      overflow: 'hidden',
      ...style,
    };

    /**
     * Shared row layout using CSS Grid for equal column distribution.
     */
    const rowStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '12px',
      padding: '12px 16px',
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-table ${className}`} style={containerStyle}>
        {/* Header row - distinct background, taller cells */}
        <div
          data-part="row"
          data-row="header"
          style={rowStyle}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={`header-${col}`}
              data-part="cell"
              style={{
                ...shimmerStyle,
                height: '14px',
                width: '70%',
              }}
            />
          ))}
        </div>

        {/* Body rows - dividers between rows, varied cell widths */}
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={`row-${row}`}
            data-part="row"
            data-row="body"
            style={rowStyle}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <div
                key={`cell-${row}-${col}`}
                data-part="cell"
                style={{
                  ...shimmerStyle,
                  height: '12px',
                  // First column narrower to mimic ID/key columns
                  width: col === 0 ? '50%' : '80%',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
SkeletonTable.displayName = 'Skeleton.Table';

export default SkeletonTable;
