'use client';

/**
 * @fileoverview Switch Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS implementation of the Switch component using CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @module ApolloSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { SwitchProps } from '../../types';

// Size configuration using CSS variables
const SIZE_CONFIG: Record<string, { width: string; height: string; thumbSize: string; translate: string }> = {
  small: {
    width: 'var(--ds-switch-sm-width)',
    height: 'var(--ds-switch-sm-height)',
    thumbSize: 'var(--ds-switch-sm-thumb-size)',
    translate: 'calc(var(--ds-switch-sm-width) - var(--ds-switch-sm-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
  default: {
    width: 'var(--ds-switch-md-width)',
    height: 'var(--ds-switch-md-height)',
    thumbSize: 'var(--ds-switch-md-thumb-size)',
    translate: 'calc(var(--ds-switch-md-width) - var(--ds-switch-md-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
  large: {
    width: 'var(--ds-switch-lg-width)',
    height: 'var(--ds-switch-lg-height)',
    thumbSize: 'var(--ds-switch-lg-thumb-size)',
    translate: 'calc(var(--ds-switch-lg-width) - var(--ds-switch-lg-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (props, ref) => {
    const {
      checked,
      defaultChecked = false,
      disabled = false,
      loading = false,
      size = 'default',
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className = '',
      style,
      autoFocus,
      tabIndex,
      id,
      name,
    } = props;

    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const [isFocused, setIsFocused] = useState(false);
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || loading) return;
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    };

    const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      if (disabled || loading) return;
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    };

    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

    // Build class names
    const containerClasses = [
      'rottay-switch',
      'rottay-switch--apollo',
      `rottay-switch--${size}`,
      isChecked && 'rottay-switch--checked',
      disabled && 'rottay-switch--disabled',
      loading && 'rottay-switch--loading',
      className,
    ].filter(Boolean).join(' ');

    const wrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--ds-switch-label-gap)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const switchStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      width: sizeConfig.width,
      height: sizeConfig.height,
    };

    const inputStyle: React.CSSProperties = {
      opacity: 0,
      width: 0,
      height: 0,
      position: 'absolute',
    };

    const sliderStyle: React.CSSProperties = {
      position: 'absolute',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isChecked
        ? 'var(--ds-switch-checked-bg)'
        : 'var(--ds-switch-bg)',
      transition: 'var(--ds-switch-transition)',
      borderRadius: 'var(--ds-switch-radius)',
      opacity: disabled || loading ? 0.5 : 1,
      outline: isFocused ? 'var(--ds-switch-focus-ring)' : 'none',
      outlineOffset: '2px',
    };

    const knobStyle: React.CSSProperties = {
      position: 'absolute',
      height: sizeConfig.thumbSize,
      width: sizeConfig.thumbSize,
      left: 'var(--ds-switch-thumb-offset)',
      bottom: 'var(--ds-switch-thumb-offset)',
      backgroundColor: 'var(--ds-switch-thumb-bg)',
      transition: 'var(--ds-switch-transition)',
      borderRadius: '50%',
      boxShadow: 'var(--ds-switch-thumb-shadow)',
      transform: isChecked ? `translateX(${sizeConfig.translate})` : 'translateX(0)',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-switch-label-color)',
      userSelect: 'none',
    };

    return (
      <label
        className={containerClasses}
        style={wrapperStyle}
        onClick={handleClick}
      >
        {!isChecked && unCheckedChildren && (
          <span style={labelStyle}>{unCheckedChildren}</span>
        )}
        <span style={switchStyle}>
          <input
            ref={ref}
            type="checkbox"
            style={inputStyle}
            checked={isChecked}
            disabled={disabled || loading}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            id={id}
            name={name}
            aria-checked={isChecked}
            role="switch"
          />
          <span style={sliderStyle}>
            <span style={knobStyle} />
          </span>
        </span>
        {isChecked && checkedChildren && (
          <span style={labelStyle}>{checkedChildren}</span>
        )}
        {loading && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            style={{ marginLeft: '4px', animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        )}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </label>
    );
  }
);

Switch.displayName = 'Switch.Apollo';

export default Switch;
