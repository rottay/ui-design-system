'use client';

/**
 * @fileoverview Cascader Modern Engine - Rottay Design System.
 * Skin-painted hierarchical option selector (no DaisyUI classes): every
 * visual decision lives in `foundation/tokens/css/runtime/engines/modern/skin/cascader/index.css`,
 * keyed on the stamped `data-*` contract (`data-size`, `data-status`,
 * `data-loading`, `data-open`, `data-selected`, ...). Supports click/hover
 * expansion, cross-level search, async data loading, custom fieldNames
 * mapping, and controlled/uncontrolled value modes.
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
import React, { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import { partAttributes, useFieldAction, useInteractionState } from '@/foundation/behavior';
import { resolveListboxTarget, resolveTypeaheadTarget, isTypeaheadKey } from '../../../../runtime/collection/listbox';
import { resolveNavigationIntent } from '../../../../runtime/collection/roving-focus';
import type { TypeaheadState } from '../../../../runtime/collection/typeahead';
import type { CascaderProps, CascaderOption, CascaderValue, CascaderFieldNames } from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
} from '../../../../runtime/overlay/field-overlay';
import { CASCADER_DEFAULTS } from '../../contracts';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation, useReadingDirectionIsRtl } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { NavigationDownIcon } from '@/graphics/icons/semantic/generated/roles/navigation-down';
import { NavigationForwardIcon } from '@/graphics/icons/semantic/generated/roles/navigation-forward';

/**
 * Hook-local `tOr`: catalogue value with an English floor -- when the
 * catalogue entry has not landed yet the provider echoes the full key, which
 * must never reach visible copy or an aria-label.
 */
function useCascaderTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, fallback: string, params?: Record<string, string | number>): string => {
    const resolved = i18n?.t(key, params);
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

/* Both ways the trigger is asked to show what `value` actually is must agree, so the
   value-sync effect and the non-commit close path derive path and columns here. */
function resolvePathAndColumns(
  value: CascaderValue,
  options: CascaderOption[],
  fieldNames?: CascaderFieldNames,
): { path: CascaderOption[]; columns: CascaderOption[][] } {
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
  const columns: CascaderOption[][] = [options];
  for (const opt of path) {
    const children = getChildren(opt, fieldNames);
    if (!children || children.length === 0) break;
    columns.push(children);
  }
  return { path, columns };
}

interface CascaderOptionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role'> {
  role: 'option';
  children: React.ReactNode;
}

/** A column or search-result row: a real focused button whose state the interaction kernel decides. */
function CascaderOptionButton({ disabled, children, onFocus, onBlur, ...rest }: CascaderOptionButtonProps) {
  const row = useInteractionState({ disabled });
  return (
    <button
      type="button"
      disabled={disabled}
      {...rest}
      {...partAttributes('option', row.state)}
      onPointerEnter={(event) => {
        row.handlers.onPointerEnter(event);
        rest.onPointerEnter?.(event);
      }}
      onPointerLeave={row.handlers.onPointerLeave}
      onPointerDown={row.handlers.onPointerDown}
      onPointerUp={row.handlers.onPointerUp}
      onFocus={(event) => {
        row.handlers.onFocus(event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        row.handlers.onBlur(event);
        onBlur?.(event);
      }}
    >
      {children}
    </button>
  );
}

function CascaderClearButton({ label, onClear }: { label: string; onClear: (event: React.MouseEvent) => void }) {
  const action = useFieldAction();
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={label}
      {...partAttributes('clear-button', action.state)}
      onPointerEnter={action.handlers.onPointerEnter}
      onPointerLeave={action.handlers.onPointerLeave}
      onPointerDown={action.handlers.onPointerDown}
      onPointerUp={action.handlers.onPointerUp}
      onPointerCancel={action.handlers.onPointerCancel}
      onFocus={action.handlers.onFocus}
      onBlur={action.handlers.onBlur}
      onKeyDown={action.handlers.onKeyDown}
      onKeyUp={action.handlers.onKeyUp}
    >
      <ActionCloseIcon decorative size={12} />
    </button>
  );
}

/**
 * Modern Cascader component.
 *
 * Renders a trigger input that opens a multi-column dropdown. Each column
 * represents one level of the option hierarchy. Selecting a leaf node
 * commits the value and closes the dropdown.
 *
 * @param props - {@link CascaderProps}
 * @returns A positioned cascader dropdown with search and async-load support
 */
/**
 * Scope class the portaled panel carries: the family pair the skin scopes
 * every panel-subtree rule through, plus a panel marker for the panel's own
 * rules. `:is([data-part="root"], [data-part="dropdown"])` in the skin keeps
 * every one of those rules at its original specificity.
 */
const PANEL_SCOPE = 'ds-cascader ds-cascader--modern ds-cascader-panel';

export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(
  (props, ref) => {
    const { tOr } = useCascaderTranslation();
    // The reading direction comes from the shared i18n authority; this family
    // measures nothing of its own.
    const directionIsRtl = useReadingDirectionIsRtl();
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
      loading,
      status,
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      loadData,
      className,
      style,
      popupClassName,
    } = props;

    // Copy defaults: explicit props win; otherwise localized copy with the
    // historical English defaults (contract + pre-i18n literals) as the floor.
    const placeholder = placeholderProp ?? tOr('cascader.placeholder', 'Please select');
    const notFoundContent = notFoundContentProp ?? tOr('cascader.not_found', 'No data');
    const loadingLabel = tOr('cascader.loading', 'Loading...');

    // The legacy size spelling keys the skin's per-size geometry channels
    // (toLegacySize resolves either spelling; geometry itself is skin-owned).
    const size = toLegacySize(sizeProp);

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    // Bumped on every commit attempt so the value-sync effect also runs when a controlled
    // consumer REFUSES the value and `value` therefore never changes.
    const [commitNonce, setCommitNonce] = useState(0);

    // Support both controlled (value prop provided) and uncontrolled modes.
    // When controlled, external state is the source of truth for the selection.
    const isControlled = controlledValue !== undefined;
    const value = (isControlled ? controlledValue : internalValue) as CascaderValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    // Instance-scoped popup id: `aria-expanded` on a combobox is meaningless to
    // AT without an `aria-controls` pointing at the popup it expanded.
    const popupId = `cascader-popup-${useId().replace(/:/g, '')}`;

    const containerRef = useRef<HTMLDivElement>(null);
    // The kernel needs the field root as state (a ref never re-renders when
    // it lands), so the container publishes to both.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    // The panel carries both this engine's column-walking ref and the
    // kernel's measured element.
    const setPanelNode = useCallback((node: HTMLDivElement | null) => {
      (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setPanelEl(node);
    }, []);
    // After a keyboard-driven expansion, DOM focus lands on the first option
    // of the freshly appended column (see handleDropdownKeyDown).
    const pendingColumnFocusRef = useRef(false);

    const trigger = useInteractionState({ disabled });
    const searchField = useInteractionState();
    const typeaheadRef = useRef<TypeaheadState>({ buffer: '', lastKeyTime: 0 });

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

    /* Abandoning a drill leaves `value` unchanged, so the uncommitted branch must be resynced
       away; commit paths call handleOpenChange(false) directly and must not be overwritten. */
    const closeWithoutCommit = useCallback(() => {
      handleOpenChange(false);
      const { path, columns } = resolvePathAndColumns(value, options, fieldNames);
      setSelectedPath(path);
      setActiveColumns(columns);
    }, [handleOpenChange, value, options, fieldNames]);

    // Sync first column when options change
    useEffect(() => {
      setActiveColumns((prev) => {
        const next = [...prev];
        next[0] = options;
        return next;
      });
    }, [options]);

    // Build selected path from value. The rebuild is UNCONDITIONAL: guarding on
    // a non-empty value left the trigger label, its accessible name and the
    // clear affordance showing a stale path forever once a controlled consumer
    // reset `value` to [] (form reset, external clear, route change).
    /* Columns rebuild with the path so a preset value exposes its full drill chain. */
    useEffect(() => {
      const { path, columns } = resolvePathAndColumns(value, options, fieldNames);
      setSelectedPath(path);
      setActiveColumns(columns);
    }, [value, options, fieldNames, commitNonce]);

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
        setCommitNonce((n) => n + 1);
        handleOpenChange(false);
        // Options are real focused buttons here, so dismissing the panel
        // unmounts the focused element -- without the restore, focus strands
        // on <body> after every successful selection.
        triggerRef.current?.focus();
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
      triggerRef.current?.focus();
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

    // APG multi-column keyboard contract: the listbox kernel walks and type-aheads the current column; the
    // horizontal intent (mirrored under RTL) expands forward into the next column or returns to the previous one.
    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeWithoutCommit();
        triggerRef.current?.focus();
        return;
      }
      const target = e.target as HTMLElement;
      const optionEl = target.closest?.('[data-part="option"]') as HTMLElement | null;
      if (!optionEl) return;

      const columnEl = optionEl.closest('ul');
      if (!columnEl) return;

      const rows = Array.from(columnEl.querySelectorAll<HTMLButtonElement>('[data-part="option"]'));
      const currentIndex = rows.indexOf(optionEl as HTMLButtonElement);
      const vertical = resolveListboxTarget(e.key, {
        activeIndex: currentIndex,
        itemCount: rows.length,
        isItemSelectable: (index) => !rows[index]?.disabled,
      });
      if (vertical !== null) {
        e.preventDefault();
        if (vertical >= 0) rows[vertical]?.focus();
        return;
      }
      if (isTypeaheadKey(e)) {
        const result = resolveTypeaheadTarget(typeaheadRef.current, e.key, {
          activeIndex: currentIndex,
          itemCount: rows.length,
          isItemSelectable: (index) => !rows[index]?.disabled,
          getItemText: (index) => rows[index]?.querySelector('[data-part="option-label"]')?.textContent ?? undefined,
          now: Date.now(),
        });
        typeaheadRef.current = result.state;
        if (result.index >= 0) {
          e.preventDefault();
          rows[result.index]?.focus();
        }
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
      const intent = resolveNavigationIntent(e.key, {
        orientation: 'horizontal',
        rtl: directionIsRtl,
      });

      if (intent === 'next') {
        const option = arrayValueAt(activeColumns[columnIndex] ?? [], currentIndex);
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
      if (intent === 'previous') {
        if (columnIndex === 0) return;
        e.preventDefault();
        const prevColumn = columnsWrap.querySelectorAll(':scope > [data-part="menu-column"]')[columnIndex - 1];
        const focusTarget =
          prevColumn?.querySelector<HTMLElement>('[data-part="option"][data-selected="true"]') ??
          prevColumn?.querySelector<HTMLElement>('[data-part="option"]');
        focusTarget?.focus();
      }
    };

    const dismissPanel = useCallback(() => {
      closeWithoutCommit();
    }, [closeWithoutCommit]);

    // One overlay contract, on the canonical portal path: the panel leaves the
    // field subtree through `FieldOverlayPanel`, so it cannot be clipped by an
    // ancestor's overflow. That buys the canonical dropdown band, the single
    // Escape router (top-most layer only) and the shared capture-phase
    // outside-pointer watcher, which replaces this engine's private
    // `mousedown` listener. The skin selects the panel from its own root-level
    // class instead of by descendancy.
    const overlay = useFieldOverlay({
      kind: 'dropdown',
      open: isOpen,
      anchor: anchorEl,
      panel: panelEl,
      // The columns track grows past the field, so the trigger width is a
      // FLOOR here, not a fixed size (`inset-inline-start: 0` gave the panel
      // its start edge in-tree; portaled, the edge is measured).
      anchorWidth: 'min',
      placement: 'bottom-start',
      offset: 4,
      flip: true,
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onDismiss: dismissPanel,
      // Escape stays with this engine's own key handler: it closes AND returns
      // focus to the trigger, a component-scoped contract the shared router
      // cannot express. The layer still declares `modal: true`, so the router
      // keeps a lower dialog from claiming the same press.
      dismissOnEscape: false,
      dismissOnOutsidePointer: true,
    });

    const getDisplayValue = () => {
      if (selectedPath.length === 0) return '';
      const labels = selectedPath.map((opt) => String(getLabel(opt, fieldNames)));
      if (displayRender) {
        return displayRender(labels, selectedPath);
      }
      return labels.join(' / ');
    };

    /**
     * Accessible name for the combobox trigger: once a path is committed the
     * name must convey the selection (the placeholder only names the empty
     * control). Always the plain joined labels -- displayRender output can be
     * arbitrary ReactNode, never an aria string.
     */
    const getTriggerName = (): string => {
      if (selectedPath.length === 0) return placeholder;
      return selectedPath.map((opt) => String(getLabel(opt, fieldNames))).join(' / ');
    };

    /** Whether a flat search-result path equals the committed value. */
    const isFlatPathSelected = (fo: FlatOption): boolean => {
      const committed = (value ?? []) as (string | number)[];
      if (committed.length !== fo.values.length) return false;
      return fo.values.every((v, i) => committed[i] === v);
    };

    const isSearchMode = showSearch && searchValue.length > 0;

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          setAnchorEl(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`ds-cascader ds-cascader--modern ${className || ''}`}
        style={style}
        data-part="root"
        data-size={size}
        data-loading={loading || undefined}
        data-status={status || undefined}
      >
        {/* Geometry is skin-owned per `data-size` (the inline getSizeStyle
            paint is drained -- single paint owner per family law). */}
        <div
          ref={triggerRef}
          onClick={() => {
            if (disabled) return;
            if (isOpen) closeWithoutCommit();
            else handleOpenChange(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              if (!isOpen) handleOpenChange(true);
            } else if (e.key === 'Escape' && isOpen) {
              e.preventDefault();
              closeWithoutCommit();
            }
          }}
          {...partAttributes('trigger', trigger.state)}
          onPointerEnter={trigger.handlers.onPointerEnter}
          onPointerLeave={trigger.handlers.onPointerLeave}
          onPointerDown={trigger.handlers.onPointerDown}
          onPointerUp={trigger.handlers.onPointerUp}
          onFocus={trigger.handlers.onFocus}
          onBlur={trigger.handlers.onBlur}
          data-open={isOpen || undefined}
          data-disabled={disabled || undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? popupId : undefined}
          aria-haspopup="listbox"
          aria-label={getTriggerName()}
          aria-disabled={disabled || undefined}
          aria-busy={loading || undefined}
          aria-invalid={status === 'error' || undefined}
          tabIndex={disabled ? -1 : 0}
        >
          <span
            data-part={selectedPath.length > 0 ? 'value' : 'placeholder'}
          >
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {/* Busy posture replaces the chevron (antd suffix idiom); otherwise
              the governed chevron rotates skin-side via data-open. */}
          {loading ? (
            <span data-part="trigger-loading" aria-hidden="true" />
          ) : (
            <span data-part="arrow-icon" aria-hidden="true">
              <NavigationDownIcon decorative size={12} />
            </span>
          )}
        </div>

        {/* Clear lives OUTSIDE the combobox trigger: APG forbids interactive
            controls nested inside the interactive combobox element. The skin
            overlays it at the trigger's inline end. */}
        {allowClear && selectedPath.length > 0 && !disabled && (
          <CascaderClearButton label={tOr('cascader.clear', 'Clear')} onClear={handleClear} />
        )}

        {isOpen && (
          <>
            {/* The dropdown is a plain container (no role): APG forbids
                interactive content inside a listbox, so the search input sits
                OUTSIDE any listbox and each column is its own listbox of
                role="option" rows. Root `loading` masks the panel content
                with a loading-state that keeps the empty state's spatial
                contract (never a spinner floating in a blank panel). */}
            <FieldOverlayPanel overlay={overlay}>
            <div
              {...overlay.panelProps}
              ref={setPanelNode}
              id={popupId}
              data-part="dropdown"
              className={`${PANEL_SCOPE} ${popupClassName || ''}`.trim()}
              onKeyDown={handleDropdownKeyDown}
            >
            {loading ? (
              <div data-part="loading-state" role="status">
                <span data-part="loading-spinner" aria-hidden="true" />
                <span>{loadingLabel}</span>
              </div>
            ) : (
            <>
            {/* Search input (geometry drained to the skin). */}
            {showSearch && (
              <div data-part="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  {...partAttributes('search-input', searchField.state)}
                  onPointerEnter={searchField.handlers.onPointerEnter}
                  onPointerLeave={searchField.handlers.onPointerLeave}
                  onPointerDown={searchField.handlers.onPointerDown}
                  onPointerUp={searchField.handlers.onPointerUp}
                  onFocus={searchField.handlers.onFocus}
                  onBlur={searchField.handlers.onBlur}
                  placeholder={tOr('cascader.search_placeholder', 'Search...')}
                  /* Placeholder is the accessible-name floor (Mentions K4-D
                     idiom): without an aria-label the field fails axe `label`. */
                  aria-label={tOr('cascader.search_placeholder', 'Search...')}
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
                    filteredFlatOptions.map((fo, idx) => {
                      const isResultSelected = isFlatPathSelected(fo);
                      return (
                      <li key={idx}>
                        <CascaderOptionButton
                          onClick={() => handleSearchSelect(fo)}
                          data-selected={isResultSelected || undefined}
                          role="option"
                          aria-selected={isResultSelected}
                        >
                          <span data-part="option-label">{fo.labels.join(' / ')}</span>
                        </CascaderOptionButton>
                      </li>
                      );
                    })
                  ) : (
                    /* Empty posture inside the listbox carries the option
                       role + aria-disabled (aria-required-children;
                       Mentions idiom). */
                    <li data-part="empty" role="option" aria-disabled="true">{notFoundContent}</li>
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
                      /* The catalog value carries a {level} param
                         ('Level {level}'): pass it or AT would read the raw
                         placeholder literally. */
                      aria-label={tOr('cascader.column_label', `Level ${colIndex + 1}`, { level: colIndex + 1 })}
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
                              <CascaderOptionButton
                                disabled={option.disabled}
                                onClick={() => handleOptionClick(option, colIndex)}
                                onMouseEnter={() => handleOptionHover(option, colIndex)}
                                data-selected={isSelected || undefined}
                                data-disabled={option.disabled || undefined}
                                role="option"
                                aria-selected={!!isSelected}
                                aria-busy={isLoading || undefined}
                              >
                                <span data-part="option-label">{optLabel}</span>
                                {isLoading ? (
                                  /* Decorative mini-spinner: aria-busy on the
                                     option carries the state to AT. */
                                  <span data-part="loading" aria-hidden="true" />
                                ) : (
                                  (optChildren && optChildren.length > 0 || (!isLeaf(option, fieldNames) && loadData)) && (
                                    /* Governed chevron; the icon facade mirrors
                                       it under RTL (autoMirror). */
                                    <span data-part="chevron" aria-hidden="true">
                                      <NavigationForwardIcon decorative size={12} />
                                    </span>
                                  )
                                )}
                              </CascaderOptionButton>
                            </li>
                          );
                        })
                      ) : (
                        <li data-part="empty" role="option" aria-disabled="true">{notFoundContent}</li>
                      )}
                    </ul>
                  ))}
                </div>
              </>
            )}
            </>
            )}
            </div>
            </FieldOverlayPanel>
          </>
        )}
      </div>
    );
  }
);

Cascader.displayName = 'Cascader.Modern';

export default Cascader;
