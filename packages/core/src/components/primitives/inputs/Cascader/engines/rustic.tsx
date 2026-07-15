'use client';

/**
 * @fileoverview Cascader Rustic Engine - Rottay Design System.
 * Pure vanilla HTML/CSS implementation of a hierarchical option selector.
 * Uses CSS variables (--ds-cascader-*) for multi-tenant theming and renders
 * the dropdown via React portal for correct stacking-context behaviour.
 * Supports click/hover expansion, cross-level search, and async data loading.
 *
 * @example
 * ```tsx
 * <Cascader engine="rustic" options={regions} loadData={fetchChildren} showSearch />
 * ```
 *
 * @module Cascader/Engines/Rustic
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { arrayValueAt } from '@/_internal/utils/collections';
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../Cascader.types';
import { CASCADER_DEFAULTS } from '../Cascader.types';
import { toLegacySize } from '../../../../../contracts/common';

// ---------------------------------------------------------------------------
// Helpers for fieldNames mapping
// fieldNames allows consumers to use their own data shape (e.g., {name, id, items})
// instead of the default {label, value, children}. These accessors abstract
// the mapping so the rest of the component uses a uniform API.
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

function optionIsLeaf(option: CascaderOption, fn?: CascaderFieldNames): boolean {
  if (option.isLeaf !== undefined) return option.isLeaf;
  const children = getChildren(option, fn);
  return !children || children.length === 0;
}

// ---------------------------------------------------------------------------
// Flatten options for search
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

// Trigger height varies by size prop. Values resolve at runtime from CSS
// variables so each tenant can customise dimensions without code changes.
const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-cascader-sm-height)' },
  default: { height: 'var(--ds-cascader-md-height)' },
  large: { height: 'var(--ds-cascader-lg-height)' },
};

/**
 * Rustic Cascader component (pure HTML/CSS with CSS variables).
 *
 * The trigger element is rendered inline; the dropdown is portalled to
 * document.body to avoid overflow:hidden clipping from parent containers.
 * Position is calculated from the trigger's bounding rect on open.
 *
 * @param props - {@link CascaderProps}
 * @returns A cascader trigger with a portalled multi-column dropdown
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
      status,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className = '',
      style,
    } = props;

    // SIZE_CONFIG and the BEM class suffix below are keyed by the legacy
    // 'small' | 'middle' | 'large' spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');

    // Support both controlled and uncontrolled value modes
    const isControlled = controlledValue !== undefined;
    const value = (isControlled ? controlledValue : internalValue) as CascaderValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    // Recalculate portal dropdown position relative to the trigger element.
    // Runs every time the dropdown opens to handle layout shifts.
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
    }, [isOpen]);

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
    // Tracks loading state per-option key to show a spinner on the expanding node

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
    // Hover vs click expansion is determined by the expandTrigger prop.
    // Leaf nodes trigger selection instead of expansion.

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
      if (optionIsLeaf(option, fieldNames) && !loadData) {
        const newPath = [...selectedPath.slice(0, columnIndex), option];
        const newValue = newPath.map((opt) => getValue(opt, fieldNames)) as CascaderValue;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        setSelectedPath(newPath);
        onChange?.(newValue, newPath);
        handleOpenChange(false);
        setActiveColumns([options]);
      }
    };

    // Expands a node and adds its children as a new column. Also handles
    // the case where children are loaded asynchronously via loadData.
    const expandOption = async (option: CascaderOption, columnIndex: number) => {
      const newPath = [...selectedPath.slice(0, columnIndex), option];
      setSelectedPath(newPath);

      const children = getChildren(option, fieldNames);

      // Async load if no children and loadData provided
      if (!children && !optionIsLeaf(option, fieldNames) && loadData) {
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
      } else if (!loadData) {
        // Leaf node - complete selection
        const newValue = newPath.map((opt) => getValue(opt, fieldNames)) as CascaderValue;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue, newPath);
        handleOpenChange(false);
        setActiveColumns([options]);
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
    // Pre-flatten all leaf paths when search is enabled. Filtering happens
    // client-side against the concatenated labels for instant results.

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

    // Close dropdown when clicking outside both the trigger and the portal
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
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

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    // Build BEM-style class names for external CSS targeting if needed
    const containerClasses = [
      'rottay-cascader',
      'rottay-cascader--rustic',
      `rottay-cascader--${size}`,
      status && `rottay-cascader--${status}`,
      disabled && 'rottay-cascader--disabled',
      isOpen && 'rottay-cascader--open',
      className,
    ].filter(Boolean).join(' ');

    const triggerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      height: sizeConfig.height,
      padding: '0 12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--ds-font-family-base)',
      transition: 'var(--ds-transition-fast)',
      ...style,
    };

    const valueStyle: React.CSSProperties = {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const clearButtonStyle: React.CSSProperties = {
      cursor: 'pointer',
      padding: '0 4px',
      fontSize: '14px',
    };

    const arrowStyle: React.CSSProperties = {
      marginLeft: '8px',
      transition: 'transform 0.2s',
      fontSize: '10px',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1050,
      animation: 'ds-cascader-dropdown-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
      transformOrigin: 'top left',
    };

    const searchContainerStyle: React.CSSProperties = {
      padding: '8px',
    };

    const searchInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '6px 10px',
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const menuStyle = (): React.CSSProperties => ({
      listStyle: 'none',
      margin: 0,
      padding: '4px 0',
      minWidth: 'var(--ds-cascader-menu-width)',
      maxHeight: 'var(--ds-cascader-menu-height)',
      overflowY: 'auto',
    });

    // Item style reduces opacity for disabled options and bolds the
    // selected path; background/border-left now live in the skin CSS.
    const getItemStyle = (isSelected: boolean, isDisabled?: boolean): React.CSSProperties => ({
      padding: 'var(--ds-cascader-item-padding)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
      fontWeight: isSelected ? 600 : 'normal',
    });

    const emptyStyle: React.CSSProperties = {
      padding: 'var(--ds-cascader-item-padding)',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const spinnerStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '12px',
      height: '12px',
      animation: 'ds-cascader-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    };

    const isSearchMode = showSearch && searchValue.length > 0;

    // Portal the dropdown to document.body so it is not clipped by
    // parent overflow:hidden containers. SSR guard (typeof document)
    // prevents errors during server-side rendering.
    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-cascader__dropdown"
          data-part="dropdown"
          style={dropdownStyle}
        >
          {/* Search input */}
          {showSearch && (
            <div style={searchContainerStyle} data-part="search-input-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={searchInputStyle}
                data-part="search-input"
              />
            </div>
          )}

          {isSearchMode ? (
            /* Flat search results */
            <ul
              className="rottay-cascader__menu"
              data-part="option-list"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '4px 0',
                minWidth: '240px',
                maxHeight: 'var(--ds-cascader-menu-height)',
                overflowY: 'auto',
              }}
            >
              {filteredFlatOptions.length > 0 ? (
                filteredFlatOptions.map((fo, idx) => (
                  <li
                    key={idx}
                    className="rottay-cascader__item"
                    onClick={() => handleSearchSelect(fo)}
                    style={getItemStyle(false)}
                    data-part="option"
                  >
                    <span>{fo.labels.join(' / ')}</span>
                  </li>
                ))
              ) : (
                <li style={emptyStyle} data-part="empty">{notFoundContent}</li>
              )}
            </ul>
          ) : (
            /* Normal cascading columns */
            <div style={{ display: 'flex' }} data-part="option-list">
              {activeColumns.map((column, colIndex) => (
                <ul
                  key={colIndex}
                  className="rottay-cascader__menu"
                  data-part="menu-column"
                  data-last={colIndex === activeColumns.length - 1 || undefined}
                  style={menuStyle()}
                >
                  {column.length > 0 ? (
                    column.map((option) => {
                      const optValue = getValue(option, fieldNames);
                      const optLabel = getLabel(option, fieldNames);
                      const optChildren = getChildren(option, fieldNames);
                      const selectedOption = arrayValueAt(selectedPath, colIndex);
                      const isSelected = selectedOption && getValue(selectedOption, fieldNames) === optValue;
                      const isLoading = loadingKeys.has(optValue);
                      const hasExpandIndicator = (optChildren && optChildren.length > 0) || (!optionIsLeaf(option, fieldNames) && loadData);

                      return (
                        <li
                          key={String(optValue)}
                          className="rottay-cascader__item"
                          onClick={() => handleOptionClick(option, colIndex)}
                          onMouseEnter={() => handleOptionHover(option, colIndex)}
                          style={getItemStyle(!!isSelected, option.disabled)}
                          data-part="option"
                          data-selected={isSelected || undefined}
                          data-disabled={option.disabled || undefined}
                        >
                          <span>{optLabel}</span>
                          {isLoading ? (
                            <span style={spinnerStyle} data-part="loading" />
                          ) : (
                            hasExpandIndicator && (
                              <span data-part="menu-item-arrow">›</span>
                            )
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li style={emptyStyle} data-part="empty">{notFoundContent}</li>
                  )}
                </ul>
              ))}
            </div>
          )}
        </div>,
        document.body
      )
    ) : null;

    return (
      <>
        <div
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={containerClasses}
          style={triggerStyle}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
          data-part="trigger"
          data-open={isOpen || undefined}
          data-disabled={disabled || undefined}
          data-status={status || undefined}
        >
          <span style={valueStyle} data-part={selectedPath.length > 0 ? 'value' : 'placeholder'}>
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
              aria-label="Clear"
              data-part="clear-button"
            >
              ✕
            </button>
          )}
          <span style={arrowStyle} data-part="arrow-icon">▼</span>
        </div>
        {dropdownContent}
      </>
    );
  }
);

Cascader.displayName = 'Cascader.Rustic';

export default Cascader;
