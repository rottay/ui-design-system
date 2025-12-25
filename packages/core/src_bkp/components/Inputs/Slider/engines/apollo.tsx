/**
 * Apollo Slider (Native HTML + Tailwind)
 *
 * Native HTML range input + Tailwind CSS slider implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import type { SliderProps, SliderValue, SliderMarks } from '../../../../types/components/slider';

/**
 * Apollo Slider - Native HTML + Tailwind implementation
 */
function ApolloSlider({
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
  dots = false,
  included = true,
  reverse = false,
  vertical = false,
  tooltip,
  className,
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
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Normalize value to array for consistent handling
  const normalizedValue = Array.isArray(currentValue) ? currentValue : [currentValue];

  // Calculate percentage for a given value
  const getPercentage = useCallback(
    (val: number) => {
      const percentage = ((val - min) / (max - min)) * 100;
      return reverse ? 100 - percentage : percentage;
    },
    [min, max, reverse]
  );

  // Update value with step constraint
  const snapToStep = useCallback(
    (val: number): number => {
      if (step === null) return val;
      const steps = Math.round((val - min) / step);
      return Math.min(max, Math.max(min, min + steps * step));
    },
    [min, max, step]
  );

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
  const handleRangeChange = (index: number, newValue: number) => {
    if (!Array.isArray(currentValue)) return;

    const snappedValue = snapToStep(newValue);
    let newRange: [number, number] = [...currentValue] as [number, number];

    // Prevent handles from crossing
    if (index === 0) {
      newRange[0] = Math.min(snappedValue, newRange[1]);
    } else {
      newRange[1] = Math.max(snappedValue, newRange[0]);
    }

    handleValueChange(newRange);
  };

  // Mouse up handler for onChangeComplete
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setActiveHandle(null);
      if (onChangeComplete) {
        onChangeComplete(currentValue);
      }
    }
  };

  // Generate marks positions
  const renderMarks = () => {
    if (!marks) return null;

    return Object.entries(marks).map(([key, mark]) => {
      const markValue = parseFloat(key);
      const percentage = getPercentage(markValue);
      const isObject = typeof mark === 'object' && mark !== null && 'label' in mark;
      const label = isObject ? mark.label : mark;
      const markStyle = isObject ? mark.style : {};

      return (
        <div
          key={key}
          className={cn(
            'absolute text-xs text-gray-600',
            vertical ? 'left-8' : 'top-6'
          )}
          style={{
            ...(vertical ? { bottom: `${percentage}%` } : { left: `${percentage}%` }),
            transform: vertical ? 'translateY(50%)' : 'translateX(-50%)',
            ...markStyle,
          }}
        >
          {label}
        </div>
      );
    });
  };

  // Generate step dots
  const renderDots = () => {
    if (!dots || step === null) return null;

    const dotCount = Math.floor((max - min) / step) + 1;
    const dotsArray = Array.from({ length: dotCount }, (_, i) => {
      const dotValue = min + i * step;
      const percentage = getPercentage(dotValue);
      const isInRange = Array.isArray(currentValue)
        ? dotValue >= currentValue[0] && dotValue <= currentValue[1]
        : dotValue <= currentValue;

      return (
        <div
          key={i}
          className={cn(
            'absolute w-2 h-2 rounded-full border-2 border-white',
            isInRange && included ? 'bg-blue-500' : 'bg-gray-300',
            vertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'
          )}
          style={vertical ? { bottom: `${percentage}%` } : { left: `${percentage}%` }}
        />
      );
    });

    return <>{dotsArray}</>;
  };

  // Tooltip formatter
  const formatTooltip = (val: number): string => {
    if (tooltip?.formatter === null) return '';
    if (tooltip?.formatter) {
      const formatted = tooltip.formatter(val);
      return typeof formatted === 'string' || typeof formatted === 'number' ? String(formatted) : '';
    }
    return String(val);
  };

  const sliderClasses = cn(
    'relative',
    vertical ? 'h-full w-6 inline-block' : 'w-full h-6',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  const trackClasses = cn(
    'absolute bg-gray-200 rounded-full',
    vertical ? 'w-1 h-full left-1/2 -translate-x-1/2' : 'h-1 w-full top-1/2 -translate-y-1/2'
  );

  const rangeClasses = cn(
    'absolute bg-blue-500 rounded-full',
    vertical ? 'w-1 left-1/2 -translate-x-1/2' : 'h-1 top-1/2 -translate-y-1/2'
  );

  const thumbClasses = cn(
    'absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md',
    'transition-transform duration-150',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    !disabled && 'hover:scale-110',
    disabled && 'cursor-not-allowed'
  );

  // Calculate range track position and size
  const getRangeStyle = () => {
    const values = normalizedValue;
    if (vertical) {
      const bottom = getPercentage(values[0]);
      const top = getPercentage(values[values.length - 1]);
      return {
        bottom: `${Math.min(bottom, top)}%`,
        height: `${Math.abs(top - bottom)}%`,
      };
    } else {
      const left = getPercentage(values[0]);
      const right = getPercentage(values[values.length - 1]);
      return {
        left: `${Math.min(left, right)}%`,
        width: `${Math.abs(right - left)}%`,
      };
    }
  };

  if (range && Array.isArray(currentValue)) {
    // Range mode with two handles
    return (
      <div
        ref={sliderRef}
        className={sliderClasses}
        style={style}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Track */}
        <div className={trackClasses} />

        {/* Range highlight */}
        {included && <div className={rangeClasses} style={getRangeStyle()} />}

        {/* Dots */}
        {renderDots()}

        {/* Marks */}
        {renderMarks()}

        {/* Handle 1 */}
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step ?? undefined}
          value={currentValue[0]}
          disabled={disabled}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          onChange={(e) => {
            setIsDragging(true);
            setActiveHandle(0);
            handleRangeChange(0, parseFloat(e.target.value));
          }}
          className="absolute opacity-0 w-full h-full cursor-pointer"
          style={{ pointerEvents: disabled ? 'none' : 'auto' }}
        />

        {/* Visual handle 1 */}
        <div
          className={thumbClasses}
          style={{
            ...(vertical
              ? { bottom: `${getPercentage(currentValue[0])}%`, left: '50%', transform: 'translate(-50%, 50%)' }
              : { left: `${getPercentage(currentValue[0])}%`, top: '50%', transform: 'translate(-50%, -50%)' }),
          }}
        >
          {(tooltip?.open || (isDragging && activeHandle === 0)) && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              {formatTooltip(currentValue[0])}
            </div>
          )}
        </div>

        {/* Handle 2 */}
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? undefined}
          value={currentValue[1]}
          disabled={disabled}
          tabIndex={tabIndex}
          onChange={(e) => {
            setIsDragging(true);
            setActiveHandle(1);
            handleRangeChange(1, parseFloat(e.target.value));
          }}
          className="absolute opacity-0 w-full h-full cursor-pointer"
          style={{ pointerEvents: disabled ? 'none' : 'auto' }}
        />

        {/* Visual handle 2 */}
        <div
          className={thumbClasses}
          style={{
            ...(vertical
              ? { bottom: `${getPercentage(currentValue[1])}%`, left: '50%', transform: 'translate(-50%, 50%)' }
              : { left: `${getPercentage(currentValue[1])}%`, top: '50%', transform: 'translate(-50%, -50%)' }),
          }}
        >
          {(tooltip?.open || (isDragging && activeHandle === 1)) && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              {formatTooltip(currentValue[1])}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single value mode
  const singleValue = Array.isArray(currentValue) ? currentValue[0] : currentValue;

  return (
    <div
      ref={sliderRef}
      className={sliderClasses}
      style={style}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Track */}
      <div className={trackClasses} />

      {/* Range highlight (from min to current value) */}
      {included && (
        <div
          className={rangeClasses}
          style={
            vertical
              ? { bottom: reverse ? `${100 - getPercentage(singleValue)}%` : '0%', height: `${getPercentage(singleValue)}%` }
              : { left: reverse ? `${100 - getPercentage(singleValue)}%` : '0%', width: `${getPercentage(singleValue)}%` }
          }
        />
      )}

      {/* Dots */}
      {renderDots()}

      {/* Marks */}
      {renderMarks()}

      {/* Input */}
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
        onChange={(e) => {
          setIsDragging(true);
          handleSingleChange(e);
        }}
        className="absolute opacity-0 w-full h-full cursor-pointer"
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      />

      {/* Visual handle */}
      <div
        className={thumbClasses}
        style={{
          ...(vertical
            ? { bottom: `${getPercentage(singleValue)}%`, left: '50%', transform: 'translate(-50%, 50%)' }
            : { left: `${getPercentage(singleValue)}%`, top: '50%', transform: 'translate(-50%, -50%)' }),
        }}
      >
        {(tooltip?.open || isDragging) && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            {formatTooltip(singleValue)}
          </div>
        )}
      </div>
    </div>
  );
}

ApolloSlider.displayName = 'ApolloSlider';

export default ApolloSlider;
