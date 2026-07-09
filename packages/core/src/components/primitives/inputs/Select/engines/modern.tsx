/**
 * @fileoverview Select Modern Engine (Premium) - Rottay Design System.
 * Renders a fully custom dropdown select styled with CSS custom properties
 * for a precise, calm, editorial feel -- inspired by Linear, Vercel, and
 * Stripe Dashboard controls. Native `<select>` fallback for simple cases.
 *
 * **Token Usage:**
 * - Surface: `--ds-surface-control` (trigger), `--ds-surface-card` (dropdown)
 * - Border: `--ds-color-border`, focus: `--ds-color-primary`
 * - Radius: `--ds-radius-md` (trigger), `--ds-radius-lg` (dropdown), `--ds-radius-sm` (items)
 * - Elevation: `--ds-elevation-3` (dropdown shadow)
 * - Focus ring: `--ds-focus-ring-width`, `--ds-focus-ring-offset`, `--ds-focus-ring-color`
 * - Motion: `--ds-motion-fast` (var(--ds-motion-fast)), `--ds-motion-ease-out`
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
  useId,
} from 'react';
import { createPortal } from 'react-dom';
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
  type RenderableItem,
} from '../utils';

/* ------------------------------------------------------------------ */
/*  Sizing tokens (matching Input for visual consistency)              */
/* ------------------------------------------------------------------ */

const SIZES = {
  xs: { height: '28px', paddingX: '8px',  fontSize: '12px', lineHeight: '16px' },
  sm: { height: '32px', paddingX: '10px', fontSize: '14px', lineHeight: '20px' },
  md: { height: '36px', paddingX: '12px', fontSize: '14px', lineHeight: '20px' },
  lg: { height: '40px', paddingX: '14px', fontSize: '16px', lineHeight: '24px' },
  xl: { height: '44px', paddingX: '16px', fontSize: '16px', lineHeight: '24px' },
} as const;

/* ------------------------------------------------------------------ */
/*  Shared transition string                                           */
/* ------------------------------------------------------------------ */

const TRANSITION = 'border-color var(--ds-motion-fast) var(--ds-motion-ease-out), outline-color var(--ds-motion-fast) var(--ds-motion-ease-out), outline-offset var(--ds-motion-fast) var(--ds-motion-ease-out), background-color var(--ds-motion-fast) var(--ds-motion-ease-out)';

/* ------------------------------------------------------------------ */
/*  Trigger shell builder (matches Input shell exactly)                */
/* ------------------------------------------------------------------ */

function buildTriggerStyle(
  size: keyof typeof SIZES,
  variant: string,
  isOpen: boolean,
  isHovered: boolean,
  hasError: boolean,
  hasWarning: boolean,
  isDisabled: boolean,
): React.CSSProperties {
  const s = SIZES[size];

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    minHeight: s.height,
    paddingLeft: s.paddingX,
    paddingRight: s.paddingX,
    fontSize: s.fontSize,
    lineHeight: s.lineHeight,
    fontFamily: 'inherit',
    color: 'var(--ds-color-text-primary)',
    backgroundColor: 'var(--ds-select-bg, var(--ds-surface-control))',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-border)',
    borderRadius: 'var(--ds-radius-md, 8px)',
    outline: 'var(--ds-focus-ring-width, 2px) solid transparent',
    outlineOffset: 'var(--ds-focus-ring-offset, 2px)',
    transition: TRANSITION,
    boxSizing: 'border-box',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
  };

  // Variant overrides
  if (variant === 'filled') {
    base.backgroundColor = 'var(--ds-select-filled-bg, var(--ds-surface-canvas))';
    base.borderColor = 'transparent';
  } else if (variant === 'flushed') {
    base.borderRadius = '0';
    base.borderWidth = '0';
    base.borderColor = 'transparent';
    base.borderBottomWidth = '1px';
    base.borderBottomStyle = 'solid';
    base.borderBottomColor = 'var(--ds-color-border)';
    base.paddingLeft = '0';
    base.paddingRight = '0';
    base.backgroundColor = 'transparent';
  } else if (variant === 'default') {
    // Same as outline
  }

  // Hover
  if (isHovered && !isOpen && !hasError && !hasWarning && !isDisabled) {
    base.borderColor = 'var(--ds-color-border-hover)';
    base.backgroundColor = 'var(--ds-select-bg-hover, var(--ds-select-bg, var(--ds-surface-control)))';
  }

  // Open (focus)
  if (isOpen) {
    base.borderColor = 'var(--ds-color-primary)';
    base.backgroundColor = 'var(--ds-select-bg-focus, var(--ds-select-bg, var(--ds-surface-control)))';
    base.outline = 'var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color)';
    if (variant === 'flushed') {
      base.outline = 'none';
      base.borderBottomWidth = '2px';
      base.borderBottomColor = 'var(--ds-color-primary)';
    }
  }

  // Error
  if (hasError) {
    base.borderColor = 'var(--ds-color-error)';
    base.backgroundColor = 'color-mix(in srgb, var(--ds-color-error) 4%, transparent)';
    if (isOpen) {
      base.outline = 'var(--ds-focus-ring-width, 2px) solid color-mix(in srgb, var(--ds-color-error) 15%, transparent)';
    }
  }

  // Warning
  if (hasWarning && !hasError) {
    base.borderColor = 'var(--ds-color-warning)';
    base.backgroundColor = 'color-mix(in srgb, var(--ds-color-warning) 4%, transparent)';
    if (isOpen) {
      base.outline = 'var(--ds-focus-ring-width, 2px) solid color-mix(in srgb, var(--ds-color-warning) 15%, transparent)';
    }
  }

  // Disabled
  if (isDisabled) {
    base.opacity = 0.5;
    base.cursor = 'not-allowed';
    base.backgroundColor = 'var(--ds-select-bg-disabled, var(--ds-surface-canvas))';
  }

  return base;
}

/* ------------------------------------------------------------------ */
/*  Dropdown panel style                                               */
/* ------------------------------------------------------------------ */

const DROPDOWN_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + var(--ds-spacing-1, 4px))',
  left: 0,
  right: 0,
  zIndex: 180,
  background:
    'var(--ds-select-dropdown-bg, linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 97%, white 3%), color-mix(in srgb, var(--ds-color-bg-primary) 22%, var(--ds-surface-card))))',
  border: '1px solid var(--ds-select-dropdown-border-color, color-mix(in srgb, var(--ds-color-border-secondary) 72%, transparent))',
  borderRadius: 14,
  boxShadow: 'var(--ds-select-dropdown-shadow, var(--ds-shadow-popover, var(--ds-shadow-lg, var(--ds-card-shadow))))',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '4px',
  overflow: 'hidden',
  transformOrigin: 'top center',
};

/* ------------------------------------------------------------------ */
/*  Checkmark icon for selected items                                  */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Chevron icon                                                       */
/* ------------------------------------------------------------------ */

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        color: 'var(--ds-color-text-muted)',
        transition: 'transform var(--ds-motion-fast) var(--ds-motion-ease-out)',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Search icon                                                        */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--ds-color-text-muted)' }}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Clear button                                                       */
/* ------------------------------------------------------------------ */

function ClearButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear selection"
      tabIndex={-1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        padding: 0,
        border: 'none',
        borderRadius: 'var(--ds-radius-sm, 6px)',
        backgroundColor: 'transparent',
        color: 'var(--ds-color-text-muted)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color var(--ds-motion-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ds-surface-canvas)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Keyframe injection (once)                                          */
/* ------------------------------------------------------------------ */

const KEYFRAME_CSS = `
@keyframes rottay-select-appear {
  from {
    opacity: 0;
    transform: scale(var(--ds-motion-scale-in)) translateY(var(--ds-motion-offset-in));
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Modern (premium) Select engine.
 *
 * For simple selects (non-searchable, single, no groups/virtual), renders a
 * styled native `<select>` for maximum accessibility and mobile compatibility.
 * For advanced cases (searchable, multiple, groups, virtual scroll), renders
 * a custom dropdown with full keyboard navigation.
 */
const ModernSelect = forwardRef<HTMLElement, SelectProps>((props, ref) => {
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
    // Aliases
    allowClear,
    showSearch,
    // New features
    optionGroups,
    virtual,
    tokenSeparators,
    forceCustomDropdown = false,
    ...rest
  } = props;

  // Responsive size handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'height',
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

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;
  const hasError = error || status === 'error';
  const hasWarning = !hasError && status === 'warning';

  // Flatten grouped options
  const allOptions = useMemo(() => {
    if (optionGroups && optionGroups.length > 0) {
      return flatOptionsFromGroups(optionGroups);
    }
    return flatOptions;
  }, [flatOptions, optionGroups]);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

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

  // Build renderable list
  const renderableItems = useMemo(() => {
    if (isSearchable && searchValue) {
      return filteredOptions.map((opt) => ({ type: 'option' as const, option: opt }));
    }
    return buildRenderableList(filteredOptions, optionGroups);
  }, [filteredOptions, optionGroups, isSearchable, searchValue]);

  const hasRichDropdownOptions = useMemo(
    () => allOptions.some((option) => Boolean(option.icon || option.description)),
    [allOptions],
  );

  // Selectable indices (skip headers + disabled)
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

  // Selected options
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
    setFocusedIndex(-1);
  }, [tokenSeparators, multiple, allOptions, internalValue, onChange, onSearch]);

  // Keyboard navigation
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

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const rect = containerRef.current.getBoundingClientRect();
    const gutter = 12;
    const minWidth = hasRichDropdownOptions ? 320 : 240;
    const maxWidth = Math.min(hasRichDropdownOptions ? 440 : window.innerWidth - gutter * 2, window.innerWidth - gutter * 2);
    const width = Math.min(Math.max(rect.width, minWidth), maxWidth);
    const left = Math.min(Math.max(gutter, rect.left), window.innerWidth - width - gutter);

    setDropdownPosition({
      top: rect.bottom + 6,
      left,
      width,
    });
  }, [hasRichDropdownOptions]);

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    const handleViewportChange = () => updateDropdownPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updateDropdownPosition]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;

      if (containerRef.current) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display value
  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined
        ? selectedOptions.slice(0, maxTagCount)
        : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1, 4px)', alignItems: 'center' }}>
          {visibleTags.map((opt) => (
            <span
              key={opt.value}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1, 4px)',
                padding: '1px var(--ds-spacing-2, 8px)',
                fontSize: 'var(--ds-font-size-xs, 12px)',
                lineHeight: 'var(--ds-line-height-xs, 20px)',
                borderRadius: 'var(--ds-radius-sm, 6px)',
                backgroundColor: 'var(--ds-surface-canvas)',
                color: 'var(--ds-color-text-primary)',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '14px',
                  height: '14px',
                  padding: 0,
                  border: 'none',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  color: 'var(--ds-color-text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'color var(--ds-motion-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ds-color-text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ds-color-text-muted)'; }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1px var(--ds-spacing-2, 8px)',
              fontSize: 'var(--ds-font-size-xs, 12px)',
              lineHeight: 'var(--ds-line-height-xs, 20px)',
              borderRadius: 'var(--ds-radius-sm, 6px)',
              backgroundColor: 'var(--ds-surface-canvas)',
              color: 'var(--ds-color-text-muted)',
            }}>
              +{hiddenCount}
            </span>
          )}
        </div>
      );
    }

    return <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOptions[0].label}</span>;
  }, [selectedOptions, multiple, maxTagCount, handleSelect]);

  /* ---------------------------------------------------------------- */
  /*  Native <select> fallback for simple cases                        */
  /* ---------------------------------------------------------------- */

  if (!forceCustomDropdown && !isSearchable && !multiple && !optionGroups && !virtual) {
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
      forceCustomDropdown: _forceCustomDropdown,
      ...htmlProps
    } = rest as any;

    const s = SIZES[size as keyof typeof SIZES] || SIZES.md;

    const nativeSelectStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      height: s.height,
      paddingLeft: s.paddingX,
      paddingRight: '32px', // space for native arrow
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      fontFamily: 'inherit',
      color: 'var(--ds-color-text-primary)',
      backgroundColor: 'var(--ds-surface-control)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--ds-color-border)',
      borderRadius: 'var(--ds-radius-md, 8px)',
      outline: 'var(--ds-focus-ring-width, 2px) solid transparent',
      outlineOffset: 'var(--ds-focus-ring-offset, 2px)',
      transition: TRANSITION,
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A0A0A5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `right ${s.paddingX} center`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    };

    // Variant overrides for native
    if (variant === 'filled') {
      nativeSelectStyle.backgroundColor = 'var(--ds-surface-canvas)';
      nativeSelectStyle.borderColor = 'transparent';
    } else if (variant === 'flushed') {
      nativeSelectStyle.borderRadius = '0';
      nativeSelectStyle.borderWidth = '0';
      nativeSelectStyle.borderColor = 'transparent';
      nativeSelectStyle.borderBottomWidth = '1px';
      nativeSelectStyle.borderBottomStyle = 'solid';
      nativeSelectStyle.borderBottomColor = 'var(--ds-color-border)';
      nativeSelectStyle.paddingLeft = '0';
      nativeSelectStyle.backgroundColor = 'transparent';
    }

    // Error/warning for native
    if (hasError) {
      nativeSelectStyle.borderColor = 'var(--ds-color-error)';
      nativeSelectStyle.backgroundColor = 'color-mix(in srgb, var(--ds-color-error) 4%, transparent)';
    } else if (hasWarning) {
      nativeSelectStyle.borderColor = 'var(--ds-color-warning)';
      nativeSelectStyle.backgroundColor = 'color-mix(in srgb, var(--ds-color-warning) 4%, transparent)';
    }

    // Focus style for native select via CSS class
    const nativeFocusId = `ds-sel-${reactId.replace(/:/g, '')}`;
    const nativeFocusCSS = `
      .${nativeFocusId}:focus {
        border-color: var(--ds-color-primary);
        outline: var(--ds-focus-ring-width, 2px) solid var(--ds-focus-ring-color);
      }
      .${nativeFocusId}:hover:not(:focus):not(:disabled) {
        border-color: var(--ds-color-border-hover);
      }
    `;

    return (
      <div className={className} style={{ ...style, position: 'relative' }}>
        {responsiveCSS && responsiveCSS.css && (
          <style dangerouslySetInnerHTML={{ __html: responsiveCSS.css }} />
        )}
        <style dangerouslySetInnerHTML={{ __html: nativeFocusCSS }} />
        <select
          ref={nativeSelectRef}
          {...(responsiveCSS ? responsiveCSS.attrs : {})}
          className={nativeFocusId}
          style={nativeSelectStyle}
          value={internalValue[0] ?? ''}
          disabled={disabled}
          required={rest.required}
          onChange={handleNativeChange}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
          name={name}
          id={id}
          autoFocus={autoFocus}
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
          <span
            className="rottay-select__loading-indicator"
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '32px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'inline-flex',
            }}
          >
            <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--ds-color-border)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin var(--ds-motion-glacial) linear infinite' }} />
          </span>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Custom dropdown for advanced cases                               */
  /* ---------------------------------------------------------------- */

  const triggerStyle = buildTriggerStyle(
    size as keyof typeof SIZES,
    variant,
    isOpen,
    isHovered,
    hasError,
    hasWarning,
    disabled,
  );

  const {
    engine: _customEngine,
    readOnly: _customReadOnly,
    required: customRequired,
    filterOption: _customFilterOption,
    onSearch: _customOnSearch,
    onClear: _customOnClear,
    prefix: _customPrefix,
    suffix: _customSuffix,
    children: _customChildren,
    maxTagCount: _customMaxTagCount,
    searchable: _customSearchable,
    clearable: _customClearable,
    allowClear: _customAllowClear,
    showSearch: _customShowSearch,
    error: _customError,
    loading: _customLoading,
    optionGroups: _customOptionGroups,
    virtual: _customVirtual,
    tokenSeparators: _customTokenSeparators,
    forceCustomDropdown: _customForceCustomDropdown,
    ...triggerHtmlProps
  } = rest as any;

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Option item styles
  const optionBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '20px',
    color: 'var(--ds-color-text-primary)',
    transition:
      'background-color var(--ds-motion-fast) var(--ds-motion-ease-out), border-color var(--ds-motion-fast) var(--ds-motion-ease-out), box-shadow var(--ds-motion-fast) var(--ds-motion-ease-out)',
    userSelect: 'none',
    border: '1px solid transparent',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  // Group header style
  const groupHeaderStyle: React.CSSProperties = {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--ds-color-text-muted)',
    padding: '8px 12px 4px 12px',
    userSelect: 'none',
  };

  // Renders a single dropdown item
  const renderOptionItem = (item: RenderableItem, idx: number, isFocusedItem: boolean) => {
    if (item.type === 'group-header') {
      return (
        <div
          key={`gh-${idx}`}
          style={{
            ...groupHeaderStyle,
            ...(idx > 0 ? { marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--ds-color-border)' } : {}),
          }}
        >
          {item.groupLabel}
        </div>
      );
    }
    const option = item.option!;
    const isSelected = internalValue.includes(option.value);
    return (
      <div
        key={option.value}
        role="option"
        aria-selected={isSelected}
        style={{
          ...optionBaseStyle,
          ...(idx > 0 && item.type === 'option'
            ? { boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--ds-color-border-subtle) 68%, transparent)' }
            : {}),
          ...(option.disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
          ...(isFocusedItem && !isSelected ? {
            background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-color-primary) 10%, transparent)',
          } : {}),
          ...(isSelected ? {
            border: '1px solid color-mix(in srgb, var(--ds-color-primary) 14%, transparent)',
            background: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)',
            fontWeight: 500,
            boxShadow: 'inset 2px 0 0 var(--ds-color-primary)',
          } : {}),
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!option.disabled) {
            handleSelect(option.value, option);
          }
        }}
        onMouseEnter={() => setFocusedIndex(idx)}
      >
        {multiple && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '14px',
            height: '14px',
            borderRadius: '4px',
            border: isSelected
              ? '1px solid var(--ds-color-primary)'
              : '1px solid var(--ds-color-border)',
            backgroundColor: isSelected ? 'var(--ds-color-primary)' : 'transparent',
            flexShrink: 0,
            transition: 'all var(--ds-motion-fast)',
          }}>
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </span>
        )}
        {option.icon && <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: option.description ? 1 : 0 }}>{option.icon}</span>}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: option.description ? 2 : 0,
            overflow: 'hidden',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
          {option.description && (
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--ds-color-text-muted)',
                fontSize: 11,
                lineHeight: '14px',
                fontWeight: 450,
              }}
            >
              {option.description}
            </span>
          )}
        </span>
        {!multiple && isSelected && (
          <span style={{ display: 'inline-flex', color: 'var(--ds-color-primary)', flexShrink: 0 }}>
            <CheckIcon />
          </span>
        )}
      </div>
    );
  };

  // Search input style
  const searchInputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderBottom: '1px solid var(--ds-color-border)',
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    lineHeight: '20px',
    color: 'var(--ds-color-text-primary)',
    fontFamily: 'inherit',
    padding: 0,
    minWidth: 0,
  };

  // Placeholder CSS for the search input
  const searchPlaceholderId = `ds-sel-search-${reactId.replace(/:/g, '')}`;
  const searchPlaceholderCSS = `
    .${searchPlaceholderId}::placeholder {
      color: var(--ds-color-text-muted);
      opacity: 1;
    }
  `;

  return (
    <div ref={containerRef} className={className} style={{ ...style, position: 'relative', width: '100%' }} onKeyDown={handleKeyDown}>
      {responsiveCSS && responsiveCSS.css && (
        <style dangerouslySetInnerHTML={{ __html: responsiveCSS.css }} />
      )}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAME_CSS + searchPlaceholderCSS }} />

      {/* Trigger */}
      <div
        {...triggerHtmlProps}
        className="rottay-select__trigger"
        style={triggerStyle}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
            if (!isOpen && isSearchable) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={customRequired ? true : undefined}
        onFocus={onFocus as any}
        onBlur={onBlur as any}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: 0 }}>
          {isSearchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className={searchPlaceholderId}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                fontFamily: 'inherit',
                padding: 0,
              }}
              value={searchValue}
              onChange={handleSearchInput}
              placeholder={selectedOptions.length === 0 ? displayPlaceholder : ''}
              onClick={(e) => e.stopPropagation()}
            />
          ) : displayValue || (
            <span style={{ color: 'var(--ds-color-text-muted)' }}>{displayPlaceholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isClearable && internalValue.length > 0 && !disabled && (
            <ClearButton onClick={handleClear} />
          )}
          {loading && <span className="rottay-select__loading-indicator" aria-hidden="true" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--ds-color-border)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin var(--ds-motion-glacial) linear infinite' }} />}
          <ChevronIcon isOpen={isOpen} />
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
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          data-rottay-portal="true"
          role="listbox"
          style={{
            ...DROPDOWN_STYLE,
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            right: 'auto',
            width: dropdownPosition.width || undefined,
            zIndex: 2400,
            animation: 'rottay-select-appear var(--ds-motion-fast) var(--ds-motion-ease-out)',
          }}
        >
          {/* Search input inside dropdown */}
          {isSearchable && (
            <div style={searchInputContainerStyle}>
              <SearchIcon />
              <input
                ref={!isOpen ? undefined : inputRef}
                type="text"
                className={searchPlaceholderId}
                style={searchInputStyle}
                value={searchValue}
                onChange={handleSearchInput}
                placeholder={t('select.search') || 'Search...'}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div
            style={{
              ...(virtualEnabled ? {
                maxHeight: `${containerHeight}px`,
                overflowY: 'auto' as const,
              } : {
                maxHeight: 'var(--ds-select-max-height, 240px)',
                overflowY: 'auto' as const,
              }),
              padding: isSearchable ? '6px 0 0 0' : '0',
            }}
            onScroll={virtualEnabled ? handleDropdownScroll : undefined}
          >
            {virtualEnabled ? (
              <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: `${offsetY}px`, left: 0, right: 0 }}>
                  {visibleItems.length === 0 ? (
                    <div style={{ padding: '12px 16px', color: 'var(--ds-color-text-muted)', fontSize: '14px' }}>
                      {noOptionsText}
                    </div>
                  ) : (
                    visibleItems.map((item, idx) => {
                      const realIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER) + idx;
                      if (item.type === 'group-header') {
                        return (
                          <div
                            key={`gh-${idx}`}
                            style={{
                              ...groupHeaderStyle,
                              height: `${itemHeight}px`,
                              display: 'flex',
                              alignItems: 'center',
                              ...(realIdx > 0 ? { borderTop: '1px solid var(--ds-color-border)' } : {}),
                            }}
                          >
                            {item.groupLabel}
                          </div>
                        );
                      }
                      const option = item.option!;
                      const isSelected = internalValue.includes(option.value);
                      const isFocusedItem = realIdx === focusedIndex;
                      return (
                        <div
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          style={{
                            ...optionBaseStyle,
                            height: `${itemHeight}px`,
                            boxSizing: 'border-box',
                            ...(option.disabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
                            ...(isFocusedItem && !isSelected ? {
                              border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                              background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 96%, white 4%), color-mix(in srgb, var(--ds-color-bg-primary) 20%, var(--ds-surface-card)))',
                              transform: 'translateY(-1px)',
                            } : {}),
                            ...(isSelected ? {
                              border: '1px solid color-mix(in srgb, var(--ds-color-primary) 18%, transparent)',
                              background: 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))',
                              fontWeight: 500,
                            } : {}),
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!option.disabled) {
                              handleSelect(option.value, option);
                            }
                          }}
                          onMouseEnter={() => setFocusedIndex(realIdx)}
                        >
                          {multiple && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: isSelected
                                ? '1px solid var(--ds-color-primary)'
                                : '1px solid var(--ds-color-border)',
                              backgroundColor: isSelected ? 'var(--ds-color-primary)' : 'transparent',
                              flexShrink: 0,
                              transition: 'all var(--ds-motion-fast)',
                            }}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </span>
                          )}
                          {option.icon && <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: option.description ? 1 : 0 }}>{option.icon}</span>}
                          <span
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: option.description ? 2 : 0,
                              overflow: 'hidden',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.label}</span>
                            {option.description && (
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: 'var(--ds-color-text-muted)',
                                  fontSize: 11,
                                  lineHeight: '14px',
                                  fontWeight: 450,
                                }}
                              >
                                {option.description}
                              </span>
                            )}
                          </span>
                          {!multiple && isSelected && (
                            <span style={{ display: 'inline-flex', color: 'var(--ds-color-primary)', flexShrink: 0 }}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              renderableItems.length === 0 ? (
                <div style={{ padding: '12px 16px', color: 'var(--ds-color-text-muted)', fontSize: '14px' }}>
                  {noOptionsText}
                </div>
              ) : (
                renderableItems.map((item, idx) => renderOptionItem(item, idx, idx === focusedIndex))
              )
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
});

ModernSelect.displayName = 'ModernSelect';

export default ModernSelect;
