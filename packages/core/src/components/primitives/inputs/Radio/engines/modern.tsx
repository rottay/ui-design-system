/**
 * @fileoverview Radio Modern Engine - Rottay Design System
 * @description Premium radio button with precise, calm styling.
 * Inspired by Linear/Vercel design language -- crisp circle, smooth dot scale-in.
 *
 * @remarks
 * Uses a hidden native input for accessibility and a custom visual indicator
 * built with inline styles referencing DS CSS custom properties. No DaisyUI
 * dependency -- pure CSS tokens for full theme control.
 *
 * **Visual Spec:**
 * - 18x18 circle, 2px border, border-radius 50%
 * - Selected: outer circle border primary + inner 6px filled dot (primary), smooth scale transition
 * - Hover: border brightens to `--ds-color-border` / `--ds-color-primary`
 * - Focus: 2px outline `--ds-color-primary` with offset, `:focus-visible` only
 * - Disabled: opacity 0.5, cursor not-allowed
 * - Transitions on border-color and dot transform (150ms ease-out)
 * - Touch target min 44x44 via padding on the label row
 *
 * @see {@link Radio} for the main component
 * @module ModernRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback } from 'react';
import type { RadioProps } from '../Radio.types';
import { RADIO_DEFAULTS } from '../Radio.types';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ModernRadio(props: RadioProps): React.ReactElement {
  const {
    size = RADIO_DEFAULTS.size,
    color = RADIO_DEFAULTS.color,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = RADIO_DEFAULTS.disabled,
    onChange,
    children,
    name,
    description,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `radio-modern-${generatedId}`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [isControlled, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.matches(':focus-visible')) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  /* -- Sizes -------------------------------------------------------- */
  // TODO: migrate to CSS custom properties (--ds-radio-size-xs through --ds-radio-size-xl)
  // once inline style numeric values can be replaced with token references
  const sizeMap: Record<string, number> = {
    xs: 14, sm: 16, md: 18, lg: 20, xl: 24,
  };
  const circleSize = sizeMap[size] ?? 18;
  const dotSize = Math.max(4, Math.round(circleSize * 0.333)); // ~6px for 18px circle

  const displayLabel = label || children;

  /* -- Styles ------------------------------------------------------- */
  const transitionTiming = '150ms ease-out';

  const circleStyle: React.CSSProperties = {
    position: 'relative',
    width: circleSize,
    height: circleSize,
    minWidth: circleSize,
    borderRadius: '50%',
    border: `2px solid ${isChecked ? 'var(--ds-radio-checked-bg, var(--ds-color-primary))' : 'var(--ds-radio-border, var(--ds-color-border-secondary))'}`,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `border-color ${transitionTiming}, box-shadow ${transitionTiming}`,
    flexShrink: 0,
    ...(isHovered && !disabled && !isChecked && {
      borderColor: 'var(--ds-radio-border, var(--ds-color-border))',
    }),
    ...(isHovered && !disabled && isChecked && {
      borderColor: 'var(--ds-color-primary-hover)',
    }),
    ...(isFocusVisible && !disabled && {
      outline: '2px solid var(--ds-color-primary)',
      outlineOffset: '2px',
    }),
    ...(disabled && {
      opacity: 'var(--ds-radio-disabled-opacity, 0.5)' as unknown as number,
      cursor: 'not-allowed',
    }),
  };

  const dotStyle: React.CSSProperties = {
    width: dotSize,
    height: dotSize,
    borderRadius: '50%',
    backgroundColor: 'var(--ds-radio-indicator-color, var(--ds-color-text-on-primary, #fff))',
    transform: isChecked ? 'scale(1)' : 'scale(0)',
    transition: `transform ${transitionTiming}`,
  };

  const labelRowStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '4px 0',
    minHeight: 44,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const labelTextStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    color: disabled
      ? 'var(--ds-color-text-disabled)'
      : 'var(--ds-color-text-primary)',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 12,
    lineHeight: '16px',
    color: 'var(--ds-color-text-muted)',
    marginTop: 1,
  };

  return (
    <div className={className} style={style}>
      <label
        style={labelRowStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hidden native input for accessibility + form participation */}
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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

        {/* Custom visual indicator */}
        <span style={circleStyle}>
          <span style={dotStyle} />
        </span>

        {/* Label + optional description */}
        {(displayLabel || description) && (
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            {displayLabel && (
              <span style={labelTextStyle}>{displayLabel}</span>
            )}
            {description && (
              <span style={descriptionStyle}>{description}</span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

ModernRadio.displayName = 'ModernRadio';
