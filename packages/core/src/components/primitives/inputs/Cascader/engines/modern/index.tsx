'use client';

/**
 * Cascader - Modern Engine (DaisyUI/Tailwind)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CascaderProps, CascaderOption, CascaderValue } from '../../types';
import { CASCADER_DEFAULTS } from '../../types';

export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(
  (props, ref) => {
    const {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      displayRender,
      expandTrigger = CASCADER_DEFAULTS.expandTrigger,
      placeholder = CASCADER_DEFAULTS.placeholder,
      disabled,
      allowClear = CASCADER_DEFAULTS.allowClear,
      size = CASCADER_DEFAULTS.size,
      notFoundContent = 'No data',
      open: controlledOpen,
      onDropdownVisibleChange,
      className,
      style,
    } = props;

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);

    const isControlled = controlledValue !== undefined;
    const value = (isControlled ? controlledValue : internalValue) as CascaderValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onDropdownVisibleChange?.(newOpen);
    }, [controlledOpen, onDropdownVisibleChange]);

    // Build selected path from value
    useEffect(() => {
      if (value.length > 0) {
        const path: CascaderOption[] = [];
        let currentOptions = options;

        for (const val of value) {
          const found = currentOptions.find((opt) => opt.value === val);
          if (found) {
            path.push(found);
            if (found.children) {
              currentOptions = found.children;
            }
          }
        }
        setSelectedPath(path);
      }
    }, [value, options]);

    const handleOptionHover = (option: CascaderOption, columnIndex: number) => {
      if (expandTrigger !== 'hover' || option.disabled) return;
      expandOption(option, columnIndex);
    };

    const handleOptionClick = (option: CascaderOption, columnIndex: number) => {
      if (option.disabled) return;

      if (expandTrigger === 'click' && option.children && option.children.length > 0) {
        expandOption(option, columnIndex);
      }

      // If leaf node, select it
      if (!option.children || option.children.length === 0 || option.isLeaf) {
        const newPath = [...selectedPath.slice(0, columnIndex), option];
        const newValue = newPath.map((opt) => opt.value) as CascaderValue;

        if (!isControlled) {
          setInternalValue(newValue);
        }
        setSelectedPath(newPath);
        onChange?.(newValue, newPath);
        handleOpenChange(false);
      }
    };

    const expandOption = (option: CascaderOption, columnIndex: number) => {
      const newPath = [...selectedPath.slice(0, columnIndex), option];
      setSelectedPath(newPath);

      if (option.children && option.children.length > 0) {
        const newColumns = [...activeColumns.slice(0, columnIndex + 1), option.children];
        setActiveColumns(newColumns);
      } else {
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

    const getDisplayValue = () => {
      if (selectedPath.length === 0) return '';
      const labels = selectedPath.map((opt) => String(opt.label));
      if (displayRender) {
        return displayRender(labels, selectedPath);
      }
      return labels.join(' / ');
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
          <span className={`flex-1 truncate ${!selectedPath.length ? 'text-base-content/50' : ''}`}>
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
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
          <div className="absolute z-50 mt-1 flex bg-base-100 rounded-box shadow-lg">
            {activeColumns.map((column, colIndex) => (
              <ul
                key={colIndex}
                className="menu w-48 max-h-60 overflow-auto border-r border-base-300 last:border-r-0"
              >
                {column.length > 0 ? (
                  column.map((option) => {
                    const isSelected = selectedPath[colIndex]?.value === option.value;
                    return (
                      <li key={String(option.value)}>
                        <button
                          type="button"
                          className={`flex justify-between ${option.disabled ? 'disabled' : ''} ${isSelected ? 'active' : ''}`}
                          disabled={option.disabled}
                          onClick={() => handleOptionClick(option, colIndex)}
                          onMouseEnter={() => handleOptionHover(option, colIndex)}
                        >
                          <span className="truncate">{option.label}</span>
                          {option.children && option.children.length > 0 && (
                            <span>›</span>
                          )}
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-base-content/50 p-2">{notFoundContent}</li>
                )}
              </ul>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Cascader.displayName = 'Cascader.Modern';

export default Cascader;
