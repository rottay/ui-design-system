/**
 * @fileoverview Spinner Base Component - Rottay Design System
 * @description Base implementation of the Spinner component using CSS variables
 * from the design token system for consistent styling across all engines.
 *
 * @remarks
 * This base component provides the foundational structure that engine-specific
 * implementations extend. It uses CSS custom properties (variables) to enable
 * dynamic theming and multi-tenant customization.
 *
 * The base component is primarily used for:
 * - Providing a consistent DOM structure
 * - Applying CSS variable-based styling
 * - Serving as a fallback when no engine is specified
 *
 * @example
 * ```tsx
 * import { BaseSpinner } from '@rottay/design-system';
 *
 * // Direct usage (rare - typically use engine-specific Spinner)
 * <BaseSpinner className="my-spinner" style={{ margin: '1rem' }}>
 *   <CustomSpinnerAnimation />
 * </BaseSpinner>
 * ```
 *
 * @module Spinner/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { SpinnerProps } from '../types';

// ============================================================================
// Base Component
// ============================================================================

/**
 * Base Spinner component using CSS variables.
 *
 * @description
 * This is the foundational component that engine-specific implementations extend.
 * It provides the core DOM structure and CSS variable integration for theming.
 *
 * @remarks
 * - Uses forwardRef for ref forwarding to the container element
 * - Applies the `rottay-spinner` class for global styling hooks
 * - Supports custom className and style props for flexibility
 * - Children can be used for custom spinner content
 *
 * @param props - {@link SpinnerProps} Component properties
 * @param ref - Forwarded ref to the container div element
 * @returns React element with spinner container structure
 *
 * @example
 * ```tsx
 * <BaseSpinner
 *   ref={spinnerRef}
 *   className="loading-indicator"
 *   style={{ position: 'absolute', top: '50%' }}
 * >
 *   {customSpinnerContent}
 * </BaseSpinner>
 * ```
 */
export const BaseSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (props, ref) => {
    const { className = '', style = {}, children } = props;

    return (
      <div
        ref={ref}
        className={`rottay-spinner ${className}`}
        style={style}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// Display Name
// ============================================================================

/**
 * Component display name for React DevTools debugging.
 */
BaseSpinner.displayName = 'BaseSpinner';
