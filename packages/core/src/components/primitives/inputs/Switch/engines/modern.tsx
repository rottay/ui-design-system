/**
 * @fileoverview Switch Modern Engine - Rottay Design System
 * @description Premium toggle switch with precise, calm styling.
 * Inspired by Linear/Vercel design language -- smooth thumb slide, subtle shadows.
 *
 * @remarks
 * Uses a hidden native checkbox for accessibility and a custom visual track+thumb
 * built with inline styles referencing DS CSS custom properties. No DaisyUI
 * dependency -- pure CSS tokens for full theme control.
 *
 * **Visual Spec:**
 * - Track: 36x20, rounded-full, `--ds-color-border-secondary` bg when off
 * - On: track bg `--ds-color-primary`
 * - Thumb: 16px white circle with subtle shadow, slides right (200ms ease-out)
 * - Hover: slight track color change
 * - Focus: 2px outline `--ds-color-primary` with offset, `:focus-visible` only
 * - Disabled: opacity 0.5, cursor not-allowed
 * - Label: 8px gap, proper alignment
 * - Touch target min 44px via wrapper minHeight
 *
 * @see {@link Switch} for the main component
 * @module ModernSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { SwitchProps } from '../Switch.types';

/* ------------------------------------------------------------------ */
/*  Size presets                                                       */
/* ------------------------------------------------------------------ */

interface SwitchDimensions {
  trackW: number;
  trackH: number;
  thumbSize: number;
  thumbInset: number;
}

const dimensionMap: Record<string, SwitchDimensions> = {
  small:   { trackW: 28, trackH: 16, thumbSize: 12, thumbInset: 2 },
  default: { trackW: 36, trackH: 20, thumbSize: 16, thumbInset: 2 },
  large:   { trackW: 44, trackH: 24, thumbSize: 20, thumbInset: 2 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

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
    const isChecked = isControlled ? checked : internalChecked;

    const [isHovered, setIsHovered] = useState(false);
    const [isFocusVisible, setIsFocusVisible] = useState(false);

    const isDisabled = disabled || loading;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    }, [isControlled, onChange]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    }, [isChecked, onClick]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.matches(':focus-visible')) {
        setIsFocusVisible(true);
      }
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocusVisible(false);
    }, []);

    /* -- Dimensions ------------------------------------------------- */
    const sizeKey = size === 'large' ? 'large' : size === 'small' ? 'small' : 'default';
    const dim = dimensionMap[sizeKey];
    const thumbTravel = dim.trackW - dim.thumbSize - dim.thumbInset * 2;

    /* -- Styles ----------------------------------------------------- */
    const transitionTiming = '200ms ease-out';

    const wrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      minHeight: 44,
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      ...style,
    };

    const trackBg = (() => {
      if (isChecked) {
        if (isHovered && !isDisabled) return 'var(--ds-color-primary-hover)';
        return 'var(--ds-color-primary)';
      }
      if (isHovered && !isDisabled) return 'var(--ds-color-border)';
      return 'var(--ds-color-border-secondary)';
    })();

    const trackStyle: React.CSSProperties = {
      position: 'relative',
      width: dim.trackW,
      height: dim.trackH,
      borderRadius: 'var(--ds-radius-full)',
      backgroundColor: trackBg,
      transition: `background-color ${transitionTiming}`,
      flexShrink: 0,
      ...(isDisabled && { opacity: 0.5 }),
      ...(isFocusVisible && !isDisabled && {
        outline: '2px solid var(--ds-color-primary)',
        outlineOffset: '2px',
      }),
    };

    const thumbStyle: React.CSSProperties = {
      position: 'absolute',
      top: dim.thumbInset,
      left: dim.thumbInset,
      width: dim.thumbSize,
      height: dim.thumbSize,
      borderRadius: '50%',
      backgroundColor: 'var(--ds-surface-control, var(--ds-color-text-on-primary))',
      transform: isChecked ? `translateX(${thumbTravel}px)` : 'translateX(0)',
      transition: `transform ${transitionTiming}, box-shadow ${transitionTiming}`,
      boxShadow: 'var(--ds-elevation-1)',
    };

    const labelTextStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: '20px',
      color: isDisabled
        ? 'var(--ds-color-text-disabled)'
        : 'var(--ds-color-text-primary)',
    };

    return (
      <label
        className={className}
        style={wrapperStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Unchecked label (before track) */}
        {!isChecked && unCheckedChildren && (
          <span style={labelTextStyle}>{unCheckedChildren}</span>
        )}

        {/* Hidden native input for accessibility + form participation */}
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          id={id}
          name={name}
          role="switch"
          aria-checked={isChecked}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        />

        {/* Custom visual track + thumb */}
        <span style={trackStyle}>
          <span style={thumbStyle} />
        </span>

        {/* Checked label (after track) */}
        {isChecked && checkedChildren && (
          <span style={labelTextStyle}>{checkedChildren}</span>
        )}

        {/* Loading spinner */}
        {loading && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              animation: 'spin 0.8s linear infinite',
              marginLeft: 2,
            }}
          >
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="var(--ds-color-border-secondary)"
              strokeWidth="1.5"
            />
            <path
              d="M12.5 7A5.5 5.5 0 0 0 7 1.5"
              stroke="var(--ds-color-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Modern';

export default Switch;
