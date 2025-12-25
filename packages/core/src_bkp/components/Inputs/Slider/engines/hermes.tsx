/**
 * Hermes Slider Engine
 *
 * DaisyUI range input implementation with unified SliderProps.
 * Uses DaisyUI's range component classes and styling.
 */

'use client';

import { useState, useCallback } from 'react';
import type { SliderProps, SliderValue } from '../../../../types/components/slider';

/**
 * Hermes Slider - DaisyUI implementation with unified SliderProps
 */
function HermesSlider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  disabled = false,
  onChange,
  onChangeComplete,
  marks,
  className = '',
  style,
  id,
  name,
  autoFocus,
  tabIndex,
}: SliderProps) {
  // Initialize internal state for uncontrolled component
  const getInitialValue = (): SliderValue => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return range ? [min, max / 2] : min;
  };

  const [internalValue, setInternalValue] = useState<SliderValue>(getInitialValue());

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Normalize value to array for consistent handling
  const normalizedValue = Array.isArray(currentValue) ? currentValue : [currentValue];

  // Handle value change
  const handleValueChange = useCallback(
    (newValue: SliderValue, isDragEnd = false) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (isDragEnd && onChangeComplete) {
        onChangeComplete(newValue);
      } else if (!isDragEnd && onChange) {
        onChange(newValue);
      }
    },
    [isControlled, onChange, onChangeComplete]
  );

  // Handle single slider change
  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    handleValueChange(newValue);
  };

  // Handle range slider change
  const handleRangeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!Array.isArray(currentValue)) return;

    const newValue = parseFloat(e.target.value);
    let newRange: [number, number] = [...currentValue] as [number, number];

    // Prevent handles from crossing
    if (index === 0) {
      newRange[0] = Math.min(newValue, newRange[1]);
    } else {
      newRange[1] = Math.max(newValue, newRange[0]);
    }

    handleValueChange(newRange);
  };

  // Mouse up handler for onChangeComplete
  const handleMouseUp = () => {
    if (onChangeComplete) {
      onChangeComplete(currentValue);
    }
  };

  // Calculate percentage for gradient
  const getPercentage = (val: number): number => {
    return ((val - min) / (max - min)) * 100;
  };

  // Render marks
  const renderMarks = () => {
    if (!marks) return null;

    return (
      <div className="flex justify-between w-full text-xs text-gray-600 mt-2">
        {Object.entries(marks).map(([key, mark]) => {
          const markValue = parseFloat(key);
          const percentage = getPercentage(markValue);
          const isObject = typeof mark === 'object' && mark !== null && 'label' in mark;
          const label = isObject ? mark.label : mark;

          return (
            <div
              key={key}
              className="absolute"
              style={{
                left: `${percentage}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    );
  };

  // DaisyUI range classes
  const rangeClasses = [
    'range',
    'range-primary',
    disabled ? 'range-disabled opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (range && Array.isArray(currentValue)) {
    // Range mode with two inputs (DaisyUI doesn't have native dual range support)
    // We'll render two separate range inputs stacked
    return (
      <div className="relative w-full" style={style}>
        <div className="relative">
          {/* Lower bound slider */}
          <input
            type="range"
            id={id}
            name={name ? `${name}-min` : undefined}
            min={min}
            max={max}
            step={step ?? undefined}
            value={currentValue[0]}
            disabled={disabled}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            onChange={(e) => handleRangeChange(0, e)}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className={rangeClasses}
            style={{
              background: `linear-gradient(to right,
                #e5e7eb 0%,
                #e5e7eb ${getPercentage(currentValue[0])}%,
                #3b82f6 ${getPercentage(currentValue[0])}%,
                #3b82f6 ${getPercentage(currentValue[1])}%,
                #e5e7eb ${getPercentage(currentValue[1])}%,
                #e5e7eb 100%)`,
            }}
          />

          {/* Upper bound slider (overlaid) */}
          <input
            type="range"
            name={name ? `${name}-max` : undefined}
            min={min}
            max={max}
            step={step ?? undefined}
            value={currentValue[1]}
            disabled={disabled}
            tabIndex={tabIndex}
            onChange={(e) => handleRangeChange(1, e)}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className={`${rangeClasses} absolute top-0 left-0 w-full pointer-events-none`}
            style={{
              background: 'transparent',
              pointerEvents: disabled ? 'none' : 'auto',
            }}
          />

          {/* Value display */}
          <div className="flex justify-between w-full text-xs text-gray-600 mt-2">
            <span>{currentValue[0]}</span>
            <span>{currentValue[1]}</span>
          </div>
        </div>

        {/* Marks */}
        {marks && <div className="relative mt-2">{renderMarks()}</div>}
      </div>
    );
  }

  // Single value mode
  const singleValue = Array.isArray(currentValue) ? currentValue[0] : currentValue;
  const percentage = getPercentage(singleValue);

  return (
    <div className="w-full" style={style}>
      <input
        type="range"
        id={id}
        name={name}
        min={min}
        max={max}
        step={step ?? undefined}
        value={singleValue}
        disabled={disabled}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        onChange={handleSingleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className={rangeClasses}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
      />

      {/* Value display */}
      <div className="flex justify-center w-full text-xs text-gray-600 mt-2">
        <span>{singleValue}</span>
      </div>

      {/* Marks */}
      {marks && <div className="relative mt-2">{renderMarks()}</div>}
    </div>
  );
}

HermesSlider.displayName = 'HermesSlider';

export default HermesSlider;
