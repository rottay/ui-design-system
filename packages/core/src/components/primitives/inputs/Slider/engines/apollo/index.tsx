'use client';

/**
 * @fileoverview Slider Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Slider component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Apollo engine provides a zero-dependency slider using hidden range
 * inputs with custom visual overlays for track, rail, and handles.
 *
 * **Pure CSS Features:**
 * - Hidden native range inputs for interaction
 * - Custom rail with absolute positioning
 * - Active track showing selection range
 * - Visual handles with box shadow
 * - Marks with custom label positioning
 *
 * **Component Structure:**
 * - Container div with relative positioning
 * - Rail (full width/height background)
 * - Track (selection area, positioned dynamically)
 * - Hidden range input(s) for interaction
 * - Visual handles at current value positions
 * - Optional marks with labels
 *
 * **Range Mode:**
 * Uses two overlapping hidden inputs, each controlling one handle.
 *
 * @example Using Apollo Engine
 * ```tsx
 * <Slider
 *   engine="apollo"
 *   min={0}
 *   max={100}
 *   step={10}
 *   marks={{ 0: '0', 50: '50', 100: '100' }}
 * />
 * ```
 *
 * @see {@link Slider} for the main component
 * @see {@link TitanSlider} for Ant Design implementation
 * @see {@link HermesSlider} for DaisyUI implementation
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
      className,
      style,
    } = props;

    const getInitialValue = (): number | [number, number] => {
      if (defaultValue !== undefined) return defaultValue;
      if (range) return [min!, max!];
      return min!;
    };

    const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue);

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

    const trackColor = '#3b82f6';
    const railColor = '#e5e7eb';

    if (range) {
      const [start, end] = currentValue as [number, number];
      const startPercent = getPercentage(start);
      const endPercent = getPercentage(end);

      return (
        <div
          ref={ref}
          className={className}
          style={{
            position: 'relative',
            width: vertical ? '20px' : '100%',
            height: vertical ? '100%' : '20px',
            padding: vertical ? '0' : '8px 0',
            ...style,
          }}
        >
          {/* Rail */}
          <div
            style={{
              position: 'absolute',
              backgroundColor: railColor,
              borderRadius: '4px',
              ...(vertical ? {
                width: '4px',
                height: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
              } : {
                height: '4px',
                width: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
              ...railStyle,
            }}
          />

          {/* Track (active range) */}
          <div
            style={{
              position: 'absolute',
              backgroundColor: trackColor,
              borderRadius: '4px',
              ...(vertical ? {
                width: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: `${startPercent}%`,
                height: `${endPercent - startPercent}%`,
              } : {
                height: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                left: `${startPercent}%`,
                width: `${endPercent - startPercent}%`,
              }),
              ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
            }}
          />

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
            disabled={disabled}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              pointerEvents: 'auto',
            }}
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
            disabled={disabled}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              pointerEvents: 'auto',
            }}
          />

          {/* Handles */}
          <div
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              backgroundColor: trackColor,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'none',
              ...(vertical ? {
                left: '50%',
                bottom: `${startPercent}%`,
                transform: 'translate(-50%, 50%)',
              } : {
                top: '50%',
                left: `${startPercent}%`,
                transform: 'translate(-50%, -50%)',
              }),
              ...(Array.isArray(handleStyle) ? handleStyle[0] : handleStyle),
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              backgroundColor: trackColor,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'none',
              ...(vertical ? {
                left: '50%',
                bottom: `${endPercent}%`,
                transform: 'translate(-50%, 50%)',
              } : {
                top: '50%',
                left: `${endPercent}%`,
                transform: 'translate(-50%, -50%)',
              }),
              ...(Array.isArray(handleStyle) ? handleStyle[1] : handleStyle),
            }}
          />

          {/* Marks */}
          {marks && Object.entries(marks).map(([key, mark]) => {
            const markValue = Number(key);
            const percent = getPercentage(markValue);
            const label = typeof mark === 'object' ? mark.label : mark;
            const markStyle = typeof mark === 'object' ? mark.style : undefined;

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  fontSize: '12px',
                  color: '#6b7280',
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
                  ...markStyle,
                }}
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

    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: vertical ? '20px' : '100%',
          height: vertical ? '100%' : '20px',
          padding: vertical ? '0' : '8px 0',
          ...style,
        }}
      >
        {/* Rail */}
        <div
          style={{
            position: 'absolute',
            backgroundColor: railColor,
            borderRadius: '4px',
            ...(vertical ? {
              width: '4px',
              height: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
            } : {
              height: '4px',
              width: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            ...railStyle,
          }}
        />

        {/* Track */}
        <div
          style={{
            position: 'absolute',
            backgroundColor: trackColor,
            borderRadius: '4px',
            ...(vertical ? {
              width: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 0,
              height: `${percent}%`,
            } : {
              height: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              left: 0,
              width: `${percent}%`,
            }),
            ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
          }}
        />

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
          disabled={disabled}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />

        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            backgroundColor: disabled ? '#9ca3af' : trackColor,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            pointerEvents: 'none',
            ...(vertical ? {
              left: '50%',
              bottom: `${percent}%`,
              transform: 'translate(-50%, 50%)',
            } : {
              top: '50%',
              left: `${percent}%`,
              transform: 'translate(-50%, -50%)',
            }),
            ...(Array.isArray(handleStyle) ? handleStyle[0] : handleStyle),
          }}
        />

        {/* Marks */}
        {marks && Object.entries(marks).map(([key, mark]) => {
          const markValue = Number(key);
          const markPercent = getPercentage(markValue);
          const label = typeof mark === 'object' ? mark.label : mark;
          const markStyle = typeof mark === 'object' ? mark.style : undefined;

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                fontSize: '12px',
                color: '#6b7280',
                whiteSpace: 'nowrap',
                ...(vertical ? {
                  left: '100%',
                  bottom: `${markPercent}%`,
                  marginLeft: '8px',
                  transform: 'translateY(50%)',
                } : {
                  top: '100%',
                  left: `${markPercent}%`,
                  marginTop: '4px',
                  transform: 'translateX(-50%)',
                }),
                ...markStyle,
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

Slider.displayName = 'Slider.Apollo';

export default Slider;
