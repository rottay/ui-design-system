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
import { arrayValueAt } from '@/foundation/kernel/collections';
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../../contracts';
import { CASCADER_DEFAULTS } from '../../contracts';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/**
 * Hook-local `tOr`: catalogue value with an English floor -- when the
 * catalogue entry has not landed yet the provider echoes the full key, which
 * must never reach visible copy or an aria-label.
 */
function useCascaderTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
    return resolved;
  };
  return { tOr };
}

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
    const { tOr } = useCascaderTranslation();
    const {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      displayRender,
      expandTrigger = CASCADER_DEFAULTS.expandTrigger,
      placeholder: placeholderProp,
      disabled,
      showSearch,
      allowClear = CASCADER_DEFAULTS.allowClear,
      size: sizeProp = CASCADER_DEFAULTS.size,
      notFoundContent: notFoundContentProp,
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className,
      style,
    } = props;

    // Copy defaults: explicit props win; otherwise localized copy with the
    // historical English defaults (contract + pre-i18n literals) as the floor.
    const placeholder = placeholderProp ?? tOr('cascader.placeholder', 'Please select');
    const notFoundContent = notFoundContentProp ?? tOr('cascader.not_found', 'No data');

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
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // After a keyboard-driven expansion, DOM focus lands on the first option
    // of the freshly appended column (see handleDropdownKeyDown).
    const pendingColumnFocusRef = useRef(false);

    // Reading-direction probe (Tree/Segmented engine idiom).
    const isRtl = (el: HTMLElement): boolean => {
      const scoped = el.closest('[dir]');
      if (scoped) return scoped.getAttribute('dir') === 'rtl';
      return document.documentElement.dir === 'rtl';
    };

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

    // Focus the first option of a freshly appended column after a
    // keyboard-driven expansion (the column only exists post-render).
    useEffect(() => {
      if (!pendingColumnFocusRef.current) return;
      pendingColumnFocusRef.current = false;
      const columns = dropdownRef.current?.querySelectorAll('[data-part="menu-column"]');
      const last = columns?.[columns.length - 1];
      last?.querySelector<HTMLElement>('[data-part="option"]')?.focus();
    }, [activeColumns]);

    // APG multi-column keyboard contract: ArrowUp/Down cycle the options of
    // the CURRENT column; forward (ArrowRight in LTR) expands the focused
    // option and moves focus into the new column; backward collapses to the
    // selected option of the previous column; Escape closes and returns
    // focus to the trigger. Forward/backward swap under RTL (the column flow
    // mirrors). Options stay native buttons -- this only moves DOM focus.
    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleOpenChange(false);
        triggerRef.current?.focus();
        return;
      }
      const target = e.target as HTMLElement;
      const optionEl = target.closest?.('[data-part="option"]') as HTMLElement | null;
      if (!optionEl) return;

      const columnEl = optionEl.closest('ul');
      if (!columnEl) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const columnOptions = Array.from(
          columnEl.querySelectorAll<HTMLElement>('[data-part="option"]:not(:disabled)'),
        );
        if (columnOptions.length === 0) return;
        const currentIndex = columnOptions.indexOf(optionEl);
        const nextIndex = currentIndex < 0
          ? 0
          : (currentIndex + (e.key === 'ArrowDown' ? 1 : -1) + columnOptions.length) % columnOptions.length;
        columnOptions[nextIndex]?.focus();
        return;
      }

      // Column drills only apply to the cascading layout (not search results).
      if (!optionEl.closest('[data-part="menu-column"]')) return;
      const columnsWrap = optionEl.closest('[data-part="option-list"]');
      if (!columnsWrap) return;
      const columnIndex = Array.from(
        columnsWrap.querySelectorAll(':scope > [data-part="menu-column"]'),
      ).indexOf(columnEl as Element);
      if (columnIndex < 0) return;
      const rtl = isRtl(optionEl);
      const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

      if (e.key === forwardKey) {
        const rawIndex = Array.from(columnEl.querySelectorAll('[data-part="option"]')).indexOf(optionEl);
        const option = arrayValueAt(activeColumns[columnIndex] ?? [], rawIndex);
        if (!option) return;
        const expandable =
          (getChildren(option, fieldNames)?.length ?? 0) > 0 ||
          (!isLeaf(option, fieldNames) && !!loadData);
        if (!expandable) return;
        e.preventDefault();
        pendingColumnFocusRef.current = true;
        void expandOption(option, columnIndex);
        return;
      }
      if (e.key === backwardKey) {
        if (columnIndex === 0) return;
        e.preventDefault();
        const prevColumn = columnsWrap.querySelectorAll(':scope > [data-part="menu-column"]')[columnIndex - 1];
        const focusTarget =
          prevColumn?.querySelector<HTMLElement>('[data-part="option"][data-selected="true"]') ??
          prevColumn?.querySelector<HTMLElement>('[data-part="option"]');
        focusTarget?.focus();
      }
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
        className={`ds-cascader ds-cascader--modern ${className || ''}`}
        style={style}
        data-part="root"
      >
        <div
          ref={triggerRef}
          style={{
            boxSizing: 'border-box',
            ...getSizeStyle(),
          }}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              if (!isOpen) handleOpenChange(true);
            } else if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              handleOpenChange(false);
            }
          }}
          data-part="trigger"
          data-open={isOpen || undefined}
          data-disabled={disabled || undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={placeholder}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
        >
          <span
            data-part={selectedPath.length > 0 ? 'value' : 'placeholder'}
          >
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {/* Governed chevron; the open rotation is skin-owned via data-open. */}
          <span data-part="arrow-icon" aria-hidden="true">
            <NavigationDownIcon decorative size={12} />
          </span>
        </div>

        {/* Clear lives OUTSIDE the combobox trigger: APG forbids interactive
            controls nested inside the interactive combobox element. The skin
            overlays it at the trigger's inline end. */}
        {allowClear && selectedPath.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            data-part="clear-button"
            aria-label={tOr('cascader.clear', 'Clear')}
          >
            <ActionCloseIcon decorative size={12} />
          </button>
        )}

        {isOpen && (
          <>
            {/* The dropdown is a plain container (no role): APG forbids
                interactive content inside a listbox, so the search input sits
                OUTSIDE any listbox and each column is its own listbox of
                role="option" rows. */}
            <div data-part="dropdown" ref={dropdownRef} onKeyDown={handleDropdownKeyDown}>
            {/* Search input */}
            {showSearch && (
              <div data-part="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  data-part="search-input"
                  style={{
                    padding: '4px var(--ds-input-sm-padding-x, 10px)',
                    fontSize: 'var(--ds-input-sm-font-size, 13px)',
                    height: 'var(--ds-input-sm-height, 32px)',
                    boxSizing: 'border-box',
                  }}
                  placeholder={tOr('cascader.search_placeholder', 'Search...')}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {isSearchMode ? (
              <>
                {/* Flat search results: one listbox of matching leaf paths. */}
                <ul data-part="option-list" role="listbox" aria-label={tOr('cascader.search_results', 'Search results')}>
                  {filteredFlatOptions.length > 0 ? (
                    filteredFlatOptions.map((fo, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => handleSearchSelect(fo)}
                          data-part="option"
                          role="option"
                          aria-selected={false}
                        >
                          <span data-part="option-label">{fo.labels.join(' / ')}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li data-part="empty">{notFoundContent}</li>
                  )}
                </ul>
              </>
            ) : (
              <>
                {/* Normal cascading columns */}
                <div data-part="option-list">
                  {activeColumns.map((column, colIndex) => (
                    <ul
                      key={colIndex}
                      data-part="menu-column"
                      data-last={colIndex === activeColumns.length - 1 || undefined}
                      role="listbox"
                      aria-label={tOr('cascader.column_label', `Level ${colIndex + 1}`)}
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
                                disabled={option.disabled}
                                onClick={() => handleOptionClick(option, colIndex)}
                                onMouseEnter={() => handleOptionHover(option, colIndex)}
                                data-part="option"
                                data-selected={isSelected || undefined}
                                data-disabled={option.disabled || undefined}
                                role="option"
                                aria-selected={!!isSelected}
                              >
                                <span data-part="option-label">{optLabel}</span>
                                {isLoading ? (
                                  <span data-part="loading" />
                                ) : (
                                  (optChildren && optChildren.length > 0 || (!isLeaf(option, fieldNames) && loadData)) && (
                                    /* Governed chevron; the icon facade mirrors
                                       it under RTL (autoMirror). */
                                    <span data-part="chevron" aria-hidden="true">
                                      <NavigationForwardIcon decorative size={12} />
                                    </span>
                                  )
                                )}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li data-part="empty">{notFoundContent}</li>
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
