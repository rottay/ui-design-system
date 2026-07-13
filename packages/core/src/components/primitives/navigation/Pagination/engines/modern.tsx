/**
 * @fileoverview Pagination Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Pagination component.
 * Provides utility-first pagination with join components.
 *
 * @remarks
 * The Modern engine uses DaisyUI's join pattern for pagination:
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
 * <Pagination engine="modern" current={1} total={100} />
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * <Pagination
 *   engine="modern"
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
 * @see {@link ClassicPagination} for Ant Design alternative
 * @see {@link RusticPagination} for Vanilla alternative
 *
 * @module Pagination/Engines/Modern
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { PaginationProps, PaginationSize } from '../Pagination.types';
import { PAGINATION_DEFAULTS } from '../Pagination.types';
import { useTranslation } from '../../../../../i18n';

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
const SIZE_STYLES: Record<PaginationSize, React.CSSProperties> = {
  sm: { height: 32, padding: '0 12px', fontSize: 13 },
  md: { height: 36, padding: '0 16px', fontSize: 14 },
  lg: { height: 44, padding: '0 20px', fontSize: 16 },
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Modern engine implementation of Pagination.
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
 * <ModernPagination
 *   current={3}
 *   total={150}
 *   pageSize={10}
 *   onChange={handlePageChange}
 * />
 * ```
 */
export default function ModernPagination(props: PaginationProps): React.ReactElement {
  const { t } = useTranslation('components');

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

    // When total pages fit within the visible window, show all without ellipsis
    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show page 1 as an anchor point for navigation
    pages.push(1);

    // Insert leading ellipsis when the current page is far from the start
    if (current > 3) {
      pages.push('...');
    }

    // Show a sliding window of pages around the current position.
    // The window is clamped to [2, totalPages-1] to avoid duplicating
    // the first/last page that are always shown separately.
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      pages.push(i);
    }

    // Insert trailing ellipsis when the current page is far from the end
    if (current < totalPages - 2) {
      pages.push('...');
    }

    // Always show the last page as an anchor point
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // ============================================================================
  // Styling
  // ============================================================================

  const sizeKey: PaginationSize = size ?? 'md';
  const btnStyle = SIZE_STYLES[sizeKey];
  const baseBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--ds-color-border)',
    borderRadius: 0,
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--ds-color-text-primary)',
    ...btnStyle,
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={style} data-part="root">
      {/* Total items display */}
      {showTotal && (
        <div className="text-sm mb-2" data-part="pagination-range">{t('pagination.total_items', { total })}</div>
      )}

      {/* Pagination controls */}
      <div style={{ display: 'inline-flex' }}>
        {/* Previous button */}
        <button
          style={{ ...baseBtnStyle, borderRadius: 'var(--ds-radius-md) 0 0 var(--ds-radius-md)', borderRight: 'none' }}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current === 1}
          data-part="pagination-nav-button"
          data-direction="prev"
        >
          «
        </button>

        {/* Page number buttons */}
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={page}
              style={{
                ...baseBtnStyle,
                borderRight: 'none',
                ...(page === current ? { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)', fontWeight: 600 } : {}),
              }}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              data-part="pagination-page-button"
              data-current={page === current}
            >
              {page}
            </button>
          ) : (
            <button key={`ellipsis-${index}`} style={{ ...baseBtnStyle, borderRight: 'none', pointerEvents: 'none', opacity: 0.5 }} data-part="ellipsis">
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          style={{ ...baseBtnStyle, borderRadius: '0 var(--ds-radius-md) var(--ds-radius-md) 0' }}
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current === totalPages}
          data-part="pagination-nav-button"
          data-direction="next"
        >
          »
        </button>
      </div>
    </div>
  );
}
