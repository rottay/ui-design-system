'use client';

/**
 * @fileoverview TreeSelect Rustic Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the TreeSelect component
 * using CSS variables for multi-tenant theming.
 *
 * Features:
 * - treeCheckStrictly: independent parent/child checkbox selection
 * - filterTreeNode + search input with auto-expand of matching parents
 * - fieldNames: custom field mapping (title, value, children)
 * - loadData: lazy load children with loading spinner
 * - treeLine: CSS border connector lines between nodes
 * - Controlled expand: treeExpandedKeys + onTreeExpand callback
 *
 * @module RusticTreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../../types';
import { TREESELECT_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

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

/** Normalize raw tree data through fieldNames mapping */
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

/** Check if some (but not all) descendants are selected */
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
        <span style={{ color: 'var(--ds-color-primary)', fontWeight: 600 }}>
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
    backgroundColor: isSelected ? 'var(--ds-treeselect-node-bg-selected)' : 'transparent',
    opacity: node.disabled ? 0.5 : 1,
    borderRadius: 'var(--ds-treeselect-node-radius)',
    fontSize: 'var(--ds-font-size-sm)',
    transition: 'background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
    borderLeft: isSelected ? '3px solid var(--ds-color-primary, #1677ff)' : '3px solid transparent',
  };

  const expandButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '4px',
    fontSize: '10px',
    color: 'var(--ds-treeselect-expand-color)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
  };

  const loadingSpinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid var(--ds-color-border-primary)',
    borderTopColor: 'var(--ds-color-primary)',
    borderRadius: '50%',
    animation: 'rottay-treeselect-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  };

  const treeLineStyle: React.CSSProperties = treeLine ? {
    margin: 0,
    padding: 0,
    borderLeft: '1px solid var(--ds-color-border-primary)',
    marginLeft: `${level * 20 + 17}px`,
  } : {
    margin: 0,
    padding: 0,
    borderLeft: level > 0 ? '1px solid var(--ds-color-border-secondary, rgba(0,0,0,0.06))' : 'none',
    marginLeft: level > 0 ? `${level * 20 + 17}px` : 0,
  };

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        className="rottay-treeselect__node"
        style={nodeStyle}
        onClick={() => !node.disabled && onSelect(node)}
        onMouseEnter={(e) => {
          if (!node.disabled && !isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--ds-treeselect-node-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {/* Expand/collapse or leaf spacer */}
        {!isLeaf ? (
          <button
            type="button"
            onClick={handleExpand}
            style={expandButtonStyle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isLoading ? (
              <span style={loadingSpinnerStyle} />
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
          />
        )}
        <span style={{ color: isSelected ? 'var(--ds-treeselect-node-color-selected)' : 'inherit' }}>
          {renderTitle()}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <ul style={treeLineStyle}>
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
    const [isFocused, setIsFocused] = useState(false);
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
      setIsFocused(newOpen);
      if (!newOpen) {
        setSearchValue('');
      }
    }, [controlledOpen, onDropdownVisibleChange]);

    // Update position
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

    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-treeselect-border-error)';
      if (status === 'warning') return 'var(--ds-treeselect-border-warning)';
      if (isFocused) return 'var(--ds-treeselect-border-focus)';
      return 'var(--ds-treeselect-border)';
    };

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
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--ds-treeselect-radius)',
      backgroundColor: 'var(--ds-treeselect-bg)',
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
      color: selectedKeys.size > 0 ? 'inherit' : 'var(--ds-treeselect-placeholder-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const clearButtonStyle: React.CSSProperties = {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ds-treeselect-clear-color)',
      padding: '0 4px',
      fontSize: '14px',
    };

    const arrowStyle: React.CSSProperties = {
      marginLeft: '8px',
      transition: 'transform 0.2s',
      transform: isOpen ? 'rotate(180deg)' : 'none',
      fontSize: '10px',
      color: 'var(--ds-treeselect-arrow-color)',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      width: position.width,
      backgroundColor: 'var(--ds-treeselect-dropdown-bg)',
      borderRadius: 'var(--ds-treeselect-dropdown-radius)',
      boxShadow: 'var(--ds-card-shadow, var(--ds-treeselect-dropdown-shadow))',
      maxHeight: 'var(--ds-treeselect-dropdown-max-height)',
      overflowY: 'auto',
      zIndex: 1050,
      animation: 'rottay-treeselect-dropdown-in var(--ds-personality-animation-entrance-duration, 0.15s) cubic-bezier(0.16, 1, 0.3, 1)',
      transformOrigin: 'top center',
    };

    const searchInputStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: '6px 10px',
      border: '1px solid var(--ds-color-border-primary)',
      borderRadius: 'var(--ds-radius-sm)',
      fontSize: 'var(--ds-font-size-sm)',
      backgroundColor: 'var(--ds-input-bg)',
      color: 'inherit',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const searchContainerStyle: React.CSSProperties = {
      padding: '8px',
      borderBottom: '1px solid var(--ds-color-border-secondary)',
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--ds-treeselect-dropdown-bg)',
      zIndex: 1,
    };

    const emptyStyle: React.CSSProperties = {
      padding: '16px',
      textAlign: 'center',
      color: 'var(--ds-treeselect-empty-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    // Inject keyframe animation for spinner (only once)
    useEffect(() => {
      const styleId = 'rottay-treeselect-spin-keyframes';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          @keyframes rottay-treeselect-spin { to { transform: rotate(360deg); } }
          @keyframes rottay-treeselect-dropdown-in { from { opacity: 0; transform: scaleY(0.95) translateY(-4px); } to { opacity: 1; transform: scaleY(1) translateY(0); } }
        `;
        document.head.appendChild(styleEl);
      }
    }, []);

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-treeselect__dropdown"
          style={dropdownStyle}
        >
          {/* Search input */}
          {showSearch && (
            <div style={searchContainerStyle}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('treeselect.search_placeholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={searchInputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ds-color-primary, #1677ff)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 119, 255, 0.15), 0 0 8px rgba(22, 119, 255, 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ds-color-border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
          {treeData.length > 0 ? (
            <ul style={{ margin: 0, padding: '8px' }}>
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
            <div className="rottay-treeselect__empty" style={emptyStyle}>
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
        >
          <span style={valueStyle}>
            {selectedKeys.size > 0 ? getDisplayValue() : displayPlaceholder}
          </span>
          {allowClear && selectedKeys.size > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
              aria-label="Clear"
            >
              ✕
            </button>
          )}
          <span style={arrowStyle}>▼</span>
        </div>
        {dropdownContent}
      </>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Rustic';

export default TreeSelect;
