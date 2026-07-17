'use client';

/**
 * @fileoverview TreeSelect Rustic Engine -- pure vanilla HTML/CSS implementation
 * for the Rottay Design System. All styling uses CSS variables (`--ds-treeselect-*`)
 * for multi-tenant theming. The dropdown is rendered via React portal to escape
 * parent overflow/stacking contexts.
 *
 * @example
 * ```tsx
 * <TreeSelect engine="rustic" treeData={nodes} showSearch treeLine />
 * ```
 *
 * @module RusticTreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../../contracts';
import { TREESELECT_DEFAULTS } from '../../contracts';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';

// ---------------------------------------------------------------------------
// Size configuration using CSS variables
// ---------------------------------------------------------------------------

const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-treeselect-sm-height)' },
  default: { height: 'var(--ds-treeselect-md-height)' },
  large: { height: 'var(--ds-treeselect-lg-height)' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a field from a node using fieldNames mapping */
function resolveField<T>(node: Record<string, unknown>, field: string, fallback: string): T {
  return (node[field] ?? node[fallback]) as T;
}

// Recursively remaps tree data through fieldNames so the component can use
// standard property names (title/value/children) regardless of the consumer's
// data shape. This runs once per treeData change (memoized in the component).
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

/** Collect all descendant values of a node */
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
 * Check if at least one (but not necessarily all) descendants are selected.
 * Used together with `areAllChildrenSelected` to determine the indeterminate
 * checkbox state in cascading mode.
 */
function hasSomeDescendantSelected(node: TreeSelectNode, selectedKeys: Set<string | number>): boolean {
  if (!node.children) return false;
  return node.children.some((child) =>
    selectedKeys.has(child.value) || hasSomeDescendantSelected(child, selectedKeys)
  );
}

/** Find parent keys for nodes that match a filter */
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
// TreeNodeItem component
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

/**
 * Renders a single tree node row with expand toggle, optional checkbox, and
 * highlighted title. Recurses into children when expanded. Inline styles use
 * CSS variables so each tenant's theme is applied automatically.
 */
const TreeNodeItem: React.FC<TreeNodeProps> = ({
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

  // Indeterminate state for cascading checkable
  const isIndeterminate = checkable && !treeCheckStrictly && hasChildren
    ? !areAllChildrenSelected(node, selectedKeys) && hasSomeDescendantSelected(node, selectedKeys)
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
  const renderTitle = (): ReactNode => {
    if (!searchValue || !filterFn) return node.title;
    const title = typeof node.title === 'string' ? node.title : String(node.title ?? '');
    const idx = title.toLowerCase().indexOf(searchValue.toLowerCase());
    if (idx === -1) return node.title;
    return (
      <>
        {title.slice(0, idx)}
        <span style={{ fontWeight: 600 }} data-part="tree-node-highlight">
          {title.slice(idx, idx + searchValue.length)}
        </span>
        {title.slice(idx + searchValue.length)}
      </>
    );
  };

  const nodeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--ds-treeselect-node-padding)',
    paddingLeft: `${level * 20 + 8}px`,
    cursor: node.disabled ? 'not-allowed' : 'pointer',
    opacity: node.disabled ? 0.5 : 1,
    fontSize: 'var(--ds-font-size-sm)',
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
  };

  const expandButtonStyle: React.CSSProperties = {
    cursor: 'pointer',
    marginRight: '4px',
    fontSize: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s',
  };

  const loadingSpinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    animation: 'ds-tree-select-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  };

  const treeLineStyle: React.CSSProperties = treeLine ? {
    margin: 0,
    padding: 0,
    marginLeft: `${level * 20 + 17}px`,
  } : {
    margin: 0,
    padding: 0,
    marginLeft: level > 0 ? `${level * 20 + 17}px` : 0,
  };

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        className="rottay-treeselect__node"
        style={nodeStyle}
        onClick={() => !node.disabled && onSelect(node)}
        data-part="option"
        data-selected={isSelected || undefined}
        data-disabled={node.disabled || undefined}
      >
        {/* Expand/collapse or leaf spacer */}
        {!isLeaf ? (
          <button
            type="button"
            onClick={handleExpand}
            style={expandButtonStyle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            data-part="tree-node-toggle"
            data-expanded={isExpanded || undefined}
          >
            {isLoading ? (
              <span style={loadingSpinnerStyle} data-part="loading" />
            ) : '▶'}
          </button>
        ) : (
          <span style={{ width: '18px' }} />
        )}
        {/* Checkbox */}
        {checkable && (
          <input
            type="checkbox"
            checked={isSelected}
            ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
            disabled={node.disabled || node.disableCheckbox}
            onChange={() => !node.disabled && onSelect(node)}
            onClick={(e) => e.stopPropagation()}
            style={{ marginRight: '8px' }}
            data-part="option-icon"
          />
        )}
        <span data-part="tree-node-label">
          {renderTitle()}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <ul style={treeLineStyle} data-part="tree-list" data-tree-line={treeLine || undefined} data-nested={level > 0 || undefined}>
          {node.children!.map((child) => (
            <TreeNodeItem
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
 * Rustic (vanilla HTML/CSS) engine for the TreeSelect component.
 *
 * Renders a trigger button and a portal-mounted dropdown tree. All visual
 * chrome is driven by `--ds-treeselect-*` CSS variables, enabling full
 * multi-tenant customization without class overrides. Keyframe animations
 * for the spinner and dropdown entrance are injected once into `<head>`.
 *
 * @param props - Standardized TreeSelectProps from the design system contract.
 * @param ref   - Forwarded ref attached to the trigger element.
 * @returns A fully self-contained tree-select with portal dropdown.
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
      status,
      notFoundContent,
      open: controlledOpen,
      onDropdownVisibleChange,
      fieldNames,
      treeLine,
      loadData,
      className = '',
      style,
    } = props;

    // SIZE_CONFIG and the BEM class suffix below are keyed by the legacy
    // 'small' | 'middle' | 'large' spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    const displayPlaceholder = placeholder ?? t('treeselect.placeholder');
    const displayNotFound = notFoundContent ?? t('treeselect.not_found');

    // Normalize data through fieldNames mapping
    const treeData = useMemo(
      () => normalizeNodes(rawTreeData, fieldNames),
      [rawTreeData, fieldNames]
    );

    // Determine filter function
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
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const [searchValue, setSearchValue] = useState('');
    const [loadingKeys, setLoadingKeys] = useState<Set<string | number>>(new Set());

    const isControlled = controlledValue !== undefined;
    const selectedKeys = isControlled ? normalizeValue(controlledValue) : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const expandedKeys = controlledExpandedKeys !== undefined
      ? new Set(controlledExpandedKeys)
      : internalExpandedKeys;

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    // Re-measure trigger position each time the dropdown opens so the portal
    // aligns correctly even after layout shifts (scroll, resize, etc.).
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

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
            allValues.forEach((v) => newSelectedKeys.delete(v));
          } else {
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

    // Auto-expand matching parents when searching
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

    // Click outside
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

    const getDisplayValue = (): string => {
      if (selectedKeys.size === 0) return '';
      const findTitle = (nodes: TreeSelectNode[], value: string | number): string => {
        for (const node of nodes) {
          if (node.value === value) return String(node.title);
          if (node.children) {
            const found = findTitle(node.children, value);
            if (found) return found;
          }
        }
        return '';
      };

      const titles = Array.from(selectedKeys)
        .map((v) => findTitle(treeData, v))
        .filter(Boolean);
      return titles.join(', ');
    };

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    // Build class names
    const containerClasses = [
      'rottay-treeselect',
      'rottay-treeselect--rustic',
      `rottay-treeselect--${size}`,
      status && `rottay-treeselect--${status}`,
      disabled && 'rottay-treeselect--disabled',
      isOpen && 'rottay-treeselect--open',
      className,
    ].filter(Boolean).join(' ');

    const triggerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      height: sizeConfig.height,
      padding: '0 12px',
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
      fontSize: 'var(--ds-font-size-sm)',
    };

    const clearButtonStyle: React.CSSProperties = {
      cursor: 'pointer',
      padding: '0 4px',
      fontSize: '14px',
    };

    const arrowStyle: React.CSSProperties = {
      marginLeft: '8px',
      transition: 'transform 0.2s',
      fontSize: '10px',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      width: position.width,
      maxHeight: 'var(--ds-treeselect-dropdown-max-height)',
      overflowY: 'auto',
      zIndex: 1050,
      animation: 'ds-tree-select-dropdown-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
      transformOrigin: 'top center',
    };

    const searchInputStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: '6px 10px',
      fontSize: 'var(--ds-font-size-sm)',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const searchContainerStyle: React.CSSProperties = {
      padding: '8px',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    };

    const emptyStyle: React.CSSProperties = {
      padding: '16px',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    // Portal the dropdown to document.body so it escapes parent overflow
    // containers and z-index stacking contexts (e.g., modals, drawers).
    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-treeselect__dropdown"
          data-part="dropdown"
          style={dropdownStyle}
        >
          {/* Search input */}
          {showSearch && (
            <div style={searchContainerStyle} data-part="search-input-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('treeselect.search_placeholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={searchInputStyle}
                data-part="search-input"
              />
            </div>
          )}
          {treeData.length > 0 ? (
            <ul style={{ margin: 0, padding: '8px' }} data-part="tree-list">
              {treeData.map((node) => (
                <TreeNodeItem
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
            <div className="rottay-treeselect__empty" data-part="empty" style={emptyStyle}>
              {displayNotFound}
            </div>
          )}
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
          data-part="trigger"
          data-open={isOpen || undefined}
          data-disabled={disabled || undefined}
          data-status={status || undefined}
        >
          <span style={valueStyle} data-part={selectedKeys.size > 0 ? 'value' : 'placeholder'}>
            {selectedKeys.size > 0 ? getDisplayValue() : displayPlaceholder}
          </span>
          {allowClear && selectedKeys.size > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
              aria-label="Clear"
              data-part="clear-button"
            >
              ✕
            </button>
          )}
          <span style={arrowStyle} data-part="arrow-icon">▼</span>
        </div>
        {dropdownContent}
      </>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Rustic';

export default TreeSelect;
