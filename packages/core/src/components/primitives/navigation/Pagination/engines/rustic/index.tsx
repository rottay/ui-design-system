/**
 * @fileoverview Pagination Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Pagination component.
 * Provides zero-dependency pagination with maximum accessibility.
 *
 * @remarks
 * The Rustic engine implements pagination using only native HTML and CSS:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full control over styling via CSS variables
 * - Lightweight bundle size
 *
 * This engine is ideal for projects requiring:
 * - Minimal bundle size
 * - Maximum accessibility
 * - Complete styling control
 * - No framework dependencies
 *
 * @example Basic Usage
 * ```tsx
 * import { Pagination } from '@rottay/design-system';
 *
 * <Pagination engine="rustic" current={1} total={100} />
 * ```
 *
 * @example With Custom Colors
 * ```tsx
 * <Pagination
 *   engine="rustic"
 *   current={page}
 *   total={200}
 *   style={{
 *     '--ds-color-primary': '#8B5CF6',
 *     '--ds-color-neutral-300': '#E5E7EB',
 *   }}
 *   onChange={handleChange}
 * />
 * ```
 *
 * @see {@link PaginationProps} for prop definitions
 * @see {@link ClassicPagination} for Ant Design alternative
 * @see {@link ModernPagination} for DaisyUI alternative
 *
 * @module Pagination/Engines/Rustic
 * @category Navigation
 * @package @rottay/design-system
 */

import React from 'react';
import type { PaginationProps, PaginationSize } from '../../types';
import { PAGINATION_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

// ============================================================================
// Size Styles
// ============================================================================

/**
 * Maps Rottay size variants to inline style values.
 *
 * @remarks
 * Provides consistent sizing across the pagination controls:
 * - Padding scales with size for proper touch targets
 * - Font size ensures readability at each scale
 */
const SIZE_STYLES: Record<PaginationSize, { padding: string; fontSize: string }> = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 0.75rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1rem', fontSize: '1.125rem' },
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Rustic engine implementation of Pagination.
 *
 * @description
 * Implements pagination using pure HTML and inline CSS with CSS variables.
 * Features include:
 * - Previous/Next navigation buttons
 * - Numbered page buttons
 * - Ellipsis for large page ranges
 * - Active state with primary color
 * - Disabled state with reduced opacity
 * - CSS variable theming support
 *
 * @param props - {@link PaginationProps}
 * @returns Native HTML pagination element
 *
 * @example
 * ```tsx
 * <RusticPagination
 *   current={3}
 *   total={150}
 *   pageSize={10}
 *   onChange={handlePageChange}
 * />
 * ```
 */
export default function RusticPagination(props: PaginationProps): React.ReactElement {
  const { t } = useTranslation('components');

  const {
    current,
    total,
    pageSize = PAGINATION_DEFAULTS.pageSize!,
    size = PAGINATION_DEFAULTS.size,
    showTotal = PAGINATION_DEFAULTS.showTotal,
    disabled,
    onChange,
    className,
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
  // Styles
  // ============================================================================

  /**
   * Container styles with flex layout.
   */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    ...style,
  };

  /**
   * Pagination nav styles with horizontal layout.
   */
  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.25rem',
  };

  const sizeKey: PaginationSize = size ?? 'md';

  /**
   * Generates button styles based on state.
   *
   * @param isActive - Whether the button represents current page
   * @param isDisabled - Whether the button is disabled
   * @returns Complete button style object
   */
  const getButtonStyle = (isActive: boolean, isDisabled: boolean): React.CSSProperties => ({
    ...SIZE_STYLES[sizeKey],
    border: '1px solid var(--ds-pagination-border-color, var(--ds-color-neutral-300, #d9d9d9))',
    borderRadius: 'var(--ds-pagination-radius, 0.25rem)',
    background: isActive ? 'var(--ds-pagination-active-bg, var(--ds-color-primary-500, #0066CC))' : 'var(--ds-pagination-bg, white)',
    color: isActive ? 'var(--ds-pagination-active-color, white)' : 'inherit',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
  });

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={className} style={containerStyle}>
      {/* Total items display */}
      {showTotal && (
        <div style={{ fontSize: '0.875rem', color: 'var(--ds-pagination-total-color, var(--ds-color-neutral-600, #666))' }}>
          {t('pagination.total_items', { total })}
        </div>
      )}

      {/* Pagination navigation */}
      <nav style={paginationStyle}>
        {/* Previous button */}
        <button
          style={getButtonStyle(false, disabled || current === 1)}
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
              style={getButtonStyle(page === current, disabled || false)}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
            >
              {page}
            </button>
          ) : (
            <button
              key={`ellipsis-${index}`}
              style={getButtonStyle(false, true)}
              disabled
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          style={getButtonStyle(false, disabled || current === totalPages)}
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current === totalPages}
        >
          »
        </button>
      </nav>
    </div>
  );
}
