'use client';

/**
 * @fileoverview ColorPicker Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind CSS implementation of the ColorPicker component
 * with native browser color input and custom preset panels.
 *
 * @remarks
 * The Modern engine provides a lightweight color picker using:
 * - **Native color input**: Browser's built-in color picker
 * - **DaisyUI styling**: Consistent with Tailwind design tokens
 * - **Custom dropdowns**: Styled panel with presets
 * - **Format display**: Shows color value in selected format
 *
 * Optimized for smaller bundle size while maintaining functionality.
 *
 * @example Basic usage
 * ```tsx
 * <ColorPicker engine="modern" defaultValue="#52c41a" />
 * ```
 *
 * @example With presets
 * ```tsx
 * <ColorPicker
 *   engine="modern"
 *   presets={[{ label: 'Brand', colors: ['#1677ff', '#52c41a'] }]}
 * />
 * ```
 *
 * @see {@link ColorPicker} - Main component
 * @see {@link ColorPickerProps} - Component props
 * @module ColorPicker/Engines/Modern
 * @category Inputs
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ColorPickerProps, Color } from '../../contracts';
import { COLORPICKER_DEFAULTS } from '../../contracts';
import { toLegacySize } from '../../../../../../foundation/contracts/kernel/common';

/**
 * Lightweight Color factory that satisfies the DS `Color` interface.
 * Only hex-to-rgb conversion is fully implemented; HSB returns the
 * raw hex as a simplified fallback since DaisyUI has no HSB utilities.
 */
const createColor = (hex: string): Color => ({
  toHexString: () => hex,
  toRgbString: () => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  },
  toHsbString: () => hex, // Simplified
});

/**
 * Modern engine ColorPicker -- native browser color input with DaisyUI styling.
 *
 * Combines the browser's built-in `<input type="color">` with a custom
 * dropdown panel that shows a hex text input, preset swatches, and an
 * optional clear button. Open/close state and the color value both support
 * controlled and uncontrolled modes. Click-outside detection is handled
 * by a document-level mousedown listener.
 *
 * @param props - {@link ColorPickerProps} unified color picker props shared across engines.
 * @returns A ref-forwarding color picker with DaisyUI/Tailwind styling.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = '#1677ff',
      onChange,
      format = COLORPICKER_DEFAULTS.format,
      presets,
      showText,
      size: sizeProp = COLORPICKER_DEFAULTS.size,
      disabled,
      allowClear,
      trigger = COLORPICKER_DEFAULTS.trigger,
      open: controlledOpen,
      onOpenChange,
      placement = COLORPICKER_DEFAULTS.placement,
      className,
      style,
    } = props;

    // getSizeClass's switch below is keyed by the legacy 'small' | 'middle' | 'large'
    // spelling; toLegacySize resolves either spelling to it.
    const size = toLegacySize(sizeProp);

    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);

    // Dual controlled/uncontrolled for both value and open state
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled
      ? (typeof controlledValue === 'string' ? controlledValue : controlledValue.toHexString())
      : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);

    /** Toggles the dropdown, respecting controlled `open` prop when present. */
    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [controlledOpen, onOpenChange]);

    /** Updates the selected color, wrapping the hex in a Color interface object. */
    const handleChange = (hex: string) => {
      if (!isControlled) {
        setInternalValue(hex);
      }
      const color = createColor(hex);
      onChange?.(color, hex);
    };

    /** Resets value to empty string and closes the dropdown. */
    const handleClear = () => {
      handleChange('');
      handleOpenChange(false);
    };

    // Close dropdown when clicking outside the container
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

    /** Returns Tailwind size classes for the color swatch button. */
    const getSizeClass = () => {
      switch (size) {
        case 'small': return 'w-6 h-6';
        case 'large': return 'w-10 h-10';
        default: return 'w-8 h-8';
      }
    };

    /** Resolves the text shown beside the swatch (hex, rgb, or custom formatter). */
    const getDisplayText = () => {
      if (!showText) return null;
      if (typeof showText === 'function') {
        return showText(createColor(currentValue));
      }
      switch (format) {
        case 'rgb': return createColor(currentValue).toRgbString();
        case 'hsb': return currentValue;
        default: return currentValue;
      }
    };

    const displayText = getDisplayText();

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-part="root"
        className={`relative inline-block rottay-colorpicker rottay-colorpicker--modern ${className || ''}`}
        style={style}
      >
        {/* Trigger area: opens/closes dropdown on click or hover depending on `trigger` prop */}
        <div
          data-part="trigger"
          className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && (trigger === 'click' ? handleOpenChange(!isOpen) : null)}
          onMouseEnter={() => !disabled && trigger === 'hover' && handleOpenChange(true)}
          onMouseLeave={() => !disabled && trigger === 'hover' && handleOpenChange(false)}
        >
          <div
            data-part="swatch"
            className={`${getSizeClass()} rounded`}
            style={{ '--ds-colorpicker-swatch-color': currentValue || 'var(--ds-color-white)' } as React.CSSProperties}
          />
          {displayText && <span data-part="display-text" className="text-sm">{displayText}</span>}
        </div>

        {isOpen && (
          <div
            data-part="dropdown"
            className={`absolute z-50 mt-1 p-3 rounded-lg ${placement?.includes('top') ? 'bottom-full mb-1' : ''}`}
          >
            {/* Color input */}
            <input
              type="color"
              data-part="native-color-input"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full cursor-pointer border-0"
              style={{ height: 'var(--ds-color-picker-height, 10rem)' }}
              disabled={disabled}
            />

            {/* Hex input */}
            <div className="mt-2">
              <input
                type="text"
                data-part="hex-input"
                value={currentValue}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full font-mono"
                style={{
                  padding: '4px var(--ds-input-sm-padding-x, 10px)',
                  fontSize: 'var(--ds-input-sm-font-size, 13px)',
                  height: 'var(--ds-input-sm-height, 32px)',
                  boxSizing: 'border-box',
                }}
                placeholder="#000000"
                disabled={disabled}
              />
            </div>

            {/* Presets */}
            {presets && presets.length > 0 && (
              <div className="mt-3 pt-3">
                {presets.map((preset, idx) => (
                  <div key={idx} data-part="preset-group" className="mb-2">
                    {preset.label && (
                      <div data-part="preset-label" className="text-xs mb-1">{preset.label}</div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {preset.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          data-part="preset-swatch"
                          className="w-5 h-5 rounded cursor-pointer hover:scale-110 transition-transform"
                          style={{ '--ds-colorpicker-preset-color': color } as React.CSSProperties}
                          onClick={() => handleChange(color)}
                          disabled={disabled}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {allowClear && (
              <div className="mt-2 pt-2">
                <button
                  type="button"
                  data-part="clear-button"
                  style={{ height: 'var(--ds-input-sm-height, 32px)', padding: '0 var(--ds-input-sm-padding-x, 10px)', fontSize: 'var(--ds-input-sm-font-size, 13px)', cursor: 'pointer' }}
                  onClick={handleClear}
                  disabled={disabled}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker.Modern';

export default ColorPicker;
