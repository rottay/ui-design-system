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
 * - `showSizeChanger` renders a native `<select>` trailing the joined
 *   controls (the modern select.css native-trigger idiom: `appearance: none`
 *   + a governed `NavigationDownIcon` part). `pageSizeOptions` supplies the
 *   option list (default 10/20/50/100), always merged with the active
 *   `pageSize` so it never shows a phantom value. Changing the page size
 *   keeps the existing `onChange(1, nextPageSize)` reset-to-page-1 contract
 *   AND additionally fires `onShowSizeChange(current', nextPageSize)` with
 *   the RE-CLAMPED previous current page (AntD parity: two callbacks, two
 *   different current-page values).
 * - `siblingCount`/`boundaryCount` (default 1/1) parameterize the page-button
 *   window; the defaults reproduce the original fixed 1-sibling/1-boundary
 *   algorithm branch-for-branch.
 * - `showQuickJumper` renders a "go to page" input trailing the joined
 *   controls; it commits on Enter and on blur, clamps to `[1, totalPages]`,
 *   and ignores an empty or non-numeric value.
 * - `simple` replaces the page-button cluster with a single `current / total`
 *   readout between the prev/next controls; it is orthogonal to `showTotal`,
 *   `showSizeChanger` and `showQuickJumper`, which keep rendering
 *   independently.
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
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';

// ============================================================================
// i18n fallback helpers
// ============================================================================

/**
 * English fallbacks mirror the `components.pagination.*` catalog keys so the
 * primitive keeps its documented standalone rendering contract when no
 * I18nProvider is mounted (the `useOptionalTranslation` rationale).
 */
const EN_FALLBACK = {
  previous: 'Previous',
  next: 'Next',
  navigation: 'Pagination',
  totalItems: 'Total {total} items',
  itemsPerPage: '{count} per page',
  sizeChanger: 'Items per page',
  page: 'Page {current} of {total}',
  goTo: 'Go to page',
} as const;

/**
 * Default page-size choices for `showSizeChanger`, used whenever the caller
 * does not supply `pageSizeOptions`. The active `pageSize` is always merged
 * in so the select never shows a phantom value.
 */
const BASE_PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 50, 100];

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
// Page Number Generation
// ============================================================================

/**
 * Generates the page-button sequence (numbers and `'...'` ellipsis markers)
 * for the joined controls row.
 *
 * @remarks
 * A direct parameterization of the family's original fixed 1-sibling/
 * 1-boundary algorithm: every branch below (the full-range fast path, the
 * leading/trailing ellipsis conditions, the sibling window, the boundary
 * pages) collapses to the ORIGINAL expression when `siblingCount=1` and
 * `boundaryCount=1` — the documented default behavior is therefore provably
 * unchanged, not just re-implemented to taste.
 *
 * @param current - Current active page (1-indexed)
 * @param totalPages - Total number of pages
 * @param siblingCount - Page buttons kept on each side of `current`
 * @param boundaryCount - Page buttons always kept at each end of the range
 */
function getPageNumbers(
  current: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): (number | string)[] {
  const pages: (number | string)[] = [];

  // When every page fits inside one boundary+sibling window, show them all
  // without an ellipsis. At the 1/1 defaults this is the original `<= 5`.
  const fullRangeThreshold = boundaryCount * 2 + siblingCount * 2 + 1;
  if (totalPages <= fullRangeThreshold) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Leading boundary pages (always shown as navigation anchors).
  for (let i = 1; i <= boundaryCount; i++) pages.push(i);

  // Leading ellipsis once the current page has drifted past the boundary +
  // sibling window. At 1/1 this is the original `current > 3`.
  if (current > boundaryCount + siblingCount + 1) {
    pages.push('...');
  }

  // Sliding sibling window around the current page, clamped inside the
  // boundary pages already pushed above/below.
  const siblingsStart = Math.max(boundaryCount + 1, current - siblingCount);
  const siblingsEnd = Math.min(totalPages - boundaryCount, current + siblingCount);
  for (let i = siblingsStart; i <= siblingsEnd; i++) pages.push(i);

  // Trailing ellipsis. At 1/1 this is the original `current < totalPages - 2`.
  if (current < totalPages - boundaryCount - siblingCount) {
    pages.push('...');
  }

  // Trailing boundary pages.
  for (let i = totalPages - boundaryCount + 1; i <= totalPages; i++) pages.push(i);

  return pages;
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
    showSizeChanger = PAGINATION_DEFAULTS.showSizeChanger,
    showTotal = PAGINATION_DEFAULTS.showTotal,
    showQuickJumper = PAGINATION_DEFAULTS.showQuickJumper,
    simple = PAGINATION_DEFAULTS.simple,
    pageSizeOptions,
    onShowSizeChange,
    siblingCount = PAGINATION_DEFAULTS.siblingCount!,
    boundaryCount = PAGINATION_DEFAULTS.boundaryCount!,
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
   * Size-changer option list: the caller's `pageSizeOptions` (default the
   * conventional 10/20/50/100 set) plus the active pageSize, deduped and
   * sorted so a non-listed active size (say 25) reads in place.
   */
  const resolvedPageSizeOptions = React.useMemo(
    () =>
      Array.from(new Set([...(pageSizeOptions ?? BASE_PAGE_SIZE_OPTIONS), pageSize])).sort(
        (a, b) => a - b
      ),
    [pageSizeOptions, pageSize]
  );

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

  /**
   * Handles page-size changes. `onChange` keeps its documented reset-to-
   * page-1 contract unchanged (`onChange(1, nextPageSize)`); `onShowSizeChange`
   * is the ADDITIONAL AntD-parity callback and reports a DIFFERENT value on
   * purpose — the previous current page re-clamped into the new total —
   * so a consumer that wants to stay near its place (rather than snap to
   * page 1) has the number to do it with.
   */
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPageSize = Number(event.target.value);
    if (disabled || nextPageSize === pageSize || nextPageSize <= 0) return;
    const nextTotalPages = Math.max(1, Math.ceil(total / nextPageSize));
    const reclampedCurrent = Math.min(Math.max(current, 1), nextTotalPages);
    onChange?.(1, nextPageSize);
    onShowSizeChange?.(reclampedCurrent, nextPageSize);
  };

  /** Quick-jumper free-typed buffer (not synced to `current`; AntD idiom). */
  const [jumpValue, setJumpValue] = React.useState('');

  /**
   * Commits the quick jumper: empty or non-numeric input is ignored (and the
   * buffer clears on the non-numeric path), otherwise the target page is
   * clamped to `[1, totalPages]` and routed through the same boundary-checked
   * `handlePageChange` the page buttons use.
   */
  const commitJump = () => {
    const trimmed = jumpValue.trim();
    if (trimmed === '') return;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setJumpValue('');
      return;
    }
    const clamped = Math.min(Math.max(Math.trunc(parsed), 1), Math.max(totalPages, 1));
    handlePageChange(clamped);
    setJumpValue('');
  };

  const handleJumpKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitJump();
    }
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
      data-simple={simple || undefined}
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

        {simple ? (
          /* Simple mode: a single localized readout replaces the page-button
             cluster entirely; prev/next stay the same real controls. */
          <span data-part="pagination-simple-text">
            {translate('pagination.page', EN_FALLBACK.page, { current, total: totalPages })}
          </span>
        ) : (
          /* Page number buttons: the visible number IS the accessible name */
          getPageNumbers(current, totalPages, siblingCount, boundaryCount).map((page, index) =>
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

      {/* Quick jumper: commits on Enter and on blur; clamps to
          [1, totalPages] and ignores an empty or non-numeric value. */}
      {showQuickJumper && (
        <span data-part="pagination-jumper" data-disabled={disabled || undefined}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            data-part="quick-jumper"
            value={jumpValue}
            disabled={disabled}
            onChange={(event) => setJumpValue(event.target.value)}
            onKeyDown={handleJumpKeyDown}
            onBlur={commitJump}
            aria-label={translate('pagination.go_to', EN_FALLBACK.goTo)}
          />
        </span>
      )}

      {/* Page-size changer: a native select (keyboard, mobile picker and
          forced-colors behavior for free) in the select.css native-trigger
          idiom — the governed chevron is decorative; the select carries the
          accessible name. `data-disabled` rides the wrapper so the skin dims
          control AND chevron as one unit. */}
      {showSizeChanger && (
        <span data-part="pagination-size-changer" data-disabled={disabled || undefined}>
          <select
            data-part="pagination-size-select"
            value={pageSize}
            disabled={disabled}
            onChange={handlePageSizeChange}
            aria-label={translate('pagination.size_changer', EN_FALLBACK.sizeChanger)}
          >
            {resolvedPageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {translate('pagination.items_per_page', EN_FALLBACK.itemsPerPage, {
                  count: option,
                })}
              </option>
            ))}
          </select>
          <NavigationDownIcon decorative size="sm" data-part="pagination-size-icon" />
        </span>
      )}
    </nav>
  );
}
