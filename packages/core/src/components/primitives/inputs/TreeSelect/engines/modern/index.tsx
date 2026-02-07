'use client';

/**
 * TreeSelect - Modern Engine (DaisyUI/Tailwind)
 */
import React, { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
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
  treeLine?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  expandedKeys,
  selectedKeys,
  onToggle,
  onSelect,
  checkable,
  treeLine,
}) => {
  const key = node.key ?? node.value;
  const isExpanded = expandedKeys.has(key);
  const isSelected = selectedKeys.has(node.value);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li>
      <div
        className={`flex items-center py-1 px-2 hover:bg-base-200 rounded cursor-pointer ${isSelected ? 'bg-primary/10 text-primary' : ''} ${node.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => !node.disabled && onSelect(node)}
      >
        {hasChildren && (
          <button
            type="button"
            className="btn btn-ghost btn-xs mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(key);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-6" />}
        {checkable && (
          <input
            type="checkbox"
            className="checkbox checkbox-sm mr-2"
            checked={isSelected}
            disabled={node.disabled || node.disableCheckbox}
            onChange={() => !node.disabled && onSelect(node)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <span className="flex-1">{node.title}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className={treeLine ? 'border-l border-base-300 ml-4' : ''}>
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
              treeLine={treeLine}
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
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      treeLine,
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

    const isControlled = controlledValue !== undefined;
    const selectedKeys = isControlled ? normalizeValue(controlledValue) : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
    }, [controlledOpen, onDropdownVisibleChange]);

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

    const getSizeClass = () => {
      switch (size) {
        case 'small': return 'input-sm';
        case 'large': return 'input-lg';
        default: return 'input-md';
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
          className={`input input-bordered ${getSizeClass()} flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
        >
          <span className={`flex-1 truncate ${selectedKeys.size === 0 ? 'text-base-content/50' : ''}`}>
            {selectedKeys.size > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedKeys.size > 0 && !disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
            >
              ✕
            </button>
          )}
          <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-base-100 rounded-box shadow-lg max-h-60 overflow-auto">
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
                    treeLine={treeLine}
                  />
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-base-content/50">
                {notFoundContent}
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
