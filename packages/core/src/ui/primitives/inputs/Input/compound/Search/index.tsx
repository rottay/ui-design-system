/**
 * @fileoverview InputSearch - Rottay Design System
 * @description Compound component providing a search input with an integrated
 * search button/icon and an `onSearch` callback triggered on Enter or click.
 *
 * @remarks
 * InputSearch wraps the BaseInput component, adding a search action button
 * in the suffix slot. The search callback fires when the user presses Enter
 * or clicks the search icon/button.
 *
 * **Key Features:**
 * - Built-in magnifying glass SVG icon
 * - `onSearch` callback triggered on Enter key or button click
 * - Optional custom search button text via `searchButtonText`
 * - Toggleable search button visibility via `showSearchButton`
 * - Inherits all BaseInput props (size, variant, status, etc.)
 *
 * **Keyboard Interaction:**
 * - Enter key triggers `onSearch` with the current input value
 * - Other key events are forwarded to `onKeyDown` if provided
 *
 * @example Basic Search
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Search
 *   placeholder="Search..."
 *   onSearch={(value) => handleSearch(value)}
 * />
 * ```
 *
 * @example With Custom Button Text
 * ```tsx
 * <Input.Search
 *   placeholder="Search users..."
 *   onSearch={handleSearch}
 *   searchButtonText="Go"
 * />
 * ```
 *
 * @see {@link Input} for the main input component
 * @see {@link BaseInput} for the underlying input implementation
 * @module InputSearch
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import type { KeyboardEvent } from 'react';
import type { InputSearchProps } from '../../contracts';
import { BaseInput } from '../../engines';

/** SVG magnifying glass icon for the search button. */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/**
 * Search input with integrated search action button.
 *
 * @description
 * Renders a BaseInput with a search icon/button in the suffix slot.
 * The `onSearch` callback is invoked when the user presses Enter or
 * clicks the search button.
 *
 * @param props - {@link InputSearchProps} extending all standard input props
 * @returns A text input element with a search button suffix
 *
 * @example
 * ```tsx
 * <InputSearch
 *   placeholder="Search products..."
 *   onSearch={(value) => fetchResults(value)}
 *   showSearchButton
 * />
 * ```
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
      data-part="search-button"
      onClick={() => onSearch?.((inputProps as any).value || '')}
      style={{
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
      }}
      aria-label="Search"
    >
      {searchButtonText || <SearchIcon />}
    </button>
  ) : null;

  return (
    <BaseInput
      {...inputProps}
      type="text"
      suffix={searchButton}
      onKeyDown={handleKeyDown}
    />
  );
};

InputSearch.displayName = 'Input.Search';
