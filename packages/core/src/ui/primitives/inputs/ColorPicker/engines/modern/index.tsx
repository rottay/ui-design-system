'use client';

/**
 * @fileoverview ColorPicker Modern Engine - Rottay Design System
 * @description Tailwind CSS + token implementation of the ColorPicker component
 * with native browser color input and custom preset panels. No DaisyUI classes
 * are emitted; paint is owned by the unlayered modern skin
 * (`skin/color-picker.css`) — K4-C docblock correction.
 *
 * @remarks
 * The Modern engine provides a lightweight color picker using:
 * - **Native color input**: Browser's built-in color picker
 * - **Token skin styling**: the skin owns swatch/dropdown/input paint
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
import { resolveCssColor } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * Token-backed default (K4-C): the previous `defaultValue = '#1677ff'` hard
 * coded Ant Design's brand blue into every tenant. The default is now the
 * tenant's own `--ds-color-primary`. The swatch consumes the `var()` directly
 * (CSS resolves it), but the native `<input type="color">` and hex input
 * require a concrete `#rrggbb`, so the engine resolves the token against the
 * provider-owned root after mount — the same owner-scoped pattern QRCode and
 * Watermark use. A resolution that yields no hex keeps the `var()` on the
 * swatch and never invents a color.
 */
const TOKEN_DEFAULT_VALUE = 'var(--ds-color-primary)';

/** Matches exactly `#rrggbb` — the only grammar the native color input accepts. */
const NATIVE_HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Normalize a resolved color to `#rrggbb`. `resolveCssColor` returns whatever
 * the browser's computed custom property serializes to — Chromium gives
 * `rgb(r, g, b)` for hex declarations, which the native `<input type="color">`
 * rejects (it silently falls back to #000000). K4-C Pass-2 live finding.
 */
function toNativeHexColor(value: string): string | null {
  if (NATIVE_HEX_RE.test(value)) return value.toLowerCase();
  const match = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/);
  if (!match) return null;
  const to2 = (channel: string) => Number(channel).toString(16).padStart(2, '0');
  return `#${to2(match[1])}${to2(match[2])}${to2(match[3])}`;
}

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
 * Modern engine ColorPicker -- native browser color input with token skin styling.
 *
 * Combines the browser's built-in `<input type="color">` with a custom
 * dropdown panel that shows a hex text input, preset swatches, and an
 * optional clear button. Open/close state and the color value both support
 * controlled and uncontrolled modes. Click-outside detection is handled
 * by a document-level mousedown listener.
 *
 * @param props - {@link ColorPickerProps} unified color picker props shared across engines.
 * @returns A ref-forwarding color picker with Tailwind/token styling.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = TOKEN_DEFAULT_VALUE,
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
    /**
     * Hex draft + validation: the text field lets the user type freely, but
     * only a complete `#rgb`/`#rrggbb` commits to the value. An invalid draft
     * stamps `data-invalid`/`aria-invalid` with a compact error message, and
     * reverts to the committed value on Enter or blur instead of propagating
     * a broken color to the swatch hatch.
     */
    const HEX_DRAFT_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const [hexDraft, setHexDraft] = useState<string | null>(null);

    // Dual controlled/uncontrolled for both value and open state
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled
      ? (typeof controlledValue === 'string' ? controlledValue : controlledValue.toHexString())
      : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Viewport collision handling (K4-C Pass 2): the in-tree dropdown is
    // start-aligned by default, which overflows narrow viewports when the
    // trigger sits near the inline-end edge (measured 6px horizontal overflow
    // at 390px). On open, measure once and end-align when the panel would
    // cross the viewport's inline-end edge. Logical `inset-inline-end` keeps
    // it correct in RTL. No portal, no dependency — bounded and testable.
    const [alignEdge, setAlignEdge] = useState<'start' | 'end'>('start');
    useEffect(() => {
      if (!isOpen) return;
      const dropdown = dropdownRef.current;
      if (!dropdown || typeof window === 'undefined') return;
      const rect = dropdown.getBoundingClientRect();
      const overflowEnd = rect.right - (window.innerWidth - 8);
      setAlignEdge(overflowEnd > 0 ? 'end' : 'start');
    }, [isOpen]);

    // Action/field strings: translated when an I18nProvider is mounted, with
    // the documented English fallbacks otherwise (a missing catalog key echoes
    // the raw key back, which the endsWith guard detects — K4-C wires the
    // channel ahead of the locale JSONs, so behavior is byte-identical until
    // they land).
    const i18n = useOptionalTranslation('components');
    const colorPickerLabel = (
      key: string,
      fallback: string,
      params?: Record<string, string | number>
    ): string => {
      const translated = i18n?.t(key, params);
      return translated && !translated.endsWith(key) ? translated : fallback;
    };
    const clearLabel = colorPickerLabel('colorpicker.clear', 'Clear');

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

    /** Commit a hex draft when it parses; otherwise keep editing. */
    const commitHexDraft = (raw: string): boolean => {
      if (HEX_DRAFT_RE.test(raw)) {
        handleChange(raw.toLowerCase());
        setHexDraft(null);
        return true;
      }
      return false;
    };

    /** Enter commits valid drafts and reverts invalid ones to the live value. */
    const handleHexKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!commitHexDraft((event.target as HTMLInputElement).value)) {
        setHexDraft(null);
      }
    };

    /** Blur commits valid drafts and reverts invalid ones to the live value. */
    const handleHexBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (!commitHexDraft(event.target.value)) {
        setHexDraft(null);
      }
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

    // Resolve a token-backed uncontrolled value (e.g. the `var(--ds-color-primary)`
    // default) against the provider-owned root. The swatch consumes the var()
    // natively, but the native color input and hex input need a concrete
    // `#rrggbb`; only commit when resolution actually yields one.
    useEffect(() => {
      if (isControlled) return;
      if (!internalValue.includes('var(')) return;
      const owner = containerRef.current;
      if (!owner) return;
      const resolved = toNativeHexColor(resolveCssColor(internalValue, owner, ''));
      if (resolved) {
        setInternalValue(resolved);
      }
    }, [internalValue, isControlled]);

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
        className={`rottay-colorpicker rottay-colorpicker--modern ${className || ''}`}
        style={style}
      >
        {/* Trigger area: opens/closes dropdown on click or hover depending on `trigger` prop */}
        <div
          data-part="trigger"
          data-disabled={disabled ? 'true' : undefined}
          onClick={() => !disabled && (trigger === 'click' ? handleOpenChange(!isOpen) : null)}
          onMouseEnter={() => !disabled && trigger === 'hover' && handleOpenChange(true)}
          onMouseLeave={() => !disabled && trigger === 'hover' && handleOpenChange(false)}
        >
          <div
            data-part="swatch"
            data-size={size}
            style={{ '--ds-colorpicker-swatch-color': currentValue || 'var(--ds-color-white)' } as React.CSSProperties}
          />
          {displayText && <span data-part="display-text">{displayText}</span>}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            data-part="dropdown"
            data-edge={alignEdge}
            data-placement={placement}
            // Placement/edge classes stay inline: the engine tests pin
            // `bottom-full` (top placement) and `end-0` (edge collision).
            className={`${placement?.includes('top') ? 'bottom-full mb-1' : ''} ${alignEdge === 'end' ? 'end-0' : ''}`}
          >
            {/* Color input */}
            <input
              type="color"
              data-part="native-color-input"
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              style={{ height: 'var(--ds-color-picker-height, 10rem)' }}
              disabled={disabled}
              aria-label={colorPickerLabel('colorpicker.chooseColor', 'Choose color')}
            />

            {/* Hex input */}
            <div data-part="hex-field">
              <input
                type="text"
                data-part="hex-input"
                data-invalid={hexDraft !== null && !HEX_DRAFT_RE.test(hexDraft) ? 'true' : undefined}
                value={hexDraft ?? currentValue}
                onChange={(e) => setHexDraft(e.target.value)}
                onKeyDown={handleHexKeyDown}
                onBlur={handleHexBlur}
                placeholder="#000000"
                disabled={disabled}
                aria-label={colorPickerLabel('colorpicker.hexLabel', 'Hex color')}
                aria-invalid={hexDraft !== null && !HEX_DRAFT_RE.test(hexDraft) || undefined}
              />
              {hexDraft !== null && !HEX_DRAFT_RE.test(hexDraft) && (
                <span data-part="hex-error" role="alert">
                  {colorPickerLabel('colorpicker.invalidHex', 'Enter a valid hex color (e.g. #1677ff)')}
                </span>
              )}
            </div>

            {/* Presets */}
            {presets && presets.length > 0 && (
              <div data-part="presets">
                {presets.map((preset, idx) => (
                  <div key={idx} data-part="preset-group">
                    {preset.label && (
                      <div data-part="preset-label">{preset.label}</div>
                    )}
                    <div data-part="preset-row">
                      {preset.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          data-part="preset-swatch"
                          style={{ '--ds-colorpicker-preset-color': color } as React.CSSProperties}
                          aria-label={colorPickerLabel('colorpicker.selectColor', `Select color ${color}`, { color })}
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
              <div data-part="clear-field">
                <button
                  type="button"
                  data-part="clear-button"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  {clearLabel}
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
