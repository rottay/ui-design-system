/**
 * @fileoverview Pagination Modern Engine - Rottay Design System
 * @description Token-driven pagination: the engine stamps anatomy
 * (`data-part` hooks) and accessibility state, and the modern skin
 * (`modern/skin/pagination.css`) owns 100% of layout and paint.
 * No DaisyUI classes, no Tailwind utilities, no inline style objects.
 *
 * @remarks
 * Contract notes:
 * - The root is a `<nav>` landmark with an accessible name; the current page
 *   carries `aria-current="page"`; prev/next glyph buttons are named through
 *   `aria-label` from the `components.pagination.*` i18n keys (English
 *   fallback when no provider is mounted).
 * - The ellipsis is an inert `<span>` (never a focusable button).
 * - Size rides `data-size` on the root; the skin maps sm/md/lg to the
 *   documented 32/36/44px control heights.
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
import type { PaginationProps } from '../../contracts';
import { PAGINATION_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

// ============================================================================
// i18n fallback helpers
// ============================================================================

/**
 * English fallbacks mirror the `components.pagination.*` catalog keys so the
 * primitive keeps its documented standalone rendering contract when no
 * I18nProvider is mounted (the `useOptionalTranslation` rationale).
 *
 * `pagination.navigation` is NOT yet in the catalog (requested through the
 * K3-B lane ficha): the missing-key marker the provider returns
 * (`i18n:missing:<locale>:<key>`) is detected and swapped for the fallback
 * until the key lands.
 */
const EN_FALLBACK = {
  previous: 'Previous',
  next: 'Next',
  navigation: 'Pagination',
  totalItems: 'Total {total} items',
} as const;

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  // The i18n kernel's interpolateTranslation pattern (resolution/translation):
  // a global regex replace — the core tsconfig lib predates es2021, so
  // `replaceAll` is not available here.
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Modern engine implementation of Pagination.
 *
 * @param props - {@link PaginationProps}
 * @returns Token-driven pagination nav element
 */
export default function ModernPagination(props: PaginationProps): React.ReactElement {
  const translation = useOptionalTranslation('components');

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

  /** Catalog lookup with the English standalone fallback (see EN_FALLBACK). */
  const translate = (
    key: string,
    fallback: string,
    params?: Record<string, string | number>
  ): string => {
    const value = translation?.t(key, params);
    if (!value || value.startsWith('i18n:missing:')) return interpolate(fallback, params);
    return value;
  };

  // ============================================================================
  // Computed Values
  // ============================================================================

  /** Calculate total number of pages */
  const totalPages = Math.ceil(total / pageSize);

  /**
   * Narrow frames let the joined controls row scroll (see the skin). When the
   * page changes, keep the current page button inside the scrollport instead
   * of stranding it off-edge; `inline: 'nearest'` is a no-op when it already
   * fits, and the optional call keeps jsdom (no layout) safe.
   */
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    controlsRef.current
      ?.querySelector<HTMLElement>(
        '[data-part="pagination-page-button"][data-current="true"]'
      )
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [current]);

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
  // Render
  // ============================================================================

  return (
    <nav
      className={`rottay-pagination rottay-pagination--modern ${className}`.trim()}
      style={style}
      data-part="root"
      data-size={size ?? 'md'}
      data-disabled={disabled || undefined}
      aria-label={translate('pagination.navigation', EN_FALLBACK.navigation)}
    >
      {/* Total items display */}
      {showTotal && (
        <div data-part="pagination-range">
          {translate('pagination.total_items', EN_FALLBACK.totalItems, { total })}
        </div>
      )}

      {/* Pagination controls */}
      <div data-part="pagination-controls" ref={controlsRef}>
        {/* Previous button: glyph-only, so the accessible name comes from
            i18n; the semantic chevron auto-mirrors in RTL. */}
        <button
          type="button"
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current <= 1}
          data-part="pagination-nav-button"
          data-direction="prev"
          aria-label={translate('pagination.previous', EN_FALLBACK.previous)}
        >
          <NavigationBackIcon decorative size="sm" />
        </button>

        {/* Page number buttons: the visible number IS the accessible name */}
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              data-part="pagination-page-button"
              data-current={page === current}
              aria-current={page === current ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} data-part="ellipsis" aria-hidden="true">
              {page}
            </span>
          )
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current >= totalPages}
          data-part="pagination-nav-button"
          data-direction="next"
          aria-label={translate('pagination.next', EN_FALLBACK.next)}
        >
          <NavigationForwardIcon decorative size="sm" />
        </button>
      </div>
    </nav>
  );
}
