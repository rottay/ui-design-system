/**
 * Apollo ColorPicker Engine
 *
 * Native HTML + Tailwind CSS color picker implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ColorPickerProps } from '../../../../types/components/colorpicker';
import {
  formatColor,
  parseColor,
  DEFAULT_PRESETS,
} from '../../../../types/components/colorpicker';
import { cn } from '../../../../utils/cn';

/**
 * Size styles
 */
const sizeStyles = {
  small: 'w-6 h-6',
  middle: 'w-8 h-8',
  large: 'w-10 h-10',
};

/**
 * Apollo ColorPicker - Native HTML + Tailwind implementation
 */
function ApolloColorPicker({
  value,
  defaultValue = '#1677FF',
  disabled,
  format = 'hex',
  showText = false,
  allowClear = false,
  disabledAlpha = true,
  size = 'middle',
  trigger = 'click',
  presets = DEFAULT_PRESETS,
  open: controlledOpen,
  onChange,
  onChangeComplete,
  onOpenChange,
  onClear,
  className,
  style,
}: ColorPickerProps) {
  // State
  const [currentColor, setCurrentColor] = useState<string | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [alpha, setAlpha] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled
  const isControlled = value !== undefined;
  const displayColor = isControlled ? value : currentColor;
  const isDropdownOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Open/close dropdown
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [disabled, onOpenChange]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
    if (displayColor) {
      onChangeComplete?.(displayColor);
    }
  }, [onOpenChange, onChangeComplete, displayColor]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  // Handle color change
  const handleColorChange = (newColor: string) => {
    if (!isControlled) {
      setCurrentColor(newColor);
    }

    // Apply alpha if needed
    if (!disabledAlpha && alpha < 1) {
      const rgb = parseColor(newColor);
      if (rgb) {
        const formatted = formatColor({ ...rgb, a: alpha }, format);
        onChange?.(formatted);
        return;
      }
    }

    const rgb = parseColor(newColor);
    if (rgb) {
      onChange?.(formatColor(rgb, format));
    } else {
      onChange?.(newColor);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleColorChange(e.target.value);
  };

  // Handle preset click
  const handlePresetClick = (color: string) => {
    handleColorChange(color);
    onChangeComplete?.(color);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setCurrentColor(null);
    }
    onChange?.(null);
    onClear?.();
  };

  // Handle trigger
  const handleTriggerClick = () => {
    if (trigger === 'click') {
      if (isDropdownOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }
  };

  const handleTriggerHover = () => {
    if (trigger === 'hover') {
      openDropdown();
    }
  };

  // Format display text
  const getDisplayText = (): string => {
    if (!displayColor) return '';
    if (typeof showText === 'function') {
      const result = showText(displayColor);
      return typeof result === 'string' ? result : displayColor;
    }
    return displayColor;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={style}
      onMouseEnter={handleTriggerHover}
      onMouseLeave={trigger === 'hover' ? closeDropdown : undefined}
    >
      {/* Trigger */}
      <div
        className={cn(
          'flex items-center gap-2 cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
        onClick={handleTriggerClick}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isDropdownOpen}
      >
        <div
          className={cn(
            sizeStyles[size],
            'rounded border-2 border-gray-300 shadow-sm transition-all',
            'hover:border-blue-400',
            disabled && 'opacity-50'
          )}
          style={{ backgroundColor: displayColor ?? 'transparent' }}
        >
          {!displayColor && (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {showText && displayColor && (
          <span className="text-sm text-gray-700">{getDisplayText()}</span>
        )}

        {allowClear && displayColor && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            tabIndex={-1}
          >
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[240px]">
          {/* Native color input */}
          <div className="mb-4">
            <input
              type="color"
              value={displayColor ?? '#000000'}
              onChange={handleInputChange}
              className="w-full h-32 rounded cursor-pointer border-0 p-0"
            />
          </div>

          {/* Alpha slider */}
          {!disabledAlpha && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Alpha</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={(e) => {
                  setAlpha(parseFloat(e.target.value));
                  if (displayColor) {
                    handleColorChange(displayColor);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Hex input */}
          <div className="mb-4">
            <input
              type="text"
              value={displayColor ?? ''}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#000000"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Presets */}
          {presets.map((preset, idx) => (
            <div key={idx} className="mb-3">
              {preset.label && (
                <div className="text-xs text-gray-500 mb-2">{preset.label}</div>
              )}
              <div className="flex flex-wrap gap-1">
                {preset.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      'w-6 h-6 rounded border border-gray-300 cursor-pointer',
                      'hover:scale-110 transition-transform',
                      displayColor === color && 'ring-2 ring-blue-500 ring-offset-1'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ApolloColorPicker.displayName = 'ApolloColorPicker';

export default ApolloColorPicker;
