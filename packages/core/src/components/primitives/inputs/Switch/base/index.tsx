/**
 * Switch - Base Component
 * Uses CSS variables from design tokens for consistent styling
 */

'use client';

import React, { forwardRef, useState, useMemo } from 'react';
import type { SwitchProps } from '../types';
import { SWITCH_DEFAULTS } from '../types';

/**
 * Loading spinner for switch
 */
const LoadingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-switch-spin 1s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="10"
    />
  </svg>
);

/**
 * Size configurations
 */
const SIZE_CONFIG = {
  small: { width: 28, height: 16, handleSize: 12, handleOffset: 2 },
  default: { width: 44, height: 22, handleSize: 18, handleOffset: 2 },
  large: { width: 56, height: 28, handleSize: 24, handleOffset: 2 },
};

/**
 * Base Switch component using CSS variables.
 * This is extended by engine-specific implementations.
 */
export const BaseSwitch = forwardRef<HTMLButtonElement, SwitchProps>(
  (props, ref) => {
    const {
      checked: controlledChecked,
      defaultChecked = SWITCH_DEFAULTS.defaultChecked,
      disabled = SWITCH_DEFAULTS.disabled,
      loading = SWITCH_DEFAULTS.loading,
      size = SWITCH_DEFAULTS.size,
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className = '',
      style = {},
      autoFocus,
      tabIndex,
      id,
      name,
    } = props;

    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;

    // Get size config
    const sizeKey = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
    const config = SIZE_CONFIG[sizeKey];

    // CSS variables
    const switchVars = useMemo<React.CSSProperties>(() => ({
      '--switch-width': `${config.width}px`,
      '--switch-height': `${config.height}px`,
      '--switch-handle-size': `${config.handleSize}px`,
      '--switch-handle-offset': `${config.handleOffset}px`,
      '--switch-bg': isChecked ? 'var(--color-primary, #1677ff)' : 'var(--color-bg-tertiary, rgba(0, 0, 0, 0.25))',
      '--switch-bg-disabled': 'var(--color-bg-disabled, rgba(0, 0, 0, 0.12))',
      '--switch-handle-bg': 'var(--color-bg-elevated, #fff)',
      '--switch-handle-shadow': '0 2px 4px rgba(0, 0, 0, 0.2)',
    } as React.CSSProperties), [config, isChecked]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      const newChecked = !isChecked;
      if (controlledChecked === undefined) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
      onClick?.(newChecked, e);
    };

    const handleTranslateX = isChecked
      ? config.width - config.handleSize - config.handleOffset
      : config.handleOffset;

    const switchStyle: React.CSSProperties = {
      ...switchVars,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: 'var(--switch-width)',
      height: 'var(--switch-height)',
      backgroundColor: disabled ? 'var(--switch-bg-disabled)' : 'var(--switch-bg)',
      borderRadius: 'calc(var(--switch-height) / 2)',
      border: 'none',
      padding: 0,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background-color 0.2s',
      outline: 'none',
      ...style,
    };

    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: 0,
      transform: `translate(${handleTranslateX}px, -50%)`,
      width: 'var(--switch-handle-size)',
      height: 'var(--switch-handle-size)',
      backgroundColor: 'var(--switch-handle-bg)',
      borderRadius: '50%',
      boxShadow: 'var(--switch-handle-shadow)',
      transition: 'transform 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const innerStyle: React.CSSProperties = {
      display: 'block',
      color: '#fff',
      fontSize: sizeKey === 'small' ? 9 : 12,
      marginLeft: isChecked ? 6 : config.handleSize + 6,
      marginRight: isChecked ? config.handleSize + 6 : 6,
      transition: 'margin 0.2s',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        name={name}
        aria-checked={isChecked}
        aria-disabled={disabled || loading}
        tabIndex={tabIndex}
        autoFocus={autoFocus}
        className={`rottay-switch ${isChecked ? 'rottay-switch--checked' : ''} ${disabled ? 'rottay-switch--disabled' : ''} ${loading ? 'rottay-switch--loading' : ''} ${className}`}
        style={switchStyle}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        <span className="rottay-switch__inner" style={innerStyle}>
          {isChecked ? checkedChildren : unCheckedChildren}
        </span>
        <span className="rottay-switch__handle" style={handleStyle}>
          {loading && <LoadingSpinner size={config.handleSize - 6} />}
        </span>
      </button>
    );
  }
);

BaseSwitch.displayName = 'BaseSwitch';
