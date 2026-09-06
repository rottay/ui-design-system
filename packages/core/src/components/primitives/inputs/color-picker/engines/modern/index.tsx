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
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import type { ColorPickerProps, Color, ColorFormat } from '../../contracts';
import {
  FieldOverlayPanel,
  useFieldOverlay,
} from '../../../../runtime/overlay/field-overlay';
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
/**
 * Scope class the portaled panel carries: the family pair the skin already
 * scopes every panel-subtree rule through, so those rules keep matching at
 * identical specificity once the panel leaves the field, plus a panel marker
 * for the two rules that used to reach it through `[data-part='root']`.
 */
const PANEL_SCOPE =
  'rottay-colorpicker rottay-colorpicker--modern rottay-colorpicker-panel';

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = TOKEN_DEFAULT_VALUE,
      onChange,
      format: formatProp,
      onFormatChange,
      presets,
      showText,
      size: sizeProp = COLORPICKER_DEFAULTS.size,
      disabled,
      allowClear,
      trigger = COLORPICKER_DEFAULTS.trigger,
      open: controlledOpen,
      onOpenChange,
      placement = COLORPICKER_DEFAULTS.placement,
      panelRender,
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

    /**
     * Format: controlled through the `format` prop or uncontrolled through
     * internal state. The contract's `onFormatChange` fires "via format
     * switcher" — the panel's own format `<select>` rendered below. The
     * switcher governs the DISPLAY/output format; the panel's editing grammar
     * stays hex (the only input grammar this lightweight panel owns).
     */
    const [internalFormat, setInternalFormat] = useState<ColorFormat>(
      formatProp ?? COLORPICKER_DEFAULTS.format ?? 'hex'
    );
    const currentFormat = formatProp ?? internalFormat;

    // Dual controlled/uncontrolled for both value and open state
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled
      ? (typeof controlledValue === 'string' ? controlledValue : controlledValue.toHexString())
      : internalValue;
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    // The kernel needs the field root as state (a ref never re-renders when
    // it lands), so the container publishes to both.
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    // The panel carries both this engine's focus/containment ref and the
    // kernel's measured element.
    const setPanelNode = useCallback((node: HTMLDivElement | null) => {
      (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      setPanelEl(node);
    }, []);
    const triggerRef = useRef<HTMLDivElement>(null);
    /** Set only by the trigger's own key handlers, so a pointer (and, under
     *  `trigger='hover'`, a passing cursor) never steals focus. */
    const keyboardOpenRef = useRef(false);

    /**
     * Keyboard open moves focus into the panel. Escape already returns it to
     * the trigger; without the outbound half the restore had nothing to undo
     * and a keyboard user had to Tab past the trigger to reach the controls
     * they had just asked for.
     */
    // Keyed on the panel ELEMENT, not on `isOpen`: the panel is portaled, so
    // it mounts a commit after `isOpen` flips and an `[isOpen]`-only effect
    // would read a null ref and never land the focus.
    useEffect(() => {
      if (!isOpen) {
        keyboardOpenRef.current = false;
        return;
      }
      if (!keyboardOpenRef.current || !panelEl) return;
      keyboardOpenRef.current = false;
      panelEl.querySelector<HTMLElement>('input, select, button')?.focus();
    }, [isOpen, panelEl]);

    // A controlled `open` can close the panel outside this component's own handlers, so an
    // unresolved draft must be cleared or the next open shows stale text.
    useEffect(() => {
      if (!isOpen) setHexDraft(null);
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
    const triggerLabel = colorPickerLabel('colorpicker.triggerLabel', 'Color picker');
    const formatLabel = colorPickerLabel('colorpicker.formatLabel', 'Color format');
    const panelLabel = colorPickerLabel('colorpicker.panelLabel', 'Color picker panel');

    /* The panel and its error message need stable ids so the trigger can point
       at the surface it opens and the hex field at the message that explains
       its own invalid state. */
    const instanceId = useId();
    const panelId = `${instanceId}-panel`;
    const hexErrorId = `${instanceId}-hex-error`;
    const hexIsInvalid = hexDraft !== null && !HEX_DRAFT_RE.test(hexDraft);

    /** Format switcher: fires the contract callback and, when the consumer
     *  does not control `format`, moves the internal display format. */
    const handleFormatSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value as ColorFormat;
      if (formatProp === undefined) {
        setInternalFormat(next);
      }
      onFormatChange?.(next);
    };

    /** Toggles the dropdown, respecting controlled `open` prop when present. */
    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [controlledOpen, onOpenChange]);

    const hoverDisclosure = trigger === 'hover' && !disabled;

    const handleHoverLeave = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        // React reports leaving the root the moment the pointer crosses into
        // the PORTALED panel, which is no longer a DOM descendant. The panel
        // is still "inside" the disclosure, so the close decision is a
        // containment test against both real elements.
        const next = event.relatedTarget as Node | null;
        if (next && panelEl?.contains(next)) return;
        handleOpenChange(false);
      },
      [panelEl, handleOpenChange],
    );

    /**
     * Keyboard disclosure contract (B2.5): the trigger is a real focusable
     * button — Enter/Space toggle, ArrowDown opens, and Escape anywhere
     * inside the component (hex input, preset swatches, clear) closes and
     * returns focus to the trigger. Keyboard always works, even under
     * `trigger='hover'` (pointer parity).
     */
    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!isOpen) keyboardOpenRef.current = true;
        handleOpenChange(!isOpen);
      } else if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        keyboardOpenRef.current = true;
        handleOpenChange(true);
      }
    };

    const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Escape' || !isOpen) return;
      event.preventDefault();
      event.stopPropagation();
      handleOpenChange(false);
      triggerRef.current?.focus();
    };

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

    const dismissPanel = useCallback(() => {
      handleOpenChange(false);
    }, [handleOpenChange]);

    // One overlay contract, on the canonical portal path: the panel leaves the
    // field subtree through `FieldOverlayPanel`, so it cannot be clipped by an
    // ancestor's overflow. That buys the canonical dropdown band, the single
    // Escape router (top-most layer only) and the shared capture-phase
    // outside-pointer watcher, which replaces this engine's private
    // `mousedown` listener. The skin selects the panel from its own root-level
    // class instead of by descendancy.
    // Viewport collision handling is the overlay kernel's: the measured
    // branch clamps the panel inside the viewport with an 8px margin and
    // flips the block side, which is what the private `data-edge` pass used
    // to approximate for the inline axis only.
    const overlay = useFieldOverlay({
      kind: 'dropdown',
      open: isOpen,
      anchor: anchorEl,
      panel: panelEl,
      placement: placement?.includes('top') ? 'top-start' : 'bottom-start',
      offset: 4,
      flip: true,
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onDismiss: dismissPanel,
      // Escape stays with this engine's own key handler: it closes AND returns
      // focus to the trigger, a component-scoped contract the shared router
      // cannot express. The layer still declares `modal: true`, so the router
      // keeps a lower dialog from claiming the same press.
      dismissOnEscape: false,
      dismissOnOutsidePointer: true,
    });

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
      switch (currentFormat) {
        case 'rgb': return createColor(currentValue).toRgbString();
        case 'hsb': return currentValue;
        default: return currentValue;
      }
    };

    const displayText = getDisplayText();

    /**
     * The panel (extracted so the contract's `panelRender` can wrap it). DOM
     * order matters: the engine tests pin `querySelectorAll('button')[0]` as
     * the first PRESET swatch — the format switcher is a `<select>`, never a
     * button, and the trigger stays a div, so that pin holds.
     */
    const dropdownPanel = (
      <div
        {...overlay.panelProps}
        ref={setPanelNode}
        className={PANEL_SCOPE}
        data-part="dropdown"
        /* The trigger has always advertised `aria-haspopup="dialog"`, but the
           surface it opened was an anonymous div: AT was promised a named
           dialog and handed an unlabelled group of stray controls. */
        id={panelId}
        role="dialog"
        aria-label={panelLabel}
        data-placement={placement}
        style={overlay.panelProps.style}
      >
        {/* Color input: geometry drained to the skin (the
            `--ds-color-picker-height` hook keeps its fallback there --
            undeclared channel, its fallback IS its contract). */}
        <input
          type="color"
          data-part="native-color-input"
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          aria-label={colorPickerLabel('colorpicker.chooseColor', 'Choose color')}
        />

        {/* Hex input */}
        <div data-part="hex-field">
          <input
            type="text"
            data-part="hex-input"
            data-invalid={hexIsInvalid ? 'true' : undefined}
            value={hexDraft ?? currentValue}
            onChange={(e) => setHexDraft(e.target.value)}
            onKeyDown={handleHexKeyDown}
            onBlur={handleHexBlur}
            placeholder="#000000"
            disabled={disabled}
            aria-label={colorPickerLabel('colorpicker.hexLabel', 'Hex color')}
            aria-invalid={hexIsInvalid || undefined}
            /* The message named the field's problem but nothing tied it to the
               field: a user arriving on the input by keyboard heard "invalid"
               with no statement of what would be valid. */
            aria-describedby={hexIsInvalid ? hexErrorId : undefined}
          />
          {hexIsInvalid && (
            <span id={hexErrorId} data-part="hex-error" role="alert">
              {colorPickerLabel('colorpicker.invalidHex', 'Enter a valid hex color (e.g. #1677ff)')}
            </span>
          )}
        </div>

        {/* Format switcher (contract's onFormatChange channel). HEX/RGB/HSB are
            technical tokens, identical across locales — only the select's
            accessible name is localized. */}
        <div data-part="format-field">
          <select
            data-part="format-select"
            value={currentFormat}
            onChange={handleFormatSelect}
            disabled={disabled}
            aria-label={formatLabel}
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsb">HSB</option>
          </select>
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
                  {preset.colors.map((color) => {
                    const isPresetSelected =
                      currentValue.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        key={color}
                        type="button"
                        data-part="preset-swatch"
                        data-selected={isPresetSelected || undefined}
                        style={{ '--ds-colorpicker-preset-color': color } as React.CSSProperties}
                        aria-label={colorPickerLabel('colorpicker.selectColor', `Select color ${color}`, { color })}
                        aria-pressed={isPresetSelected}
                        onClick={() => handleChange(color)}
                        disabled={disabled}
                      />
                    );
                  })}
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
    );

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          setAnchorEl(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-part="root"
        className={`rottay-colorpicker rottay-colorpicker--modern ${className || ''}`}
        style={style}
        onKeyDown={handleRootKeyDown}
        /* Hover disclosure spans the field AND the panel. A trigger-scoped
           mouseleave closed the panel the moment the pointer travelled toward
           it, making the hex input, presets and clear control unreachable by
           pointer. The panel is now PORTALED, so leaving the root no longer
           means leaving the disclosure -- see handleHoverLeave. */
        onMouseEnter={hoverDisclosure ? () => handleOpenChange(true) : undefined}
        onMouseLeave={hoverDisclosure ? handleHoverLeave : undefined}
      >
        {/* Trigger area: opens/closes dropdown on click or hover depending on
            `trigger` prop. A real focusable disclosure button (keyboard law):
            Enter/space/ArrowDown operate it even in hover mode. */}
        <div
          ref={triggerRef}
          data-part="trigger"
          data-disabled={disabled ? 'true' : undefined}
          data-open={isOpen || undefined}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          aria-disabled={disabled || undefined}
          onClick={() => !disabled && (trigger === 'click' ? handleOpenChange(!isOpen) : null)}
          onKeyDown={handleTriggerKeyDown}
        >
          <div
            data-part="swatch"
            data-size={size}
            data-empty={!currentValue || undefined}
            style={{ '--ds-colorpicker-swatch-color': currentValue || 'var(--ds-color-white)' } as React.CSSProperties}
          />
          {displayText && <span data-part="display-text">{displayText}</span>}
        </div>

        {isOpen && (
          <FieldOverlayPanel overlay={overlay}>
            {panelRender ? panelRender(dropdownPanel) : dropdownPanel}
          </FieldOverlayPanel>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker.Modern';

export default ColorPicker;
