/**
 * @fileoverview Skeleton ListItem Compound Component - Rottay Design System
 * @description List item placeholder component for the Skeleton primitive.
 * Displays a list item loading indicator with optional avatar and text lines.
 *
 * @remarks
 * The SkeletonListItem renders a horizontal row with an optional circular
 * avatar placeholder on the left and a stack of text lines on the right.
 * Line widths vary by index (first line 40%, last 60%, others 80%) to
 * mimic the natural appearance of list item content.
 *
 * **Key Features:**
 * - Optional 40px circular avatar on the left
 * - Configurable number of text lines
 * - Varied line widths for realistic appearance
 * - First line slightly taller (14px) to represent the title
 * - Themed via CSS custom properties (shimmer gradient, animation duration)
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton.ListItem />
 * ```
 *
 * @example With Avatar
 * ```tsx
 * <Skeleton.ListItem hasAvatar lines={3} />
 * ```
 *
 * @example Repeated in a List
 * ```tsx
 * function ContactListLoading() {
 *   return (
 *     <div>
 *       {Array.from({ length: 5 }).map((_, i) => (
 *         <Skeleton.ListItem key={i} hasAvatar lines={2} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link SkeletonListItemProps} - Component props interface
 * @see {@link SkeletonAvatar} - Avatar skeleton companion
 * @see {@link SkeletonTable} - Table skeleton companion
 * @module Skeleton/Compound/ListItem
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonListItem component.
 *
 * @interface SkeletonListItemProps
 *
 * @example
 * ```tsx
 * const props: SkeletonListItemProps = {
 *   hasAvatar: true,
 *   lines: 3,
 *   className: 'my-list-item-skeleton',
 * };
 * ```
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
 * Skeleton ListItem compound component.
 *
 * @description
 * Renders an animated list item placeholder with optional avatar and
 * configurable text lines. Line widths vary by position: first line at
 * 40% (title), last line at 60%, and middle lines at 80%.
 *
 * @remarks
 * - Avatar is a 40px circle with flexShrink: 0 to prevent squishing
 * - First line is 14px tall (title), remaining lines are 12px (subtitle/meta)
 * - Container uses 12px gap between avatar and text, 8px vertical padding
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-list-item` class for styling hooks
 *
 * @param props - {@link SkeletonListItemProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered list item skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonListItem hasAvatar lines={2} className="contact-skeleton" />
 * ```
 */
export const SkeletonListItem = forwardRef<HTMLDivElement, SkeletonListItemProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { hasAvatar = false, lines = 2, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Container styles for horizontal avatar + text layout.
     * Vertical padding creates spacing when items are stacked in a list.
     */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} data-part="root" className={`rottay-skeleton-list-item ${className}`} style={containerStyle}>
        {/* Optional circular avatar placeholder */}
        {hasAvatar && (
          <div
            data-part="avatar"
            style={{
              ...shimmerStyle,
              width: 40,
              height: 40,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        )}

        {/* Text lines container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              data-part="line"
              style={{
                ...shimmerStyle,
                // First line is taller (title), rest are shorter (subtitle/meta)
                height: index === 0 ? '14px' : '12px',
                // Width varies: 40% for title, 60% for last line, 80% for middle
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

// Set display name for React DevTools debugging
SkeletonListItem.displayName = 'Skeleton.ListItem';

export default SkeletonListItem;
