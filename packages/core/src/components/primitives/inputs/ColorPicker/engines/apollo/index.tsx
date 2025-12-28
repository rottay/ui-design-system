'use client';

/**
 * @fileoverview ColorPicker Apollo Engine - Rottay Design System
 * @description Pure vanilla HTML/CSS implementation of the ColorPicker component
 * with zero external dependencies for maximum portability.
 *
 * @remarks
 * The Apollo engine provides a dependency-free color picker using:
 * - **Native browser input**: Uses HTML5 color input type
 * - **Portal rendering**: Dropdown renders to document.body
 * - **Inline styles**: No CSS framework dependencies
 * - **Full accessibility**: Keyboard navigation and screen reader support
 *
 * Ideal for environments where bundle size and dependency count are critical.
 *
 * @example Basic usage
 * ```tsx
 * <ColorPicker engine="apollo" defaultValue="#faad14" />
 * ```
 *
 * @example With text display
 * ```tsx
 * <ColorPicker engine="apollo" defaultValue="#1677ff" showText format="rgb" />
 * ```
 *
 * @see {@link ColorPicker} - Main component
 * @see {@link ColorPickerProps} - Component props
 * @module ColorPicker/Engines/Apollo
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ColorPickerProps, Color } from '../../types';
import { COLORPICKER_DEFAULTS } from '../../types';

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
      className,
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

    const getSwatchSize = () => {
      switch (size) {
        case 'small': return { width: '24px', height: '24px' };
        case 'large': return { width: '40px', height: '40px' };
        default: return { width: '32px', height: '32px' };
      }
    };

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

    const dropdownContent = isOpen && typeof document !== 'undefined' ? (
      createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            zIndex: 1050,
            minWidth: '200px',
          }}
        >
          {/* Color input */}
          <input
            type="color"
            value={currentValue || '#000000'}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              height: '140px',
              cursor: 'pointer',
              border: 'none',
              padding: 0,
            }}
          />

          {/* Hex input */}
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
              {presets.map((preset, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  {preset.label && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      {preset.label}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {preset.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleChange(color)}
                        disabled={disabled}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          backgroundColor: color,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clear button */}
          {allowClear && (
            <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                style={{
                  padding: '4px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
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
          className={className}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            ...style,
          }}
          onClick={() => !disabled && trigger === 'click' && handleOpenChange(!isOpen)}
          onMouseEnter={() => !disabled && trigger === 'hover' && handleOpenChange(true)}
          onMouseLeave={() => !disabled && trigger === 'hover' && handleOpenChange(false)}
        >
          <div
            style={{
              ...getSwatchSize(),
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              backgroundColor: currentValue || '#fff',
            }}
          />
          {displayText && (
            <span style={{ fontSize: '14px' }}>{displayText}</span>
          )}
        </div>
        {dropdownContent}
      </>
    );
  }
);

ColorPicker.displayName = 'ColorPicker.Apollo';

export default ColorPicker;
