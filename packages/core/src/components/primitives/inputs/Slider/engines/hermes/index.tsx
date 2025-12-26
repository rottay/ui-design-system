'use client';

/**
 * Slider - Hermes Engine (DaisyUI/Tailwind)
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

    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      handleChange(newValue);
    };

    const handleRangeChange = (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPartValue = Number(e.target.value);
      const current = currentValue as [number, number];
      const newValue: [number, number] = index === 0
        ? [newPartValue, current[1]]
        : [current[0], newPartValue];
      handleChange(newValue);
    };

    const handleMouseUp = () => {
      onChangeComplete?.(currentValue);
    };

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
            className={`absolute bg-base-300 rounded-full ${vertical ? 'w-1 h-full left-1/2 -translate-x-1/2' : 'h-1 w-full top-1/2 -translate-y-1/2'}`}
          />

          {/* Active range */}
          <div
            className="absolute bg-primary rounded-full"
            style={vertical ? {
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: `${startPercent}%`,
              height: `${endPercent - startPercent}%`,
              width: '4px',
            } : {
              top: '50%',
              transform: 'translateY(-50%)',
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              height: '4px',
            }}
          />

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
            className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { left: '50%', bottom: `${startPercent}%` } : { top: '50%', left: `${startPercent}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={vertical ? { left: '50%', bottom: `${endPercent}%` } : { top: '50%', left: `${endPercent}%` }}
          />

          {/* Marks */}
          {marks && Object.entries(marks).map(([key, mark]) => {
            const markValue = Number(key);
            const percent = getPercentage(markValue);
            const label = typeof mark === 'object' ? mark.label : mark;

            return (
              <div
                key={key}
                className="absolute text-xs text-base-content/60"
                style={vertical ? {
                  left: '100%',
                  bottom: `${percent}%`,
                  marginLeft: '8px',
                  transform: 'translateY(50%)',
                } : {
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

    // Single slider
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
              className="absolute text-xs text-base-content/60"
              style={{
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

Slider.displayName = 'Slider.Hermes';

export default Slider;
