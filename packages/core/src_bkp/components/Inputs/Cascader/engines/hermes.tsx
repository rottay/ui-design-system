/**
 * Hermes Cascader Engine
 *
 * DaisyUI-based cascader implementation with unified CascaderProps.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { CascaderProps, CascaderOption, CascaderSingleValue } from '../../../../types/components/cascader';
import {
  getOptionLabel,
  getOptionValue,
  getOptionChildren,
  findOptionPath,
  formatDisplayLabels,
  defaultSearchFilter,
} from '../../../../types/components/cascader';

/**
 * Map size to DaisyUI classes
 */
const sizeClasses = {
  small: 'input-sm',
  middle: '',
  large: 'input-lg',
};

/**
 * Map status to DaisyUI classes
 */
const statusClasses = {
  error: 'input-error',
  warning: 'input-warning',
};

/**
 * Hermes Cascader - DaisyUI implementation
 */
function HermesCascader({
  options,
  value,
  defaultValue,
  placeholder = 'Please select',
  disabled,
  changeOnSelect = false,
  size = 'middle',
  status,
  allowClear = true,
  showSearch = false,
  separator = ' / ',
  fieldNames,
  open: controlledOpen,
  expandTrigger = 'click',
  notFoundContent = 'No options',
  onChange,
  onDropdownVisibleChange,
  onSearch,
  onFocus,
  onBlur,
  className = '',
  style,
  id,
  autoFocus,
}: CascaderProps) {
  // State
  const [selectedValue, setSelectedValue] = useState<CascaderSingleValue>(
    (defaultValue as CascaderSingleValue) ?? []
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
  const [searchValue, setSearchValue] = useState('');
  const [hoveredPath, setHoveredPath] = useState<CascaderOption[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value as CascaderSingleValue) : selectedValue;
  const isDropdownOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Get display text
  const selectedPath = currentValue.length > 0 ? findOptionPath(options, currentValue, fieldNames) : null;
  const displayText = selectedPath ? formatDisplayLabels(selectedPath, separator, fieldNames) : '';

  // Open/close dropdown
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      onDropdownVisibleChange?.(true);
      // Reset columns to show from root
      setActiveColumns([options]);
      setHoveredPath([]);
    }
  }, [disabled, onDropdownVisibleChange, options]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onDropdownVisibleChange?.(false);
    setSearchValue('');
  }, [onDropdownVisibleChange]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  // Handle option hover/click
  const handleOptionInteract = (option: CascaderOption, columnIndex: number, isClick: boolean) => {
    const children = getOptionChildren(option, fieldNames);
    const optValue = getOptionValue(option, fieldNames);

    // Update hovered path
    const newPath = [...hoveredPath.slice(0, columnIndex), option];
    setHoveredPath(newPath);

    // Update active columns
    if (children && children.length > 0) {
      setActiveColumns([
        ...activeColumns.slice(0, columnIndex + 1),
        children,
      ]);
    } else {
      setActiveColumns(activeColumns.slice(0, columnIndex + 1));
    }

    // Handle selection
    const shouldSelect = isClick && (changeOnSelect || !children || children.length === 0);
    if (shouldSelect) {
      const newValue = newPath.map((opt) => getOptionValue(opt, fieldNames));

      if (!isControlled) {
        setSelectedValue(newValue);
      }

      onChange?.(newValue, newPath);

      if (!children || children.length === 0) {
        closeDropdown();
      }
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setSelectedValue([]);
    }
    onChange?.([], []);
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch?.(val);
  };

  // Get search results (flattened paths that match)
  const getSearchResults = (): CascaderOption[][] => {
    if (!searchValue) return [];

    const results: CascaderOption[][] = [];

    function traverse(opts: CascaderOption[], path: CascaderOption[]) {
      for (const opt of opts) {
        const currentPath = [...path, opt];
        const children = getOptionChildren(opt, fieldNames);

        if (defaultSearchFilter(searchValue, currentPath, fieldNames)) {
          if (!children || children.length === 0) {
            results.push(currentPath);
          }
        }

        if (children) {
          traverse(children, currentPath);
        }
      }
    }

    traverse(options, []);
    return results.slice(0, 50); // Limit results
  };

  const searchResults = showSearch && searchValue ? getSearchResults() : [];

  // Input classes
  const inputClasses = [
    'input',
    'input-bordered',
    'w-full',
    'cursor-pointer',
    sizeClasses[size],
    status && statusClasses[status],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className="dropdown w-full" style={style}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={showSearch && isDropdownOpen ? searchValue : displayText}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly={!showSearch}
          onClick={openDropdown}
          onChange={showSearch ? handleSearchChange : undefined}
          onFocus={(e) => {
            openDropdown();
            onFocus?.(e);
          }}
          onBlur={onBlur}
          className={inputClasses}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {allowClear && currentValue.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost btn-xs btn-circle"
              tabIndex={-1}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="dropdown-content bg-base-100 rounded-box shadow-lg z-50 mt-1 flex">
          {/* Search results */}
          {showSearch && searchValue ? (
            <div className="p-2 min-w-[200px] max-h-60 overflow-auto">
              {searchResults.length === 0 ? (
                <div className="text-base-content/50 text-center py-4">{notFoundContent}</div>
              ) : (
                searchResults.map((path, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-base-200 rounded"
                    onClick={() => {
                      const newValue = path.map((opt) => getOptionValue(opt, fieldNames));
                      if (!isControlled) {
                        setSelectedValue(newValue);
                      }
                      onChange?.(newValue, path);
                      closeDropdown();
                    }}
                  >
                    {formatDisplayLabels(path, separator, fieldNames)}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Cascading columns */
            activeColumns.map((column, colIdx) => (
              <ul
                key={colIdx}
                className="menu bg-base-100 min-w-[150px] max-h-60 overflow-auto border-r border-base-200 last:border-r-0"
              >
                {column.map((option) => {
                  const optValue = getOptionValue(option, fieldNames);
                  const optLabel = getOptionLabel(option, fieldNames);
                  const children = getOptionChildren(option, fieldNames);
                  const isSelected = currentValue[colIdx] === optValue;
                  const isHovered = hoveredPath[colIdx] === option;

                  return (
                    <li key={String(optValue)}>
                      <button
                        type="button"
                        disabled={option.disabled}
                        onClick={() => handleOptionInteract(option, colIdx, true)}
                        onMouseEnter={expandTrigger === 'hover' ? () => handleOptionInteract(option, colIdx, false) : undefined}
                        className={[
                          'flex justify-between',
                          isSelected ? 'active' : '',
                          isHovered && !isSelected ? 'bg-base-200' : '',
                          option.disabled ? 'disabled' : '',
                        ].join(' ')}
                      >
                        <span>{optLabel}</span>
                        {children && children.length > 0 && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))
          )}
        </div>
      )}
    </div>
  );
}

HermesCascader.displayName = 'HermesCascader';

export default HermesCascader;
