'use client';

import type { KeyboardEvent } from 'react';
import type { InputSearchProps } from '../../types';
import { Input } from '../../';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/**
 * Input.Search compound component
 * Provides a search input with search icon and callback
 */
export const InputSearch = (props: InputSearchProps) => {
  const {
    onSearch,
    loading: _loading,
    showSearchButton = true,
    searchButtonText,
    ...inputProps
  } = props;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.((inputProps as any).value || '');
    }
    (inputProps as any).onKeyDown?.(e);
  };

  const searchButton = showSearchButton ? (
    <button
      type="button"
      onClick={() => onSearch?.((inputProps as any).value || '')}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        color: 'var(--ds-input-border-focus)',
      }}
      aria-label="Search"
    >
      {searchButtonText || <SearchIcon />}
    </button>
  ) : null;

  return (
    <Input
      {...inputProps}
      type="text"
      suffix={searchButton}
      onKeyDown={handleKeyDown}
    />
  );
};

InputSearch.displayName = 'Input.Search';
