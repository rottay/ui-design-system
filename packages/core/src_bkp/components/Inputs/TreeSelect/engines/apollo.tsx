'use client';

/**
 * Apollo TreeSelect Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { TreeSelectProps, TreeSelectNode, TreeSelectSingleValue, TreeSelectValue } from '../types';
import {
  getNodeValue,
  getNodeLabel,
  getNodeChildren,
  findTreeNode,
  defaultTreeFilter,
  isMultipleValue,
} from '../../../../types/components/treeselect';

/**
 * Apollo TreeSelect Component
 *
 * Pure Tailwind-styled tree select.
 */
export default function ApolloTreeSelect(props: TreeSelectProps) {
  const {
    treeData = [],
    value: controlledValue,
    defaultValue,
    placeholder = 'Select...',
    disabled = false,
    multiple = false,
    treeCheckable = false,
    allowClear = false,
    size = 'middle',
    status,
    variant = 'outlined',
    showSearch = false,
    searchValue: controlledSearchValue,
    treeDefaultExpandAll = false,
    treeDefaultExpandedKeys = [],
    treeExpandedKeys: controlledExpandedKeys,
    treeLine = false,
    fieldNames,
    open: controlledOpen,
    notFoundContent = 'No data',
    filterTreeNode = true,
    onChange,
    onSearch,
    onDropdownVisibleChange,
    onSelect,
    onTreeExpand,
    onFocus,
    onBlur,
    className = '',
    style,
    id,
    autoFocus,
  } = props;

  // Internal state
  const [internalValue, setInternalValue] = useState<TreeSelectValue | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(() => {
    if (treeDefaultExpandAll) {
      const allKeys: (string | number)[] = [];
      const collectKeys = (nodes: TreeSelectNode[]) => {
        for (const node of nodes) {
          allKeys.push(getNodeValue(node, fieldNames));
          const children = getNodeChildren(node, fieldNames);
          if (children) collectKeys(children);
        }
      };
      collectKeys(treeData);
      return allKeys;
    }
    return treeDefaultExpandedKeys;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = controlledValue ?? internalValue;
  const searchValue = controlledSearchValue ?? internalSearchValue;
  const dropdownOpen = controlledOpen ?? isOpen;
  const currentExpandedKeys = controlledExpandedKeys ?? expandedKeys;
  const isMultiple = multiple || treeCheckable;

  // Get selected values as array
  const selectedValues = useMemo(() => {
    if (value === undefined) return [];
    return isMultipleValue(value) ? value : [value];
  }, [value]);

  // Get display label
  const displayLabel = useMemo(() => {
    if (selectedValues.length === 0) return '';
    if (isMultiple) return `${selectedValues.length} selected`;
    const node = findTreeNode(treeData, selectedValues[0], fieldNames);
    return node ? getNodeLabel(node, fieldNames) : String(selectedValues[0]);
  }, [selectedValues, treeData, fieldNames, isMultiple]);

  // Filter tree nodes
  const filterNodes = useCallback(
    (nodes: TreeSelectNode[]): TreeSelectNode[] => {
      if (!searchValue || filterTreeNode === false) return nodes;

      return nodes.reduce<TreeSelectNode[]>((acc, node) => {
        const children = getNodeChildren(node, fieldNames);
        const filteredChildren = children ? filterNodes(children) : undefined;
        const matchesFilter =
          typeof filterTreeNode === 'function'
            ? filterTreeNode(searchValue, node)
            : defaultTreeFilter(searchValue, node, fieldNames);

        if (matchesFilter || (filteredChildren && filteredChildren.length > 0)) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }
        return acc;
      }, []);
    },
    [searchValue, filterTreeNode, fieldNames]
  );

  const filteredTreeData = useMemo(() => filterNodes(treeData), [filterNodes, treeData]);

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    middle: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };

  // Status classes
  const statusClasses = {
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20',
  };

  // Variant classes
  const variantClasses = {
    outlined: 'border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    borderless: 'border-0 focus:ring-0',
    filled: 'border-0 bg-gray-100 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20',
  };

  // Handle node click
  const handleNodeSelect = useCallback(
    (nodeValue: TreeSelectSingleValue, node: TreeSelectNode) => {
      if (node.disabled || (treeCheckable && !node.checkable && node.checkable !== undefined)) {
        return;
      }

      let newValue: TreeSelectValue;

      if (isMultiple) {
        const currentValues = selectedValues;
        if (currentValues.includes(nodeValue)) {
          newValue = currentValues.filter((v) => v !== nodeValue);
        } else {
          newValue = [...currentValues, nodeValue];
        }
      } else {
        newValue = nodeValue;
        setIsOpen(false);
        onDropdownVisibleChange?.(false);
      }

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      const labels = isMultipleValue(newValue)
        ? newValue.map((v) => {
            const n = findTreeNode(treeData, v, fieldNames);
            return n ? getNodeLabel(n, fieldNames) : String(v);
          })
        : [getNodeLabel(node, fieldNames)];

      onChange?.(newValue, labels, { triggerValue: nodeValue, triggerNode: node });
      onSelect?.(nodeValue, node);
    },
    [
      isMultiple,
      selectedValues,
      controlledValue,
      treeData,
      fieldNames,
      onChange,
      onSelect,
      onDropdownVisibleChange,
      treeCheckable,
    ]
  );

  // Handle expand
  const handleExpand = useCallback(
    (nodeValue: string | number) => {
      const newKeys = currentExpandedKeys.includes(nodeValue)
        ? currentExpandedKeys.filter((k) => k !== nodeValue)
        : [...currentExpandedKeys, nodeValue];

      if (controlledExpandedKeys === undefined) {
        setExpandedKeys(newKeys);
      }
      onTreeExpand?.(newKeys);
    },
    [currentExpandedKeys, controlledExpandedKeys, onTreeExpand]
  );

  // Handle search
  const handleSearch = useCallback(
    (val: string) => {
      if (controlledSearchValue === undefined) {
        setInternalSearchValue(val);
      }
      onSearch?.(val);
    },
    [controlledSearchValue, onSearch]
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = isMultiple ? [] : undefined;
      if (controlledValue === undefined) {
        setInternalValue(newValue as TreeSelectValue);
      }
      onChange?.(newValue as TreeSelectValue, [], { triggerValue: '' as TreeSelectSingleValue, triggerNode: {} as TreeSelectNode });
    },
    [isMultiple, controlledValue, onChange]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onDropdownVisibleChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDropdownVisibleChange]);

  // Render tree node
  const renderNode = (node: TreeSelectNode, level: number = 0) => {
    const nodeValue = getNodeValue(node, fieldNames);
    const nodeLabel = getNodeLabel(node, fieldNames);
    const children = getNodeChildren(node, fieldNames);
    const isExpanded = currentExpandedKeys.includes(nodeValue);
    const isSelected = selectedValues.includes(nodeValue);
    const hasChildren = children && children.length > 0;

    return (
      <div key={String(nodeValue)}>
        <div
          className={[
            'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded transition-colors',
            isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100',
            node.disabled ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => !node.disabled && handleNodeSelect(nodeValue, node)}
        >
          {/* Expand icon */}
          {hasChildren && (
            <button
              type="button"
              className="p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand(nodeValue);
              }}
            >
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!hasChildren && treeLine && <span className="w-4" />}

          {/* Checkbox for multiple */}
          {isMultiple && (
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isSelected}
              disabled={node.disabled}
              onChange={() => {}}
            />
          )}

          {/* Label */}
          <span className="flex-1 truncate text-sm">{nodeLabel}</span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className={treeLine ? 'border-l border-gray-200 ml-4' : ''}>
            {children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectClasses = [
    'w-full flex items-center justify-between rounded-md cursor-pointer outline-none transition-colors',
    sizeClasses[size],
    variantClasses[variant],
    status ? statusClasses[status] : '',
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className="relative w-full" style={style}>
      {/* Select trigger */}
      <div
        id={id}
        className={selectClasses}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!dropdownOpen);
            onDropdownVisibleChange?.(!dropdownOpen);
          }
        }}
        onFocus={onFocus as React.FocusEventHandler<HTMLDivElement>}
        onBlur={onBlur as React.FocusEventHandler<HTMLDivElement>}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`flex-1 truncate ${!displayLabel ? 'text-gray-400' : 'text-gray-700'}`}>
          {displayLabel || placeholder}
        </span>

        <div className="flex items-center gap-1">
          {/* Clear button */}
          {allowClear && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Arrow */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {/* Search */}
          {showSearch && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus={autoFocus}
              />
            </div>
          )}

          {/* Tree */}
          <div className="p-1">
            {filteredTreeData.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                {notFoundContent}
              </div>
            ) : (
              filteredTreeData.map((node) => renderNode(node))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
