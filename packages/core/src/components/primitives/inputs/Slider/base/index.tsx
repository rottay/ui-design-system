/**
 * Slider - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import type { SliderProps } from '../types';
import { SLIDER_DEFAULTS } from '../types';

/**
 * Base Slider component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseSlider = forwardRef<HTMLDivElement, SliderProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue,
      onChange,
      onChangeComplete,
      min = SLIDER_DEFAULTS.min!,
      max = SLIDER_DEFAULTS.max!,
      step = SLIDER_DEFAULTS.step!,
      range = SLIDER_DEFAULTS.range,
      marks,
      included = SLIDER_DEFAULTS.included,
      disabled = SLIDER_DEFAULTS.disabled,
      vertical = SLIDER_DEFAULTS.vertical,
      reverse = SLIDER_DEFAULTS.reverse,
      tooltip,
      keyboard = SLIDER_DEFAULTS.keyboard,
      dots = SLIDER_DEFAULTS.dots,
      trackStyle,
      railStyle,
      handleStyle,
      className = '',
      style = {},
    } = props;

    // Initialize value
    const getInitialValue = () => {
      if (defaultValue !== undefined) return defaultValue;
      if (range) return [min, max];
      return min;
    };

    const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue());
    const [isDragging, setIsDragging] = useState(false);
    const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

    // Get single value or range values
    const getValue = useCallback((index?: 0 | 1): number => {
      if (Array.isArray(currentValue)) {
        return index !== undefined ? currentValue[index] : currentValue[0];
      }
      return currentValue;
    }, [currentValue]);

    // Calculate percentage from value
    const getPercent = useCallback((val: number): number => {
      const percent = ((val - min) / (max - min)) * 100;
      return reverse ? 100 - percent : percent;
    }, [min, max, reverse]);

    // Calculate value from percentage
    const getValueFromPercent = useCallback((percent: number): number => {
      const actualPercent = reverse ? 100 - percent : percent;
      let value = (actualPercent / 100) * (max - min) + min;

      // Snap to step
      if (step !== null) {
        value = Math.round(value / step) * step;
      }

      // Clamp to bounds
      return Math.min(max, Math.max(min, value));
    }, [min, max, step, reverse]);

    // Handle slider click/drag
    const handleSliderInteraction = useCallback((clientX: number, clientY: number) => {
      if (disabled || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      let percent: number;

      if (vertical) {
        percent = ((rect.bottom - clientY) / rect.height) * 100;
      } else {
        percent = ((clientX - rect.left) / rect.width) * 100;
      }

      percent = Math.min(100, Math.max(0, percent));
      const newValue = getValueFromPercent(percent);

      if (range && Array.isArray(currentValue)) {
        const [start, end] = currentValue;
        const distToStart = Math.abs(newValue - start);
        const distToEnd = Math.abs(newValue - end);

        if (distToStart < distToEnd) {
          const updated: [number, number] = [newValue, end];
          if (controlledValue === undefined) setInternalValue(updated);
          onChange?.(updated);
        } else {
          const updated: [number, number] = [start, newValue];
          if (controlledValue === undefined) setInternalValue(updated);
          onChange?.(updated);
        }
      } else {
        if (controlledValue === undefined) setInternalValue(newValue);
        onChange?.(newValue);
      }
    }, [disabled, vertical, getValueFromPercent, range, currentValue, controlledValue, onChange]);

    // Mouse/Touch handlers
    const handleMouseDown = (e: React.MouseEvent, handleIndex?: 0 | 1) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      setActiveHandle(handleIndex ?? null);
      setShowTooltip(true);
      handleSliderInteraction(e.clientX, e.clientY);
    };

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        handleSliderInteraction(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        setActiveHandle(null);
        setShowTooltip(false);
        onChangeComplete?.(currentValue);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, handleSliderInteraction, onChangeComplete, currentValue]);

    // CSS variables
    const sliderVars = useMemo<React.CSSProperties>(() => ({
      '--slider-rail-bg': 'var(--color-bg-tertiary, #f0f0f0)',
      '--slider-track-bg': disabled ? 'var(--color-bg-disabled)' : 'var(--color-primary, #1677ff)',
      '--slider-handle-bg': 'var(--color-bg-elevated, #fff)',
      '--slider-handle-border': disabled ? 'var(--color-bg-disabled)' : 'var(--color-primary, #1677ff)',
      '--slider-handle-size': '14px',
      '--slider-rail-size': '4px',
      '--slider-dot-size': '8px',
    } as React.CSSProperties), [disabled]);

    // Track position and size
    const trackPosition = useMemo(() => {
      if (range && Array.isArray(currentValue)) {
        const [start, end] = currentValue;
        const startPercent = getPercent(start);
        const endPercent = getPercent(end);
        return {
          start: Math.min(startPercent, endPercent),
          size: Math.abs(endPercent - startPercent),
        };
      }
      return {
        start: reverse ? getPercent(getValue()) : 0,
        size: reverse ? 100 - getPercent(getValue()) : getPercent(getValue()),
      };
    }, [range, currentValue, getPercent, getValue, reverse]);

    const sliderStyle: React.CSSProperties = {
      ...sliderVars,
      position: 'relative',
      width: vertical ? 'var(--slider-rail-size)' : '100%',
      height: vertical ? '100%' : 'var(--slider-rail-size)',
      minHeight: vertical ? 100 : undefined,
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: vertical ? '0 5px' : '5px 0',
      ...style,
    };

    const railStyles: React.CSSProperties = {
      position: 'absolute',
      width: vertical ? 'var(--slider-rail-size)' : '100%',
      height: vertical ? '100%' : 'var(--slider-rail-size)',
      backgroundColor: 'var(--slider-rail-bg)',
      borderRadius: 'var(--slider-rail-size)',
      ...railStyle,
    };

    const trackStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: 'var(--slider-track-bg)',
      borderRadius: 'var(--slider-rail-size)',
      ...(vertical ? {
        width: 'var(--slider-rail-size)',
        bottom: `${trackPosition.start}%`,
        height: `${trackPosition.size}%`,
      } : {
        height: 'var(--slider-rail-size)',
        left: `${trackPosition.start}%`,
        width: `${trackPosition.size}%`,
      }),
      ...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle),
    };

    const getHandleStyle = (percent: number, index: number): React.CSSProperties => ({
      position: 'absolute',
      width: 'var(--slider-handle-size)',
      height: 'var(--slider-handle-size)',
      backgroundColor: 'var(--slider-handle-bg)',
      border: '2px solid var(--slider-handle-border)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      cursor: disabled ? 'not-allowed' : 'grab',
      transition: isDragging ? 'none' : 'left 0.1s, bottom 0.1s',
      zIndex: activeHandle === index ? 2 : 1,
      ...(vertical ? {
        left: '50%',
        bottom: `${percent}%`,
      } : {
        top: '50%',
        left: `${percent}%`,
      }),
      ...(Array.isArray(handleStyle) ? handleStyle[index] : handleStyle),
    });

    // Format tooltip value
    const formatTooltip = (val: number): React.ReactNode => {
      if (tooltip?.formatter === null) return null;
      if (tooltip?.formatter) return tooltip.formatter(val);
      return val;
    };

    return (
      <div
        ref={ref}
        className={`rottay-slider ${vertical ? 'rottay-slider--vertical' : ''} ${disabled ? 'rottay-slider--disabled' : ''} ${className}`}
        style={sliderStyle}
      >
        <div
          ref={sliderRef}
          className="rottay-slider__rail"
          style={railStyles}
          onMouseDown={(e) => handleMouseDown(e)}
        >
          {included && <div className="rottay-slider__track" style={trackStyles} />}

          {/* Dots */}
          {dots && step !== null && (
            <>
              {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
                const value = min + i * step;
                const percent = getPercent(value);
                return (
                  <div
                    key={value}
                    className="rottay-slider__dot"
                    style={{
                      position: 'absolute',
                      width: 'var(--slider-dot-size)',
                      height: 'var(--slider-dot-size)',
                      backgroundColor: 'var(--slider-rail-bg)',
                      border: '2px solid var(--slider-handle-border)',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      ...(vertical ? { left: '50%', bottom: `${percent}%` } : { top: '50%', left: `${percent}%` }),
                    }}
                  />
                );
              })}
            </>
          )}

          {/* Marks */}
          {marks && Object.entries(marks).map(([key, mark]) => {
            const value = parseFloat(key);
            const percent = getPercent(value);
            const label = typeof mark === 'object' ? mark.label : mark;
            const markStyle = typeof mark === 'object' ? mark.style : {};

            return (
              <div
                key={key}
                className="rottay-slider__mark"
                style={{
                  position: 'absolute',
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  ...(vertical ? { left: 20, bottom: `${percent}%`, transform: 'translateY(50%)' } : { top: 20, left: `${percent}%`, transform: 'translateX(-50%)' }),
                  ...markStyle,
                }}
              >
                {label}
              </div>
            );
          })}

          {/* Handles */}
          {range && Array.isArray(currentValue) ? (
            <>
              <div
                className="rottay-slider__handle"
                style={getHandleStyle(getPercent(currentValue[0]), 0)}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 0); }}
              />
              <div
                className="rottay-slider__handle"
                style={getHandleStyle(getPercent(currentValue[1]), 1)}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 1); }}
              />
            </>
          ) : (
            <div
              className="rottay-slider__handle"
              style={getHandleStyle(getPercent(getValue()), 0)}
              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 0); }}
            >
              {showTooltip && tooltip?.open !== false && (
                <div
                  className="rottay-slider__tooltip"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-bg-spotlight, rgba(0,0,0,0.75))',
                    color: '#fff',
                    borderRadius: 4,
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatTooltip(getValue())}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

BaseSlider.displayName = 'BaseSlider';
