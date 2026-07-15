'use client';

/**
 * @fileoverview Cascader Modern Engine - Rottay Design System.
 * DaisyUI/Tailwind CSS implementation of a hierarchical option selector.
 * Supports click/hover expansion, cross-level search, async data loading,
 * custom fieldNames mapping, and controlled/uncontrolled value modes.
 *
 * @example
 * ```tsx
 * <Cascader engine="modern" options={categories} showSearch expandTrigger="hover" />
 * ```
 *
 * @module Cascader/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../Cascader.types';
import { CASCADER_DEFAULTS } from '../Cascader.types';
import { toLegacySize } from '../../../../../contracts/common';

// ---------------------------------------------------------------------------
// Helpers for fieldNames mapping.
// fieldNames lets consumers use their own data shape (e.g., {name, id, items})
// instead of the default {label, value, children}. These accessors abstract
// the mapping so the rest of the component uses a uniform API.
// ---------------------------------------------------------------------------

/** Reads the label property from an option, respecting custom fieldNames. */
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
// Flatten options for search.
// Cascader options are hierarchical, but search needs to match across all
// levels. Flattening produces one entry per leaf path (e.g., "US > CA > SF")
// so the search filter can match against the concatenated label string.
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

/**
 * Modern Cascader component (DaisyUI/Tailwind CSS).
 *
 * Renders a trigger input that opens a multi-column dropdown. Each column
 * represents one level of the option hierarchy. Selecting a leaf node
 * commits the value and closes the dropdown.
 *
 * @param props - {@link CascaderProps}
 * @returns A positioned cascader dropdown with search and async-load support
 */
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
      size: sizeProp = CASCADER_DEFAULTS.size,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className,
      style,
    } = props;

    // getSizeStyle's switch below is keyed by the legacy 'small' | 'middle' | 'large'
    // spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');

    // Support both controlled (value prop provided) and uncontrolled modes.
    // When controlled, external state is the source of truth for the selection.
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
    // When loadData is provided, children are fetched on-demand as the user
    // expands nodes. A loading spinner replaces the expand arrow during fetch.

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
    // Hover expansion only fires when expandTrigger === 'hover'. Click
    // expansion handles both expanding parent nodes and selecting leaf nodes.

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

    // Expands a parent node by appending its children as a new column.
    // If the node has no children and loadData is provided, triggers an
    // async fetch first. loadData mutates the option object in-place
    // (adding children), then we re-read the children to build the column.
    const expandOption = async (option: CascaderOption, columnIndex: number) => {
      const newPath = [...selectedPath.slice(0, columnIndex), option];
      setSelectedPath(newPath);

      const children = getChildren(option, fieldNames);

      if (!children && !isLeaf(option, fieldNames) && loadData) {
        await triggerLoadData(option, selectedPath.slice(0, columnIndex));
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
        // No children means this column is the deepest level; trim any stale columns
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
    // When showSearch is enabled, all leaf paths are pre-flattened so the user
    // can type a query and see matching results across every hierarchy level.

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

    // Close the dropdown when clicking outside the container
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

    const getSizeStyle = (): React.CSSProperties => {
      switch (size) {
        case 'small': return { height: 'var(--ds-input-sm-height, 32px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' };
        case 'large': return { height: 'var(--ds-input-lg-height, 44px)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' };
        default: return { height: 'var(--ds-input-md-height, 40px)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' };
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
        className={`ds-cascader ds-cascader--modern relative ${className || ''}`}
        style={style}
        data-part="root"
      >
        <div
          className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            boxSizing: 'border-box',
            ...getSizeStyle(),
          }}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
          data-part="trigger"
          data-open={isOpen || undefined}
          data-disabled={disabled || undefined}
        >
          <span
            className="flex-1 truncate"
            data-part={selectedPath.length > 0 ? 'value' : 'placeholder'}
          >
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
            <button
              type="button"
              style={{ width: 24, height: 24, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)' }}
              onClick={handleClear}
              data-part="clear-button"
            >
              ✕
            </button>
          )}
          <span style={{ transition: 'transform var(--ds-motion-fast)' }} className={`${isOpen ? 'rotate-180' : ''}`} data-part="arrow-icon">&#9660;</span>
        </div>

        {isOpen && (
          <>
            <div data-part="dropdown" style={{ position: 'absolute', zIndex: 50, marginTop: 'var(--ds-spacing-1, 4px)', animation: 'ds-cascader-slide-in var(--ds-motion-fast) ease-out' }}>
            {/* Search input */}
            {showSearch && (
              <div className="p-2" data-part="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full"
                  data-part="search-input"
                  style={{
                    padding: '4px var(--ds-input-sm-padding-x, 10px)',
                    fontSize: 'var(--ds-input-sm-font-size, 13px)',
                    height: 'var(--ds-input-sm-height, 32px)',
                    boxSizing: 'border-box',
                    transition: 'all var(--ds-motion-fast)',
                  }}
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
                <ul data-part="option-list" style={{ listStyle: 'none', margin: 0, padding: 'var(--ds-spacing-1, 4px)', width: 256, maxHeight: 240, overflowY: 'auto' }}>
                  {filteredFlatOptions.length > 0 ? (
                    filteredFlatOptions.map((fo, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="flex justify-between"
                          onClick={() => handleSearchSelect(fo)}
                          data-part="option"
                        >
                          <span className="truncate">{fo.labels.join(' / ')}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="p-2" data-part="empty">{notFoundContent}</li>
                  )}
                </ul>
              </>
            ) : (
              <>
                {/* Normal cascading columns */}
                <div className="flex" data-part="option-list">
                  {activeColumns.map((column, colIndex) => (
                    <ul
                      key={colIndex}
                      data-part="menu-column"
                      data-last={colIndex === activeColumns.length - 1 || undefined}
                      style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 'var(--ds-spacing-1, 4px)',
                        width: 192,
                        maxHeight: 240,
                        overflowY: 'auto',
                        ...(colIndex > 0 ? { animation: 'ds-cascader-panel-in var(--ds-motion-fast) ease-out' } : {}),
                      }}
                    >
                      {column.length > 0 ? (
                        column.map((option) => {
                          const optValue = getValue(option, fieldNames);
                          const optLabel = getLabel(option, fieldNames);
                          const optChildren = getChildren(option, fieldNames);
                          const selectedOption = arrayValueAt(selectedPath, colIndex);
                          const isSelected = selectedOption && getValue(selectedOption, fieldNames) === optValue;
                          const isLoading = loadingKeys.has(optValue);
                          return (
                            <li key={String(optValue)}>
                              <button
                                type="button"
                                className={`flex justify-between ${option.disabled ? 'disabled' : ''} ${isSelected ? 'active font-medium' : ''}`}
                                style={{ transition: 'all var(--ds-motion-fast)' }}
                                disabled={option.disabled}
                                onClick={() => handleOptionClick(option, colIndex)}
                                onMouseEnter={() => handleOptionHover(option, colIndex)}
                                data-part="option"
                                data-selected={isSelected || undefined}
                                data-disabled={option.disabled || undefined}
                              >
                                <span className="truncate">{optLabel}</span>
                                {isLoading ? (
                                  <span data-part="loading" style={{ display: 'inline-block', width: 12, height: 12, animation: 'spin var(--ds-motion-glacial) linear infinite' }} />
                                ) : (
                                  (optChildren && optChildren.length > 0 || (!isLeaf(option, fieldNames) && loadData)) && (
                                    <span data-part="menu-item-arrow">›</span>
                                  )
                                )}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li className="p-2" data-part="empty">{notFoundContent}</li>
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
