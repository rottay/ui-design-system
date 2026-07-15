'use client';

/**
 * @fileoverview Slider Rustic Engine -- pure HTML/CSS with CSS variable theming.
 * Renders a custom slider track, rail, handles, and marks using
 * token-backed style objects driven by `--ds-slider-*` design tokens, making it safe for
 * multi-tenant theme isolation.
 *
 * @example
 * ```tsx
 * <Slider engine="rustic" min={0} max={100} marks={{ 0: 'Low', 100: 'High' }} />
 * ```
 *
 * @module RusticSlider
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';

import { useInteractionState } from '../../../../../behavior';
import type { SliderProps } from '../Slider.types';
import { SLIDER_DEFAULTS } from '../Slider.types';

/**
 * Rustic engine Slider -- framework-free, CSS-variable-driven range input.
 *
 * Renders an invisible native `<input type="range">` for accessibility and
 * overlays custom rail, track, and handle elements styled entirely through
 * `--ds-slider-*` CSS variables. Supports single-value and dual-handle range
 * modes with vertical orientation and custom marks.
 *
 * @param props - {@link SliderProps} unified slider props shared across engines.
 * @returns A ref-forwarding slider with pure CSS variable styling.
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
      trackStyle,
      railStyle,
      handleStyle,
      className = '',
      style,
    } = props;

    // Lazy initialiser -- uses full range span as default for dual-handle mode
    const getInitialValue = (): number | [number, number] => {
      if (defaultValue !== undefined) return defaultValue;
      if (range) return [min!, max!];
      return min!;
    };

    const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue);
    // Focus state drives the focus-ring outline on handles via inline styles
    // The triad is decided once, in the behavior core. `focused` is any focus --
    // a field's focus border must appear when a pointer lands in it. A ring is
    // `focusVisible`, and this part does not draw one.
    const { state: interaction, handlers: interactionHandlers } = useInteractionState();
    const isFocused = interaction.focused;

    // Controlled vs uncontrolled pattern: external value wins when provided
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleChange = useCallback((newValue: number | [number, number]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [isControlled, onChange]);

    // Fires the "commit" callback on pointer release (analogous to AntD's onChangeComplete)
    const handleMouseUp = () => {
      onChangeComplete?.(currentValue);
    };

    /** Maps an absolute value to a 0-100% position on the track. */
    const getPercentage = (val: number) => {
      return ((val - min!) / (max! - min!)) * 100;
    };

    // BEM class names assembled conditionally for external CSS overrides
    const containerClasses = [
      'rottay-slider',
      'rottay-slider--rustic',
      'ds-slider',
      'ds-slider--rustic',
      disabled && 'rottay-slider--disabled',
      vertical && 'rottay-slider--vertical',
      isFocused && 'rottay-slider--focused',
      className,
    ].filter(Boolean).join(' ');

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: vertical ? '20px' : '100%',
      height: vertical ? '100%' : '20px',
      padding: vertical ? '0' : '8px 0',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    // Rail = the full-length background bar behind the active track
    const railBaseStyle: React.CSSProperties = {
      position: 'absolute',
      ...(vertical ? {
        width: 'var(--ds-slider-track-height)',
        height: '100%',
        left: '50%',
      } : {
        height: 'var(--ds-slider-track-height)',
        width: '100%',
        top: '50%',
      }),
      ...railStyle,
    };

    /** Generates absolute-positioned handle styles at a given percentage offset. */
    const getHandleBaseStyle = (position: number, extraStyle?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      width: 'var(--ds-slider-handle-size)',
      height: 'var(--ds-slider-handle-size)',
      pointerEvents: 'none',
      transition: 'box-shadow 0.15s ease',
      ...(vertical ? {
        left: '50%',
        bottom: `${position}%`,
      } : {
        top: '50%',
        left: `${position}%`,
      }),
      ...extraStyle,
    });

    // Native input is invisible but receives all pointer/keyboard events
    const inputStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    /** Positions a mark label at the given percentage, adapting for vertical orientation. */
    const markStyle = (percent: number, customStyle?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      fontSize: 'var(--ds-slider-mark-font-size)',
      whiteSpace: 'nowrap',
      ...(vertical ? {
        left: '100%',
        bottom: `${percent}%`,
        marginLeft: '8px',
      } : {
        top: '100%',
        left: `${percent}%`,
        marginTop: '4px',
      }),
      ...customStyle,
    });

    if (range) {
      const [start, end] = currentValue as [number, number];
      const startPercent = getPercentage(start);
      const endPercent = getPercentage(end);

      const trackActiveStyle: React.CSSProperties = {
        position: 'absolute',
        ...(vertical ? {
          width: 'var(--ds-slider-track-height)',
          left: '50%',
          bottom: `${startPercent}%`,
          height: `${endPercent - startPercent}%`,
        } : {
          height: 'var(--ds-slider-track-height)',
          top: '50%',
          left: `${startPercent}%`,
          width: `${endPercent - startPercent}%`,
        }),
        ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
      };

      return (
        <div
          ref={ref}
          className={containerClasses}
          data-part="root"
          data-disabled={disabled ? 'true' : 'false'}
          data-orientation={vertical ? 'vertical' : 'horizontal'}
          style={containerStyle}
        >
          {/* Rail */}
          <div className="rottay-slider__rail" data-part="rail" style={railBaseStyle} />

          {/* Track (active range) */}
          <div className="rottay-slider__track" data-part="track" style={trackActiveStyle} />

          {/* Range inputs */}
          <input
            type="range"
            min={min}
            max={max}
            step={step || 1}
            value={start}
            onChange={(e) => handleChange([Number(e.target.value), end])}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            {...interactionHandlers}
            disabled={disabled}
            style={inputStyle}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={start}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step || 1}
            value={end}
            onChange={(e) => handleChange([start, Number(e.target.value)])}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            {...interactionHandlers}
            disabled={disabled}
            style={inputStyle}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={end}
          />

          {/* Handles */}
          <div
            className="rottay-slider__handle"
            data-part="handle"
            style={getHandleBaseStyle(startPercent, Array.isArray(handleStyle) ? handleStyle[0] : handleStyle)}
          />
          <div
            className="rottay-slider__handle"
            data-part="handle"
            style={getHandleBaseStyle(endPercent, Array.isArray(handleStyle) ? handleStyle[1] : handleStyle)}
          />

          {/* Marks */}
          {marks && Object.entries(marks).map(([key, mark]) => {
            const markValue = Number(key);
            const percent = getPercentage(markValue);
            const label = typeof mark === 'object' ? mark.label : mark;
            const customMarkStyle = typeof mark === 'object' ? mark.style : undefined;

            return (
              <div
                key={key}
                className="rottay-slider__mark"
                data-part="mark-label"
                style={markStyle(percent, customMarkStyle)}
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
    const percent = getPercentage(singleValue);

    // Active track fills from the start (0%) up to the current value
    const trackActiveStyle: React.CSSProperties = {
      position: 'absolute',
      ...(vertical ? {
        width: 'var(--ds-slider-track-height)',
        left: '50%',
        bottom: 0,
        height: `${percent}%`,
      } : {
        height: 'var(--ds-slider-track-height)',
        top: '50%',
        left: 0,
        width: `${percent}%`,
      }),
      ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
    };

    return (
      <div
        ref={ref}
        className={containerClasses}
        data-part="root"
        data-disabled={disabled ? 'true' : 'false'}
        data-orientation={vertical ? 'vertical' : 'horizontal'}
        style={containerStyle}
      >
        {/* Rail */}
        <div className="rottay-slider__rail" data-part="rail" style={railBaseStyle} />

        {/* Track */}
        <div className="rottay-slider__track" data-part="track" style={trackActiveStyle} />

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step || 1}
          value={singleValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          {...interactionHandlers}
          disabled={disabled}
          style={inputStyle}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={singleValue}
        />

        {/* Handle */}
        <div
          className="rottay-slider__handle"
          data-part="handle"
          style={getHandleBaseStyle(percent, Array.isArray(handleStyle) ? handleStyle[0] : handleStyle)}
        />

        {/* Marks */}
        {marks && Object.entries(marks).map(([key, mark]) => {
          const markValue = Number(key);
          const markPercent = getPercentage(markValue);
          const label = typeof mark === 'object' ? mark.label : mark;
          const customMarkStyle = typeof mark === 'object' ? mark.style : undefined;

          return (
            <div
              key={key}
              className="rottay-slider__mark"
              data-part="mark-label"
              style={markStyle(markPercent, customMarkStyle)}
            >
              {label}
            </div>
          );
        })}
      </div>
    );
  }
);

Slider.displayName = 'Slider.Rustic';

export default Slider;
