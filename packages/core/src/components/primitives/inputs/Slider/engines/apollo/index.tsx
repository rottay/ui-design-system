'use client';

/**
 * @fileoverview Slider Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Slider component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloSlider
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback } from 'react';
import type { SliderProps } from '../../types';
import { SLIDER_DEFAULTS } from '../../types';

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

    const getInitialValue = (): number | [number, number] => {
      if (defaultValue !== undefined) return defaultValue;
      if (range) return [min!, max!];
      return min!;
    };

    const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue);
    const [isFocused, setIsFocused] = useState(false);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleChange = useCallback((newValue: number | [number, number]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }, [isControlled, onChange]);

    const handleMouseUp = () => {
      onChangeComplete?.(currentValue);
    };

    const getPercentage = (val: number) => {
      return ((val - min!) / (max! - min!)) * 100;
    };

    // Build class names
    const containerClasses = [
      'rottay-slider',
      'rottay-slider--apollo',
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

    const railBaseStyle: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: 'var(--ds-slider-rail-color)',
      borderRadius: 'var(--ds-slider-track-radius)',
      ...(vertical ? {
        width: 'var(--ds-slider-track-height)',
        height: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
      } : {
        height: 'var(--ds-slider-track-height)',
        width: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
      }),
      ...railStyle,
    };

    const getHandleBaseStyle = (position: number, extraStyle?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      width: 'var(--ds-slider-handle-size)',
      height: 'var(--ds-slider-handle-size)',
      backgroundColor: disabled
        ? 'var(--ds-slider-handle-bg-disabled)'
        : 'var(--ds-slider-handle-bg)',
      borderRadius: '50%',
      border: `var(--ds-slider-handle-border-width) solid var(--ds-slider-handle-border)`,
      boxShadow: 'var(--ds-slider-handle-shadow)',
      pointerEvents: 'none',
      transition: 'box-shadow 0.15s ease',
      outline: isFocused ? 'var(--ds-slider-focus-ring)' : 'none',
      outlineOffset: '2px',
      ...(vertical ? {
        left: '50%',
        bottom: `${position}%`,
        transform: 'translate(-50%, 50%)',
      } : {
        top: '50%',
        left: `${position}%`,
        transform: 'translate(-50%, -50%)',
      }),
      ...extraStyle,
    });

    const inputStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    const markStyle = (percent: number, customStyle?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      fontSize: 'var(--ds-slider-mark-font-size)',
      color: 'var(--ds-slider-mark-color)',
      whiteSpace: 'nowrap',
      ...(vertical ? {
        left: '100%',
        bottom: `${percent}%`,
        marginLeft: '8px',
        transform: 'translateY(50%)',
      } : {
        top: '100%',
        left: `${percent}%`,
        marginTop: '4px',
        transform: 'translateX(-50%)',
      }),
      ...customStyle,
    });

    if (range) {
      const [start, end] = currentValue as [number, number];
      const startPercent = getPercentage(start);
      const endPercent = getPercentage(end);

      const trackActiveStyle: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: disabled
          ? 'var(--ds-slider-track-color-disabled)'
          : 'var(--ds-slider-track-color)',
        borderRadius: 'var(--ds-slider-track-radius)',
        ...(vertical ? {
          width: 'var(--ds-slider-track-height)',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `${startPercent}%`,
          height: `${endPercent - startPercent}%`,
        } : {
          height: 'var(--ds-slider-track-height)',
          top: '50%',
          transform: 'translateY(-50%)',
          left: `${startPercent}%`,
          width: `${endPercent - startPercent}%`,
        }),
        ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
      };

      return (
        <div
          ref={ref}
          className={containerClasses}
          style={containerStyle}
        >
          {/* Rail */}
          <div className="rottay-slider__rail" style={railBaseStyle} />

          {/* Track (active range) */}
          <div className="rottay-slider__track" style={trackActiveStyle} />

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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            style={inputStyle}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={end}
          />

          {/* Handles */}
          <div
            className="rottay-slider__handle"
            style={getHandleBaseStyle(startPercent, Array.isArray(handleStyle) ? handleStyle[0] : handleStyle)}
          />
          <div
            className="rottay-slider__handle"
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
                style={markStyle(percent, customMarkStyle)}
              >
                {label}
              </div>
            );
          })}
        </div>
      );
    }

    // Single slider
    const singleValue = currentValue as number;
    const percent = getPercentage(singleValue);

    const trackActiveStyle: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: disabled
        ? 'var(--ds-slider-track-color-disabled)'
        : 'var(--ds-slider-track-color)',
      borderRadius: 'var(--ds-slider-track-radius)',
      ...(vertical ? {
        width: 'var(--ds-slider-track-height)',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 0,
        height: `${percent}%`,
      } : {
        height: 'var(--ds-slider-track-height)',
        top: '50%',
        transform: 'translateY(-50%)',
        left: 0,
        width: `${percent}%`,
      }),
      ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
    };

    return (
      <div
        ref={ref}
        className={containerClasses}
        style={containerStyle}
      >
        {/* Rail */}
        <div className="rottay-slider__rail" style={railBaseStyle} />

        {/* Track */}
        <div className="rottay-slider__track" style={trackActiveStyle} />

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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={inputStyle}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={singleValue}
        />

        {/* Handle */}
        <div
          className="rottay-slider__handle"
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

Slider.displayName = 'Slider.Apollo';

export default Slider;
