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
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../Cascader.types';
import { CASCADER_DEFAULTS } from '../Cascader.types';

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
      size = CASCADER_DEFAULTS.size,
      status,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isFocused, setIsFocused] = useState(false);
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
      setIsFocused(newOpen);
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

    // Border color changes based on validation status and focus state
    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-cascader-border-error)';
      if (status === 'warning') return 'var(--ds-cascader-border-warning)';
      if (isFocused) return 'var(--ds-cascader-border-focus)';
      return 'var(--ds-cascader-border)';
    };

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
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--ds-cascader-radius)',
      backgroundColor: 'var(--ds-cascader-bg)',
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
      color: selectedPath.length > 0 ? 'inherit' : 'var(--ds-cascader-placeholder-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const clearButtonStyle: React.CSSProperties = {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ds-cascader-clear-color)',
      padding: '0 4px',
      fontSize: '14px',
    };

    const arrowStyle: React.CSSProperties = {
      marginLeft: '8px',
      transition: 'transform 0.2s',
      transform: isOpen ? 'rotate(180deg)' : 'none',
      fontSize: '10px',
      color: 'var(--ds-cascader-arrow-color)',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--ds-cascader-dropdown-bg)',
      borderRadius: 'var(--ds-cascader-dropdown-radius)',
      boxShadow: 'var(--ds-card-shadow, var(--ds-cascader-dropdown-shadow))',
      zIndex: 1050,
      animation: 'rottay-cascader-dropdown-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
      transformOrigin: 'top left',
    };

    const searchContainerStyle: React.CSSProperties = {
      padding: '8px',
      borderBottom: '1px solid var(--ds-cascader-menu-border)',
    };

    const searchInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '6px 10px',
      border: '1px solid var(--ds-cascader-border)',
      borderRadius: 'var(--ds-cascader-radius)',
      fontSize: 'var(--ds-font-size-sm)',
      outline: 'none',
      backgroundColor: 'var(--ds-cascader-bg)',
      transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const menuStyle = (colIndex: number, totalCols: number): React.CSSProperties => ({
      listStyle: 'none',
      margin: 0,
      padding: '4px 0',
      minWidth: 'var(--ds-cascader-menu-width)',
      maxHeight: 'var(--ds-cascader-menu-height)',
      overflowY: 'auto',
      borderRight: colIndex < totalCols - 1 ? `1px solid var(--ds-cascader-menu-border)` : 'none',
    });

    // Item style highlights the selected path with a left border accent
    // and reduces opacity for disabled options
    const getItemStyle = (isSelected: boolean, isDisabled?: boolean): React.CSSProperties => ({
      padding: 'var(--ds-cascader-item-padding)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: isSelected ? 'var(--ds-cascader-item-bg-selected)' : 'transparent',
      opacity: isDisabled ? 0.5 : 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
      borderLeft: isSelected ? '3px solid var(--ds-color-primary, #1677ff)' : '3px solid transparent',
      fontWeight: isSelected ? 600 : 'normal',
    });

    const emptyStyle: React.CSSProperties = {
      padding: 'var(--ds-cascader-item-padding)',
      color: 'var(--ds-cascader-empty-color)',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const spinnerStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '12px',
      height: '12px',
      border: '2px solid var(--ds-cascader-arrow-color)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'rottay-cascader-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
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
          style={dropdownStyle}
        >
          {/* Search input */}
          {showSearch && (
            <div style={searchContainerStyle}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={searchInputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ds-color-primary, #1677ff)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 119, 255, 0.15), 0 0 8px rgba(22, 119, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ds-cascader-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          {isSearchMode ? (
            /* Flat search results */
            <ul
              className="rottay-cascader__menu"
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ds-cascader-item-bg-hover)';
                      e.currentTarget.style.borderLeft = '3px solid var(--ds-color-primary, #1677ff)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderLeft = '3px solid transparent';
                    }}
                  >
                    <span>{fo.labels.join(' / ')}</span>
                  </li>
                ))
              ) : (
                <li style={emptyStyle}>{notFoundContent}</li>
              )}
            </ul>
          ) : (
            /* Normal cascading columns */
            <div style={{ display: 'flex' }}>
              {activeColumns.map((column, colIndex) => (
                <ul
                  key={colIndex}
                  className="rottay-cascader__menu"
                  style={menuStyle(colIndex, activeColumns.length)}
                >
                  {column.length > 0 ? (
                    column.map((option) => {
                      const optValue = getValue(option, fieldNames);
                      const optLabel = getLabel(option, fieldNames);
                      const optChildren = getChildren(option, fieldNames);
                      const isSelected = selectedPath[colIndex] && getValue(selectedPath[colIndex], fieldNames) === optValue;
                      const isLoading = loadingKeys.has(optValue);
                      const hasExpandIndicator = (optChildren && optChildren.length > 0) || (!optionIsLeaf(option, fieldNames) && loadData);

                      return (
                        <li
                          key={String(optValue)}
                          className="rottay-cascader__item"
                          onClick={() => handleOptionClick(option, colIndex)}
                          onMouseEnter={(e) => {
                            handleOptionHover(option, colIndex);
                            if (!option.disabled && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'var(--ds-cascader-item-bg-hover)';
                              e.currentTarget.style.borderLeft = '3px solid var(--ds-color-primary, #1677ff)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderLeft = '3px solid transparent';
                            }
                          }}
                          style={getItemStyle(!!isSelected, option.disabled)}
                        >
                          <span>{optLabel}</span>
                          {isLoading ? (
                            <span style={spinnerStyle} />
                          ) : (
                            hasExpandIndicator && (
                              <span style={{ color: 'var(--ds-cascader-arrow-color)' }}>›</span>
                            )
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li style={emptyStyle}>{notFoundContent}</li>
                  )}
                </ul>
              ))}
            </div>
          )}

          {/* Spinner + dropdown keyframes */}
          <style>{`
            @keyframes rottay-cascader-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes rottay-cascader-dropdown-in {
              from { opacity: 0; transform: scaleY(0.95) translateY(-4px); }
              to { opacity: 1; transform: scaleY(1) translateY(0); }
            }
          `}</style>
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
        >
          <span style={valueStyle}>
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
          <span style={arrowStyle}>▼</span>
        </div>
        {dropdownContent}
      </>
    );
  }
);

Cascader.displayName = 'Cascader.Rustic';

export default Cascader;
