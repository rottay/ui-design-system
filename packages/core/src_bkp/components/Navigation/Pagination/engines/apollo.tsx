/**
 * Apollo Pagination Engine
 *
 * Native HTML + Tailwind CSS pagination implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState, useMemo } from 'react';
import type { PaginationProps } from '../../../../types/components/pagination';
import { cn } from '../../../../utils/cn';

// Size styles for pagination
const sizeStyles = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-base',
};

const buttonSizeStyles = {
  small: 'h-7 min-w-[1.75rem] px-2',
  default: 'h-8 min-w-[2rem] px-3',
  large: 'h-10 min-w-[2.5rem] px-4',
};

/**
 * Apollo Pagination - Native HTML + Tailwind implementation
 */
function ApolloPagination({
  current,
  defaultCurrent = 1,
  total,
  pageSize = 10,
  defaultPageSize = 10,
  onChange,
  onShowSizeChange,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  disabled = false,
  simple = false,
  size = 'default',
  pageSizeOptions = [10, 20, 50, 100],
  hideOnSinglePage = false,
  showFirstButton = true,
  showLastButton = true,
  boundaryCount = 1,
  siblingCount = 1,
  className,
  style,
  id,
  'aria-label': ariaLabel = 'Pagination',
}: PaginationProps) {
  // Handle controlled vs uncontrolled state
  const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const isControlled = current !== undefined;
  const currentPage = isControlled ? current : internalCurrent;
  const currentPageSize = pageSize ?? internalPageSize;

  // Calculate total pages
  const totalPages = Math.ceil(total / currentPageSize);

  // Hide if only one page and hideOnSinglePage is true
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  // Calculate range
  const startItem = (currentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(currentPage * currentPageSize, total);

  const textSizeStyle = sizeStyles[size] ?? sizeStyles.default;
  const btnSizeStyle = buttonSizeStyles[size] ?? buttonSizeStyles.default;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || disabled || newPage === currentPage) {
      return;
    }

    if (!isControlled) {
      setInternalCurrent(newPage);
    }

    onChange?.(newPage, currentPageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    const newTotalPages = Math.ceil(total / newPageSize);
    const newPage = currentPage > newTotalPages ? newTotalPages : currentPage;

    setInternalPageSize(newPageSize);

    if (!isControlled && newPage !== currentPage) {
      setInternalCurrent(newPage);
    }

    onShowSizeChange?.(newPage, newPageSize);
    onChange?.(newPage, newPageSize);
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const range: (number | 'ellipsis')[] = [];

    if (simple) {
      return [currentPage];
    }

    // Always include first pages
    for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
      range.push(i);
    }

    // Calculate start and end of sibling range around current page
    const siblingStart = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const siblingEnd = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

    // Add ellipsis before siblings if needed
    if (siblingStart > boundaryCount + 1) {
      range.push('ellipsis');
    } else if (siblingStart === boundaryCount + 1) {
      range.push(boundaryCount + 1);
    }

    // Add sibling pages
    for (let i = siblingStart; i <= siblingEnd; i++) {
      if (i > boundaryCount && i <= totalPages - boundaryCount) {
        range.push(i);
      }
    }

    // Add ellipsis after siblings if needed
    if (siblingEnd < totalPages - boundaryCount) {
      range.push('ellipsis');
    } else if (siblingEnd === totalPages - boundaryCount) {
      range.push(totalPages - boundaryCount);
    }

    // Always include last pages
    for (let i = Math.max(totalPages - boundaryCount + 1, boundaryCount + 1); i <= totalPages; i++) {
      if (!range.includes(i)) {
        range.push(i);
      }
    }

    return range;
  }, [currentPage, totalPages, boundaryCount, siblingCount, simple]);

  // Render simple pagination
  if (simple) {
    return (
      <div
        className={cn('flex items-center gap-2', textSizeStyle, className)}
        style={style}
        id={id}
        role="navigation"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={cn(
            'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
            btnSizeStyle,
            disabled || currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
          )}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) {
                handlePageChange(value);
              }
            }}
            disabled={disabled}
            className={cn(
              'w-16 rounded border border-gray-300 text-center',
              btnSizeStyle,
              disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
            )}
          />
          <span className="text-gray-500">/ {totalPages}</span>
        </div>

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={cn(
            'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
            btnSizeStyle,
            disabled || currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
          )}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', textSizeStyle, className)}
      style={style}
      id={id}
      role="navigation"
      aria-label={ariaLabel}
    >
      {/* Show total */}
      {showTotal && (
        <div className="mr-2 text-gray-600">
          {typeof showTotal === 'function'
            ? showTotal(total, [startItem, endItem])
            : `Total ${total} items`}
        </div>
      )}

      {/* First button */}
      {showFirstButton && totalPages > 1 && (
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={disabled || currentPage === 1}
          className={cn(
            'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
            btnSizeStyle,
            disabled || currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
          )}
          aria-label="First page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Previous button */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={cn(
          'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
          btnSizeStyle,
          disabled || currentPage === 1
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
        )}
        aria-label="Previous page"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      {pageNumbers.map((pageNum, index) => {
        if (pageNum === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn('flex items-center justify-center', btnSizeStyle, 'text-gray-400')}
            >
              •••
            </span>
          );
        }

        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => handlePageChange(pageNum)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center rounded border font-medium transition-colors',
              btnSizeStyle,
              isActive
                ? 'border-blue-500 bg-blue-500 text-white'
                : disabled
                ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next button */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className={cn(
          'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
          btnSizeStyle,
          disabled || currentPage === totalPages
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
        )}
        aria-label="Next page"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Last button */}
      {showLastButton && totalPages > 1 && (
        <button
          type="button"
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={cn(
            'flex items-center justify-center rounded border border-gray-300 font-medium transition-colors',
            btnSizeStyle,
            disabled || currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500'
          )}
          aria-label="Last page"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="ml-2 flex items-center gap-2">
          <span className="text-gray-600">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = parseInt(e.currentTarget.value, 10);
                if (!isNaN(value) && value >= 1 && value <= totalPages) {
                  handlePageChange(value);
                  e.currentTarget.value = '';
                }
              }
            }}
            disabled={disabled}
            className={cn(
              'w-16 rounded border border-gray-300 text-center',
              btnSizeStyle,
              disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
            )}
            placeholder="..."
          />
        </div>
      )}

      {/* Page size changer */}
      {showSizeChanger && (
        <select
          value={currentPageSize}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className={cn(
            'ml-2 rounded border border-gray-300',
            btnSizeStyle,
            disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
          )}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

ApolloPagination.displayName = 'ApolloPagination';

export default ApolloPagination;
