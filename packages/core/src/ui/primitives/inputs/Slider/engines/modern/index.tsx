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
 * - DS token `--ds-surface-panel` - Rail background color
 * - DS token `--ds-color-primary` - Active track and thumb color
 * - Skin-owned native thumb/track geometry (`--ds-slider-*` channels)
 * - Custom positioning for handles and marks
 *
 * **Custom Implementation:**
 * - Range mode with dual hidden inputs
 * - Custom track overlay showing selection
 * - Visual handles positioned over inputs
 * - Marks rendered as absolute positioned labels
 *
 * **Limitations:**
 * - No built-in tooltip
 * - No reverse direction
 * - No dots on steps
 *
 * @example Using Modern Engine
 * ```tsx
 * <Slider
 *   engine="modern"
 *   range
 *   min={0}
 *   max={100}
 *   marks={{ 0: 'Min', 100: 'Max' }}
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
      const newValue: [number, number] = index === 0
        ? [newPartValue, current[1]]
        : [current[0], newPartValue];
      handleChange(newValue);
    };

    // Fires onChangeComplete on pointer release (mouse or touch)
    const handleMouseUp = () => {
      onChangeComplete?.(currentValue);
    };

    /** Converts an absolute value to a percentage offset along the track. */
    const getPercentage = (val: number) => {
      return ((val - min!) / (max! - min!)) * 100;
    };

    if (range) {
      const [start, end] = currentValue as [number, number];
      const startPercent = getPercentage(start);
      const endPercent = getPercentage(end);

      return (
        <div
          ref={ref}
          className={`ds-slider ds-slider--modern relative ${vertical ? 'h-full w-4' : 'w-full h-4'} ${className || ''}`}
          data-part="root"
          data-disabled={disabled ? 'true' : 'false'}
          data-orientation={vertical ? 'vertical' : 'horizontal'}
          style={style}
        >
          {/* Track */}
          <div
            data-part="rail"
            className={`absolute rounded-full ${vertical ? 'w-1 h-full left-1/2 -translate-x-1/2' : 'h-1 w-full top-1/2 -translate-y-1/2'}`}
          />

          {/* Active range */}
          <div
            data-part="track"
            className="absolute rounded-full"
            style={vertical ? {
              left: '50%',
              bottom: `${startPercent}%`,
              height: `${endPercent - startPercent}%`,
              width: '4px',
            } : {
              top: '50%',
              // Logical offset: Chromium flips the native range scale under
              // dir=rtl, so the overlay grammar must follow the inline axis.
              insetInlineStart: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              height: '4px',
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
            disabled={disabled}
            data-part="native-input"
            data-variant="overlay"
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={tOr('slider.start_value', 'Minimum value')}
          />
          <div
            data-part="handle"
            className="absolute w-4 h-4 rounded-full border-2 shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { left: '50%', bottom: `${startPercent}%` } : { top: '50%', insetInlineStart: `${startPercent}%` }}
          />

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
            disabled={disabled}
            data-part="native-input"
            data-variant="overlay"
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={tOr('slider.end_value', 'Maximum value')}
          />
          <div
            data-part="handle"
            className="absolute w-4 h-4 rounded-full border-2 shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { left: '50%', bottom: `${endPercent}%` } : { top: '50%', insetInlineStart: `${endPercent}%` }}
          />

          {/* Marks -- positioned absolutely; supports both string and {label,style} shapes */}
          {marks && Object.entries(marks).map(([key, mark]) => {
            const markValue = Number(key);
            const percent = getPercentage(markValue);
            // Marks can be plain strings or objects with a label property
            const label = typeof mark === 'object' ? mark.label : mark;

            return (
              <div
                key={key}
                data-part="mark-label"
                data-axis={vertical ? 'y' : 'x'}
                className="absolute text-xs"
                style={vertical ? {
                  left: '100%',
                  bottom: `${percent}%`,
                } : {
                  top: '100%',
                  insetInlineStart: `${percent}%`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      );
    }

    // --- Single slider (non-range mode) ---
    const singleValue = currentValue as number;

    return (
      <div
        ref={ref}
        className={`ds-slider ds-slider--modern relative ${vertical ? 'h-full w-4' : 'w-full'} ${className || ''}`}
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
          disabled={disabled}
          data-part="native-input"
          className="w-full"
          aria-label={ariaLabel ?? tOr('slider.label', 'Slider')}
          /* Runtime fill hatch: the skin's runnable-track gradient reads this
             to paint the primary portion (the only legitimate runtime value,
             mirroring the Upload dropzone-height contract). */
          style={{ '--ds-slider-single-percent': `${getPercentage(singleValue)}%` } as React.CSSProperties}
        />

        {/* Marks */}
        {marks && Object.entries(marks).map(([key, mark]) => {
          const markValue = Number(key);
          const markPercent = getPercentage(markValue);
          const label = typeof mark === 'object' ? mark.label : mark;

          return (
            <div
              key={key}
              data-part="mark-label"
              data-axis="x"
              className="absolute text-xs"
              style={{
                top: '100%',
                insetInlineStart: `${markPercent}%`,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    );
  }
);

Slider.displayName = 'Slider.Modern';

export default Slider;
