'use client';

/**
 * @fileoverview Skeleton Form Compound Component - Rottay Design System
 * @description Form placeholder component for the Skeleton primitive.
 * Displays a form-shaped loading indicator with configurable number of fields.
 *
 * @module Skeleton/Compound/Form
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the SkeletonForm component.
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
 * Renders an animated form-shaped placeholder with label + input pairs
 * and a submit button at the bottom.
 */
export const SkeletonForm = forwardRef<HTMLDivElement, SkeletonFormProps>(
  (props, ref) => {
    const { fields = 3, className = '', style = {} } = props;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      ...style,
    };

    return (
      <div ref={ref} className={`rottay-skeleton-form ${className}`} style={containerStyle}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Label */}
            <div
              style={{
                ...shimmerStyle,
                height: '14px',
                width: `${60 + (index % 3) * 15}px`,
                borderRadius: '4px',
              }}
            />
            {/* Input */}
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
        {/* Submit button */}
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

SkeletonForm.displayName = 'Skeleton.Form';

export default SkeletonForm;
