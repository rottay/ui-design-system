/**
 * @fileoverview Pagination Base Component - Rottay Design System
 * @description Base implementation of the Pagination component using CSS variables.
 * Serves as the foundation for engine-specific implementations.
 *
 * @remarks
 * The BasePagination component provides a minimal, unstyled container that
 * engine implementations can extend. It uses CSS variables from design tokens
 * for consistent styling across the system.
 *
 * This component is primarily used internally by engine implementations
 * and is not typically used directly in applications.
 *
 * @example Direct Usage (uncommon)
 * ```tsx
 * import { BasePagination } from '@rottay/design-system';
 *
 * <BasePagination className="custom-wrapper">
 *   {/* Custom pagination content *\/}
 * </BasePagination>
 * ```
 *
 * @example Extending in Engine
 * ```tsx
 * import { BasePagination } from '../base';
 *
 * export default function EnginePagination(props: PaginationProps) {
 *   return (
 *     <BasePagination {...props}>
 *       {/* Engine-specific implementation *\/}
 *     </BasePagination>
 *   );
 * }
 * ```
 *
 * @see {@link PaginationProps} for prop definitions
 * @see {@link Pagination} for the main component with engine support
 *
 * @module Pagination/Base
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { PaginationProps } from '../types';

// ============================================================================
// Base Component
// ============================================================================

/**
 * Base Pagination component using CSS variables.
 *
 * @description
 * A minimal wrapper component that provides:
 * - Consistent class naming (`rottay-pagination`)
 * - Ref forwarding for DOM access
 * - Style and className pass-through
 * - Children rendering for custom content
 *
 * This is extended by engine-specific implementations (Titan, Hermes, Apollo)
 * to provide fully-featured pagination controls.
 *
 * @remarks
 * Uses the `rottay-pagination` class for global CSS targeting.
 * CSS variables can be applied via the design tokens system.
 *
 * @param props - {@link PaginationProps}
 * @param ref - Forwarded ref to the container div
 * @returns Base pagination container element
 *
 * @example
 * ```tsx
 * <BasePagination className="my-pagination" style={{ marginTop: 16 }}>
 *   {children}
 * </BasePagination>
 * ```
 */
export const BasePagination = forwardRef<HTMLDivElement, PaginationProps>(
  (props, ref) => {
    const { className = '', style = {}, children } = props;

    return (
      <div
        ref={ref}
        className={`rottay-pagination ${className}`}
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
 * Display name for React DevTools debugging.
 */
BasePagination.displayName = 'BasePagination';
