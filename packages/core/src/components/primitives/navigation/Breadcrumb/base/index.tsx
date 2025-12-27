/**
 * @fileoverview Breadcrumb Base Component - Rottay Design System
 * @description Base implementation of the Breadcrumb using CSS variables.
 * Provides a foundation for engine-specific implementations.
 *
 * @remarks
 * The BaseBreadcrumb component serves as a reference implementation and
 * can be extended by engine-specific versions. It uses CSS variables
 * from the design tokens for consistent, theme-aware styling.
 *
 * **CSS Variables Used:**
 * - `--color-primary-500`: Link hover color
 * - `--color-neutral-600`: Text color
 * - `--spacing-*`: Padding and margins
 *
 * **Accessibility:**
 * - Uses semantic HTML structure
 * - Supports keyboard navigation via anchor tags
 * - Compatible with screen readers
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseBreadcrumb } from '@rottay/design-system';
 *
 * <BaseBreadcrumb className="my-breadcrumb">
 *   <a href="/">Home</a>
 *   <span>/</span>
 *   <a href="/products">Products</a>
 *   <span>/</span>
 *   <span>Current Page</span>
 * </BaseBreadcrumb>
 * ```
 *
 * @see {@link BreadcrumbProps} - Component props interface
 * @see {@link Breadcrumb} - Main component with engine support
 * @module Breadcrumb/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { BreadcrumbProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Breadcrumb component using CSS variables.
 * This is extended by engine-specific implementations.
 *
 * @description
 * A minimal breadcrumb container that provides the foundation for
 * engine-specific implementations. Uses CSS class names and variables
 * for styling, making it easy to theme via CSS.
 *
 * @remarks
 * This component is primarily used internally by the engine implementations.
 * For general usage, prefer the main `Breadcrumb` component which
 * includes engine routing and full feature support.
 *
 * @param props - {@link BreadcrumbProps}
 * @param ref - Forwarded ref to the container div
 * @returns The rendered base breadcrumb container
 *
 * @example
 * ```tsx
 * <BaseBreadcrumb
 *   ref={containerRef}
 *   className="custom-breadcrumb"
 *   style={{ marginBottom: '1rem' }}
 * >
 *   {children}
 * </BaseBreadcrumb>
 * ```
 */
export const BaseBreadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { className = '', style = {}, children } = props;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-breadcrumb ${className}`}
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

BaseBreadcrumb.displayName = 'BaseBreadcrumb';
