'use client';

/**
 * Cascader - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
      expandTrigger: _expandTrigger = CASCADER_DEFAULTS.expandTrigger,
      placeholder = CASCADER_DEFAULTS.placeholder,
      disabled,
      allowClear = CASCADER_DEFAULTS.allowClear,
      size = CASCADER_DEFAULTS.size,
      status,
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
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const isControlled = controlledValue !== undefined;
    const value = (isControlled ? controlledValue : internalValue) as CascaderValue;
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
        });
      }
    }, [isOpen]);

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

    const handleOptionClick = (option: CascaderOption, columnIndex: number) => {
      if (option.disabled) return;

      const newPath = [...selectedPath.slice(0, columnIndex), option];
      setSelectedPath(newPath);

      if (option.children && option.children.length > 0) {
        const newColumns = [...activeColumns.slice(0, columnIndex + 1), option.children];
        setActiveColumns(newColumns);
      } else {
        // Leaf node - complete selection
        const newValue = newPath.map((opt) => opt.value) as CascaderValue;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue, newPath);
        handleOpenChange(false);
        setActiveColumns([options]);
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

    const getDisplayValue = () => {
      if (selectedPath.length === 0) return '';
      const labels = selectedPath.map((opt) => String(opt.label));
      if (displayRender) {
        return displayRender(labels, selectedPath);
      }
      return labels.join(' / ');
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
            display: 'flex',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1050,
          }}
        >
          {activeColumns.map((column, colIndex) => (
            <ul
              key={colIndex}
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '4px 0',
                minWidth: '160px',
                maxHeight: '240px',
                overflowY: 'auto',
                borderRight: colIndex < activeColumns.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              {column.length > 0 ? (
                column.map((option) => {
                  const isSelected = selectedPath[colIndex]?.value === option.value;
                  return (
                    <li
                      key={String(option.value)}
                      onClick={() => handleOptionClick(option, colIndex)}
                      style={{
                        padding: '8px 12px',
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
                        opacity: option.disabled ? 0.5 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => {
                        if (!option.disabled) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{option.label}</span>
                      {option.children && option.children.length > 0 && (
                        <span style={{ color: '#9ca3af' }}>›</span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li style={{ padding: '8px 12px', color: '#9ca3af', textAlign: 'center' }}>
                  {notFoundContent}
                </li>
              )}
            </ul>
          ))}
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
              color: selectedPath.length > 0 ? 'inherit' : '#9ca3af',
            }}
          >
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
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

Cascader.displayName = 'Cascader.Apollo';

export default Cascader;
