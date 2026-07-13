/**
 * @fileoverview Select Rustic Engine (Vanilla HTML/CSS) - Rottay Design System.
 * Zero-dependency select component styled entirely via CSS custom properties
 * (`--ds-select-*`), making it fully themeable by tenants without any
 * framework-specific class overrides. Supports groups, virtual scroll,
 * token separators, keyboard navigation, and ARIA combobox semantics.
 *
 * @example
 * ```tsx
 * <Select engine="rustic" options={opts} searchable clearable size="md" />
 * ```
 *
 * @module RusticSelect
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
  useId,
} from 'react';
import type { SelectProps, SelectOption, SelectSize } from '../Select.types';
import { SELECT_DEFAULTS, SIZE_MAP } from '../Select.types';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '../../../layout/shared/responsive-props';
import type { ResponsiveValue } from '../../../layout/shared/types';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}
import { useTranslation } from '../../../../../i18n';
import {
  getLabelText,
  buildRenderableList,
  flatOptionsFromGroups,
  DEFAULT_ITEM_HEIGHT,
  DEFAULT_CONTAINER_HEIGHT,
  VIRTUAL_BUFFER,
} from '../utils';

/**
 * Rustic (Vanilla CSS) Select engine.
 *
 * Builds the entire select UI from raw HTML elements and inline styles driven
 * by CSS custom properties. Unlike the classic (antd) and modern (DaisyUI)
 * engines, this engine has no runtime dependency on a UI framework, which
 * makes it ideal for lightweight deployments and custom-branded tenants.
 *
 * @param props - Rottay SelectProps (engine-agnostic interface).
 * @param ref   - Forwarded to the search input or container element.
 * @returns The rendered vanilla-CSS Select with full DS feature support.
 *
 * @example
 * ```tsx
 * <RusticSelect
 *   options={items}
 *   multiple
 *   tokenSeparators={[',']}
 *   maxTagCount={5}
 * />
 * ```
 */
const RusticSelect = forwardRef<HTMLElement, SelectProps>((props, ref) => {
  const { t } = useTranslation('components');

  const {
    value,
    defaultValue,
    options: flatOptions = [],
    placeholder,
    size: sizeProp = SELECT_DEFAULTS.size,
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
    allowClear,
    showSearch,
    // New features
    optionGroups,
    virtual,
    tokenSeparators,
    forceCustomDropdown: _forceCustomDropdown,
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'min-height',
      value: sizeProp,
      resolve: (v: SelectSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).height,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: 'font-size',
      value: sizeProp,
      resolve: (v: SelectSize) => (SIZE_MAP[v as keyof typeof SIZE_MAP] || SIZE_MAP.md).fontSize,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `select-${reactId.replace(/:/g, '')}` : '';
  const responsiveCSS = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const size = scalarOrUndefined(sizeProp) ?? SELECT_DEFAULTS.size;

  // Use translation as default, allow prop override
  const displayPlaceholder = placeholder ?? t('select.placeholder');
  const noOptionsText = t('select.no_options');

  // The DS accepts both antd-style (allowClear, showSearch) and standard
  // prop names (clearable, searchable) for API compatibility across engines.
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

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
    const initial = value ?? defaultValue;
    if (initial === undefined) return [];
    return Array.isArray(initial) ? initial : [initial];
  });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [scrollTop, setScrollTop] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => {
    return inputRef.current ?? containerRef.current ?? document.createElement('div');
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

  // Build renderable list (with group headers if applicable).
  // When searching, flatten to plain options -- group headers would just be noise.
  // Without search, interleave group headers for visual organization.
  const renderableItems = useMemo(() => {
    if (isSearchable && searchValue) {
      return filteredOptions.map((opt) => ({ type: 'option' as const, option: opt }));
    }
    return buildRenderableList(filteredOptions, optionGroups);
  }, [filteredOptions, optionGroups, isSearchable, searchValue]);

  // Virtual scroll config
  const virtualEnabled = !!virtual;
  const itemHeight = virtual && typeof virtual === 'object' && virtual.itemHeight
    ? virtual.itemHeight
    : DEFAULT_ITEM_HEIGHT;
  const containerHeight = virtual && typeof virtual === 'object' && virtual.containerHeight
    ? virtual.containerHeight
    : DEFAULT_CONTAINER_HEIGHT;

  // Virtual scroll: only render items in the visible viewport plus a buffer
  // zone above and below. This keeps DOM node count constant regardless of
  // total option count (critical for selects with 10k+ options).
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

  // Handle selection -- multiple mode toggles (add/remove), single mode
  // replaces and closes the dropdown immediately.
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
      // Auto-close after single selection since there is nothing else to pick
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
    onChange?.(multiple ? [] : '', undefined);
    onClear?.();
  }, [multiple, onChange, onClear]);

  // Token separators (e.g., comma, Enter) allow users to type a value and
  // have it auto-matched to an existing option and added as a tag. This is
  // the "tag input" UX pattern common in email recipient pickers.
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (tokenSeparators && tokenSeparators.length > 0 && multiple) {
      const lastChar = rawValue.slice(-1);
      if (tokenSeparators.includes(lastChar)) {
        const token = rawValue.slice(0, -1).trim();
        if (token) {
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
    setFocusedIndex(0);
  }, [tokenSeparators, multiple, allOptions, internalValue, onChange, onSearch]);

  // Keyboard navigation operates on option-only items (skipping group headers).
  // ArrowUp/Down cycle with wrapping, Home/End jump to boundaries, Backspace
  // in multi mode removes the last selected tag (email-style deletion).
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    // Count only option items for keyboard navigation
    const optionItems = renderableItems.filter((item) => item.type === 'option');

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && optionItems[focusedIndex]) {
          const opt = optionItems[focusedIndex].option!;
          handleSelect(opt.value, opt);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => {
            const next = prev < optionItems.length - 1 ? prev + 1 : 0;
            scrollOptionIntoView(next);
            return next;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : optionItems.length - 1;
            scrollOptionIntoView(next);
            return next;
          });
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
          scrollOptionIntoView(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          const lastIndex = optionItems.length - 1;
          setFocusedIndex(lastIndex);
          scrollOptionIntoView(lastIndex);
        }
        break;
      case 'Backspace':
        if (multiple && !searchValue && internalValue.length > 0) {
          const newValue = internalValue.slice(0, -1);
          setInternalValue(newValue);
          const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
          onChange?.(newValue, selectedOpts);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }, [disabled, isOpen, focusedIndex, renderableItems, handleSelect, multiple, searchValue, internalValue, allOptions, onChange]);

  // Scroll focused option into view
  const scrollOptionIntoView = useCallback((index: number) => {
    if (listRef.current) {
      const optionElements = listRef.current.querySelectorAll('[role="option"]');
      if (optionElements[index]) {
        optionElements[index].scrollIntoView({ block: 'nearest' });
      }
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Reset focused index when options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredOptions.length]);

  // Get size values
  const sizeConfig = SIZE_MAP[size];

  // All visual properties reference CSS custom properties with fallback values
  // so the component renders correctly even without a loaded theme stylesheet.
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    ...style,
  };

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: `${sizeConfig.height}px`,
    padding: sizeConfig.padding,
    fontSize: `${sizeConfig.fontSize}px`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--ds-select-transition)',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    padding: '0.25rem 0',
    maxHeight: virtualEnabled ? `${containerHeight}px` : '16rem',
    overflowY: 'auto',
    zIndex: 1050,
    animation: 'ds-select-dropdown-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
    transformOrigin: 'top center',
  };

  // Build class names
  const containerClasses = [
    'rottay-select',
    'rottay-select--rustic',
    `rottay-select--${size}`,
    `rottay-select--${variant}`,
    isOpen && 'rottay-select--open',
    disabled && 'rottay-select--disabled',
    loading && 'rottay-select--loading',
    effectiveStatus !== 'default' && `rottay-select--${effectiveStatus}`,
    className,
  ].filter(Boolean).join(' ');

  // Display value
  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined
        ? selectedOptions.slice(0, maxTagCount)
        : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div data-part="value" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {visibleTags.map((opt) => (
            <span
              key={opt.value}
              data-part="tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.125rem 0.5rem',
                fontSize: '0.875em',
                transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
                cursor: 'default',
              }}
            >
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label}
              <button
                type="button"
                data-part="tag-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
                style={{
                  cursor: 'pointer',
                  padding: '0 0.125rem',
                  fontSize: '0.75rem',
                  lineHeight: 1,
                  transition: 'color 0.15s',
                }}
                aria-label={`Remove ${opt.label}`}
              >
                ×
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              data-part="tag-count"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.125rem 0.5rem',
                fontSize: '0.875em',
              }}
            >
              +{hiddenCount}
            </span>
          )}
        </div>
      );
    }

    return (
      <span data-part="value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {selectedOptions[0].icon && <span>{selectedOptions[0].icon}</span>}
        {selectedOptions[0].label}
      </span>
    );
  }, [selectedOptions, multiple, maxTagCount, handleSelect]);

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Map option values to their option-only indices so keyboard navigation
  // can map from a renderable item (which includes group headers) back to
  // the position used by focusedIndex (which counts only options).
  const optionIndexMap = useMemo(() => {
    const map = new Map<string | number, number>();
    let idx = 0;
    for (const item of renderableItems) {
      if (item.type === 'option' && item.option) {
        map.set(item.option.value, idx);
        idx++;
      }
    }
    return map;
  }, [renderableItems]);

  // Renders a single option row with multi-layered visual states: selected
  // (primary bg + checkmark), focused (left accent border + subtle inset
  // shadow), and disabled (reduced opacity + not-allowed cursor). All colors
  // are CSS-variable-driven for tenant customization.
  const renderOptionItem = (option: SelectOption, optionIdx: number) => {
    const isSelected = internalValue.includes(option.value);
    const isFocused = focusedIndex === optionIdx;

    return (
      <div
        key={option.value}
        id={`${id || 'select'}-option-${optionIdx}`}
        className={[
          'rottay-select__option',
          isSelected && 'rottay-select__option--selected',
          option.disabled && 'rottay-select__option--disabled',
          isFocused && 'rottay-select__option--focused',
        ].filter(Boolean).join(' ')}
        data-part="option"
        data-selected={isSelected || undefined}
        data-active={isFocused || undefined}
        data-disabled={option.disabled || undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          height: virtualEnabled ? `${itemHeight}px` : undefined,
          fontSize: `${sizeConfig.fontSize}px`,
          cursor: option.disabled ? 'not-allowed' : 'pointer',
          opacity: option.disabled ? 0.5 : 1,
          transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
        }}
        onClick={() => handleSelect(option.value, option)}
        onMouseEnter={() => setFocusedIndex(optionIdx)}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled}
      >
        {multiple && (
          <span
            data-part="option-checkbox"
            style={{
              width: '1rem',
              height: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              flexShrink: 0,
              transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {isSelected && <span style={{ animation: 'ds-select-check-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>✓</span>}
          </span>
        )}
        {option.icon && <span data-part="option-icon" style={{ flexShrink: 0 }}>{option.icon}</span>}
        <span>{option.label}</span>
        {!multiple && isSelected && (
          <span data-part="option-check" style={{
            marginLeft: 'auto',
            animation: 'ds-select-check-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'inline-block',
          }}>
            ✓
          </span>
        )}
      </div>
    );
  };

  const renderGroupHeader = (label: React.ReactNode, key: string | number) => (
    <div
      key={key}
      data-part="group-label"
      style={{
        padding: '0.5rem 0.75rem 0.25rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        height: virtualEnabled ? `${itemHeight}px` : undefined,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {label}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      data-part="root"
      data-open={isOpen || undefined}
      data-disabled={disabled || undefined}
      data-status={effectiveStatus !== 'default' ? effectiveStatus : undefined}
      style={containerStyle}
      onKeyDown={handleKeyDown}
    >
      {responsiveCSS && responsiveCSS.css && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCSS.css }} />
      )}

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={multiple ? internalValue.join(',') : internalValue[0] || ''}
        />
      )}

      {/* Trigger */}
      <div
        id={id}
        className="rottay-select__trigger"
        data-part="trigger"
        data-open={isOpen || undefined}
        data-disabled={disabled || undefined}
        style={triggerStyle}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
          }
        }}
        onFocus={onFocus as React.FocusEventHandler<HTMLDivElement>}
        onBlur={onBlur as React.FocusEventHandler<HTMLDivElement>}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-controls={`${id || 'select'}-listbox`}
        tabIndex={disabled ? -1 : 0}
        autoFocus={autoFocus}
      >
        {/* Search input or display value */}
        {isSearchable && isOpen ? (
          <input
            ref={inputRef}
            type="text"
            className="rottay-select__search"
            data-part="search-input"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder={selectedOptions.length === 0 ? displayPlaceholder : ''}
            style={{
              flex: 1,
              fontSize: 'inherit',
              minWidth: '3rem',
              caretColor: 'var(--ds-color-primary, #1677ff)',
            }}
            onClick={(e) => e.stopPropagation()}
            aria-autocomplete="list"
            aria-controls={`${id || 'select'}-listbox`}
          />
        ) : displayValue || (
          <span data-part="placeholder">{displayPlaceholder}</span>
        )}

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Clear button */}
        {isClearable && internalValue.length > 0 && !disabled && (
          <button
            type="button"
            className="rottay-select__clear"
            data-part="clear-button"
            onClick={handleClear}
            aria-label={t('select.clear')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1rem',
              height: '1rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            ×
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            data-part="loading"
            style={{ animation: 'ds-select-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        )}

        {/* Arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ds-select-arrow-color)"
          strokeWidth="2"
          data-part="arrow-icon"
          style={{
            marginLeft: '0.5rem',
            transition: 'var(--ds-select-transition)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          id={`${id || 'select'}-listbox`}
          className="rottay-select__dropdown"
          data-part="dropdown"
          style={dropdownStyle}
          role="listbox"
          aria-multiselectable={multiple}
          aria-activedescendant={focusedIndex >= 0 ? `${id || 'select'}-option-${focusedIndex}` : undefined}
          onScroll={virtualEnabled ? handleDropdownScroll : undefined}
        >
          {virtualEnabled ? (
            /* Virtual scrolling */
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: `${offsetY}px`, left: 0, right: 0 }}>
                {visibleItems.length === 0 ? (
                  <div
                    data-part="empty"
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    {noOptionsText}
                  </div>
                ) : (
                  visibleItems.map((item, idx) => {
                    if (item.type === 'group-header') {
                      return renderGroupHeader(item.groupLabel, `gh-${idx}`);
                    }
                    const optIdx = optionIndexMap.get(item.option!.value) ?? -1;
                    return renderOptionItem(item.option!, optIdx);
                  })
                )}
              </div>
            </div>
          ) : (
            /* Normal rendering */
            <>
              {renderableItems.length === 0 ? (
                <div
                  data-part="empty"
                  style={{
                    padding: '0.5rem 0.75rem',
                    textAlign: 'center',
                  }}
                >
                  {noOptionsText}
                </div>
              ) : (
                renderableItems.map((item, idx) => {
                  if (item.type === 'group-header') {
                    return renderGroupHeader(item.groupLabel, `gh-${idx}`);
                  }
                  const optIdx = optionIndexMap.get(item.option!.value) ?? -1;
                  return renderOptionItem(item.option!, optIdx);
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

RusticSelect.displayName = 'RusticSelect';

export default RusticSelect;
