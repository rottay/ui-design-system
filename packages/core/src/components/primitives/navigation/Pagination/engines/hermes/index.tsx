/**
 * Pagination - Hermes Engine (DaisyUI)
 */

import React from 'react';
import type { PaginationProps, PaginationSize } from '../../types';
import { PAGINATION_DEFAULTS } from '../../types';

const SIZE_CLASSES: Record<PaginationSize, string> = {
  sm: 'join-item btn-sm',
  md: 'join-item',
  lg: 'join-item btn-lg',
};

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

  const sizeKey: PaginationSize = size ?? 'md';
  const buttonClass = SIZE_CLASSES[sizeKey];

  return (
    <div className={className} style={style}>
      {showTotal && (
        <div className="text-sm mb-2">Total {total} items</div>
      )}
      <div className="join">
        <button
          className={`${buttonClass} btn`}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current === 1}
        >
          «
        </button>
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
