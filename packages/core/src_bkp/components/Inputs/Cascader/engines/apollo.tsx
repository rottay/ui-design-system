/**
 * Apollo Cascader Engine
 *
 * Native HTML + Tailwind CSS cascader implementation.
 * Zero external dependencies, minimal bundle size.
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
import { cn } from '../../../../utils/cn';

/**
 * Size styles
 */
const sizeStyles = {
  small: 'px-2 py-1 text-sm',
  middle: 'px-3 py-2 text-base',
  large: 'px-4 py-3 text-lg',
};

/**
 * Status styles
 */
const statusStyles = {
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
};

/**
 * Apollo Cascader - Native HTML + Tailwind implementation
 */
function ApolloCascader({
  options,
  value,
  defaultValue,
  placeholder = 'Please select',
  disabled,
  changeOnSelect = false,
  size = 'middle',
  status,
  allowClear = true,
  bordered = true,
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
  className,
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

  // Get search results
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
    return results.slice(0, 50);
  };

  const searchResults = showSearch && searchValue ? getSearchResults() : [];

  return (
    <div ref={containerRef} className="relative w-full" style={style}>
      <div className="relative">
        <input
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
          className={cn(
            'w-full rounded-md transition-colors cursor-pointer pr-10',
            'focus:outline-none focus:ring-2',
            bordered
              ? 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              : 'border-transparent',
            sizeStyles[size],
            status && statusStyles[status],
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
            className
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {allowClear && currentValue.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              tabIndex={-1}
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 flex">
          {/* Search results */}
          {showSearch && searchValue ? (
            <div className="p-2 min-w-[200px] max-h-60 overflow-auto">
              {searchResults.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-sm">{notFoundContent}</div>
              ) : (
                searchResults.map((path, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
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
              <div
                key={colIdx}
                className="min-w-[150px] max-h-60 overflow-auto border-r border-gray-100 last:border-r-0 py-1"
              >
                {column.map((option) => {
                  const optValue = getOptionValue(option, fieldNames);
                  const optLabel = getOptionLabel(option, fieldNames);
                  const children = getOptionChildren(option, fieldNames);
                  const isSelected = currentValue[colIdx] === optValue;
                  const isHovered = hoveredPath[colIdx] === option;

                  return (
                    <button
                      key={String(optValue)}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleOptionInteract(option, colIdx, true)}
                      onMouseEnter={expandTrigger === 'hover' ? () => handleOptionInteract(option, colIdx, false) : undefined}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm text-left',
                        'transition-colors',
                        isSelected && 'bg-blue-50 text-blue-700',
                        isHovered && !isSelected && 'bg-gray-100',
                        !isSelected && !isHovered && 'hover:bg-gray-50',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span>{optLabel}</span>
                      {children && children.length > 0 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

ApolloCascader.displayName = 'ApolloCascader';

export default ApolloCascader;
