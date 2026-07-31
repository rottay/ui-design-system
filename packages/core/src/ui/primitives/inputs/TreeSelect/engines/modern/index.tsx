'use client';

/**
 * @fileoverview TreeSelect Modern Engine -- DaisyUI/Tailwind implementation for
 * the Rottay Design System. Renders a fully custom tree dropdown using Tailwind
 * utility classes, with no dependency on Ant Design's rc-tree.
 *
 * @example
 * ```tsx
 * <TreeSelect engine="modern" treeData={nodes} showSearch treeCheckable />
 * ```
 *
 * @module ModernTreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../../contracts';
import { TREESELECT_DEFAULTS } from '../../contracts';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a field from a node using fieldNames mapping */
function resolveField<T>(node: Record<string, unknown>, field: string, fallback: string): T {
  return (node[field] ?? node[fallback]) as T;
}

/**
 * Recursively remaps tree data through fieldNames so the component can use
 * standard property names (title/value/children) regardless of the consumer's
 * data shape. This runs once per treeData change (memoized in the component).
 */
function normalizeNodes(
  nodes: TreeSelectNode[],
  fieldNames?: { title?: string; value?: string; children?: string }
): TreeSelectNode[] {
  if (!fieldNames) return nodes;
  const titleKey = fieldNames.title ?? 'title';
  const valueKey = fieldNames.value ?? 'value';
  const childrenKey = fieldNames.children ?? 'children';

  return nodes.map((raw) => {
    const mapped: TreeSelectNode = {
      ...raw,
      title: resolveField<ReactNode>(raw as Record<string, unknown>, titleKey, 'title'),
      value: resolveField<string | number>(raw as Record<string, unknown>, valueKey, 'value'),
      children: raw[childrenKey as keyof TreeSelectNode]
        ? normalizeNodes(
            raw[childrenKey as keyof TreeSelectNode] as TreeSelectNode[],
            fieldNames
          )
        : undefined,
    };
    return mapped;
  });
}

/** Collect all node keys in a tree */
function collectAllKeys(nodes: TreeSelectNode[]): Set<string | number> {
  const keys = new Set<string | number>();
  const traverse = (list: TreeSelectNode[]) => {
    list.forEach((node) => {
      keys.add(node.key ?? node.value);
      if (node.children) traverse(node.children);
    });
  };
  traverse(nodes);
  return keys;
}

/**
 * Collect all descendant values of a node. Used in cascading checkbox mode
 * to select/deselect entire sub-trees in a single click.
 */
function collectDescendantValues(node: TreeSelectNode): Set<string | number> {
  const values = new Set<string | number>();
  const traverse = (n: TreeSelectNode) => {
    if (n.children) {
      n.children.forEach((child) => {
        values.add(child.value);
        traverse(child);
      });
    }
  };
  traverse(node);
  return values;
}

/** Check if all children of a node are selected */
function areAllChildrenSelected(node: TreeSelectNode, selectedKeys: Set<string | number>): boolean {
  if (!node.children || node.children.length === 0) return selectedKeys.has(node.value);
  return node.children.every((child) => areAllChildrenSelected(child, selectedKeys));
}

/**
 * Walk the tree and collect keys of parent nodes that have at least one
 * descendant matching the filter. Used to auto-expand ancestors during search
 * so matching leaf nodes are always visible.
 */
function findMatchingParentKeys(
  nodes: TreeSelectNode[],
  filterFn: (node: TreeSelectNode) => boolean
): Set<string | number> {
  const parentKeys = new Set<string | number>();

  const traverse = (list: TreeSelectNode[]): boolean => {
    let anyMatch = false;
    for (const node of list) {
      const selfMatch = filterFn(node);
      const childMatch = node.children ? traverse(node.children) : false;
      if (selfMatch || childMatch) {
        anyMatch = true;
        if (node.children && node.children.length > 0) {
          parentKeys.add(node.key ?? node.value);
        }
      }
    }
    return anyMatch;
  };
  traverse(nodes);
  return parentKeys;
}

/** Default filter: case-insensitive title match */
function defaultFilterFn(inputValue: string, node: TreeSelectNode): boolean {
  const title = typeof node.title === 'string' ? node.title : String(node.title ?? '');
  return title.toLowerCase().includes(inputValue.toLowerCase());
}

// ---------------------------------------------------------------------------
// TreeNode component
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: TreeSelectNode;
  level: number;
  expandedKeys: Set<string | number>;
  selectedKeys: Set<string | number>;
  onToggle: (key: string | number) => void;
  onSelect: (node: TreeSelectNode) => void;
  checkable?: boolean;
  treeCheckStrictly?: boolean;
  treeLine?: boolean;
  loadData?: (node: TreeSelectNode) => Promise<void>;
  loadingKeys: Set<string | number>;
  searchValue: string;
  filterFn: ((inputValue: string, treeNode: TreeSelectNode) => boolean) | null;
}

/** Renders a single tree node row with expand toggle, optional checkbox, and
 *  highlighted title. Recurses into children when expanded. Nodes that do not
 *  match the active search filter (and have no matching descendants) are hidden. */
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  expandedKeys,
  selectedKeys,
  onToggle,
  onSelect,
  checkable,
  treeCheckStrictly,
  treeLine,
  loadData,
  loadingKeys,
  searchValue,
  filterFn,
}) => {
  const { t } = useTranslation('components');
  const key = node.key ?? node.value;
  const isExpanded = expandedKeys.has(key);
  const isSelected = selectedKeys.has(node.value);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.isLeaf === true || (!hasChildren && !loadData);
  const isLoading = loadingKeys.has(key);

  // Indeterminate state shows a dash in the checkbox when some, but not all,
  // descendants are selected. Only relevant in cascading (non-strict) mode.
  const isIndeterminate = checkable && !treeCheckStrictly && hasChildren
    ? !areAllChildrenSelected(node, selectedKeys) &&
      node.children!.some((child) => selectedKeys.has(child.value) || (child.children && collectDescendantValues(child).size > 0 && Array.from(collectDescendantValues(child)).some((v) => selectedKeys.has(v))))
    : false;

  // Filter visibility
  if (searchValue && filterFn) {
    const selfMatch = filterFn(searchValue, node);
    const childrenMatch = hasChildren && node.children!.some((child) => {
      const check = (n: TreeSelectNode): boolean => {
        if (filterFn(searchValue, n)) return true;
        return n.children ? n.children.some(check) : false;
      };
      return check(child);
    });
    if (!selfMatch && !childrenMatch) return null;
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadData && !hasChildren && !isLeaf && !isLoading) {
      loadData(node);
    }
    onToggle(key);
  };

  // Highlight matched text
  const renderTitle = () => {
    if (!searchValue || !filterFn) return node.title;
    const title = typeof node.title === 'string' ? node.title : String(node.title ?? '');
    const idx = title.toLowerCase().indexOf(searchValue.toLowerCase());
    if (idx === -1) return node.title;
    return (
      <>
        {title.slice(0, idx)}
        <span data-part="tree-node-highlight">{title.slice(idx, idx + searchValue.length)}</span>
        {title.slice(idx + searchValue.length)}
      </>
    );
  };

  return (
    <li>
      <div
        style={{
          // Logical indent (RTL flips it free) riding the governed channels:
          // per-level step + base offset, all skin-tunable.
          paddingInlineStart: `calc(${level} * var(--ds-tree-select-indent, 16px) + var(--ds-spacing-2, 8px))`,
        }}
        onClick={() => !node.disabled && onSelect(node)}
        data-part="option"
        data-selected={isSelected || undefined}
        data-disabled={node.disabled || undefined}
        data-key={key}
        data-level={level}
        data-has-children={hasChildren ? 'true' : undefined}
        data-expanded={hasChildren ? (isExpanded ? 'true' : 'false') : undefined}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={level + 1}
        aria-disabled={node.disabled || undefined}
        aria-checked={checkable ? (isIndeterminate ? 'mixed' : isSelected) : undefined}
        tabIndex={node.disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !node.disabled) {
            e.preventDefault();
            onSelect(node);
          }
        }}
      >
        {/* Expand/collapse or leaf indicator */}
        {!isLeaf ? (
          <button
            type="button"
            style={{ height: 24, padding: '0 var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)', cursor: 'pointer', marginInlineEnd: 'var(--ds-spacing-1, 4px)' }}
            onClick={handleExpand}
            data-part="tree-node-toggle"
            aria-label={isExpanded ? t('treeselect.collapse') : t('treeselect.expand')}
            aria-expanded={isExpanded}
            tabIndex={-1}
          >
            {isLoading ? (
              <span data-part="loading" />
            ) : (
              /* Governed chevron; direction (inline-end vs down) and the RTL
                 mirror ride the icon facade's autoMirror + the skin's
                 data-expanded rotation. */
              <span data-part="chevron" data-expanded={isExpanded || undefined}>
                <NavigationForwardIcon decorative size={12} />
              </span>
            )}
          </button>
        ) : (
          <span data-part="leaf-spacer" aria-hidden="true" />
        )}
        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            data-part="option-icon"
            style={{
              width: 16,
              height: 16,
              cursor: node.disabled || node.disableCheckbox ? 'not-allowed' : 'pointer',
            }}
            checked={isSelected}
            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
            disabled={node.disabled || node.disableCheckbox}
            onChange={() => !node.disabled && onSelect(node)}
            onClick={(e) => e.stopPropagation()}
            aria-label={typeof node.title === 'string' ? node.title : undefined}
            tabIndex={-1}
          />
        )}
        <span data-part="tree-node-label">{renderTitle()}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul data-part="tree-list" data-tree-line={treeLine || undefined} role="group">
          {node.children!.map((child) => (
            <TreeNode
              key={child.key ?? child.value}
              node={child}
              level={level + 1}
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onToggle={onToggle}
              onSelect={onSelect}
              checkable={checkable}
              treeCheckStrictly={treeCheckStrictly}
              treeLine={treeLine}
              loadData={loadData}
              loadingKeys={loadingKeys}
              searchValue={searchValue}
              filterFn={filterFn}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// ---------------------------------------------------------------------------
// TreeSelect component
// ---------------------------------------------------------------------------

/**
 * Modern (DaisyUI/Tailwind) engine for the TreeSelect component.
 *
 * Builds a fully custom dropdown tree using Tailwind utilities. Supports
 * single and multi-select, cascading or strict checkbox behaviour, lazy
 * loading via `loadData`, and live search with automatic ancestor expansion.
 *
 * @param props - Standardized TreeSelectProps from the design system contract.
 * @param ref   - Forwarded ref attached to the root container div.
 * @returns A self-contained tree-select dropdown with keyboard-friendly UX.
 */
export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(
  (props, ref) => {
    const { t } = useTranslation('components');

    const {
      treeData: rawTreeData,
      value: controlledValue,
      defaultValue,
      onChange,
      multiple,
      treeCheckable,
      treeCheckStrictly,
      showSearch,
      filterTreeNode,
      treeDefaultExpandAll,
      treeDefaultExpandedKeys,
      treeExpandedKeys: controlledExpandedKeys,
      onTreeExpand,
      placeholder,
      disabled,
      allowClear = TREESELECT_DEFAULTS.allowClear,
      size: sizeProp = TREESELECT_DEFAULTS.size,
      notFoundContent,
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      treeLine,
      loadData,
      className,
      style,
    } = props;

    // getSizeStyle's switch below is keyed by the legacy 'small' | 'middle' | 'large'
    // spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    const displayPlaceholder = placeholder ?? t('treeselect.placeholder');
    const displayNotFound = notFoundContent ?? t('treeselect.not_found');

    // Normalize once per data/fieldNames change so every downstream helper
    // can rely on standard title/value/children property names.
    const treeData = useMemo(
      () => normalizeNodes(rawTreeData, fieldNames),
      [rawTreeData, fieldNames]
    );

    // Resolve the effective filter: explicit function, default case-insensitive
    // title match when showSearch is on, or null (no filtering).
    const filterFn = useMemo<((inputValue: string, treeNode: TreeSelectNode) => boolean) | null>(() => {
      if (filterTreeNode === false) return null;
      if (typeof filterTreeNode === 'function') return filterTreeNode;
      if (filterTreeNode === true || showSearch) return defaultFilterFn;
      return null;
    }, [filterTreeNode, showSearch]);

    const getInitialExpanded = (): Set<string | number> => {
      if (controlledExpandedKeys) return new Set(controlledExpandedKeys);
      if (treeDefaultExpandAll) return collectAllKeys(treeData);
      return new Set(treeDefaultExpandedKeys || []);
    };

    const normalizeValue = (val: TreeSelectValue | undefined): Set<string | number> => {
      if (val === undefined) return new Set();
      if (Array.isArray(val)) return new Set(val);
      return new Set([val]);
    };

    const [internalValue, setInternalValue] = useState<Set<string | number>>(
      normalizeValue(defaultValue)
    );
    const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string | number>>(getInitialExpanded);
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());

    const isControlled = controlledValue !== undefined;
    const selectedKeys = isControlled ? normalizeValue(controlledValue) : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const expandedKeys = controlledExpandedKeys !== undefined
      ? new Set(controlledExpandedKeys)
      : internalExpandedKeys;

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reading-direction probe (Tree/Segmented engine idiom).
    const isRtl = (el: HTMLElement): boolean => {
      const scoped = el.closest('[dir]');
      if (scoped) return scoped.getAttribute('dir') === 'rtl';
      return document.documentElement.dir === 'rtl';
    };

    // Sync controlled expanded keys
    useEffect(() => {
      if (controlledExpandedKeys) {
        setInternalExpandedKeys(new Set(controlledExpandedKeys));
      }
    }, [controlledExpandedKeys]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
      if (!newOpen) {
        setSearchValue('');
      }
    }, [controlledOpen, onDropdownVisibleChange]);

    // Focus search on open
    useEffect(() => {
      if (isOpen && showSearch) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }, [isOpen, showSearch]);

    const handleToggle = useCallback((key: string | number) => {
      const next = new Set(expandedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (controlledExpandedKeys === undefined) {
        setInternalExpandedKeys(next);
      }
      onTreeExpand?.(Array.from(next));
    }, [expandedKeys, controlledExpandedKeys, onTreeExpand]);

    const handleLoadData = useCallback(async (node: TreeSelectNode) => {
      if (!loadData) return;
      const key = node.key ?? node.value;
      setLoadingKeys((prev) => new Set(prev).add(key));
      try {
        await loadData(node);
      } finally {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }, [loadData]);

    const handleSelect = useCallback((node: TreeSelectNode) => {
      let newSelectedKeys: Set<string | number>;

      if (multiple || treeCheckable) {
        newSelectedKeys = new Set(selectedKeys);

        if (treeCheckStrictly) {
          // Strict mode: toggle only this node
          if (newSelectedKeys.has(node.value)) {
            newSelectedKeys.delete(node.value);
          } else {
            newSelectedKeys.add(node.value);
          }
        } else {
          // Cascading mode: toggle node + all descendants
          const descendantValues = collectDescendantValues(node);
          const allValues = new Set([node.value, ...descendantValues]);

          if (newSelectedKeys.has(node.value)) {
            // Uncheck: remove self + all descendants
            allValues.forEach((v) => newSelectedKeys.delete(v));
          } else {
            // Check: add self + all descendants
            allValues.forEach((v) => newSelectedKeys.add(v));
          }
        }
      } else {
        newSelectedKeys = new Set([node.value]);
        handleOpenChange(false);
      }

      if (!isControlled) {
        setInternalValue(newSelectedKeys);
      }

      const valueArray = Array.from(newSelectedKeys);
      const outputValue = multiple || treeCheckable ? valueArray : valueArray[0];
      onChange?.(outputValue, [node.title], { triggerValue: node.value });
    }, [selectedKeys, multiple, treeCheckable, treeCheckStrictly, isControlled, onChange, handleOpenChange]);

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue(new Set());
      }
      onChange?.(multiple || treeCheckable ? [] : '', [], { triggerValue: '' });
    };

    // When the search value changes, automatically expand ancestor nodes of
    // any matching nodes so the user can see results without manual expansion.
    useEffect(() => {
      if (searchValue && filterFn) {
        const matchingParents = findMatchingParentKeys(treeData, (n) => filterFn(searchValue, n));
        if (matchingParents.size > 0) {
          const merged = new Set([...expandedKeys, ...matchingParents]);
          if (controlledExpandedKeys === undefined) {
            setInternalExpandedKeys(merged);
          }
          onTreeExpand?.(Array.from(merged));
        }
      }
    }, [searchValue, filterFn, treeData]);

    // APG treeview keyboard contract (Tree P20 idiom): ArrowUp/Down move DOM
    // focus across the VISIBLE rows in DOM order; forward (ArrowRight in LTR)
    // expands a collapsed parent (no-op on leaves/expanded); backward
    // collapses an expanded parent or jumps to the parent row; Home/End jump
    // to the edges; Escape closes and returns focus to the trigger.
    // Forward/backward swap under RTL.
    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleOpenChange(false);
        triggerRef.current?.focus();
        return;
      }
      const target = e.target as HTMLElement;
      const row = target.closest?.('[data-part="option"]') as HTMLElement | null;
      if (!row) return;
      const rows = Array.from(
        dropdownRef.current?.querySelectorAll<HTMLElement>('[data-part="option"]:not([data-disabled="true"])') ?? [],
      );
      const currentIndex = rows.indexOf(row);

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (rows.length === 0) return;
        const nextIndex = currentIndex < 0
          ? 0
          : (currentIndex + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
        rows[nextIndex]?.focus();
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        rows[0]?.focus();
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        rows[rows.length - 1]?.focus();
        return;
      }

      const rtl = isRtl(row);
      const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';
      const key = row.getAttribute('data-key');
      const hasChildren = row.getAttribute('data-has-children') === 'true';
      const expanded = row.getAttribute('data-expanded') === 'true';

      if (e.key === forwardKey) {
        if (!hasChildren || expanded || key === null) return;
        e.preventDefault();
        handleToggle(key);
        return;
      }
      if (e.key === backwardKey) {
        e.preventDefault();
        if (expanded && key !== null) {
          handleToggle(key);
          return;
        }
        // Collapsed or leaf: move DOM focus to the parent row (nearest
        // previous row with a lower data-level).
        const level = Number(row.getAttribute('data-level') ?? 0);
        if (level === 0) return;
        for (let i = currentIndex - 1; i >= 0; i -= 1) {
          const candidate = rows[i];
          if (candidate && Number(candidate.getAttribute('data-level') ?? 0) < level) {
            candidate.focus();
            return;
          }
        }
      }
    };

    // Close the dropdown when the user clicks outside the component boundary.
    // The listener is only active while the dropdown is open.
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

    const getDisplayValue = (): string => {
      if (selectedKeys.size === 0) return '';
      const findTitle = (nodes: TreeSelectNode[], value: string | number): ReactNode => {
        for (const node of nodes) {
          if (node.value === value) return node.title;
          if (node.children) {
            const found = findTitle(node.children, value);
            if (found) return found;
          }
        }
        return null;
      };

      const titles = Array.from(selectedKeys)
        .map((v) => findTitle(treeData, v))
        .filter(Boolean);
      return titles.join(', ');
    };

    const getSizeStyle = (): React.CSSProperties => {
      switch (size) {
        case 'small': return { height: 'var(--ds-input-sm-height, 32px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', padding: '4px var(--ds-input-sm-padding-x, 10px)' };
        case 'large': return { height: 'var(--ds-input-lg-height, 44px)', fontSize: 'var(--ds-input-lg-font-size, 15px)', padding: '8px var(--ds-input-lg-padding-x, 14px)' };
        default: return { height: 'var(--ds-input-md-height, 40px)', fontSize: 'var(--ds-input-md-font-size, 14px)', padding: '6px var(--ds-input-md-padding-x, 12px)' };
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`ds-tree-select ds-tree-select--modern ${className || ''}`}
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
          aria-haspopup="tree"
          aria-label={displayPlaceholder}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
        >
          <span
            data-part={selectedKeys.size > 0 ? 'value' : 'placeholder'}
          >
            {selectedKeys.size > 0 ? getDisplayValue() : displayPlaceholder}
          </span>
          {/* Governed chevron; the open rotation is skin-owned via data-open. */}
          <span data-part="arrow-icon" aria-hidden="true">
            <NavigationDownIcon decorative size={12} />
          </span>
        </div>

        {/* Clear lives OUTSIDE the combobox trigger (APG: no nested
            interactives); the skin overlays it at the trigger's inline end.
            The `sr-only` ✕ text is a test-pinned bridge (engine-advanced
            queries the clear button by its text content); the visible
            affordance is the governed icon. */}
        {allowClear && selectedKeys.size > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            data-part="clear-button"
            aria-label={t('treeselect.clear')}
          >
            <ActionCloseIcon decorative size={12} />
            <span className="sr-only" aria-hidden="true">✕</span>
          </button>
        )}

        {isOpen && (
          /* The dropdown is a plain container (no role): APG forbids
             interactive content inside a listbox, so the search input sits
             OUTSIDE the tree, and the tree itself owns the roles. */
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
                  placeholder={t('treeselect.search_placeholder')}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {treeData.length > 0 ? (
              <ul data-part="tree-list" role="tree" aria-label={displayPlaceholder}>
                {treeData.map((node) => (
                  <TreeNode
                    key={node.key ?? node.value}
                    node={node}
                    level={0}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    checkable={treeCheckable}
                    treeCheckStrictly={treeCheckStrictly}
                    treeLine={treeLine}
                    loadData={handleLoadData}
                    loadingKeys={loadingKeys}
                    searchValue={searchValue}
                    filterFn={filterFn}
                  />
                ))}
              </ul>
            ) : (
              <div data-part="empty">
                {displayNotFound}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Modern';

export default TreeSelect;
