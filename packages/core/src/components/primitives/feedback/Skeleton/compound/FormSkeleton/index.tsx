/**
 * @fileoverview Skeleton Form Compound Component - Rottay Design System
 * @description Form placeholder component for the Skeleton primitive.
 * Displays a form-shaped loading indicator with configurable number of fields.
 *
 * @remarks
 * The SkeletonForm renders a vertical stack of label + input pairs followed
 * by a submit button placeholder. Each label varies in width using a
 * deterministic formula based on its index to create visual variety.
 *
 * **Key Features:**
 * - Configurable number of form fields
 * - Each field has a label skeleton (variable width) and input skeleton
 * - Submit button placeholder at the bottom
 * - Themed via CSS custom properties (shimmer gradient, animation duration)
 *
 * @example Basic Usage
 * ```tsx
 * import { Skeleton } from '@rottay/design-system';
 *
 * <Skeleton.Form />
 * ```
 *
 * @example Custom Field Count
 * ```tsx
 * <Skeleton.Form fields={5} />
 * ```
 *
 * @example In a Drawer
 * ```tsx
 * <Drawer open={isLoading} onClose={handleClose}>
 *   <Drawer.Header>Edit User</Drawer.Header>
 *   <Drawer.Body>
 *     <Skeleton.Form fields={4} />
 *   </Drawer.Body>
 * </Drawer>
 * ```
 *
 * @see {@link SkeletonFormProps} - Component props interface
 * @see {@link SkeletonButton} - Button skeleton companion
 * @see {@link SkeletonText} - Text skeleton companion
 * @module Skeleton/Compound/Form
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonForm component.
 *
 * @interface SkeletonFormProps
 *
 * @example
 * ```tsx
 * const props: SkeletonFormProps = {
 *   fields: 4,
 *   className: 'my-form-skeleton',
 * };
 * ```
 */
export interface SkeletonFormProps {
  /**
   * Number of form fields to display.
   * @default 3
   */
  fields?: number;

  /**
   * Additional CSS class name for custom styling.
   */
  className?: string;

  /**
   * Inline styles applied to the form skeleton.
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
 * Skeleton Form compound component.
 *
 * @description
 * Renders an animated form-shaped placeholder with label + input pairs
 * and a submit button at the bottom. Label widths vary deterministically
 * by field index using the formula `60 + (index % 3) * 15` pixels to
 * create visual variety across fields.
 *
 * @remarks
 * - Uses 20px vertical gap between field groups
 * - Labels are 14px tall with variable widths (60px, 75px, 90px cycling)
 * - Inputs are 38px tall and span full width
 * - Submit button placeholder is 100px wide with 4px top margin
 * - Forwards ref for DOM manipulation
 * - Applies `rottay-skeleton-form` class for styling hooks
 *
 * @param props - {@link SkeletonFormProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered form skeleton element
 *
 * @example
 * ```tsx
 * <SkeletonForm fields={4} className="settings-form-skeleton" />
 * ```
 */
export const SkeletonForm = forwardRef<HTMLDivElement, SkeletonFormProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { fields = 3, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Generation
    // -------------------------------------------------------------------------

    /**
     * Container styles for vertical field stacking.
     * 20px gap matches typical form field spacing.
     */
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} className={`rottay-skeleton-form ${className}`} style={containerStyle}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Label placeholder - width varies by index for visual variety */}
            <div
              style={{
                ...shimmerStyle,
                height: '14px',
                width: `${60 + (index % 3) * 15}px`,
                borderRadius: '4px',
              }}
            />
            {/* Input placeholder - full width, matches typical input height */}
            <div
              style={{
                ...shimmerStyle,
                height: '38px',
                width: '100%',
                borderRadius: '6px',
              }}
            />
          </div>
        ))}
        {/* Submit button placeholder */}
        <div
          style={{
            ...shimmerStyle,
            height: '38px',
            width: '100px',
            borderRadius: '6px',
            marginTop: '4px',
          }}
        />
      </div>
    );
  }
);

// Set display name for React DevTools debugging
SkeletonForm.displayName = 'Skeleton.Form';

export default SkeletonForm;
