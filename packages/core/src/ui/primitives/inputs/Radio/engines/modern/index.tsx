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
 * - Transitions on border-color and dot transform (var(--ds-motion-fast) ease-out)
 * - Touch target min 44x44 via padding on the label row
 *
 * @see {@link Radio} for the main component
 * @module ModernRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback } from 'react';
import type { RadioProps } from '../../contracts';
import { RADIO_DEFAULTS } from '../../contracts';

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [isControlled, onChange]);

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
  const transitionTiming = 'var(--ds-motion-fast) ease-out';

  const circleStyle: React.CSSProperties = {
    position: 'relative',
    width: circleSize,
    height: circleSize,
    minWidth: circleSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `border-color ${transitionTiming}, box-shadow ${transitionTiming}`,
    flexShrink: 0,
    ...(disabled && {
      opacity: 'var(--ds-radio-disabled-opacity, 0.5)' as unknown as number,
      cursor: 'not-allowed',
    }),
  };

  const dotStyle: React.CSSProperties = {
    width: dotSize,
    height: dotSize,
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
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 12,
    lineHeight: '16px',
    marginTop: 1,
  };

  return (
    <div className={className} style={style}>
      <label
        className="ds-radio ds-radio--modern"
        data-part="root"
        data-checked={isChecked ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        style={labelRowStyle}
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
          }}
        />

        {/* Custom visual indicator */}
        <span data-part="circle" style={circleStyle}>
          <span data-part="dot" style={dotStyle} />
        </span>

        {/* Label + optional description */}
        {(displayLabel || description) && (
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            {displayLabel && (
              <span data-part="label" style={labelTextStyle}>{displayLabel}</span>
            )}
            {description && (
              <span data-part="description" style={descriptionStyle}>{description}</span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

ModernRadio.displayName = 'ModernRadio';
