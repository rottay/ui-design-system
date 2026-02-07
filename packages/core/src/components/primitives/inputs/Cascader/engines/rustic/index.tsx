'use client';

/**
 * @fileoverview Cascader Rustic Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the Cascader component
 * using CSS variables for multi-tenant theming.
 *
 * @module RusticCascader
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CascaderProps, CascaderOption, CascaderValue } from '../../types';
import { CASCADER_DEFAULTS } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { height: string }> = {
  small: { height: 'var(--ds-cascader-sm-height)' },
  default: { height: 'var(--ds-cascader-md-height)' },
  large: { height: 'var(--ds-cascader-lg-height)' },
};

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
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState<CascaderValue>(defaultValue as CascaderValue || []);
    const [internalOpen, setInternalOpen] = useState(false);
    const [activeColumns, setActiveColumns] = useState<CascaderOption[][]>([options]);
    const [selectedPath, setSelectedPath] = useState<CascaderOption[]>([]);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isFocused, setIsFocused] = useState(false);

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
      setIsFocused(newOpen);
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

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    const getBorderColor = () => {
      if (status === 'error') return 'var(--ds-cascader-border-error)';
      if (status === 'warning') return 'var(--ds-cascader-border-warning)';
      if (isFocused) return 'var(--ds-cascader-border-focus)';
      return 'var(--ds-cascader-border)';
    };

    // Build class names
    const containerClasses = [
      'rottay-cascader',
      'rottay-cascader--rustic',
      `rottay-cascader--${size}`,
      status && `rottay-cascader--${status}`,
      disabled && 'rottay-cascader--disabled',
      isOpen && 'rottay-cascader--open',
      className,
    ].filter(Boolean).join(' ');

    const triggerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      height: sizeConfig.height,
      padding: '0 12px',
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 'var(--ds-cascader-radius)',
      backgroundColor: 'var(--ds-cascader-bg)',
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
      color: selectedPath.length > 0 ? 'inherit' : 'var(--ds-cascader-placeholder-color)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const clearButtonStyle: React.CSSProperties = {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--ds-cascader-clear-color)',
      padding: '0 4px',
      fontSize: '14px',
    };

    const arrowStyle: React.CSSProperties = {
      marginLeft: '8px',
      transition: 'transform 0.2s',
      transform: isOpen ? 'rotate(180deg)' : 'none',
      fontSize: '10px',
      color: 'var(--ds-cascader-arrow-color)',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      display: 'flex',
      backgroundColor: 'var(--ds-cascader-dropdown-bg)',
      borderRadius: 'var(--ds-cascader-dropdown-radius)',
      boxShadow: 'var(--ds-cascader-dropdown-shadow)',
      zIndex: 1050,
    };

    const menuStyle = (colIndex: number, totalCols: number): React.CSSProperties => ({
      listStyle: 'none',
      margin: 0,
      padding: '4px 0',
      minWidth: 'var(--ds-cascader-menu-width)',
      maxHeight: 'var(--ds-cascader-menu-height)',
      overflowY: 'auto',
      borderRight: colIndex < totalCols - 1 ? `1px solid var(--ds-cascader-menu-border)` : 'none',
    });

    const getItemStyle = (isSelected: boolean, isDisabled?: boolean): React.CSSProperties => ({
      padding: 'var(--ds-cascader-item-padding)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: isSelected ? 'var(--ds-cascader-item-bg-selected)' : 'transparent',
      opacity: isDisabled ? 0.5 : 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 'var(--ds-font-size-sm)',
      transition: 'background-color 0.15s',
    });

    const emptyStyle: React.CSSProperties = {
      padding: 'var(--ds-cascader-item-padding)',
      color: 'var(--ds-cascader-empty-color)',
      textAlign: 'center',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-cascader__dropdown"
          style={dropdownStyle}
        >
          {activeColumns.map((column, colIndex) => (
            <ul
              key={colIndex}
              className="rottay-cascader__menu"
              style={menuStyle(colIndex, activeColumns.length)}
            >
              {column.length > 0 ? (
                column.map((option) => {
                  const isSelected = selectedPath[colIndex]?.value === option.value;
                  return (
                    <li
                      key={String(option.value)}
                      className="rottay-cascader__item"
                      onClick={() => handleOptionClick(option, colIndex)}
                      style={getItemStyle(isSelected, option.disabled)}
                      onMouseEnter={(e) => {
                        if (!option.disabled && !isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--ds-cascader-item-bg-hover)';
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
                        <span style={{ color: 'var(--ds-cascader-arrow-color)' }}>›</span>
                      )}
                    </li>
                  );
                })
              ) : (
                <li style={emptyStyle}>{notFoundContent}</li>
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
          className={containerClasses}
          style={triggerStyle}
          onClick={() => !disabled && handleOpenChange(!isOpen)}
        >
          <span style={valueStyle}>
            {selectedPath.length > 0 ? getDisplayValue() : placeholder}
          </span>
          {allowClear && selectedPath.length > 0 && !disabled && (
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

Cascader.displayName = 'Cascader.Rustic';

export default Cascader;
