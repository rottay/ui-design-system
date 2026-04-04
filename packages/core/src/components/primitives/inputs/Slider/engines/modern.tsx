'use client';

/**
 * @fileoverview Slider Modern Engine - Rottay Design System
 * @description Token-driven Tailwind CSS implementation of the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements sliders using Tailwind range input classes
 * with custom track overlays for range mode support.
 *
 * **Styling:**
 * - `range range-primary` - Base range input styling
 * - DS token `--ds-surface-panel` - Rail background color
 * - DS token `--ds-color-primary` - Active track color
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
import type { SliderProps } from '../Slider.types';
import { SLIDER_DEFAULTS } from '../Slider.types';

/**
 * Modern engine Slider -- built with Tailwind range classes, DS token styles, and custom overlays.
 *
 * Supports both single and dual-handle range modes. Range mode stacks two
 * invisible native `<input type="range">` elements on top of a custom track
 * overlay so that each handle can be dragged independently while preserving
 * accessibility and keyboard control via the native inputs.
 *
 * @param props - {@link SliderProps} unified slider props shared across engines.
 * @returns A ref-forwarding slider with Tailwind/DS token styling.
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
    } = props;

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
          className={`relative ${vertical ? 'h-full w-4' : 'w-full h-4'} ${className || ''}`}
          style={style}
        >
          {/* Track */}
          <div
            className={`absolute rounded-full ${vertical ? 'w-1 h-full left-1/2 -translate-x-1/2' : 'h-1 w-full top-1/2 -translate-y-1/2'}`}
            style={{ background: 'var(--ds-surface-panel)' }}
          />

          {/* Active range */}
          <div
            className="absolute rounded-full"
            style={vertical ? {
              background: 'var(--ds-color-primary)',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: `${startPercent}%`,
              height: `${endPercent - startPercent}%`,
              width: '4px',
            } : {
              background: 'var(--ds-color-primary)',
              top: '50%',
              transform: 'translateY(-50%)',
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              height: '4px',
            }}
          />

          {/*
           * Two invisible native range inputs are stacked over the custom track.
           * They remain fully accessible (keyboard, screen readers) while the
           * visual handles rendered below provide the styled appearance.
           */}
          {/* Start input */}
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
            className="range range-primary absolute inset-0 opacity-0 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />

          {/* End input */}
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
            className="range range-primary absolute inset-0 opacity-0 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Handles */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { background: 'var(--ds-color-primary)', left: '50%', bottom: `${startPercent}%` } : { background: 'var(--ds-color-primary)', top: '50%', left: `${startPercent}%` }}
          />
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { background: 'var(--ds-color-primary)', left: '50%', bottom: `${endPercent}%` } : { background: 'var(--ds-color-primary)', top: '50%', left: `${endPercent}%` }}
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
                className="absolute text-xs"
                style={vertical ? {
                  color: 'var(--ds-color-text-secondary)',
                  left: '100%',
                  bottom: `${percent}%`,
                  marginLeft: '8px',
                  transform: 'translateY(50%)',
                } : {
                  color: 'var(--ds-color-text-secondary)',
                  top: '100%',
                  left: `${percent}%`,
                  marginTop: '8px',
                  transform: 'translateX(-50%)',
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
        className={`relative ${vertical ? 'h-full w-4' : 'w-full'} ${className || ''}`}
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
          className={`range range-primary w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />

        {/* Marks */}
        {marks && Object.entries(marks).map(([key, mark]) => {
          const markValue = Number(key);
          const markPercent = getPercentage(markValue);
          const label = typeof mark === 'object' ? mark.label : mark;

          return (
            <div
              key={key}
              className="absolute text-xs"
              style={{
                color: 'var(--ds-color-text-secondary)',
                top: '100%',
                left: `${markPercent}%`,
                marginTop: '4px',
                transform: 'translateX(-50%)',
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
