import React, { useState, useEffect, useRef } from 'react';
import { Select, Empty, theme } from 'antd';
import { useTheme } from '../../hooks/useTheme';
import type { SearchableSelectProps, SearchableSelectOption } from './types';

/**
 * SearchableSelect Component
 *
 * Enhanced select component with integrated search functionality.
 * Features automatic debouncing, loading states, and async search support.
 *
 * @example
 * ```tsx
 * // Simple client-side search (instant filtering)
 * <SearchableSelect
 *   options={users}
 *   placeholder="Search users..."
 * />
 *
 * // Async server-side search (with debouncing)
 * <SearchableSelect
 *   options={results}
 *   onSearch={async (query) => {
 *     const data = await fetchUsers(query);
 *     return data;
 *   }}
 *   loading={isLoading}
 * />
 * ```
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  onSearch,
  debounceTime = 300,
  loading = false,
  minSearchLength = 0,
  emptyContent,
  showSearchIcon = false,
  caseSensitive = false,
  filterOption,
  placeholder = 'Search...',
  ...rest
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [searchValue, setSearchValue] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<SearchableSelectOption[]>(options);
  const [internalLoading, setInternalLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine if we're in async mode
  const isAsyncMode = !!onSearch;

  // Update filtered options when options prop changes (for async mode)
  useEffect(() => {
    if (isAsyncMode) {
      setFilteredOptions(options);
    }
  }, [options, isAsyncMode]);

  // Default filter function for native filtering (client-side)
  const defaultFilterOption = (input: string, option: SearchableSelectOption | undefined): boolean => {
    if (!option || !option.label) return false;
    const searchText = caseSensitive ? input : input.toLowerCase();
    const optionLabel = caseSensitive ? option.label : option.label.toLowerCase();
    return optionLabel.includes(searchText);
  };

  // Handle search for async mode only
  const handleAsyncSearch = (value: string) => {
    setSearchValue(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If search is too short, reset to all options
    if (value.length < minSearchLength && value.length > 0) {
      setFilteredOptions([]);
      setInternalLoading(false);
      return;
    }

    if (value.length === 0) {
      setFilteredOptions(options);
      setInternalLoading(false);
      return;
    }

    // Set loading state
    setInternalLoading(true);

    // Debounce the search
    debounceTimerRef.current = setTimeout(async () => {
      try {
        if (onSearch) {
          const result = onSearch(value);

          // Check if the result is a promise
          if (result instanceof Promise) {
            const newOptions = await result;
            if (newOptions) {
              setFilteredOptions(newOptions);
            }
          } else {
            // Synchronous callback
            setInternalLoading(false);
          }
        }
      } catch (error) {
        console.error('SearchableSelect: Error during search', error);
        setFilteredOptions([]);
      } finally {
        setInternalLoading(false);
      }
    }, debounceTime);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Show loading state
  const isLoading = loading || internalLoading;

  // Theme-specific Select dropdown styles
  const getSelectStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          borderRadius: 8,
        };
      case 'stripe':
        return {
          borderRadius: 6,
        };
      case 'notion':
        return {
          borderRadius: 3,
        };
      case 'linear':
        return {
          borderRadius: 12,
        };
      default:
        return {};
    }
  };

  // Empty content with theme-specific styling
  const notFoundContent = emptyContent || (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span style={{ color: token.colorTextSecondary, fontSize: 14 }}>
          {searchValue ? 'No results found' : 'Start typing to search'}
        </span>
      }
    />
  );

  // For sync mode (no onSearch), use native Ant Design filtering
  if (!isAsyncMode) {
    return (
      <Select
        {...rest}
        showSearch
        placeholder={placeholder}
        options={options}
        loading={isLoading}
        notFoundContent={notFoundContent}
        filterOption={filterOption || defaultFilterOption}
        style={{ ...getSelectStyles(), ...rest.style }}
      />
    );
  }

  // For async mode, use custom filtering with debouncing
  return (
    <Select
      {...rest}
      showSearch
      placeholder={placeholder}
      options={filteredOptions}
      onSearch={handleAsyncSearch}
      loading={isLoading}
      notFoundContent={notFoundContent}
      filterOption={false} // Disable native filtering for async
      style={{ ...getSelectStyles(), ...rest.style }}
    />
  );
};

SearchableSelect.displayName = 'SearchableSelect';
