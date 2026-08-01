/**
 * @fileoverview Select Modern Engine (Premium) - Rottay Design System.
 * Renders a fully custom dropdown select styled with CSS custom properties
 * for a precise, calm, editorial feel -- inspired by Linear, Vercel, and
 * Stripe Dashboard controls. Native `<select>` fallback for simple cases.
 *
 * **Token Usage:**
 * - Surface: `--ds-select-bg` → `--ds-surface-control` (trigger),
 *   `--ds-select-dropdown-bg` → `--ds-surface-card` (dropdown)
 * - Border: `--ds-select-border-color*`, focus: `--ds-select-border-color-focus`
 * - Radius: `--ds-select-radius` (trigger), `--ds-select-dropdown-radius` (panel)
 * - Elevation: `--ds-select-dropdown-shadow` → `--ds-elevation-3` (panel)
 * - Focus ring: `--ds-select-shadow-focus` → `--ds-focus-ring` halo
 * - Motion: `--ds-motion-fast`, `--ds-motion-ease-out`; panel entrance rides
 *   `ds-select-appear` with the placement-aware `--ds-select-enter-y` channel
 * - Responsive sizes: `--ds-select-trigger-responsive-*` channels consumed by
 *   the skin's trigger fallback chains (scalar and responsive paths share the
 *   `--ds-select-trigger-{xs..xl}-*` geometry)
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
import type { SelectProps, SelectOption, SelectSize } from '../../contracts';
import { SELECT_DEFAULTS } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../../runtime/overlay/portal-scope';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';
import { advanceTypeahead } from '../../../../runtime/collection/typeahead';
import type { TypeaheadState } from '../../../../runtime/collection/typeahead';
import { resolveComboboxListState } from '../../../../runtime/collection/combobox';
import {
  isResponsiveValue,
  generateResponsiveCSS,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';

function scalarOrUndefined<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (isResponsiveValue(value)) return undefined;
  return value as T;
}
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { ActionSearchIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-search';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import {
  getLabelText,
  buildRenderableList,
  flatOptionsFromGroups,
  DEFAULT_ITEM_HEIGHT,
  DEFAULT_CONTAINER_HEIGHT,
  VIRTUAL_BUFFER,
  type RenderableItem,
} from '../../runtime/selection';

/* ------------------------------------------------------------------ */
/*  i18n English floor (provider optional, never a hard dependency)    */
/* ------------------------------------------------------------------ */

/**
 * English fallbacks mirror the `components.select.*` / `common.*` catalog
 * keys so the primitive keeps its documented standalone rendering contract
 * when no I18nProvider is mounted (the `useOptionalTranslation` rationale,
 * same idiom as Pagination/ListToolbar). The provider's missing-key echoes
 * (the raw key or the `i18n:missing:<locale>:<key>` marker) are detected
 * and swapped for the floor.
 */
const EN_FALLBACK = {
  placeholder: 'Select an option',
  noOptions: 'No options available',
  loading: 'Loading options...',
  clear: 'Clear selection',
  search: 'Search...',
  remove: 'Remove',
} as const;

/* ------------------------------------------------------------------ */
/*  Checkmark icon for selected items                                  */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return <StatusSuccessIcon decorative size={14} />;
}

/* ------------------------------------------------------------------ */
/*  Chevron icon                                                       */
/* ------------------------------------------------------------------ */

function ChevronIcon() {
  return <NavigationDownIcon decorative size={16} data-part="arrow-icon" />;
}

/* ------------------------------------------------------------------ */
/*  Search icon                                                        */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return <ActionSearchIcon decorative size={14} data-part="search-icon" />;
}

/* ------------------------------------------------------------------ */
/*  Clear button                                                       */
/* ------------------------------------------------------------------ */

function ClearButton({ onClick, label }: { onClick: (e: React.MouseEvent) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={-1}
      data-part="clear-button"
    >
      <ActionCloseIcon decorative size={13} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Keyframe injection (once)                                          */
/* ------------------------------------------------------------------ */

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
  const translation = useOptionalTranslation('components');
  const translationCommon = useOptionalTranslation('common');

  /**
   * Catalog lookup with the English floor: when the provider is absent or
   * echoes a missing-key marker, the catalogued English default wins.
   */
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
  const selectId = `select-${reactId.replace(/:/g, '')}`;
  const listboxId = `${selectId}-listbox`;
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const sizeIsResponsive = isResponsiveValue(sizeProp);

  if (sizeIsResponsive) {
    // Responsive sizes ride the skin's own `--ds-select-trigger-*` channels so
    // the scalar and responsive paths can never diverge. Custom properties
    // resolve without specificity games: when a channel is undefined the
    // generated declaration is invalid at computed-value time and the skin's
    // fallback chain takes over.
    responsiveEntries.push({
      cssProperty: '--ds-select-trigger-responsive-height',
      value: sizeProp,
      resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-height)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-select-trigger-responsive-padding-x',
      value: sizeProp,
      resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-padding-x)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-select-trigger-responsive-font-size',
      value: sizeProp,
      resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-font-size)`,
    } as ResponsivePropEntry<any>);
    responsiveEntries.push({
      cssProperty: '--ds-select-trigger-responsive-line-height',
      value: sizeProp,
      resolve: (v: SelectSize) => `var(--ds-select-trigger-${v}-line-height)`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? selectId : '';
  const responsiveCSS = needsResponsiveCSS ? generateResponsiveCSS(elementId, responsiveEntries) : null;

  const size = scalarOrUndefined(sizeProp) ?? SELECT_DEFAULTS.size;

  // Use translation as default, allow prop override
  const displayPlaceholder = placeholder ?? tOr('select.placeholder', EN_FALLBACK.placeholder);
  const noOptionsText = tOr('select.no_options', EN_FALLBACK.noOptions);
  const loadingText = tOr('select.loading', EN_FALLBACK.loading);

  // Resolve aliases
  const isClearable = clearable || allowClear;
  const isSearchable = searchable || showSearch;

  // Determine effective status
  const effectiveStatus = error ? 'error' : status;

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
  // Element states (not just refs) so the overlay runtime hooks re-run when
  // the anchor/dropdown mount or unmount.
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [dropdownEl, setDropdownEl] = useState<HTMLDivElement | null>(null);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [resolvedPlacement, setResolvedPlacement] = useState<'top' | 'bottom'>('bottom');

  /**
   * Keyboard-driven focus navigation marker: pointer hover also moves
   * `focusedIndex`, but only keyboard moves are allowed to scroll the listbox
   * (a hover-followed-by-scroll-yank would fight the pointer).
   */
  const keyboardNavRef = useRef(false);
  /**
   * Focus jump queued while the dropdown was closed (closed-list type-ahead
   * opens the panel): the open-reset effect applies this index instead of
   * recentering on the selected/first option, then clears it.
   */
  const pendingFocusRef = useRef<number | null>(null);
  /**
   * Listbox type-ahead buffer (WAI pattern): printable characters accumulate
   * for a short window and jump focus to the first matching option; repeated
   * identical characters cycle through the options that start with that
   * character. Inert while `searchable` — keystrokes belong to the filter
   * input there.
   */
  const typeaheadRef = useRef<TypeaheadState>({ buffer: '', lastKeyTime: 0 });

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
  const itemHeight =
    virtual && typeof virtual === 'object' && virtual.itemHeight ? virtual.itemHeight : DEFAULT_ITEM_HEIGHT;
  const containerHeight =
    virtual && typeof virtual === 'object' && virtual.containerHeight
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
      Math.ceil((scrollTop + containerHeight) / itemHeight) + VIRTUAL_BUFFER
    );
    return {
      visibleItems: renderableItems.slice(startIdx, endIdx),
      totalHeight: total,
      offsetY: startIdx * itemHeight,
    };
  }, [renderableItems, virtualEnabled, scrollTop, itemHeight, containerHeight]);

  // Panel posture. Both branches ask the kernel the same question against
  // their own row count -- the virtual branch renders the window, the plain
  // branch the whole list -- so the "loading outranks empty" law is stated
  // once instead of twice.
  const panelState = resolveComboboxListState({
    open: isOpen,
    loading,
    itemCount: renderableItems.length,
  });
  const virtualPanelState = resolveComboboxListState({
    open: isOpen,
    loading,
    itemCount: visibleItems.length,
  });

  // Selected options
  const selectedOptions = useMemo(() => {
    return allOptions.filter((opt) => internalValue.includes(opt.value));
  }, [allOptions, internalValue]);

  // Handle selection
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
      }

      setInternalValue(newValue);
      setSearchValue('');

      if (onChange) {
        const selectedOpts = allOptions.filter((opt) => newValue.includes(opt.value));
        onChange(multiple ? newValue : newValue[0], multiple ? selectedOpts : selectedOpts[0]);
      }
    },
    [multiple, internalValue, onChange, allOptions]
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setInternalValue([]);
      setSearchValue('');
      setFocusedIndex(-1);
      onChange?.(multiple ? [] : '', undefined);
      onClear?.();
    },
    [multiple, onChange, onClear]
  );

  // Handle token separators
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      if (tokenSeparators && tokenSeparators.length > 0 && multiple) {
        const lastChar = rawValue.slice(-1);
        if (tokenSeparators.includes(lastChar)) {
          const token = rawValue.slice(0, -1).trim();
          if (token) {
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
            return;
          }
        }
      }

      setSearchValue(rawValue);
      onSearch?.(rawValue);
      setFocusedIndex(-1);
    },
    [tokenSeparators, multiple, allOptions, internalValue, onChange, onSearch]
  );

  // Type-ahead: find the next selectable option whose label starts with the
  // query, searching forward from `fromPos` (a position inside
  // `selectableIndices`) and wrapping around the list once.
  const findTypeaheadIndex = useCallback(
    (query: string, fromPos: number): number => {
      const count = selectableIndices.length;
      if (count === 0 || !query) return -1;
      for (let step = 0; step < count; step += 1) {
        const pos = (fromPos + step + count) % count;
        const itemIndex = arrayValueAt(selectableIndices, pos) ?? -1;
        const item = arrayValueAt(renderableItems, itemIndex);
        if (item?.type === 'option' && item.option) {
          const labelText = getLabelText(item.option.label).toLowerCase();
          if (labelText.startsWith(query)) return itemIndex;
        }
      }
      return -1;
    },
    [selectableIndices, renderableItems]
  );

  // Accumulate a printable character into the type-ahead buffer and move
  // focus to the matching option. Returns the matched renderable index, or
  // -1 when nothing matches (or when searchable owns the keystrokes).
  const applyTypeahead = useCallback(
    (char: string): number => {
      if (isSearchable || selectableIndices.length === 0) return -1;
      const state = typeaheadRef.current;
      const advanced = advanceTypeahead(state, char, Date.now());
      const next = advanced.prefix;
      // The window advances on every keystroke; which buffer survives is the
      // matcher's call below.
      state.lastKeyTime = advanced.state.lastKeyTime;

      const currentPos = selectableIndices.indexOf(focusedIndex);
      // A run of one repeated character ("aaa") cycles through the options
      // starting with "a" instead of pinning the first three-a match.
      const isRepeatedRun = next.length > 1 && next.split('').every((c) => c === next[0]);
      const query = isRepeatedRun ? char.toLowerCase() : next;
      const fromPos = isRepeatedRun ? currentPos + 1 : Math.max(currentPos, 0);
      let match = findTypeaheadIndex(query, fromPos);
      if (match < 0 && !isRepeatedRun && next.length > 1) {
        // The accumulated buffer matched nothing: retry as a fresh
        // single-character search from the next position.
        match = findTypeaheadIndex(char.toLowerCase(), currentPos + 1);
        if (match >= 0) state.buffer = char.toLowerCase();
        else state.buffer = '';
      } else {
        state.buffer = next;
      }
      if (match < 0) return -1;
      keyboardNavRef.current = true;
      setFocusedIndex(match);
      return match;
    },
    [isSearchable, selectableIndices, focusedIndex, findTypeaheadIndex]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // The click guard and the keyboard guard agree: while disabled or
      // loading the trigger stays shut (async postures live INSIDE an
      // already-open panel, not behind a fresh open).
      if (disabled || (loading && !isOpen)) return;
      const isPrintable =
        e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
          if (selectableIndices.length > 0) {
            keyboardNavRef.current = true;
            setFocusedIndex(arrayValueAt(selectableIndices, 0) ?? -1);
          }
          return;
        }
        // Combobox type-ahead: a printable character opens the list and jumps
        // to the matching option (native <select> parity). The open-reset
        // effect below honors `pendingFocusRef` so the jump survives.
        if (isPrintable && !isSearchable) {
          e.preventDefault();
          const match = applyTypeahead(e.key);
          if (match >= 0) {
            pendingFocusRef.current = match;
            setIsOpen(true);
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const currentPos = selectableIndices.indexOf(focusedIndex);
          const nextPos = currentPos < selectableIndices.length - 1 ? currentPos + 1 : 0;
          keyboardNavRef.current = true;
          setFocusedIndex(arrayValueAt(selectableIndices, nextPos) ?? -1);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const currentPos = selectableIndices.indexOf(focusedIndex);
          const prevPos = currentPos > 0 ? currentPos - 1 : selectableIndices.length - 1;
          keyboardNavRef.current = true;
          setFocusedIndex(arrayValueAt(selectableIndices, prevPos) ?? -1);
          break;
        }
        case 'PageDown': {
          e.preventDefault();
          const currentPos = selectableIndices.indexOf(focusedIndex);
          const nextPos = Math.min(selectableIndices.length - 1, Math.max(currentPos, 0) + 10);
          keyboardNavRef.current = true;
          setFocusedIndex(arrayValueAt(selectableIndices, nextPos) ?? -1);
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          const currentPos = selectableIndices.indexOf(focusedIndex);
          const prevPos = Math.max(0, Math.max(currentPos, 0) - 10);
          keyboardNavRef.current = true;
          setFocusedIndex(arrayValueAt(selectableIndices, prevPos) ?? -1);
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (selectableIndices.length > 0) {
            keyboardNavRef.current = true;
            setFocusedIndex(arrayValueAt(selectableIndices, 0) ?? -1);
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (selectableIndices.length > 0) {
            keyboardNavRef.current = true;
            setFocusedIndex(arrayValueAt(selectableIndices, -1) ?? -1);
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (focusedIndex >= 0) {
            const item = arrayValueAt(renderableItems, focusedIndex);
            if (item?.type === 'option' && item.option && !item.option.disabled) {
              handleSelect(item.option.value, item.option);
            }
          }
          break;
        }
        case ' ': {
          // Outside the searchable branch the filter input cannot own the
          // keystroke, so Space selects like Enter (native listbox parity).
          if (!isSearchable) {
            e.preventDefault();
            if (focusedIndex >= 0) {
              const item = arrayValueAt(renderableItems, focusedIndex);
              if (item?.type === 'option' && item.option && !item.option.disabled) {
                handleSelect(item.option.value, item.option);
              }
            }
          }
          break;
        }
        case 'Backspace': {
          // Tags parity with the rustic engine: an empty filter plus
          // Backspace peels the last selected tag (multiple mode only).
          if (multiple && searchValue === '' && internalValue.length > 0) {
            e.preventDefault();
            const lastValue = internalValue[internalValue.length - 1];
            const lastOption = allOptions.find((opt) => opt.value === lastValue);
            if (lastOption && !lastOption.disabled) {
              handleSelect(lastOption.value, lastOption);
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
        default: {
          // Open-list type-ahead: printable characters jump focus to the
          // matching option. Searchable mode leaves them to the filter input.
          if (isPrintable && !isSearchable) {
            e.preventDefault();
            applyTypeahead(e.key);
          }
          break;
        }
      }
    },
    [
      isOpen,
      focusedIndex,
      selectableIndices,
      renderableItems,
      handleSelect,
      disabled,
      loading,
      isSearchable,
      multiple,
      searchValue,
      internalValue,
      allOptions,
      applyTypeahead,
    ]
  );

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (isOpen && selectableIndices.length > 0) {
      // A closed-list type-ahead already picked the target: keep it.
      const pending = pendingFocusRef.current;
      pendingFocusRef.current = null;
      if (pending !== null && selectableIndices.includes(pending)) {
        setFocusedIndex(pending);
        return;
      }
      const selectedIdx = renderableItems.findIndex(
        (item) => item.type === 'option' && item.option && internalValue.includes(item.option.value)
      );
      if (selectedIdx >= 0 && selectableIndices.includes(selectedIdx)) {
        setFocusedIndex(selectedIdx);
      } else {
        setFocusedIndex(arrayValueAt(selectableIndices, 0) ?? -1);
      }
    } else if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Keep the keyboard-focused option inside the visible window. Pointer
  // hover moves `focusedIndex` too, but only keyboard navigation may scroll
  // (`keyboardNavRef`); the guard also covers jsdom, where scrollIntoView is
  // not implemented. In virtual mode the window follows the focused row
  // instead (scrollIntoView cannot reach unrendered rows).
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !keyboardNavRef.current) return;
    if (virtualEnabled) {
      const list = dropdownRef.current?.querySelector<HTMLElement>("[data-part='option-list']");
      if (list) {
        const rowTop = focusedIndex * itemHeight;
        const rowBottom = rowTop + itemHeight;
        if (rowTop < list.scrollTop) {
          list.scrollTop = rowTop;
        } else if (rowBottom > list.scrollTop + list.clientHeight) {
          list.scrollTop = rowBottom - list.clientHeight;
        }
      }
      return;
    }
    const optionEl = document.getElementById(`${selectId}-option-${focusedIndex}`);
    if (optionEl && typeof optionEl.scrollIntoView === 'function') {
      optionEl.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, focusedIndex, virtualEnabled, itemHeight, selectId]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  // Shared overlay stack: canonical dropdown z band + single Escape router.
  // Registered as a blocking layer (like Popover/Tooltip, but without scroll
  // lock or focus restore) so a nested select blocks lower dialogs from
  // consuming the same Escape press.
  const { isTopMost, layerProps } = useOverlayLayer({
    kind: 'dropdown',
    active: isOpen,
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onEscape: closeDropdown,
  });

  // Shared measured positioning: fixed coordinates pinned to the trigger,
  // flipped to `top` near the viewport bottom edge.
  const { style: positionStyle } = useOverlayPosition({
    anchor: containerEl,
    overlay: isOpen ? dropdownEl : null,
    placement: 'bottom-start',
    offset: 6,
    flip: true,
  });

  // Tenant/locale/DS-variable context re-stamped onto the portaled dropdown.
  const portalScope = usePortalScope(containerEl);

  // Dropdown width: at least the trigger width, clamped to the viewport
  // gutter and the rich-options band (unchanged from the previous ad-hoc
  // measurer; the shared runtime owns only the position, not the width).
  useLayoutEffect(() => {
    if (!isOpen || !containerEl || typeof window === 'undefined') return undefined;

    const updateWidth = (): void => {
      const rect = containerEl.getBoundingClientRect();
      const gutter = 12;
      const minWidth = hasRichDropdownOptions ? 320 : 240;
      const maxWidth = Math.min(
        hasRichDropdownOptions ? 440 : window.innerWidth - gutter * 2,
        window.innerWidth - gutter * 2
      );
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

  // Resolve the painted side for data-placement from the measured geometry
  // (the positioning runtime flips silently near the viewport edge).
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

  // Outside interaction dismisses the dropdown (capture-phase pointerdown,
  // top-most layer only -- a nested overlay above the select keeps it open).
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;

    const onPointerDown = (event: PointerEvent): void => {
      if (!isTopMost()) return;
      const target = event.target as Node | null;
      if (
        target &&
        (containerRef.current?.contains(target) ||
          dropdownRef.current?.contains(target))
      )
        return;
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [isOpen, isTopMost]);

  // Display value
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
              <button
                type="button"
                tabIndex={-1}
                aria-label={`${tCommonOr('remove', EN_FALLBACK.remove)} ${getLabelText(opt.label)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value, opt);
                }}
                data-part="tag-remove"
              >
                <ActionCloseIcon decorative size={10} />
              </button>
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

    // All trigger paint and per-size geometry live in the modern skin, keyed
    // on `data-size` / `data-variant` / `data-status` (single paint owner);
    // the engine stamps anatomy only.

    return (
      <div
        className={`ds-select-shell ds-select-shell--modern ${className || ''}`}
        data-part="root"
        data-size={size}
        data-loading={loading || undefined}
        data-disabled={disabled || undefined}
        style={style}
      >
        {responsiveCSS && responsiveCSS.css && <style dangerouslySetInnerHTML={{ __html: responsiveCSS.css }} />}
        <select
          ref={nativeSelectRef}
          {...(responsiveCSS ? responsiveCSS.attrs : {})}
          data-part="trigger"
          data-variant={variant}
          data-status={effectiveStatus !== 'default' ? effectiveStatus : undefined}
          data-disabled={disabled || undefined}
          value={internalValue[0] ?? ''}
          disabled={disabled}
          required={rest.required}
          aria-invalid={effectiveStatus === 'error' ? true : undefined}
          aria-busy={loading || undefined}
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
        <span data-part="native-arrow" aria-hidden="true">
          <NavigationDownIcon decorative size={16} />
        </span>
        {loading && (
          <span
            className="rottay-select__loading-indicator"
            data-part="loading"
            role="status"
          >
            <span data-part="loading-spinner" aria-hidden="true" />
            <span data-part="loading-label">{loadingText}</span>
          </span>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Custom dropdown for advanced cases                               */
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

  // Renders a single dropdown item
  const renderOptionItem = (item: RenderableItem, idx: number, isFocusedItem: boolean) => {
    if (item.type === 'group-header') {
      return (
        <div
          key={`gh-${idx}`}
          data-part="group-label"
          data-divider={idx > 0 ? 'true' : undefined}
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
        id={`${selectId}-option-${idx}`}
        role="option"
        aria-selected={isSelected}
        data-part="option"
        data-selected={isSelected || undefined}
        data-active={isFocusedItem || undefined}
        data-disabled={option.disabled || undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!option.disabled) {
            handleSelect(option.value, option);
          }
        }}
        onMouseEnter={() => {
          keyboardNavRef.current = false;
          setFocusedIndex(idx);
        }}
      >
        {multiple && (
          <span
            data-part="option-checkbox"
          >
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
      {responsiveCSS && responsiveCSS.css && <style dangerouslySetInnerHTML={{ __html: responsiveCSS.css }} />}
      {/* Trigger */}
      <div
        {...triggerHtmlProps}
        {...(responsiveCSS ? responsiveCSS.attrs : {})}
        className="rottay-select__trigger"
        data-part="trigger"
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
        tabIndex={disabled ? undefined : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined}
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
        onFocus={onFocus as any}
        onBlur={onBlur as any}
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
              className="rottay-select__loading-indicator"
              data-part="loading-status"
              // Single live owner per visible state: while the dropdown is
              // open its own loading-state region announces, so the trigger
              // indicator stays visual-only.
              role={isOpen ? undefined : 'status'}
            >
              <span data-part="loading-spinner" aria-hidden="true" />
              <span data-part="loading-label">{loadingText}</span>
            </span>
          )}
          <ChevronIcon />
        </div>
      </div>

      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={multiple ? internalValue.join(',') : internalValue[0] || ''} />}

      {/* Dropdown -- shared overlay portal with tenant scope re-stamped */}
      {isOpen && (
        <Portal>
          <OverlayPortalBoundary>
            <PortalScope snapshot={portalScope}>
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
                  width: dropdownWidth || undefined,
                  ...positionStyle,
                  ...layerProps.style,
                }}
              >
            {/* Search input inside dropdown */}
            {isSearchable && (
              <div data-part="search-input-wrapper">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  className="rottay-select__search-input"
                  data-part="search-input"
                  value={searchValue}
                  onChange={handleSearchInput}
                  placeholder={tOr('select.search', EN_FALLBACK.search)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            {/* Options list */}
            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              aria-busy={loading || undefined}
              data-part="option-list"
              data-virtual={virtualEnabled || undefined}
              style={
                virtualEnabled
                  ? {
                      // Runtime-measured virtual window: stays inline (not paint).
                      maxHeight: `${containerHeight}px`,
                      overflowY: 'auto' as const,
                    }
                  : undefined
              }
              onScroll={virtualEnabled ? handleDropdownScroll : undefined}
            >
              {virtualEnabled ? (
                <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: `${offsetY}px`,
                      insetInline: 0,
                    }}
                  >
                    {virtualPanelState === 'loading' ? (
                      <div data-part="loading-state" data-virtual="true" role="status">
                        <span data-part="loading-spinner" aria-hidden="true" />
                        <span data-part="loading-state-label">{loadingText}</span>
                      </div>
                    ) : virtualPanelState === 'empty' ? (
                      <div data-part="empty" data-virtual="true">
                        {noOptionsText}
                      </div>
                    ) : (
                      visibleItems.map((item, idx) => {
                        const realIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - VIRTUAL_BUFFER) + idx;
                        if (item.type === 'group-header') {
                          return (
                            <div
                              key={`gh-${idx}`}
                              data-part="group-label"
                              data-virtual="true"
                              data-divider={realIdx > 0 ? 'true' : undefined}
                              style={{
                                height: `${itemHeight}px`,
                                display: 'flex',
                                alignItems: 'center',
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
                            id={`${selectId}-option-${realIdx}`}
                            role="option"
                            aria-selected={isSelected}
                            data-part="option"
                            data-virtual="true"
                            data-selected={isSelected || undefined}
                            data-active={isFocusedItem || undefined}
                            data-disabled={option.disabled || undefined}
                            style={{
                              height: `${itemHeight}px`,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!option.disabled) {
                                handleSelect(option.value, option);
                              }
                            }}
                            onMouseEnter={() => {
                              keyboardNavRef.current = false;
                              setFocusedIndex(realIdx);
                            }}
                          >
                            {multiple && (
                              <span
                                data-part="option-checkbox"
                              >
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
                      })
                    )}
                  </div>
                </div>
              ) : panelState === 'loading' ? (
                /* Async posture: while options stream in, the panel keeps
                   the same spatial contract as the empty state (same part
                   geometry in the skin) instead of lying "no options". */
                <div data-part="loading-state" role="status">
                  <span data-part="loading-spinner" aria-hidden="true" />
                  <span data-part="loading-state-label">{loadingText}</span>
                </div>
              ) : panelState === 'empty' ? (
                <div data-part="empty">
                  {noOptionsText}
                </div>
              ) : (
                renderableItems.map((item, idx) => renderOptionItem(item, idx, idx === focusedIndex))
              )}
            </div>
              </div>
            </PortalScope>
          </OverlayPortalBoundary>
        </Portal>
      )}
    </div>
  );
});

ModernSelect.displayName = 'ModernSelect';

export default ModernSelect;
