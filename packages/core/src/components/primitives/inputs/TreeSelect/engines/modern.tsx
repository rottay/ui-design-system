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
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../TreeSelect.types';
import { TREESELECT_DEFAULTS } from '../TreeSelect.types';
import { useTranslation } from '../../../../../i18n';

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
        <span className="font-semibold" style={{ color: 'var(--ds-color-primary)' }}>{title.slice(idx, idx + searchValue.length)}</span>
        {title.slice(idx + searchValue.length)}
      </>
    );
  };

  return (
    <li>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer ${isSelected ? 'font-medium' : ''} ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px`, transition: 'all var(--ds-motion-fast)', ...(isSelected ? { background: 'var(--ds-color-bg-selected, color-mix(in srgb, var(--ds-color-primary) 10%, transparent))', color: 'var(--ds-color-primary)', borderLeft: '2px solid var(--ds-color-border-selected, var(--ds-color-primary))' } : {}) }}
        onClick={() => !node.disabled && onSelect(node)}
      >
        {/* Expand/collapse or leaf indicator */}
        {!isLeaf ? (
          <button
            type="button"
            style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', height: 24, padding: '0 var(--ds-spacing-2, 8px)', fontSize: 'var(--ds-font-size-xs, 12px)', borderRadius: 'var(--ds-radius-md)', border: 'none', cursor: 'pointer', marginRight: 'var(--ds-spacing-1, 4px)' }}
            onClick={handleExpand}
          >
            {isLoading ? (
              <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--ds-color-border)', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'spin var(--ds-motion-glacial) linear infinite' }} />
            ) : (
              <span style={{ transition: 'transform var(--ds-motion-fast)' }} className={`inline-block ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}
        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            className="mr-2"
            style={{
              width: 16,
              height: 16,
              accentColor: 'var(--ds-color-primary)',
              cursor: node.disabled || node.disableCheckbox ? 'not-allowed' : 'pointer',
              transition: 'all var(--ds-motion-fast)',
            }}
            checked={isSelected}
            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
            disabled={node.disabled || node.disableCheckbox}
            onChange={() => !node.disabled && onSelect(node)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <span className="flex-1">{renderTitle()}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className={treeLine ? 'ml-4' : ''} style={treeLine ? { borderLeft: '2px solid var(--ds-color-border-subtle, var(--ds-color-border))' } : undefined}>
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
      size = TREESELECT_DEFAULTS.size,
      notFoundContent,
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      treeLine,
      loadData,
      className,
      style,
    } = props;

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
        className={`relative ${className || ''}`}
        style={style}
      >
        <div
          className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            border: '1px solid var(--ds-color-border)',
            borderRadius: 'var(--ds-radius-md)',
            background: 'var(--ds-color-bg-input, var(--ds-surface-control))',
            color: 'var(--ds-color-text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
            ...getSizeStyle(),
          }}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
        >
          <span className="flex-1 truncate" style={selectedKeys.size === 0 ? { color: 'var(--ds-color-text-secondary)' } : undefined}>
            {selectedKeys.size > 0 ? getDisplayValue() : displayPlaceholder}
          </span>
          {allowClear && selectedKeys.size > 0 && !disabled && (
            <button
              type="button"
              style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)' }}
              onClick={handleClear}
            >
              ✕
            </button>
          )}
          <span style={{ transition: 'transform var(--ds-motion-fast)' }} className={`${isOpen ? 'rotate-180' : ''}`}>&#9660;</span>
        </div>

        {isOpen && (
          <>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-select-slide-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}` }} />
          <div style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 'var(--ds-spacing-1, 4px)', borderRadius: 'var(--ds-radius-lg)', maxHeight: 240, overflowY: 'auto', animation: 'rottay-select-slide-in var(--ds-motion-fast) ease-out', background: 'var(--ds-surface-card)', boxShadow: 'var(--ds-elevation-2)', borderColor: 'var(--ds-color-border)', borderWidth: 1, borderStyle: 'solid' }}>
            {/* Search input */}
            {showSearch && (
              <div className="p-2 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--ds-color-border)', background: 'var(--ds-surface-card)' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full"
                  style={{
                    border: '1px solid var(--ds-color-border)',
                    borderRadius: 'var(--ds-radius-md)',
                    padding: '4px var(--ds-input-sm-padding-x, 10px)',
                    fontSize: 'var(--ds-input-sm-font-size, 13px)',
                    height: 'var(--ds-input-sm-height, 32px)',
                    background: 'var(--ds-color-bg-input, var(--ds-surface-control))',
                    color: 'var(--ds-color-text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all var(--ds-motion-fast)',
                  }}
                  placeholder={t('treeselect.search_placeholder')}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {treeData.length > 0 ? (
              <ul className="p-2">
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
              <div className="p-4 text-center" style={{ color: 'var(--ds-color-text-secondary)' }}>
                {displayNotFound}
              </div>
            )}
          </div>
          </>
        )}
      </div>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Modern';

export default TreeSelect;
