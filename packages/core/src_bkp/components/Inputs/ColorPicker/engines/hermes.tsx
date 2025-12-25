/**
 * Hermes ColorPicker Engine
 *
 * DaisyUI-based color picker implementation with unified ColorPickerProps.
 * Uses native HTML color input with custom UI.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ColorPickerProps } from '../../../../types/components/colorpicker';
import {
  hexToRgb,
  rgbToHex,
  formatColor,
  parseColor,
  DEFAULT_PRESETS,
} from '../../../../types/components/colorpicker';

/**
 * Size classes
 */
const sizeClasses = {
  small: 'w-6 h-6',
  middle: 'w-8 h-8',
  large: 'w-10 h-10',
};

/**
 * Hermes ColorPicker - DaisyUI implementation
 */
function HermesColorPicker({
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
  className = '',
  style,
}: ColorPickerProps) {
  // State
  const [currentColor, setCurrentColor] = useState<string | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [alpha, setAlpha] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      className={`dropdown ${isDropdownOpen ? 'dropdown-open' : ''} ${className}`}
      style={style}
      onMouseEnter={handleTriggerHover}
      onMouseLeave={trigger === 'hover' ? closeDropdown : undefined}
    >
      {/* Trigger */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleTriggerClick}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isDropdownOpen}
      >
        <div
          className={`${sizeClasses[size]} rounded border-2 border-base-300 shadow-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: displayColor ?? 'transparent' }}
        >
          {!displayColor && (
            <div className="w-full h-full flex items-center justify-center text-base-content/30">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {showText && displayColor && (
          <span className="text-sm">{getDisplayText()}</span>
        )}

        {allowClear && displayColor && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost btn-xs btn-circle"
            tabIndex={-1}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="dropdown-content bg-base-100 rounded-box shadow-lg p-4 z-50 min-w-[240px] mt-2">
          {/* Native color input */}
          <div className="mb-4">
            <input
              ref={colorInputRef}
              type="color"
              value={displayColor ?? '#000000'}
              onChange={handleInputChange}
              className="w-full h-32 rounded cursor-pointer border-0"
            />
          </div>

          {/* Alpha slider */}
          {!disabledAlpha && (
            <div className="mb-4">
              <label className="text-xs text-base-content/60 mb-1 block">Alpha</label>
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
                className="range range-xs"
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
              className="input input-sm input-bordered w-full"
            />
          </div>

          {/* Presets */}
          {presets.map((preset, idx) => (
            <div key={idx} className="mb-3">
              {preset.label && (
                <div className="text-xs text-base-content/60 mb-2">{preset.label}</div>
              )}
              <div className="flex flex-wrap gap-1">
                {preset.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className={`w-6 h-6 rounded border border-base-300 cursor-pointer hover:scale-110 transition-transform ${
                      displayColor === color ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
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

HermesColorPicker.displayName = 'HermesColorPicker';

export default HermesColorPicker;
