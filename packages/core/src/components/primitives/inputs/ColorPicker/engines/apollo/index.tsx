'use client';

/**
 * @fileoverview ColorPicker Apollo Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the ColorPicker component
 * using CSS variables for multi-tenant theming.
 *
 * @module ApolloColorPicker
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ColorPickerProps, Color } from '../../types';
import { COLORPICKER_DEFAULTS } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { width: string; height: string }> = {
  small: { width: 'var(--ds-colorpicker-swatch-size-sm)', height: 'var(--ds-colorpicker-swatch-size-sm)' },
  default: { width: 'var(--ds-colorpicker-swatch-size-md)', height: 'var(--ds-colorpicker-swatch-size-md)' },
  large: { width: 'var(--ds-colorpicker-swatch-size-lg)', height: 'var(--ds-colorpicker-swatch-size-lg)' },
};

const createColor = (hex: string): Color => ({
  toHexString: () => hex,
  toRgbString: () => {
    if (!hex || hex.length < 7) return 'rgb(0, 0, 0)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  },
  toHsbString: () => hex,
});

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = '#1677ff',
      onChange,
      format = COLORPICKER_DEFAULTS.format,
      presets,
      showText,
      size = COLORPICKER_DEFAULTS.size,
      disabled,
      allowClear,
      trigger = COLORPICKER_DEFAULTS.trigger,
      open: controlledOpen,
      onOpenChange,
      className = '',
      style,
    } = props;

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled
      ? (typeof controlledValue === 'string' ? controlledValue : controlledValue.toHexString())
      : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [controlledOpen, onOpenChange]);

    const handleChange = (hex: string) => {
      if (!isControlled) {
        setInternalValue(hex);
      }
      const color = createColor(hex);
      onChange?.(color, hex);
    };

    const handleClear = () => {
      handleChange('');
      handleOpenChange(false);
    };

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

    const sizeConfig = SIZE_CONFIG[size ?? 'default'] || SIZE_CONFIG.default;

    const getDisplayText = () => {
      if (!showText) return null;
      if (typeof showText === 'function') {
        return showText(createColor(currentValue));
      }
      switch (format) {
        case 'rgb': return createColor(currentValue).toRgbString();
        default: return currentValue;
      }
    };

    const displayText = getDisplayText();

    // Build class names
    const containerClasses = [
      'rottay-colorpicker',
      'rottay-colorpicker--apollo',
      `rottay-colorpicker--${size}`,
      disabled && 'rottay-colorpicker--disabled',
      isOpen && 'rottay-colorpicker--open',
      className,
    ].filter(Boolean).join(' ');

    const triggerStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const swatchStyle: React.CSSProperties = {
      ...sizeConfig,
      borderRadius: 'var(--ds-colorpicker-swatch-radius)',
      border: `1px solid var(--ds-colorpicker-swatch-border)`,
      boxShadow: 'var(--ds-colorpicker-swatch-shadow)',
      backgroundColor: currentValue || 'var(--ds-color-white)',
    };

    const textStyle: React.CSSProperties = {
      fontSize: 'var(--ds-colorpicker-text-font-size)',
    };

    const dropdownStyle: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      left: position.left,
      padding: 'var(--ds-colorpicker-dropdown-padding)',
      backgroundColor: 'var(--ds-colorpicker-dropdown-bg)',
      borderRadius: 'var(--ds-colorpicker-dropdown-radius)',
      boxShadow: 'var(--ds-colorpicker-dropdown-shadow)',
      zIndex: 1050,
      minWidth: 'var(--ds-colorpicker-dropdown-min-width)',
    };

    const colorInputStyle: React.CSSProperties = {
      width: '100%',
      height: 'var(--ds-colorpicker-palette-height)',
      cursor: 'pointer',
      border: 'none',
      padding: 0,
    };

    const hexInputStyle: React.CSSProperties = {
      width: '100%',
      padding: '6px 10px',
      border: `1px solid var(--ds-colorpicker-input-border)`,
      borderRadius: 'var(--ds-colorpicker-input-radius)',
      fontSize: 'var(--ds-font-size-sm)',
      fontFamily: 'monospace',
      backgroundColor: 'var(--ds-colorpicker-input-bg)',
    };

    const presetLabelStyle: React.CSSProperties = {
      fontSize: 'var(--ds-colorpicker-label-font-size)',
      color: 'var(--ds-colorpicker-label-color)',
      marginBottom: '4px',
    };

    const presetContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--ds-colorpicker-preset-gap)',
    };

    const getPresetButtonStyle = (): React.CSSProperties => ({
      width: 'var(--ds-colorpicker-preset-size)',
      height: 'var(--ds-colorpicker-preset-size)',
      borderRadius: 'var(--ds-colorpicker-preset-radius)',
      border: `1px solid var(--ds-colorpicker-preset-border)`,
      cursor: disabled ? 'not-allowed' : 'pointer',
    });

    const dividerStyle: React.CSSProperties = {
      borderTop: `1px solid var(--ds-colorpicker-divider-color)`,
      marginTop: '12px',
      paddingTop: '12px',
    };

    const clearButtonStyle: React.CSSProperties = {
      padding: '4px 12px',
      border: `1px solid var(--ds-colorpicker-clear-border)`,
      borderRadius: 'var(--ds-colorpicker-clear-radius)',
      backgroundColor: 'var(--ds-colorpicker-clear-bg)',
      cursor: 'pointer',
      fontSize: 'var(--ds-font-size-sm)',
    };

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          className="rottay-colorpicker__dropdown"
          style={dropdownStyle}
        >
          {/* Color input */}
          <input
            type="color"
            value={currentValue || '#000000'}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            style={colorInputStyle}
          />

          {/* Hex input */}
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              style={hexInputStyle}
            />
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div style={dividerStyle}>
              {presets.map((preset, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  {preset.label && (
                    <div style={presetLabelStyle}>
                      {preset.label}
                    </div>
                  )}
                  <div style={presetContainerStyle}>
                    {preset.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange(color)}
                        disabled={disabled}
                        style={{
                          ...getPresetButtonStyle(),
                          backgroundColor: color,
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clear button */}
          {allowClear && (
            <div style={{ ...dividerStyle, marginTop: '8px', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                style={clearButtonStyle}
              >
                Clear
              </button>
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
          onClick={() => !disabled && trigger === 'click' && handleOpenChange(!isOpen)}
          onMouseEnter={() => !disabled && trigger === 'hover' && handleOpenChange(true)}
          onMouseLeave={() => !disabled && trigger === 'hover' && handleOpenChange(false)}
        >
          <div className="rottay-colorpicker__swatch" style={swatchStyle} />
          {displayText && (
            <span className="rottay-colorpicker__text" style={textStyle}>{displayText}</span>
          )}
        </div>
        {dropdownContent}
      </>
    );
  }
);

ColorPicker.displayName = 'ColorPicker.Apollo';

export default ColorPicker;
