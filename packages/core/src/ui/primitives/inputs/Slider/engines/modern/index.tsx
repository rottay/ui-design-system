'use client';

/**
 * @fileoverview Slider Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements sliders with skin-owned native range inputs
 * and custom track overlays for range mode support. No DaisyUI classes are
 * consumed: the single-mode native input's thumb/track paint lives in the
 * `slider.css` modern skin (`::-webkit-slider-thumb`, `::-moz-range-thumb`,
 * runnable-track pseudos), keyed on `data-part='native-input'`.
 *
 * **Styling:**
 * - Skin-owned native thumb/track geometry (`--ds-slider-*` channels)
 * - Custom positioning for handles, dots, tooltips and marks
 *
 * **Custom Implementation:**
 * - Range mode with dual hidden inputs (cross-clamped, nearest-handle track click)
 * - Custom track overlay showing selection
 * - Visual handles positioned over inputs
 * - Step dots (`dots`) and marks rendered as absolute positioned labels,
 *   with `data-active` fill-coverage state (never color-only: position + weight)
 * - Value tooltip (`tooltip` contract): opt-in via the prop, hover/focus/press
 *   driven or forced with `open`, per-orientation placement coercion
 *   (horizontal -> top/bottom, vertical -> left/right; incompatible requests
 *   fall back to the orientation default)
 *
 * **Limitations:**
 * - No `reverse` direction (contract gap, documented -- not invented)
 * - `included={false}` mark-segment grammar not implemented (contract gap)
 * - `trackStyle`/`railStyle`/`handleStyle` escape hatches apply to the
 *   range-mode custom parts only (single mode paints natively, no parts)
 *
 * @example Using Modern Engine
 * ```tsx
 * <Slider
 *   engine="modern"
 *   range
 *   min={0}
 *   max={100}
 *   marks={{ 0: 'Min', 100: 'Max' }}
 *   tooltip={{ placement: 'top' }}
 * />
 * ```
 *
 * @see {@link Slider} for the main component
 * @see {@link ClassicSlider} for Ant Design implementation
 * @see {@link RusticSlider} for vanilla implementation
 * @module ModernSlider
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';
import type { SliderProps } from '../../contracts';
import { SLIDER_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * Keys the native range input treats as value commands (the APG slider
 * contract: arrows step, PageUp/PageDown leap, Home/End bound). `keyboard={
 * false}` vetoes exactly these -- Tab and activation keys always pass.
 */
const VALUE_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'PageUp', 'PageDown', 'Home', 'End',
]);

/**
 * Pathological-DOM guard for `dots`: above 200 step intervals the dot layer
 * stops being anatomy and becomes a texture -- antd renders them all, we cap
 * and document. Value/marks semantics are unaffected.
 */
const DOT_COUNT_CAP = 200;

/**
 * Modern engine Slider -- skin-painted native range inputs, DS token styles, and custom overlays.
 *
 * Supports both single and dual-handle range modes. Range mode stacks two
 * invisible native `<input type="range">` elements on top of a custom track
 * overlay so that each handle can be dragged independently while preserving
 * accessibility and keyboard control via the native inputs.
 *
 * @param props - {@link SliderProps} unified slider props shared across engines.
 * @returns A ref-forwarding slider painted by the `slider.css` modern skin.
 */
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      onChange,
      onChangeComplete,
      min = SLIDER_DEFAULTS.min,
      max = SLIDER_DEFAULTS.max,
      step = SLIDER_DEFAULTS.step,
      range,
      marks,
      disabled,
      vertical,
      tooltip,
      dots,
      keyboard = SLIDER_DEFAULTS.keyboard,
      trackStyle,
      railStyle,
      handleStyle,
      className,
      style,
      'aria-label': ariaLabel,
    } = props;

    const i18n = useOptionalTranslation('components');
    /**
     * Localized label with an English floor: when the catalogue entry has not
     * landed yet the provider echoes the full key, which must never reach an
     * aria-label.
     */
    const tOr = (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
      return resolved;
    };

    // Lazy initialiser -- defaults to full range when in range mode
    const getInitialValue = (): number | [number, number] => {
      if (defaultValue !== undefined) return defaultValue;
      if (range) return [min!, max!];
      return min!;
    };

    const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue);

    // Support both controlled and uncontrolled usage patterns
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleChange = useCallback((newValue: number | [number, number]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [isControlled, onChange]);

    /** Handler for the single-value slider (non-range mode). */
    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      handleChange(newValue);
    };

    /**
     * Returns a change handler scoped to a specific handle index.
     * Index 0 = start handle, index 1 = end handle. The opposite
     * handle value is preserved from the current tuple.
     */
    const handleRangeChange = (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPartValue = Number(e.target.value);
      const current = currentValue as [number, number];
      // Range semantics: the start thumb never passes the end thumb (and vice
      // versa) -- keyboard steps clamp at the opposite value.
      const newValue: [number, number] = index === 0
        ? [Math.min(newPartValue, current[1]), current[1]]
        : [current[0], Math.max(newPartValue, current[0])];
      handleChange(newValue);
    };

    // Fires onChangeComplete on pointer release (mouse or touch)
    const handleMouseUp = () => {
      onChangeComplete?.(currentValue);
    };

    /**
     * APG completeness: a keyboard adjustment is a committed change too --
     * onChangeComplete fires on key release, mirroring antd's onAfterChange.
     */
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (keyboard === false || !VALUE_KEYS.has(e.key)) return;
      onChangeComplete?.(currentValue);
    };

    /**
     * `keyboard={false}` vetoes value keys only; Tab/activation always pass.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (keyboard === false && VALUE_KEYS.has(e.key)) {
        e.preventDefault();
      }
    };

    /** Converts an absolute value to a percentage offset along the track. */
    const getPercentage = (val: number) => {
      return ((val - min!) / (max! - min!)) * 100;
    };

    // ---- Value tooltip (contract `tooltip`): opt-in, skin-placed --------- //

    /**
     * Tooltip is rendered only when the prop opts in, `formatter` is not null
     * and `open` is not explicitly false (antd parity: `open: false` suppresses
     * the readout entirely -- engine-side, so no CSS specificity fight).
     */
    const showTooltip = Boolean(tooltip) && tooltip?.formatter !== null && tooltip?.open !== false;

    /**
     * Placement coercion per orientation (documented in the module docblock):
     * horizontal tooltips place top/bottom, vertical left/right; incompatible
     * requests fall back to the orientation's default.
     */
    const tooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = (() => {
      const requested = tooltip?.placement;
      if (vertical) return requested === 'left' || requested === 'right' ? requested : 'right';
      return requested === 'top' || requested === 'bottom' ? requested : 'top';
    })();

    /**
     * Renders the value readout anchored at a thumb point. The part is
     * `aria-hidden`: the accessible value already lives on the native input's
     * implicit `aria-valuenow`, so the bubble is a visual mirror only (never
     * duplicated announcements). Visibility is skin-owned (hover/focus/press
     * sibling selectors, or forced via `data-open`).
     */
    const renderTooltip = (val: number, percent: number, key: string) => {
      if (!showTooltip) return null;
      return (
        <div
          key={key}
          data-part="tooltip"
          data-placement={tooltipPlacement}
          data-open={tooltip?.open === true ? 'true' : undefined}
          aria-hidden="true"
          style={vertical
            ? { left: '50%', bottom: `${percent}%` }
            : { top: '50%', insetInlineStart: `${percent}%` }}
        >
          {tooltip?.formatter ? tooltip.formatter(val) : val}
        </div>
      );
    };

    // ---- Step dots (contract `dots`) ------------------------------------- //

    /** Fill-coverage state for a step/mark value (position + weight, not color-only). */
    const isValueInFill = (val: number): boolean => {
      if (range) {
        const [start, end] = currentValue as [number, number];
        return val >= start && val <= end;
      }
      return val <= (currentValue as number);
    };

    const renderDots = () => {
      if (!dots || !step || step <= 0) return null;
      const intervals = Math.floor((max! - min!) / step);
      if (intervals > DOT_COUNT_CAP) return null;
      const parts: React.ReactElement[] = [];
      for (let i = 0; i <= intervals; i++) {
        const dotValue = min! + i * step;
        const percent = getPercentage(dotValue);
        parts.push(
          <span
            key={i}
            data-part="dot"
            data-active={isValueInFill(dotValue) || undefined}
            aria-hidden="true"
            style={vertical
              ? { left: '50%', bottom: `${percent}%` }
              : { top: '50%', insetInlineStart: `${percent}%` }}
          />,
        );
      }
      return parts;
    };

    // ---- Marks ------------------------------------------------------------- //

    const renderMarks = () => {
      if (!marks) return null;
      return Object.entries(marks).map(([key, mark]) => {
        const markValue = Number(key);
        // Out-of-range marks have no anchor on the scale (antd parity: skip).
        if (markValue < min! || markValue > max!) return null;
        const percent = getPercentage(markValue);
        // Marks can be plain strings or objects with label + per-mark style
        const label = typeof mark === 'object' ? mark.label : mark;
        const markStyle = typeof mark === 'object' ? mark.style : undefined;

        return (
          <div
            key={key}
            data-part="mark-label"
            data-axis={vertical ? 'y' : 'x'}
            data-active={isValueInFill(markValue) || undefined}
            style={vertical ? {
              left: '100%',
              bottom: `${percent}%`,
              ...markStyle,
            } : {
              top: '100%',
              insetInlineStart: `${percent}%`,
              ...markStyle,
            }}
          >
            {label}
          </div>
        );
      });
    };

    if (range) {
      const [start, end] = currentValue as [number, number];
      const startPercent = getPercentage(start);
      const endPercent = getPercentage(end);

      /**
       * Track click (range mode): the two overlay inputs are pointer-transparent
       * except on their thumb pseudos, so a pointer press on the rail/track
       * parts lands here and seeks the NEAREST handle (antd parity). Clicks on
       * anything else (marks, tooltips, thumb drag releases on the inputs) are
       * ignored. Logical-axis aware: RTL mirrors the horizontal ratio, vertical
       * grows from the block end.
       */
      const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        const target = e.target as HTMLElement;
        const part = target.dataset?.part;
        if (part !== 'rail' && part !== 'track') return;
        const rail = (e.currentTarget as HTMLElement).querySelector("[data-part='rail']");
        if (!rail) return;
        const rect = rail.getBoundingClientRect();
        let ratio: number;
        if (vertical) {
          ratio = rect.height > 0 ? (rect.bottom - e.clientY) / rect.height : 0;
        } else {
          const scoped = (e.currentTarget as HTMLElement).closest('[dir]');
          const rtl = scoped
            ? scoped.getAttribute('dir') === 'rtl'
            : document.documentElement.dir === 'rtl';
          ratio = rect.width > 0
            ? (rtl ? (rect.right - e.clientX) : (e.clientX - rect.left)) / rect.width
            : 0;
        }
        ratio = Math.min(1, Math.max(0, ratio));
        const raw = min! + ratio * (max! - min!);
        const snapped = step && step > 0 ? Math.round(raw / step) * step : raw;
        // Avoid float dust (0.1-step ladders) drifting the native inputs.
        const nextValue = Math.min(max!, Math.max(min!, Number(snapped.toFixed(5))));
        const moveStart = Math.abs(nextValue - start) <= Math.abs(nextValue - end);
        const newValue: [number, number] = moveStart
          ? [Math.min(nextValue, end), end]
          : [start, Math.max(nextValue, start)];
        if (newValue[0] === start && newValue[1] === end) return;
        handleChange(newValue);
        onChangeComplete?.(newValue);
      };

      return (
        <div
          ref={ref}
          className={`ds-slider ds-slider--modern ${className || ''}`}
          data-part="root"
          data-range="true"
          data-disabled={disabled ? 'true' : 'false'}
          data-orientation={vertical ? 'vertical' : 'horizontal'}
          style={style}
          onClick={handleTrackClick}
        >
          {/* Track */}
          <div data-part="rail" style={railStyle} />

          {/* Active range */}
          <div
            data-part="track"
            style={{
              ...(vertical ? {
                left: '50%',
                bottom: `${startPercent}%`,
                height: `${endPercent - startPercent}%`,
              } : {
                top: '50%',
                // Logical offset: Chromium flips the native range scale under
                // dir=rtl, so the overlay grammar must follow the inline axis.
                insetInlineStart: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }),
              // Contract escape hatch (range mode paints custom parts).
              ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
            }}
          />

          {/*
           * Two invisible native range inputs are stacked over the custom track.
           * They remain fully accessible (keyboard, screen readers) while the
           * visual handles rendered below provide the styled appearance.
           * Each handle is the ADJACENT next sibling of its input so the skin
           * can paint the keyboard ring on the visible handle via
           * `input:focus-visible + [data-part='handle']` (the overlay inputs
           * themselves are opacity-0 — a ring on them would be invisible).
           * Each tooltip follows its handle so the skin can drive visibility
           * via `input:hover/:focus-visible/:active + handle + tooltip`.
           * Pointer hit-testing lives on each input's OWN thumb pseudo (the
           * skin sets pointer-events:none on the box, auto on the pseudo), so
           * a thumb never swallows the other thumb's drag -- even when the
           * values coincide.
           */}
          {/* Start input + handle */}
          <input
            type="range"
            min={min}
            max={max}
            step={step || 1}
            value={start}
            onChange={handleRangeChange(0)}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            data-part="native-input"
            data-variant="overlay"
            aria-label={tOr('slider.start_value', 'Minimum value')}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
          />
          <div
            data-part="handle"
            style={{
              ...(vertical ? { left: '50%', bottom: `${startPercent}%` } : { top: '50%', insetInlineStart: `${startPercent}%` }),
              ...(Array.isArray(handleStyle) ? handleStyle[0] : handleStyle),
            }}
          />
          {renderTooltip(start, startPercent, 'tooltip-start')}

          {/* End input + handle */}
          <input
            type="range"
            min={min}
            max={max}
            step={step || 1}
            value={end}
            onChange={handleRangeChange(1)}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            data-part="native-input"
            data-variant="overlay"
            aria-label={tOr('slider.end_value', 'Maximum value')}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
          />
          <div
            data-part="handle"
            style={{
              ...(vertical ? { left: '50%', bottom: `${endPercent}%` } : { top: '50%', insetInlineStart: `${endPercent}%` }),
              ...(Array.isArray(handleStyle) ? handleStyle[1] : handleStyle),
            }}
          />
          {renderTooltip(end, endPercent, 'tooltip-end')}

          {/* Step dots -- absolute, pointer-transparent (skin-owned paint) */}
          {renderDots()}

          {/* Marks -- positioned absolutely; supports both string and {label,style} shapes */}
          {renderMarks()}
        </div>
      );
    }

    // --- Single slider (non-range mode) ---
    const singleValue = currentValue as number;
    const singlePercent = getPercentage(singleValue);

    return (
      <div
        ref={ref}
        className={`ds-slider ds-slider--modern ${className || ''}`}
        data-part="root"
        data-disabled={disabled ? 'true' : 'false'}
        data-orientation={vertical ? 'vertical' : 'horizontal'}
        style={style}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step || 1}
          value={singleValue}
          onChange={handleSingleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={disabled}
          data-part="native-input"
          aria-label={ariaLabel ?? tOr('slider.label', 'Slider')}
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          /* Runtime fill hatch: the skin's runnable-track gradient reads this
             to paint the primary portion (the only legitimate runtime value,
             mirroring the Upload dropzone-height contract). */
          style={{ '--ds-slider-single-percent': `${singlePercent}%` } as React.CSSProperties}
        />
        {/* The tooltip is the input's adjacent sibling so the skin drives
            visibility via `input:hover/:focus-visible/:active + tooltip`. */}
        {renderTooltip(singleValue, singlePercent, 'tooltip-single')}

        {/* Step dots (pointer-transparent, painted by the skin) */}
        {renderDots()}

        {/* Marks */}
        {renderMarks()}
      </div>
    );
  }
);

Slider.displayName = 'Slider.Modern';

export default Slider;
