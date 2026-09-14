/**
 * @fileoverview Select Modern engine: a styled native `<select>` for the simple
 * case and a listbox-backed custom dropdown for search, multiple selection,
 * groups and virtual lists. Keyboard, type-ahead and the active option come
 * from the shared listbox kernel, the panel from the field overlay kernel, and
 * state from the interaction kernel; the Modern skin paints every part.
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
  useLayoutEffect,
} from 'react';

import { arrayValueAt } from '@/foundation/kernel/collections';
import { isComposingKey, partAttributes, useFieldAction, useInteractionState } from '@/foundation/behavior';
import type { SelectProps, SelectOption, SelectSize } from '../../contracts';
import { SELECT_DEFAULTS } from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
  type FieldOverlayDismissReason,
} from '../../../../runtime/overlay/field-overlay';
import { isTypeaheadKey, useListbox } from '../../../../runtime/collection/listbox';
import { resolveComboboxListState } from '../../../../runtime/collection/combobox';
import {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { ActionSearchIcon } from '@/graphics/icons/semantic/generated/roles/action-search';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { StatusSuccessIcon } from '@/graphics/icons/semantic/generated/roles/status-success';
import {
  getLabelText,
  buildRenderableList,
  flatOptionsFromGroups,
  DEFAULT_ITEM_HEIGHT,
  DEFAULT_CONTAINER_HEIGHT,
  VIRTUAL_BUFFER,
  type RenderableItem,
} from '../../runtime/selection';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}

/** English floor for the `components.select.*` and `common.*` catalog keys. */
const EN_FALLBACK = {
  placeholder: 'Select an option',
  noOptions: 'No options available',
  loading: 'Loading options...',
  clear: 'Clear selection',
  search: 'Search...',
  // A placeholder disappears as the user types, so it cannot name the filter input.
  searchLabel: 'Search options',
  remove: 'Remove',
} as const;

/** Space the dropdown keeps from the viewport edge, and its floor for plain and rich options. */
const VIEWPORT_GUTTER = 12;
const PANEL_MIN_WIDTH = 240;
const RICH_PANEL_MIN_WIDTH = 320;
const RICH_PANEL_MAX_WIDTH = 440;

function CheckIcon() {
  return <StatusSuccessIcon decorative size={14} />;
}

function ChevronIcon() {
  return <NavigationDownIcon decorative size={16} data-part="arrow-icon" />;
}

function SearchIcon() {
  return <ActionSearchIcon decorative size={14} data-part="search-icon" />;
}

function ClearButton({ onClick, label }: { onClick: (e: React.MouseEvent) => void; label: string }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={-1}
      {...partAttributes('clear-button', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
    >
      <ActionCloseIcon decorative size={13} />
    </button>
  );
}

function TagRemoveButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      {...partAttributes('tag-remove', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
    >
      <ActionCloseIcon decorative size={10} />
    </button>
  );
}

/**
 * Modern (premium) Select engine.
 *
 * A non-searchable, single, ungrouped, non-virtual select renders a styled
 * native `<select>`; every other case renders the custom listbox dropdown.
 */
const ModernSelect = forwardRef<HTMLElement, SelectProps>((props, ref) => {
  const translation = useOptionalTranslation('components');
  const translationCommon = useOptionalTranslation('common');

  const tOr = (key: string, fallback: string): string => {
    const resolved = translation?.t(key);
    if (!resolved || resolved === key || resolved.startsWith('i18n:missing:')) return fallback;
    return resolved;
  };
  const tCommonOr = (key: string, fallback: string): string => {
    const resolved = translationCommon?.t(key);
    if (!resolved || resolved === key || resolved.startsWith('i18n:missing:')) return fallback;
    return resolved;
  };

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
    optionGroups,
    virtual,
    tokenSeparators,
    forceCustomDropdown = false,
    ...rest
  } = props;

  const reactId = useId();
  const selectId = `select-${reactId.replace(/:/g, '')}`;
  const listboxId = `${selectId}-listbox`;
  const responsiveEntries: ResponsivePropEntry<any>[] = [];

  // Responsive sizes ride the skin's own trigger channels, so the scalar and responsive paths share one geometry.
  if (isResponsiveValue(sizeProp)) {
    responsiveEntries.push(
      { cssProperty: '--ds-select-trigger-responsive-height', value: sizeProp, resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-height)` },
      { cssProperty: '--ds-select-trigger-responsive-padding-x', value: sizeProp, resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-padding-x)` },
      { cssProperty: '--ds-select-trigger-responsive-font-size', value: sizeProp, resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-font-size)` },
      { cssProperty: '--ds-select-trigger-responsive-line-height', value: sizeProp, resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-line-height)` },
    );
  }

  const responsiveCSS = generateResponsiveCSS(responsiveEntries);
  const size = scalarOrUndefined(sizeProp) ?? SELECT_DEFAULTS.size;

  const displayPlaceholder = placeholder ?? tOr('select.placeholder', EN_FALLBACK.placeholder);
  const noOptionsText = tOr('select.no_options', EN_FALLBACK.noOptions);
  const loadingText = tOr('select.loading', EN_FALLBACK.loading);

  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;
  const effectiveStatus = error ? 'error' : status;

  const allOptions = useMemo(() => {
    if (optionGroups && optionGroups.length > 0) {
      return flatOptionsFromGroups(optionGroups);
    }
    return flatOptions;
  }, [flatOptions, optionGroups]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [internalValue, setInternalValue] = useState<(string | number)[]>(() => {
    const initial = value ?? defaultValue;
    if (initial === undefined) return [];
    return Array.isArray(initial) ? initial : [initial];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [dropdownEl, setDropdownEl] = useState<HTMLDivElement | null>(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [resolvedPlacement, setResolvedPlacement] = useState<'top' | 'bottom'>('bottom');
  /** A closed-list type-ahead already chose the row the panel opens on. */
  const openedOnMatchRef = useRef(false);
  /** A keyboard open reveals the row it lands on; a pointer open never scrolls. */
  const openedByKeyboardRef = useRef(false);
  /** An IME owns the filter input between compositionstart and compositionend. */
  const composingRef = useRef(false);

  const trigger = useInteractionState({ disabled });

  // The dropdown is portaled and, when searchable, owns focus: every dismissal returns focus to the trigger.
  const focusTrigger = useCallback(() => {
    triggerRef.current?.focus();
  }, []);

  const setContainerNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerEl(node);
  }, []);

  const setDropdownNode = useCallback((node: HTMLDivElement | null) => {
    dropdownRef.current = node;
    setDropdownEl(node);
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return nativeSelectRef.current ?? inputRef.current ?? containerRef.current ?? document.createElement('div');
    },
    []
  );

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  const defaultFilter = useCallback((input: string, option?: SelectOption): boolean => {
    if (!option) return false;
    const labelText = getLabelText(option.label);
    return labelText.toLowerCase().includes(input.toLowerCase());
  }, []);

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchValue) return allOptions;
    const filterFn = filterOption || defaultFilter;
    return allOptions.filter((opt) => filterFn(searchValue, opt));
  }, [allOptions, searchValue, isSearchable, filterOption, defaultFilter]);

  const renderableItems = useMemo(() => {
    if (isSearchable && searchValue) {
      return filteredOptions.map((opt) => ({
        type: 'option' as const,
        option: opt,
      }));
    }
    return buildRenderableList(filteredOptions, optionGroups);
  }, [filteredOptions, optionGroups, isSearchable, searchValue]);

  const hasRichDropdownOptions = useMemo(
    () => allOptions.some((option) => Boolean(option.icon || option.description)),
    [allOptions]
  );

  const isItemSelectable = useCallback(
    (index: number) => {
      const item = arrayValueAt(renderableItems, index);
      return item?.type === 'option' && !!item.option && !item.option.disabled;
    },
    [renderableItems]
  );

  const getItemText = useCallback(
    (index: number) => {
      const item = arrayValueAt(renderableItems, index);
      return item?.type === 'option' && item.option ? getLabelText(item.option.label) : undefined;
    },
    [renderableItems]
  );

  const virtualEnabled = !!virtual;
  const itemHeight =
    virtual && typeof virtual === 'object' && virtual.itemHeight ? virtual.itemHeight : DEFAULT_ITEM_HEIGHT;
  const containerHeight =
    virtual && typeof virtual === 'object' && virtual.containerHeight
      ? virtual.containerHeight
      : DEFAULT_CONTAINER_HEIGHT;

  const { visibleItems, totalHeight, offsetY, windowStart } = useMemo(() => {
    if (!virtualEnabled) {
      return { visibleItems: renderableItems, totalHeight: 0, offsetY: 0, windowStart: 0 };
    }
    const total = renderableItems.length * itemHeight;
    const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER);
    const endIdx = Math.min(
      renderableItems.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + VIRTUAL_BUFFER
    );
    return {
      visibleItems: renderableItems.slice(startIdx, endIdx),
      totalHeight: total,
      offsetY: startIdx * itemHeight,
      windowStart: startIdx,
    };
  }, [renderableItems, virtualEnabled, scrollTop, itemHeight, containerHeight]);

  // A virtual list cannot scroll an unrendered row into view, so it moves its own window.
  const revealVirtualRow = useCallback(
    (index: number) => {
      const list = listRef.current;
      if (!list) return;
      const rowTop = index * itemHeight;
      const rowBottom = rowTop + itemHeight;
      if (rowTop < list.scrollTop) list.scrollTop = rowTop;
      else if (rowBottom > list.scrollTop + list.clientHeight) list.scrollTop = rowBottom - list.clientHeight;
    },
    [itemHeight]
  );

  const listbox = useListbox({
    open: isOpen,
    itemCount: renderableItems.length,
    isItemSelectable,
    loading,
    listboxId,
    optionIdPrefix: selectId,
    multiselectable: multiple,
    getItemText: isSearchable ? undefined : getItemText,
    reveal: virtualEnabled ? revealVirtualRow : undefined,
  });
  const { activeIndex, setActiveIndex, nextSelectableFrom, listState: panelState } = listbox;
  const listboxProps = listbox.getListboxProps();

  const virtualPanelState = resolveComboboxListState({
    open: isOpen,
    loading,
    itemCount: visibleItems.length,
  });

  const selectedOptions = useMemo(() => {
    return allOptions.filter((opt) => internalValue.includes(opt.value));
  }, [allOptions, internalValue]);

  /** The portaled filter input owns focus while a searchable panel is open, so it carries the combobox contract. */
  const searchOwnsFocus = isOpen && isSearchable;

  const handleSelect = useCallback(
    (optionValue: string | number, option: SelectOption) => {
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
        focusTrigger();
      }

      setInternalValue(newValue);
      setSearchValue('');

      if (onChange) {
        const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
        onChange(multiple ? newValue : newValue[0], multiple ? selectedOpts : selectedOpts[0]);
      }
    },
    [multiple, internalValue, onChange, allOptions, focusTrigger]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setInternalValue([]);
      setSearchValue('');
      setActiveIndex(-1);
      onChange?.(multiple ? [] : '', undefined);
      onClear?.();
    },
    [multiple, onChange, onClear, setActiveIndex]
  );

  /** Tokenizes a trailing separator, reporting whether it consumed the filter text. */
  const commitSeparatorToken = useCallback(
    (rawValue: string) => {
      if (!multiple || !tokenSeparators || tokenSeparators.length === 0) return false;
      const lastChar = rawValue.slice(-1);
      if (!tokenSeparators.includes(lastChar)) return false;
      const token = rawValue.slice(0, -1).trim();
      if (!token) return false;

      const matchOption = allOptions.find(
        (opt) => getLabelText(opt.label).toLowerCase() === token.toLowerCase() || String(opt.value) === token
      );
      if (matchOption && !internalValue.includes(matchOption.value)) {
        const newValue = [...internalValue, matchOption.value];
        setInternalValue(newValue);
        const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
        onChange?.(newValue, selectedOpts);
      }
      setSearchValue('');
      onSearch?.('');
      return true;
    },
    [tokenSeparators, multiple, allOptions, internalValue, onChange, onSearch]
  );

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // A separator inside a live candidate is IME punctuation, not a token
      // boundary: the candidate stays editable until composition ends.
      const composing = composingRef.current || Boolean((e.nativeEvent as InputEvent).isComposing);

      if (!composing && commitSeparatorToken(rawValue)) return;

      setSearchValue(rawValue);
      onSearch?.(rawValue);
      setActiveIndex(-1);
    },
    [commitSeparatorToken, onSearch, setActiveIndex]
  );

  const handleSearchCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      // Firefox delivers the confirmed text on an input event still flagged as
      // composing, so the separator is tokenized from the settled value here.
      commitSeparatorToken(e.currentTarget.value);
    },
    [commitSeparatorToken]
  );

  const commitActive = useCallback(() => {
    const item = activeIndex >= 0 ? arrayValueAt(renderableItems, activeIndex) : undefined;
    if (item?.type === 'option' && item.option && !item.option.disabled) {
      handleSelect(item.option.value, item.option);
    }
  }, [activeIndex, renderableItems, handleSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Async postures live inside an already-open panel, never behind a fresh open.
      if (disabled || (loading && !isOpen)) return;
      // While an IME composes, Enter confirms the candidate and the arrows walk
      // the candidate window; none of those keys reach the selection.
      if (isComposingKey(e)) return;
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openedByKeyboardRef.current = true;
          setIsOpen(true);
          return;
        }
        // A printable character opens the list on its match (native <select> parity).
        if (!isSearchable && isTypeaheadKey(e)) {
          const match = listbox.navigate(e);
          if (match !== null && match >= 0) {
            openedOnMatchRef.current = true;
            setIsOpen(true);
          }
        }
        return;
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          commitActive();
          return;
        case ' ':
          if (!isSearchable) {
            e.preventDefault();
            commitActive();
          }
          return;
        case 'Backspace':
          // An empty filter plus Backspace peels the last selected tag.
          if (multiple && searchValue === '' && internalValue.length > 0) {
            e.preventDefault();
            const lastValue = internalValue[internalValue.length - 1];
            const lastOption = allOptions.find((opt) => opt.value === lastValue);
            if (lastOption && !lastOption.disabled) {
              handleSelect(lastOption.value, lastOption);
            }
          }
          return;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          focusTrigger();
          return;
        default:
          listbox.navigate(e);
      }
    },
    [
      disabled,
      loading,
      isOpen,
      isSearchable,
      listbox,
      nextSelectableFrom,
      setActiveIndex,
      commitActive,
      multiple,
      searchValue,
      internalValue,
      allOptions,
      handleSelect,
      focusTrigger,
    ]
  );

  // Opening lands on the selected option, else the first; a keyboard open or a type-ahead match keeps its row.
  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }
    const source = openedByKeyboardRef.current || openedOnMatchRef.current ? 'keyboard' : 'pointer';
    openedByKeyboardRef.current = false;
    if (openedOnMatchRef.current) {
      openedOnMatchRef.current = false;
      return;
    }
    const selectedIdx = renderableItems.findIndex(
      (item) => item.type === 'option' && item.option && internalValue.includes(item.option.value)
    );
    setActiveIndex(selectedIdx >= 0 && isItemSelectable(selectedIdx) ? selectedIdx : nextSelectableFrom(-1, 1), source);
  }, [isOpen]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    focusTrigger();
  }, [focusTrigger, setActiveIndex]);

  // Focus is reclaimed only when the dropdown still holds it: an outside press moves focus where the user chose.
  const dismissFromOutside = useCallback(() => {
    const focusWasInside = dropdownRef.current?.contains(document.activeElement);
    setIsOpen(false);
    if (focusWasInside) focusTrigger();
  }, [focusTrigger]);

  const handleDismiss = useCallback(
    (reason: FieldOverlayDismissReason) => {
      if (reason === 'escape') closeDropdown();
      else dismissFromOutside();
    },
    [closeDropdown, dismissFromOutside],
  );

  const overlay = useFieldOverlay({
    kind: 'dropdown',
    open: isOpen,
    anchor: containerEl,
    panel: dropdownEl,
    placement: 'bottom-start',
    offset: 6,
    flip: true,
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onDismiss: handleDismiss,
    dismissOnOutsidePointer: true,
  });
  const { panelProps, layerProps, scope: portalScope } = overlay;
  const positionStyle = panelProps.style;

  // The panel is at least the trigger's width, clamped to the viewport gutter and the rich-option band.
  useLayoutEffect(() => {
    if (!isOpen || !containerEl || typeof window === 'undefined') return undefined;

    const updateWidth = (): void => {
      const rect = containerEl.getBoundingClientRect();
      const minWidth = hasRichDropdownOptions ? RICH_PANEL_MIN_WIDTH : PANEL_MIN_WIDTH;
      const viewportMax = window.innerWidth - VIEWPORT_GUTTER * 2;
      const maxWidth = Math.min(hasRichDropdownOptions ? RICH_PANEL_MAX_WIDTH : viewportMax, viewportMax);
      setDropdownWidth((prev) => {
        const next = Math.min(Math.max(rect.width, minWidth), maxWidth);
        return prev === next ? prev : next;
      });
    };

    updateWidth();
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateWidth);
    observer?.observe(containerEl);
    return () => observer?.disconnect();
  }, [isOpen, containerEl, hasRichDropdownOptions]);

  // The positioning runtime flips near the viewport edge; the painted side is read from the geometry.
  useLayoutEffect(() => {
    if (!isOpen || !containerEl || !dropdownEl || typeof window === 'undefined')
      return undefined;

    const update = (): void => {
      const anchorRect = containerEl.getBoundingClientRect();
      const dropdownRect = dropdownEl.getBoundingClientRect();
      const next =
        dropdownRect.top + dropdownRect.height / 2 <
        anchorRect.top + anchorRect.height / 2
          ? ('top' as const)
          : ('bottom' as const);
      setResolvedPlacement((prev) => (prev === next ? prev : next));
    };

    update();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, containerEl, dropdownEl]);

  const displayValue = useMemo(() => {
    if (selectedOptions.length === 0) return null;

    if (multiple) {
      const visibleTags = maxTagCount !== undefined ? selectedOptions.slice(0, maxTagCount) : selectedOptions;
      const hiddenCount = selectedOptions.length - visibleTags.length;

      return (
        <div data-part="value" data-mode="multiple">
          {visibleTags.map((opt) => (
            <span key={opt.value} data-part="tag">
              <span
                data-part="tag-label"
                title={typeof opt.label === 'string' ? opt.label : undefined}
              >
                {opt.label}
              </span>
              <TagRemoveButton
                label={`${tCommonOr('remove', EN_FALLBACK.remove)} ${getLabelText(opt.label)}`}
                onRemove={() => handleSelect(opt.value, opt)}
              />
            </span>
          ))}
          {hiddenCount > 0 && (
            <span data-part="tag-count">
              +{hiddenCount}
            </span>
          )}
        </div>
      );
    }

    return (
      <span
        data-part="value"
        data-mode="single"
        title={typeof selectedOptions[0].label === 'string' ? selectedOptions[0].label : undefined}
      >
        {selectedOptions[0].label}
      </span>
    );
  }, [selectedOptions, multiple, maxTagCount, handleSelect, translationCommon]);

  const triggerHandlers = {
    onPointerEnter: trigger.handlers.onPointerEnter,
    onPointerLeave: trigger.handlers.onPointerLeave,
    onPointerDown: trigger.handlers.onPointerDown,
    onPointerUp: trigger.handlers.onPointerUp,
  };

  /* ---------------------------------------------------------------- */
  /*  Native <select> for the simple case                              */
  /* ---------------------------------------------------------------- */

  if (!forceCustomDropdown && !isSearchable && !multiple && !optionGroups && !virtual) {
    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = allOptions.find((o) => String(o.value) === selectedValue);
      setInternalValue([selectedValue]);
      onChange?.(selectedValue, selectedOption);
    };

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

    return (
      <div
        className={`ds-select-shell ds-select-shell--modern ${className || ''}`}
        data-part="root"
        data-size={size}
        data-loading={loading || undefined}
        data-disabled={disabled || undefined}
        style={style}
      >
        <select
          ref={nativeSelectRef}
          {...responsiveCSS.attrs}
          style={{ ...responsiveCSS.channels }}
          {...partAttributes('trigger', trigger.state)}
          {...triggerHandlers}
          data-variant={variant}
          data-status={effectiveStatus !== 'default' ? effectiveStatus : undefined}
          data-disabled={disabled || undefined}
          value={internalValue[0] ?? ''}
          disabled={disabled}
          required={rest.required}
          aria-invalid={effectiveStatus === 'error' ? true : undefined}
          aria-busy={loading || undefined}
          onChange={handleNativeChange}
          onFocus={(event) => {
            trigger.handlers.onFocus(event);
            (onFocus as ((e: React.FocusEvent) => void) | undefined)?.(event);
          }}
          onBlur={(event) => {
            trigger.handlers.onBlur(event);
            (onBlur as ((e: React.FocusEvent) => void) | undefined)?.(event);
          }}
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
        <span data-part="native-arrow" aria-hidden="true">
          <NavigationDownIcon decorative size={16} />
        </span>
        {loading && (
          <span data-part="loading" role="status">
            <span data-part="loading-spinner" aria-hidden="true" />
            <span data-part="loading-label">{loadingText}</span>
          </span>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Custom listbox dropdown                                          */
  /* ---------------------------------------------------------------- */

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

  const renderGroupLabel = (item: RenderableItem, idx: number) => (
    <div
      key={`gh-${idx}`}
      data-part="group-label"
      // A bare div is not a legal listbox child; the caption leaves the tree instead of posing as an option.
      role="presentation"
      data-divider={idx > 0 ? 'true' : undefined}
    >
      {item.groupLabel}
    </div>
  );

  const renderOptionItem = (item: RenderableItem, idx: number) => {
    if (item.type === 'group-header') return renderGroupLabel(item, idx);
    const option = item.option!;
    const isSelected = internalValue.includes(option.value);
    const optionProps = listbox.getOptionProps(idx, { selected: isSelected, disabled: option.disabled });
    return (
      <div
        key={option.value}
        role={optionProps.role}
        id={optionProps.id}
        aria-selected={optionProps['aria-selected']}
        aria-disabled={optionProps['aria-disabled']}
        data-active={optionProps['data-active']}
        onMouseEnter={optionProps.onMouseEnter}
        data-part="option"
        data-selected={isSelected || undefined}
        data-disabled={option.disabled || undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!option.disabled) {
            handleSelect(option.value, option);
          }
        }}
      >
        {multiple && (
          <span data-part="option-checkbox">
            {isSelected ? <CheckIcon /> : null}
          </span>
        )}
        {option.icon ? <span data-part="option-icon">{option.icon}</span> : null}
        <span data-part="option-content" data-has-description={option.description ? 'true' : undefined}>
          <span data-part="option-label">{option.label}</span>
          {option.description && (
            <span data-part="option-description">
              {option.description}
            </span>
          )}
        </span>
        {!multiple && isSelected && (
          <span data-part="option-check">
            <CheckIcon />
          </span>
        )}
      </div>
    );
  };

  // Both postures are the listbox's only child while they show, so they carry a disabled option role.
  const renderPosture = (state: 'loading' | 'empty', virtualRow: boolean) =>
    state === 'loading' ? (
      <div data-part="loading-state" data-virtual={virtualRow || undefined} role="option" aria-disabled="true" aria-selected={false}>
        <span data-part="loading-spinner" aria-hidden="true" />
        <span data-part="loading-state-label">{loadingText}</span>
      </div>
    ) : (
      <div data-part="empty" data-virtual={virtualRow || undefined} role="option" aria-disabled="true" aria-selected={false}>
        {noOptionsText}
      </div>
    );

  return (
    <div
      ref={setContainerNode}
      className={`ds-select-shell ds-select-shell--modern ${className || ''}`}
      data-part="root"
      data-open={isOpen || undefined}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      data-size={size}
      data-mode={multiple ? 'multiple' : 'single'}
      data-searchable={isSearchable || undefined}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div
        {...triggerHtmlProps}
        {...responsiveCSS.attrs}
        style={{ ...responsiveCSS.channels }}
        // The caller's id must reach the custom path too, or every <label htmlFor> aimed at it dangles.
        id={id}
        {...partAttributes('trigger', trigger.state)}
        {...triggerHandlers}
        data-variant={variant}
        data-open={isOpen || undefined}
        data-disabled={disabled || undefined}
        data-status={effectiveStatus !== 'default' ? effectiveStatus : undefined}
        onClick={() => {
          if (!disabled && !loading) {
            setIsOpen(!isOpen);
            if (!isOpen && isSearchable) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        ref={triggerRef}
        tabIndex={disabled ? undefined : 0}
        // The combobox is the element the user stands on: an open searchable panel hands it to the filter input.
        role={searchOwnsFocus ? 'button' : 'combobox'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen && !searchOwnsFocus ? listboxId : undefined}
        aria-activedescendant={!searchOwnsFocus ? listbox.activeId : undefined}
        aria-required={customRequired ? true : undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={
          (triggerHtmlProps as Record<string, unknown>)['aria-invalid'] !== undefined
            ? ((triggerHtmlProps as Record<string, unknown>)['aria-invalid'] as boolean | 'true' | 'false')
            : effectiveStatus === 'error'
              ? true
              : undefined
        }
        aria-busy={loading || undefined}
        onFocus={(event) => {
          trigger.handlers.onFocus(event);
          (onFocus as ((e: React.FocusEvent) => void) | undefined)?.(event);
        }}
        onBlur={(event) => {
          trigger.handlers.onBlur(event);
          (onBlur as ((e: React.FocusEvent) => void) | undefined)?.(event);
        }}
      >
        <div data-part="trigger-value">
          {displayValue || <span data-part="placeholder">{displayPlaceholder}</span>}
        </div>

        <div data-part="trigger-actions">
          {isClearable && internalValue.length > 0 && !disabled && (
            <ClearButton onClick={handleClear} label={tOr('select.clear', EN_FALLBACK.clear)} />
          )}
          {loading && (
            <span
              data-part="loading-status"
              // While the panel is open its own posture announces, so the trigger indicator stays visual.
              role={isOpen ? undefined : 'status'}
            >
              <span data-part="loading-spinner" aria-hidden="true" />
              <span data-part="loading-label">{loadingText}</span>
            </span>
          )}
          <ChevronIcon />
        </div>
      </div>

      {name && <input type="hidden" name={name} value={multiple ? internalValue.join(',') : internalValue[0] || ''} />}

      {isOpen && (
        <FieldOverlayPanel overlay={overlay}>
          <div
            ref={setDropdownNode}
            {...layerProps}
            className="ds-select-shell__dropdown"
            data-part="dropdown"
            data-rottay-portal="true"
            data-placement={resolvedPlacement}
            data-mode={multiple ? 'multiple' : 'single'}
            data-searchable={isSearchable || undefined}
            data-rich-options={hasRichDropdownOptions || undefined}
            role="presentation"
            dir={portalScope.direction}
            lang={portalScope.language}
            style={{
              ...positionStyle,
              ...(dropdownWidth ? ({ '--ds-select-dropdown-inline-size': `${dropdownWidth}px` } as React.CSSProperties) : null),
            }}
          >
            {isSearchable && (
              <div data-part="search-input-wrapper">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  className="ds-select-shell__search-input"
                  data-part="search-input"
                  value={searchValue}
                  onChange={handleSearchInput}
                  onCompositionStart={() => {
                    composingRef.current = true;
                  }}
                  onCompositionEnd={handleSearchCompositionEnd}
                  placeholder={tOr('select.search', EN_FALLBACK.search)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  role="combobox"
                  aria-label={tOr('select.search_label', EN_FALLBACK.searchLabel)}
                  aria-expanded
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-activedescendant={listbox.activeId}
                />
              </div>
            )}

            <div
              ref={listRef}
              role={listboxProps.role}
              id={listboxProps.id}
              aria-busy={listboxProps['aria-busy']}
              aria-multiselectable={listboxProps['aria-multiselectable']}
              data-part="option-list"
              data-virtual={virtualEnabled || undefined}
              style={virtualEnabled ? ({ '--ds-select-virtual-height': `${containerHeight}px` } as React.CSSProperties) : undefined}
              onScroll={virtualEnabled ? handleDropdownScroll : undefined}
            >
              {virtualEnabled ? (
                <div data-part="virtual-track" style={{ '--ds-select-virtual-total': `${totalHeight}px` } as React.CSSProperties}>
                  <div
                    data-part="virtual-window"
                    style={{
                      '--ds-select-virtual-offset': `${offsetY}px`,
                      '--ds-select-virtual-row': `${itemHeight}px`,
                    } as React.CSSProperties}
                  >
                    {virtualPanelState === 'loading' || virtualPanelState === 'empty'
                      ? renderPosture(virtualPanelState, true)
                      : visibleItems.map((item, idx) => renderOptionItem(item, windowStart + idx))}
                  </div>
                </div>
              ) : panelState === 'loading' || panelState === 'empty' ? (
                renderPosture(panelState, false)
              ) : (
                renderableItems.map((item, idx) => renderOptionItem(item, idx))
              )}
            </div>
          </div>
        </FieldOverlayPanel>
      )}
    </div>
  );
});

ModernSelect.displayName = 'ModernSelect';

export default ModernSelect;
