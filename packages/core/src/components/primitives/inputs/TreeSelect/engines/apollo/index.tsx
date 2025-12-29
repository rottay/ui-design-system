'use client';

/**
 * @fileoverview TreeSelect Apollo Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the TreeSelect component
 * using CSS variables for multi-tenant theming.
 *
 * @module ApolloTreeSelect
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../../types';
import { TREESELECT_DEFAULTS } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-treeselect-sm-height)' },
  default: { height: 'var(--ds-treeselect-md-height)' },
  large: { height: 'var(--ds-treeselect-lg-height)' },
};

interface TreeNodeProps {
  node: TreeSelectNode;
  level: number;
  expandedKeys: Set<string | number>;
  selectedKeys: Set<string | number>;
  onToggle: (key: string | number) => void;
  onSelect: (node: TreeSelectNode) => void;
  checkable?: boolean;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({
  node,
  level,
  expandedKeys,
  selectedKeys,
  onToggle,
  onSelect,
  checkable,
}) => {
  const key = node.key ?? node.value;
  const isExpanded = expandedKeys.has(key);
  const isSelected = selectedKeys.has(node.value);
  const hasChildren = node.children && node.children.length > 0;

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
    transition: 'background-color 0.15s',
  };

  const expandButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: '4px',
    fontSize: '10px',
    color: 'var(--ds-treeselect-expand-color)',
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
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(key);
            }}
            style={expandButtonStyle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span style={{ width: '18px' }} />
        )}
        {checkable && (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={node.disabled || node.disableCheckbox}
            onChange={() => !node.disabled && onSelect(node)}
            onClick={(e) => e.stopPropagation()}
            style={{ marginRight: '8px' }}
          />
        )}
        <span style={{ color: isSelected ? 'var(--ds-treeselect-node-color-selected)' : 'inherit' }}>
          {node.title}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <ul style={{ margin: 0, padding: 0 }}>
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
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const TreeSelect = React.forwardRef<HTMLDivElement, TreeSelectProps>(
  (props, ref) => {
    const {
      treeData,
      value: controlledValue,
      defaultValue,
      onChange,
      multiple,
      treeCheckable,
      treeDefaultExpandAll,
      treeDefaultExpandedKeys,
      placeholder = TREESELECT_DEFAULTS.placeholder,
      disabled,
      allowClear = TREESELECT_DEFAULTS.allowClear,
      size = TREESELECT_DEFAULTS.size,
      status,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      className = '',
      style,
    } = props;

    const getInitialExpanded = (): Set<string | number> => {
      if (treeDefaultExpandAll) {
        const allKeys = new Set<string | number>();
        const traverse = (nodes: TreeSelectNode[]) => {
          nodes.forEach((node) => {
            allKeys.add(node.key ?? node.value);
            if (node.children) traverse(node.children);
          });
        };
        traverse(treeData);
        return allKeys;
      }
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
    const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(getInitialExpanded);
    const [internalOpen, setInternalOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const isControlled = controlledValue !== undefined;
    const selectedKeys = isControlled ? normalizeValue(controlledValue) : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
      setIsFocused(newOpen);
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

    const handleToggle = (key: string | number) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    };

    const handleSelect = (node: TreeSelectNode) => {
      let newSelectedKeys: Set<string | number>;

      if (multiple || treeCheckable) {
        newSelectedKeys = new Set(selectedKeys);
        if (newSelectedKeys.has(node.value)) {
          newSelectedKeys.delete(node.value);
        } else {
          newSelectedKeys.add(node.value);
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
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue(new Set());
      }
      onChange?.(multiple || treeCheckable ? [] : '', [], { triggerValue: '' });
    };

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

    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-treeselect-border-error)';
      if (status === 'warning') return 'var(--ds-treeselect-border-warning)';
      if (isFocused) return 'var(--ds-treeselect-border-focus)';
      return 'var(--ds-treeselect-border)';
    };

    // Build class names
    const containerClasses = [
      'rottay-treeselect',
      'rottay-treeselect--apollo',
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
      boxShadow: 'var(--ds-treeselect-dropdown-shadow)',
      maxHeight: 'var(--ds-treeselect-dropdown-max-height)',
      overflowY: 'auto',
      zIndex: 1050,
    };

    const emptyStyle: React.CSSProperties = {
      padding: '16px',
      textAlign: 'center',
      color: 'var(--ds-treeselect-empty-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-treeselect__dropdown"
          style={dropdownStyle}
        >
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
                />
              ))}
            </ul>
          ) : (
            <div className="rottay-treeselect__empty" style={emptyStyle}>
              {notFoundContent}
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
            {selectedKeys.size > 0 ? getDisplayValue() : placeholder}
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

TreeSelect.displayName = 'TreeSelect.Apollo';

export default TreeSelect;
