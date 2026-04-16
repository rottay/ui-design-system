/**
 * @fileoverview Checkbox Modern Engine - Rottay Design System
 * @description Premium checkbox implementation with precise, calm styling.
 * Inspired by Linear/Vercel design language -- crisp geometry, smooth motion.
 *
 * @remarks
 * Uses a hidden native input for accessibility and a custom visual indicator
 * built with inline styles referencing DS CSS custom properties. No DaisyUI
 * dependency -- pure CSS tokens for full theme control.
 *
 * **Visual Spec:**
 * - 18x18 indicator, 2px border, `--ds-radius-sm` corners
 * - Checked: primary fill + white SVG checkmark (2px stroke), smooth scale transition
 * - Indeterminate: primary fill + white dash SVG
 * - Hover: border brightens to `--ds-color-border` / `--ds-color-primary`
 * - Focus: 2px outline `--ds-color-primary` with offset, `:focus-visible` only
 * - Disabled: opacity 0.5, cursor not-allowed
 * - Transitions on bg, border-color, transform (150ms ease-out)
 * - Touch target min 44x44 via padding on the label row
 *
 * @see {@link Checkbox} for the main component
 * @module ModernCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import type { CheckboxProps } from '../Checkbox.types';
import { CHECKBOX_DEFAULTS, SIZE_MAP_NUMERIC } from '../Checkbox.types';

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

/** Crisp checkmark -- 2px stroke, round caps, centered in a 12x12 viewBox. */
const CheckIcon = ({ size }: { size: number }) => {
  const svgSize = Math.max(10, Math.round(size * 0.6));
  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transform: 'scale(1)',
        transition: 'transform 150ms ease-out',
      }}
    >
      <path
        d="M2.5 6.5L5 9L9.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Dash for indeterminate state -- centered horizontal bar. */
const IndeterminateIcon = ({ size }: { size: number }) => {
  const svgSize = Math.max(10, Math.round(size * 0.6));
  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transform: 'scale(1)',
        transition: 'transform 150ms ease-out',
      }}
    >
      <path
        d="M3 6H9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Size tokens                                                        */
/* ------------------------------------------------------------------ */

/** DS token references for checkbox box dimensions (CSS custom properties with px fallbacks). */
const CHECKBOX_SIZE_TOKEN_MAP: Record<string, string> = {
  xs: 'var(--ds-checkbox-size-xs, 14px)',
  sm: 'var(--ds-checkbox-size-sm, 16px)',
  md: 'var(--ds-checkbox-size-md, 18px)',
  lg: 'var(--ds-checkbox-size-lg, 20px)',
  xl: 'var(--ds-checkbox-size-xl, 24px)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ModernCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    label,
    checked: controlledChecked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    onChange,
    children,
    name,
    value,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = `checkbox-modern-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked, e);
  }, [isControlled, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Only show focus ring for keyboard navigation (focus-visible behavior)
    if (e.target.matches(':focus-visible')) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  /* -- Sizes -------------------------------------------------------- */
  // Numeric fallback for SVG icon sizing (cannot use CSS vars in SVG attributes)
  const boxSizeNumeric = SIZE_MAP_NUMERIC[size] ?? 18;
  // DS token reference for CSS box dimensions
  const boxSizeToken = CHECKBOX_SIZE_TOKEN_MAP[size] || CHECKBOX_SIZE_TOKEN_MAP.md;

  /* -- Active visual state ------------------------------------------ */
  const active = isChecked || indeterminate;

  const displayLabel = label || children;
  const isStandaloneIndicator = !displayLabel;

  /* -- Styles ------------------------------------------------------- */
  const transitionTiming = '150ms ease-out';

  const boxStyle: React.CSSProperties = {
    position: 'relative',
    width: boxSizeToken,
    height: boxSizeToken,
    minWidth: boxSizeToken,
    borderRadius: isStandaloneIndicator ? '999px' : 'var(--ds-radius-sm)',
    border: `2px solid ${
      active
        ? 'var(--ds-color-primary)'
        : isStandaloneIndicator
          ? 'color-mix(in srgb, var(--ds-color-border) 88%, var(--ds-surface-panel) 12%)'
          : 'var(--ds-color-border-secondary)'
    }`,
    backgroundColor: active
      ? 'var(--ds-color-primary)'
      : isStandaloneIndicator
        ? 'color-mix(in srgb, var(--ds-surface-panel) 76%, var(--ds-color-text-primary) 24%)'
        : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color ${transitionTiming}, border-color ${transitionTiming}, transform ${transitionTiming}, box-shadow ${transitionTiming}`,
    flexShrink: 0,
    transform: active ? 'scale(1)' : 'scale(1)',
    ...(isHovered && !disabled && !active && {
      borderColor: isStandaloneIndicator ? 'var(--ds-color-text-secondary)' : 'var(--ds-color-border)',
      backgroundColor: isStandaloneIndicator
        ? 'color-mix(in srgb, var(--ds-surface-panel) 68%, var(--ds-color-text-primary) 32%)'
        : undefined,
    }),
    ...(isHovered && !disabled && active && {
      borderColor: 'var(--ds-color-primary-hover)',
      backgroundColor: 'var(--ds-color-primary-hover)',
    }),
    ...(isFocusVisible && !disabled && {
      outline: '2px solid var(--ds-color-primary)',
      outlineOffset: '2px',
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
  };

  const labelRowStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: displayLabel ? 8 : 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: displayLabel ? '4px 0' : 0,
    minHeight: displayLabel ? 44 : boxSizeNumeric,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    lineHeight: 1,
  };

  const labelTextStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    color: disabled
      ? 'var(--ds-color-text-disabled)'
      : 'var(--ds-color-text-primary)',
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
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-checked={indeterminate ? 'mixed' : isChecked}
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
        <span style={boxStyle}>
          {active && (
            indeterminate
              ? <IndeterminateIcon size={boxSizeNumeric} />
              : <CheckIcon size={boxSizeNumeric} />
          )}
        </span>

        {displayLabel && (
          <span style={labelTextStyle}>{displayLabel}</span>
        )}
      </label>
    </div>
  );
}

ModernCheckbox.displayName = 'ModernCheckbox';
