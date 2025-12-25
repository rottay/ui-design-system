/**
 * Pagination - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { PaginationProps } from '../types';
import { PAGINATION_DEFAULTS } from '../types';

const SIZE_STYLES = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 0.75rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1rem', fontSize: '1.125rem' },
};

export default function ApolloPagination(props: PaginationProps): React.ReactElement {
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

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !disabled) {
      onChange?.(page, pageSize);
    }
  };

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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    ...style,
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.25rem',
  };

  const getButtonStyle = (isActive: boolean, isDisabled: boolean): React.CSSProperties => ({
    ...SIZE_STYLES[size!],
    border: '1px solid var(--color-neutral-300, #d9d9d9)',
    borderRadius: '0.25rem',
    background: isActive ? 'var(--color-primary, #0066CC)' : 'white',
    color: isActive ? 'white' : 'inherit',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
  });

  return (
    <div className={className} style={containerStyle}>
      {showTotal && (
        <div style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600, #666)' }}>
          Total {total} items
        </div>
      )}
      <nav style={paginationStyle}>
        <button
          style={getButtonStyle(false, disabled || current === 1)}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current === 1}
        >
          «
        </button>
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
