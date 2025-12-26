'use client';

/**
 * TreeSelect - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TreeSelectProps, TreeSelectNode, TreeSelectValue } from '../../types';
import { TREESELECT_DEFAULTS } from '../../types';

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

  return (
    <li style={{ listStyle: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          paddingLeft: `${level * 20 + 8}px`,
          cursor: node.disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
          opacity: node.disabled ? 0.5 : 1,
          borderRadius: '4px',
        }}
        onClick={() => !node.disabled && onSelect(node)}
        onMouseEnter={(e) => {
          if (!node.disabled && !isSelected) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
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
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '4px',
              fontSize: '10px',
              color: '#6b7280',
            }}
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
        <span style={{ color: isSelected ? '#3b82f6' : 'inherit' }}>{node.title}</span>
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
      className,
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

    const getInputHeight = () => {
      switch (size) {
        case 'small': return '32px';
        case 'large': return '48px';
        default: return '40px';
      }
    };

    const getBorderColor = () => {
      if (status === 'error') return '#ef4444';
      if (status === 'warning') return '#f59e0b';
      return '#d1d5db';
    };

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: position.width,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 1050,
          }}
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
            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
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
          className={className}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: getInputHeight(),
            padding: '0 12px',
            border: `1px solid ${getBorderColor()}`,
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            ...style,
          }}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
        >
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: selectedKeys.size > 0 ? 'inherit' : '#9ca3af',
            }}
          >
            {selectedKeys.size > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedKeys.size > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          )}
          <span
            style={{
              marginLeft: '8px',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              fontSize: '10px',
              color: '#9ca3af',
            }}
          >
            ▼
          </span>
        </div>
        {dropdownContent}
      </>
    );
  }
);

TreeSelect.displayName = 'TreeSelect.Apollo';

export default TreeSelect;
