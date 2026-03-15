'use client';

/**
 * Cascader - Modern Engine (DaisyUI/Tailwind)
 *
 * Features:
 * - expandTrigger: 'click' | 'hover'
 * - showSearch: search input filtering across all levels
 * - fieldNames: custom property mapping (label, value, children)
 * - loadData: async loading with spinner when expanding nodes
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../../types';
import { CASCADER_DEFAULTS } from '../../types';

// ---------------------------------------------------------------------------
// Helpers for fieldNames mapping
// ---------------------------------------------------------------------------

function getLabel(option: CascaderOption, fn?: CascaderFieldNames): React.ReactNode {
  const key = fn?.label ?? 'label';
  return (option as Record<string, unknown>)[key] as React.ReactNode;
}

function getValue(option: CascaderOption, fn?: CascaderFieldNames): string | number {
  const key = fn?.value ?? 'value';
  return (option as Record<string, unknown>)[key] as string | number;
}

function getChildren(option: CascaderOption, fn?: CascaderFieldNames): CascaderOption[] | undefined {
  const key = fn?.children ?? 'children';
  return (option as Record<string, unknown>)[key] as CascaderOption[] | undefined;
}

function isLeaf(option: CascaderOption, fn?: CascaderFieldNames): boolean {
  if (option.isLeaf !== undefined) return option.isLeaf;
  const children = getChildren(option, fn);
  return !children || children.length === 0;
}

// ---------------------------------------------------------------------------
// Flatten options for search
// ---------------------------------------------------------------------------

interface FlatOption {
  path: CascaderOption[];
  labels: string[];
  values: (string | number)[];
}

function flattenOptions(
  options: CascaderOption[],
  fn?: CascaderFieldNames,
  parentPath: CascaderOption[] = [],
  parentLabels: string[] = [],
  parentValues: (string | number)[] = [],
): FlatOption[] {
  const result: FlatOption[] = [];
  for (const opt of options) {
    const label = String(getLabel(opt, fn));
    const val = getValue(opt, fn);
    const path = [...parentPath, opt];
    const labels = [...parentLabels, label];
    const values = [...parentValues, val];
    const children = getChildren(opt, fn);
    if (children && children.length > 0) {
      result.push(...flattenOptions(children, fn, path, labels, values));
    } else {
      result.push({ path, labels, values });
    }
  }
  return result;
}

export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(
  (props, ref) => {
    const {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      displayRender,
      expandTrigger = CASCADER_DEFAULTS.expandTrigger,
      placeholder = CASCADER_DEFAULTS.placeholder,
      disabled,
      showSearch,
      allowClear = CASCADER_DEFAULTS.allowClear,
      size = CASCADER_DEFAULTS.size,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');

    const isControlled = controlledValue !== undefined;
    const value = (isControlled ? controlledValue : internalValue) as CascaderValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
      if (newOpen && showSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (!newOpen) {
        setSearchValue('');
      }
    }, [controlledOpen, onDropdownVisibleChange, showSearch]);

    // Sync first column when options change
    useEffect(() => {
      setActiveColumns((prev) => {
        const next = [...prev];
        next[0] = options;
        return next;
      });
    }, [options]);

    // Build selected path from value
    useEffect(() => {
      if (value.length > 0) {
        const path: CascaderOption[] = [];
        let currentOptions = options;

        for (const val of value) {
          const found = currentOptions.find((opt) => getValue(opt, fieldNames) === val);
          if (found) {
            path.push(found);
            const children = getChildren(found, fieldNames);
            if (children) {
              currentOptions = children;
            }
          }
        }
        setSelectedPath(path);
      }
    }, [value, options, fieldNames]);

    // ------ Async load helpers ------

    const triggerLoadData = useCallback(async (option: CascaderOption, path: CascaderOption[]) => {
      if (!loadData) return;
      const key = getValue(option, fieldNames);
      setLoadingKeys((prev) => new Set(prev).add(key));
      try {
        await loadData([...path, option]);
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }, [loadData, fieldNames]);

    // ------ Expand / Select ------

    const handleOptionHover = (option: CascaderOption, columnIndex: number) => {
      if (expandTrigger !== 'hover' || option.disabled) return;
      expandOption(option, columnIndex);
    };

    const handleOptionClick = (option: CascaderOption, columnIndex: number) => {
      if (option.disabled) return;

      if (expandTrigger === 'click') {
        expandOption(option, columnIndex);
      }

      // If leaf node, select it
      if (isLeaf(option, fieldNames)) {
        const newPath = [...selectedPath.slice(0, columnIndex), option];
        const newValue = newPath.map((opt) => getValue(opt, fieldNames)) as CascaderValue;

        if (!isControlled) {
          setInternalValue(newValue);
        }
        setSelectedPath(newPath);
        onChange?.(newValue, newPath);
        handleOpenChange(false);
      }
    };

    const expandOption = async (option: CascaderOption, columnIndex: number) => {
      const newPath = [...selectedPath.slice(0, columnIndex), option];
      setSelectedPath(newPath);

      const children = getChildren(option, fieldNames);

      // If no children loaded yet and loadData provided, trigger async load
      if (!children && !isLeaf(option, fieldNames) && loadData) {
        await triggerLoadData(option, selectedPath.slice(0, columnIndex));
        // After load, children should be on the option object (mutated in place)
        const loadedChildren = getChildren(option, fieldNames);
        if (loadedChildren && loadedChildren.length > 0) {
          setActiveColumns([...activeColumns.slice(0, columnIndex + 1), loadedChildren]);
        }
        return;
      }

      if (children && children.length > 0) {
        const newColumns = [...activeColumns.slice(0, columnIndex + 1), children];
        setActiveColumns(newColumns);
      } else {
        setActiveColumns(activeColumns.slice(0, columnIndex + 1));
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue([]);
      }
      setSelectedPath([]);
      setActiveColumns([options]);
      onChange?.([], []);
    };

    // ------ Search ------

    const flatOptions = useMemo(
      () => (showSearch ? flattenOptions(options, fieldNames) : []),
      [options, fieldNames, showSearch],
    );

    const filteredFlatOptions = useMemo(() => {
      if (!searchValue) return flatOptions;
      const lower = searchValue.toLowerCase();
      return flatOptions.filter((fo) =>
        fo.labels.some((l) => l.toLowerCase().includes(lower)),
      );
    }, [flatOptions, searchValue]);

    const handleSearchSelect = (fo: FlatOption) => {
      if (!isControlled) {
        setInternalValue(fo.values as CascaderValue);
      }
      setSelectedPath(fo.path);
      onChange?.(fo.values as CascaderValue, fo.path);
      handleOpenChange(false);
    };

    // Click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          handleOpenChange(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleOpenChange]);

    const getDisplayValue = () => {
      if (selectedPath.length === 0) return '';
      const labels = selectedPath.map((opt) => String(getLabel(opt, fieldNames)));
      if (displayRender) {
        return displayRender(labels, selectedPath);
      }
      return labels.join(' / ');
    };

    const getSizeClass = () => {
      switch (size) {
        case 'small': return 'input-sm';
        case 'large': return 'input-lg';
        default: return 'input-md';
      }
    };

    const isSearchMode = showSearch && searchValue.length > 0;

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`relative ${className || ''}`}
        style={style}
      >
        <div
          className={`input input-bordered ${getSizeClass()} flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
        >
          <span className={`flex-1 truncate ${!selectedPath.length ? 'text-base-content/50' : ''}`}>
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
            >
              ✕
            </button>
          )}
          <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>&#9660;</span>
        </div>

        {isOpen && (
          <>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-select-slide-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes rottay-cascader-panel-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}` }} />
            <div className="absolute z-50 mt-1 bg-base-100 rounded-box shadow-lg border border-base-300" style={{ animation: 'rottay-select-slide-in 0.15s ease-out' }}>
            {/* Search input */}
            {showSearch && (
              <div className="p-2 border-b border-base-300">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="input input-sm input-bordered w-full focus:input-primary transition-all duration-200"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {isSearchMode ? (
              <>
                {/* Flat search results */}
                <ul className="menu w-64 max-h-60 overflow-auto p-1">
                  {filteredFlatOptions.length > 0 ? (
                    filteredFlatOptions.map((fo, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="flex justify-between"
                          onClick={() => handleSearchSelect(fo)}
                        >
                          <span className="truncate">{fo.labels.join(' / ')}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-base-content/50 p-2">{notFoundContent}</li>
                  )}
                </ul>
              </>
            ) : (
              <>
                {/* Normal cascading columns */}
                <div className="flex">
                  {activeColumns.map((column, colIndex) => (
                    <ul
                      key={colIndex}
                      className="menu w-48 max-h-60 overflow-auto border-r border-base-300 last:border-r-0"
                      style={colIndex > 0 ? { animation: 'rottay-cascader-panel-in 0.2s ease-out' } : undefined}
                    >
                      {column.length > 0 ? (
                        column.map((option) => {
                          const optValue = getValue(option, fieldNames);
                          const optLabel = getLabel(option, fieldNames);
                          const optChildren = getChildren(option, fieldNames);
                          const isSelected = selectedPath[colIndex] && getValue(selectedPath[colIndex], fieldNames) === optValue;
                          const isLoading = loadingKeys.has(optValue);
                          return (
                            <li key={String(optValue)}>
                              <button
                                type="button"
                                className={`flex justify-between transition-all duration-150 ${option.disabled ? 'disabled' : ''} ${isSelected ? 'active bg-primary/10 border-l-2 border-primary font-medium' : ''}`}
                                disabled={option.disabled}
                                onClick={() => handleOptionClick(option, colIndex)}
                                onMouseEnter={() => handleOptionHover(option, colIndex)}
                              >
                                <span className="truncate">{optLabel}</span>
                                {isLoading ? (
                                  <span className="loading loading-spinner loading-xs text-primary"></span>
                                ) : (
                                  (optChildren && optChildren.length > 0 || (!isLeaf(option, fieldNames) && loadData)) && (
                                    <span>›</span>
                                  )
                                )}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-base-content/50 p-2">{notFoundContent}</li>
                      )}
                    </ul>
                  ))}
                </div>
              </>
            )}
            </div>
          </>
        )}
      </div>
    );
  }
);

Cascader.displayName = 'Cascader.Modern';

export default Cascader;
