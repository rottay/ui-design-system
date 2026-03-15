/**
 * @fileoverview Select Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the Select component.
 *
 * Features:
 * - Option groups: group options under headers with visual separator
 * - Virtual scrolling: only render visible options + buffer, fixed height container
 * - tokenSeparators: auto-create tags in multiple mode when separator typed
 * - Keyboard navigation: ArrowUp/ArrowDown/Home/End/Enter/Escape
 * - Focused option highlight with visual indication
 * - Dropdown slide-in animation
 *
 * @module ModernSelect
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
} from 'react';
import type { SelectProps, SelectOption } from '../Select.types';
import { SELECT_DEFAULTS } from '../Select.types';
import { useTranslation } from '../../../../../i18n';
import {
  getLabelText,
  buildRenderableList,
  flatOptionsFromGroups,
  DEFAULT_ITEM_HEIGHT,
  DEFAULT_CONTAINER_HEIGHT,
  VIRTUAL_BUFFER,
  type RenderableItem,
} from '../utils';

// DaisyUI size classes
const DAISY_SIZE_MAP = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: 'select-md',
  lg: 'select-lg',
  xl: 'select-lg', // DaisyUI doesn't have xl, use lg
};

// Status to DaisyUI color classes
const DAISY_STATUS_MAP = {
  default: '',
  error: 'select-error',
  warning: 'select-warning',
  success: 'select-success',
};

const ModernSelect = forwardRef<HTMLElement, SelectProps>((props, ref) => {
  const { t } = useTranslation('components');

  const {
    value,
    defaultValue,
    options: flatOptions = [],
    placeholder,
    size = SELECT_DEFAULTS.size,
    variant = SELECT_DEFAULTS.variant,
    multiple = SELECT_DEFAULTS.multiple,
    searchable,
    clearable,
    disabled = SELECT_DEFAULTS.disabled,
    loading = SELECT_DEFAULTS.loading,
    error = SELECT_DEFAULTS.error,
    maxTagCount,
    status = SELECT_DEFAULTS.status,
    filterOption,
    onChange,
    onSearch,
    onFocus,
    onBlur,
    onClear,
    className,
    style,
    name,
    id,
    autoFocus,
    // Aliases
    allowClear,
    showSearch,
    // New features
    optionGroups,
    virtual,
    tokenSeparators,
    ...rest
  } = props;

  // Use translation as default, allow prop override
  const displayPlaceholder = placeholder ?? t('select.placeholder');
  const noOptionsText = t('select.no_options');

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;

  // Merge flat options with group options
  const allOptions = useMemo(() => {
    if (optionGroups && optionGroups.length > 0) {
      return flatOptionsFromGroups(optionGroups);
    }
    return flatOptions;
  }, [flatOptions, optionGroups]);

  // State for searchable/multiple select with custom dropdown
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
    const initial = value ?? defaultValue;
    if (initial === undefined) return [];
    return Array.isArray(initial) ? initial : [initial];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useImperativeHandle(ref, () => {
    return nativeSelectRef.current ?? inputRef.current ?? containerRef.current ?? document.createElement('div');
  }, []);

  // Sync with controlled value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  // Default filter function
  const defaultFilter = useCallback((input: string, option?: SelectOption): boolean => {
    if (!option) return false;
    const labelText = getLabelText(option.label);
    return labelText.toLowerCase().includes(input.toLowerCase());
  }, []);

  // Filtered options based on search
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchValue) return allOptions;
    const filterFn = filterOption || defaultFilter;
    return allOptions.filter((opt) => filterFn(searchValue, opt));
  }, [allOptions, searchValue, isSearchable, filterOption, defaultFilter]);

  // Build renderable list (with group headers if applicable)
  const renderableItems = useMemo(() => {
    if (isSearchable && searchValue) {
      // When searching, show flat filtered results (no group headers)
      return filteredOptions.map((opt) => ({ type: 'option' as const, option: opt }));
    }
    return buildRenderableList(filteredOptions, optionGroups);
  }, [filteredOptions, optionGroups, isSearchable, searchValue]);

  // Build a list of only selectable option indices (for keyboard nav)
  const selectableIndices = useMemo(() => {
    const indices: number[] = [];
    renderableItems.forEach((item, idx) => {
      if (item.type === 'option' && item.option && !item.option.disabled) {
        indices.push(idx);
      }
    });
    return indices;
  }, [renderableItems]);

  // Virtual scroll config
  const virtualEnabled = !!virtual;
  const itemHeight = virtual && typeof virtual === 'object' && virtual.itemHeight
    ? virtual.itemHeight
    : DEFAULT_ITEM_HEIGHT;
  const containerHeight = virtual && typeof virtual === 'object' && virtual.containerHeight
    ? virtual.containerHeight
    : DEFAULT_CONTAINER_HEIGHT;

  // Virtual scroll: compute visible range
  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    if (!virtualEnabled) {
      return { visibleItems: renderableItems, totalHeight: 0, offsetY: 0 };
    }
    const total = renderableItems.length * itemHeight;
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
    const endIdx = Math.min(
      renderableItems.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + VIRTUAL_BUFFER,
    );
    return {
      visibleItems: renderableItems.slice(startIdx, endIdx),
      totalHeight: total,
      offsetY: startIdx * itemHeight,
    };
  }, [renderableItems, virtualEnabled, scrollTop, itemHeight, containerHeight]);

  // Get selected options
  const selectedOptions = useMemo(() => {
    return allOptions.filter((opt) => internalValue.includes(opt.value));
  }, [allOptions, internalValue]);

  // Handle selection
  const handleSelect = useCallback((optionValue: string | number, option: SelectOption) => {
    if (option.disabled) return;

    let newValue: (string | number)[];
    if (multiple) {
      if (internalValue.includes(optionValue)) {
        newValue = internalValue.filter((v) => v !== optionValue);
      } else {
        newValue = [...internalValue, optionValue];
      }
    } else {
      newValue = [optionValue];
      setIsOpen(false);
    }

    setInternalValue(newValue);
    setSearchValue('');

    if (onChange) {
      const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
      onChange(
        multiple ? newValue : newValue[0],
        multiple ? selectedOpts : selectedOpts[0]
      );
    }
  }, [multiple, internalValue, onChange, allOptions]);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue([]);
    setSearchValue('');
    setFocusedIndex(-1);
    onChange?.(multiple ? [] : '', undefined);
    onClear?.();
  }, [multiple, onChange, onClear]);

  // Handle token separators
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (tokenSeparators && tokenSeparators.length > 0 && multiple) {
      // Check if the last character is a separator
      const lastChar = rawValue.slice(-1);
      if (tokenSeparators.includes(lastChar)) {
        const token = rawValue.slice(0, -1).trim();
        if (token) {
          // Find matching option
          const matchOption = allOptions.find(
            (opt) => getLabelText(opt.label).toLowerCase() === token.toLowerCase()
              || String(opt.value) === token,
          );
          if (matchOption && !internalValue.includes(matchOption.value)) {
            const newValue = [...internalValue, matchOption.value];
            setInternalValue(newValue);
            const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
            onChange?.(newValue, selectedOpts);
          }
          setSearchValue('');
          onSearch?.('');
          return;
        }
      }
    }

    setSearchValue(rawValue);
    onSearch?.(rawValue);
    // Reset focused index when search changes
    setFocusedIndex(-1);
  }, [tokenSeparators, multiple, allOptions, internalValue, onChange, onSearch]);

  // Keyboard navigation handler for custom dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        if (selectableIndices.length > 0) {
          setFocusedIndex(selectableIndices[0]);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentPos = selectableIndices.indexOf(focusedIndex);
        const nextPos = currentPos < selectableIndices.length - 1 ? currentPos + 1 : 0;
        setFocusedIndex(selectableIndices[nextPos] ?? -1);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const currentPos = selectableIndices.indexOf(focusedIndex);
        const prevPos = currentPos > 0 ? currentPos - 1 : selectableIndices.length - 1;
        setFocusedIndex(selectableIndices[prevPos] ?? -1);
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (selectableIndices.length > 0) {
          setFocusedIndex(selectableIndices[0]);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (selectableIndices.length > 0) {
          setFocusedIndex(selectableIndices[selectableIndices.length - 1]);
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const item = renderableItems[focusedIndex];
          if (item?.type === 'option' && item.option && !item.option.disabled) {
            handleSelect(item.option.value, item.option);
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      }
      default:
        break;
    }
  }, [isOpen, focusedIndex, selectableIndices, renderableItems, handleSelect]);

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (isOpen && selectableIndices.length > 0) {
      // Focus the currently selected item or the first selectable item
      const selectedIdx = renderableItems.findIndex(
        (item) => item.type === 'option' && item.option && internalValue.includes(item.option.value)
      );
      if (selectedIdx >= 0 && selectableIndices.includes(selectedIdx)) {
        setFocusedIndex(selectedIdx);
      } else {
        setFocusedIndex(selectableIndices[0]);
      }
    } else if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display value (computed unconditionally for stable hooks)
  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined
        ? selectedOptions.slice(0, maxTagCount)
        : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div className="flex flex-wrap gap-1">
          {visibleTags.map((opt) => (
            <span key={opt.value} className="badge badge-sm gap-1">
              {opt.label}
              <button
                type="button"
                className="hover:bg-base-300 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
              >
                x
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="badge badge-sm badge-ghost">+{hiddenCount}</span>
          )}
        </div>
      );
    }

    return <span>{selectedOptions[0].label}</span>;
  }, [selectedOptions, multiple, maxTagCount, handleSelect]);

  // Dropdown animation styles
  const dropdownAnimationStyle: React.CSSProperties = {
    animation: 'rottay-select-slide-in 0.15s ease-out',
  };

  // For simple native select (non-searchable, non-multiple, no groups, no virtual)
  if (!isSearchable && !multiple && !optionGroups && !virtual) {
    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = allOptions.find((o) => String(o.value) === selectedValue);
      setInternalValue([selectedValue]);
      onChange?.(selectedValue, selectedOption);
    };

    // Strip invalid HTML props
    const {
      engine: _engine,
      readOnly: _readOnly,
      filterOption: _filterOption,
      onSearch: _onSearch,
      onClear: _onClear,
      prefix: _prefix,
      suffix: _suffix,
      children: _children,
      maxTagCount: _maxTagCount,
      searchable: _searchable,
      clearable: _clearable,
      allowClear: _allowClear,
      showSearch: _showSearch,
      error: _error,
      loading: _loading,
      optionGroups: _optionGroups,
      virtual: _virtual,
      tokenSeparators: _tokenSeparators,
      ...htmlProps
    } = rest as any;

    const selectClasses = [
      'select',
      variant !== 'flushed' ? 'select-bordered' : '',
      variant === 'filled' ? 'bg-base-200' : '',
      DAISY_SIZE_MAP[size],
      DAISY_STATUS_MAP[effectiveStatus],
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="relative w-full" style={style}>
        <select
          ref={nativeSelectRef}
          className={selectClasses}
          value={internalValue[0] ?? ''}
          disabled={disabled}
          required={rest.required}
          onChange={handleNativeChange}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
          name={name}
          id={id}
          autoFocus={autoFocus}
          style={variant === 'flushed' ? {
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
          } : undefined}
          {...htmlProps}
        >
          {displayPlaceholder && (
            <option value="" disabled>
              {displayPlaceholder}
            </option>
          )}
          {allOptions.map((option) => (
            <option key={String(option.value)} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {loading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2">
            <span className="loading loading-spinner loading-xs"></span>
          </span>
        )}
      </div>
    );
  }

  // Custom dropdown for searchable/multiple/groups/virtual
  const triggerClasses = [
    'select',
    variant !== 'flushed' ? 'select-bordered' : '',
    variant === 'filled' ? 'bg-base-200' : '',
    DAISY_SIZE_MAP[size],
    DAISY_STATUS_MAP[effectiveStatus],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    'w-full flex items-center justify-between',
  ].filter(Boolean).join(' ');

  const handleDropdownScroll = (e: React.UIEvent<HTMLUListElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Render a single option item with focus highlight
  const renderOptionItem = (item: RenderableItem, idx: number, isFocused: boolean) => {
    if (item.type === 'group-header') {
      return (
        <li key={`gh-${idx}`} className="menu-title">
          <span className="font-semibold text-xs text-base-content/60 uppercase tracking-wider">
            {item.groupLabel}
          </span>
        </li>
      );
    }
    const option = item.option!;
    const isSelected = internalValue.includes(option.value);
    return (
      <li key={option.value}>
        <a
          className={[
            isSelected ? 'active' : '',
            option.disabled ? 'disabled opacity-50' : '',
            isFocused ? 'focus' : '',
            'flex items-center gap-2 transition-colors duration-150',
          ].filter(Boolean).join(' ')}
          style={isFocused && !isSelected ? {
            backgroundColor: 'var(--ds-select-option-hover-bg, oklch(var(--b2)))',
          } : undefined}
          onClick={(e) => {
            e.preventDefault();
            if (!option.disabled) {
              handleSelect(option.value, option);
            }
          }}
          onMouseEnter={() => setFocusedIndex(idx)}
        >
          {multiple && (
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={isSelected}
              readOnly
            />
          )}
          {option.icon && <span>{option.icon}</span>}
          <span>{option.label}</span>
        </a>
      </li>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full" style={style} onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        className={triggerClasses}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
            if (!isOpen && isSearchable) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={variant === 'flushed' ? {
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        } : undefined}
      >
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {isSearchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="bg-transparent outline-none flex-1 min-w-0"
              value={searchValue}
              onChange={handleSearchInput}
              placeholder={selectedOptions.length === 0 ? displayPlaceholder : ''}
              onClick={(e) => e.stopPropagation()}
            />
          ) : displayValue || (
            <span className="text-base-content/50">{displayPlaceholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isClearable && internalValue.length > 0 && !disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
            >
              x
            </button>
          )}
          {loading && <span className="loading loading-spinner loading-xs"></span>}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={multiple ? internalValue.join(',') : internalValue[0] || ''}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={dropdownRef as unknown as React.RefObject<HTMLUListElement>}
          role="listbox"
          className="menu bg-base-100 rounded-box shadow-lg border border-base-300 absolute top-full left-0 right-0 mt-1 z-50 p-2"
          style={{
            ...(virtualEnabled ? {
              maxHeight: `${containerHeight}px`,
              overflowY: 'auto',
              position: 'absolute',
            } : {
              maxHeight: '15rem',
              overflowY: 'auto',
            }),
            ...dropdownAnimationStyle,
          }}
          onScroll={virtualEnabled ? handleDropdownScroll : undefined}
        >
          {virtualEnabled && (
            <li style={{ height: `${totalHeight}px`, position: 'relative', padding: 0, margin: 0 }}>
              <div style={{ position: 'absolute', top: `${offsetY}px`, left: 0, right: 0 }}>
                {visibleItems.length === 0 ? (
                  <div className="disabled p-2">
                    <span className="text-base-content/50">{noOptionsText}</span>
                  </div>
                ) : (
                  visibleItems.map((item, idx) => {
                    const realIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER) + idx;
                    if (item.type === 'group-header') {
                      return (
                        <div
                          key={`gh-${idx}`}
                          className="font-semibold text-xs text-base-content/60 uppercase tracking-wider px-3 pt-3 pb-1 border-t border-base-200 first:border-t-0"
                          style={{ height: `${itemHeight}px`, display: 'flex', alignItems: 'center' }}
                        >
                          {item.groupLabel}
                        </div>
                      );
                    }
                    const option = item.option!;
                    const isSelected = internalValue.includes(option.value);
                    const isFocused = realIdx === focusedIndex;
                    return (
                      <div
                        key={option.value}
                        style={{ height: `${itemHeight}px` }}
                      >
                        <a
                          className={[
                            isSelected ? 'active' : '',
                            option.disabled ? 'disabled opacity-50' : '',
                            isFocused ? 'focus' : '',
                            'flex items-center gap-2 transition-colors duration-150',
                          ].filter(Boolean).join(' ')}
                          style={isFocused && !isSelected ? {
                            backgroundColor: 'var(--ds-select-option-hover-bg, oklch(var(--b2)))',
                          } : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!option.disabled) {
                              handleSelect(option.value, option);
                            }
                          }}
                          onMouseEnter={() => setFocusedIndex(realIdx)}
                        >
                          {multiple && (
                            <input
                              type="checkbox"
                              className="checkbox checkbox-xs"
                              checked={isSelected}
                              readOnly
                            />
                          )}
                          {option.icon && <span>{option.icon}</span>}
                          <span>{option.label}</span>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            </li>
          )}

          {!virtualEnabled && (
            renderableItems.length === 0 ? (
              <li className="disabled">
                <span className="text-base-content/50">{noOptionsText}</span>
              </li>
            ) : (
              renderableItems.map((item, idx) => renderOptionItem(item, idx, idx === focusedIndex))
            )
          )}
        </ul>
      )}

      {/* Inline keyframe for dropdown animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rottay-select-slide-in {
          from {
            opacity: 0;
            transform: scaleY(0.95);
            transform-origin: top;
          }
          to {
            opacity: 1;
            transform: scaleY(1);
            transform-origin: top;
          }
        }
      `}} />
    </div>
  );
});

ModernSelect.displayName = 'ModernSelect';

export default ModernSelect;
