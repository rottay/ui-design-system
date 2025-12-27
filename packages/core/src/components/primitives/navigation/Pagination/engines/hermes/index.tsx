/**
 * @fileoverview Pagination Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Pagination component.
 * Provides utility-first pagination with join components.
 *
 * @remarks
 * The Hermes engine uses DaisyUI's join pattern for pagination:
 * - Lightweight, utility-first approach
 * - Tailwind CSS integration
 * - Responsive by default
 * - Easy customization via classes
 *
 * This engine is ideal for projects already using Tailwind CSS
 * or when you need a lighter-weight pagination solution.
 *
 * @example Basic Usage
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * <Pagination engine="hermes" current={1} total={100} />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Pagination
 *   engine="hermes"
 *   current={page}
 *   total={200}
 *   size="lg"
 *   showTotal
 *   className="my-4"
 *   onChange={handleChange}
 * />
 * ```
 *
 * @see {@link PaginationProps} for prop definitions
 * @see {@link TitanPagination} for Ant Design alternative
 * @see {@link ApolloPagination} for Vanilla alternative
 *
 * @module Pagination/Engines/Hermes
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { PaginationProps, PaginationSize } from '../../types';
import { PAGINATION_DEFAULTS } from '../../types';

// ============================================================================
// Size Classes
// ============================================================================

/**
 * Maps Rottay size variants to DaisyUI button classes.
 *
 * @remarks
 * Uses DaisyUI's join-item pattern with btn size modifiers.
 * - sm: Compact buttons for dense UIs
 * - md: Standard button size (default)
 * - lg: Large buttons for prominent navigation
 */
const SIZE_CLASSES: Record<PaginationSize, string> = {
  sm: 'join-item btn-sm',
  md: 'join-item',
  lg: 'join-item btn-lg',
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Hermes engine implementation of Pagination.
 *
 * @description
 * Implements pagination using DaisyUI's join component pattern.
 * Features include:
 * - Previous/Next navigation buttons
 * - Numbered page buttons
 * - Ellipsis for large page ranges
 * - Active state styling
 * - Disabled state handling
 *
 * @param props - {@link PaginationProps}
 * @returns DaisyUI styled pagination element
 *
 * @example
 * ```tsx
 * <HermesPagination
 *   current={3}
 *   total={150}
 *   pageSize={10}
 *   onChange={handlePageChange}
 * />
 * ```
 */
export default function HermesPagination(props: PaginationProps): React.ReactElement {
  const {
    current,
    total,
    pageSize = PAGINATION_DEFAULTS.pageSize!,
    size = PAGINATION_DEFAULTS.size,
    showTotal = PAGINATION_DEFAULTS.showTotal,
    disabled,
    onChange,
    className = '',
    style,
  } = props;

  // ============================================================================
  // Computed Values
  // ============================================================================

  /** Calculate total number of pages */
  const totalPages = Math.ceil(total / pageSize);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles page navigation with boundary checks.
   * @param page - Target page number
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onChange?.(page, pageSize);
    }
  };

  // ============================================================================
  // Page Number Generation
  // ============================================================================

  /**
   * Generates array of page numbers with ellipsis for large ranges.
   *
   * @remarks
   * Algorithm:
   * - Shows first and last page always
   * - Shows current page and neighbors
   * - Uses ellipsis (...) to indicate skipped pages
   *
   * @returns Array of page numbers and ellipsis strings
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // ============================================================================
  // Styling
  // ============================================================================

  const sizeKey: PaginationSize = size ?? 'md';
  const buttonClass = SIZE_CLASSES[sizeKey];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={style}>
      {/* Total items display */}
      {showTotal && (
        <div className="text-sm mb-2">Total {total} items</div>
      )}

      {/* Pagination controls */}
      <div className="join">
        {/* Previous button */}
        <button
          className={`${buttonClass} btn`}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current === 1}
        >
          «
        </button>

        {/* Page number buttons */}
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={page}
              className={`${buttonClass} btn ${page === current ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
            >
              {page}
            </button>
          ) : (
            <button key={`ellipsis-${index}`} className={`${buttonClass} btn btn-disabled`}>
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          className={`${buttonClass} btn`}
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current === totalPages}
        >
          »
        </button>
      </div>
    </div>
  );
}
