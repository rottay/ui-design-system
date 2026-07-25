/**
 * @fileoverview Checkbox Modern Engine - Rottay Design System
 * @description Premium checkbox implementation with precise, calm styling.
 * Inspired by Linear/Vercel design language -- crisp geometry, smooth motion.
 *
 * @remarks
 * Uses a visually hidden native input for accessibility and form participation
 * plus a custom visual indicator. Every visual decision lives in the modern
 * skin (`foundation/tokens/css/runtime/engines/modern/skin/checkbox.css`),
 * keyed on the `data-*` contract this component stamps: `data-size`,
 * `data-color`, `data-radius`, `data-checked`, `data-indeterminate`,
 * `data-active`, `data-standalone`, `data-error`, `data-disabled`, and
 * `data-label-placement`. Geometry consumes the canonical
 * `--ds-checkbox-{size}-*` channels multiplied by the three-plane density
 * channel `--ds-density-effective-scale`.
 *
 * @see {@link Checkbox} for the main component
 * @module ModernCheckbox
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import type { CheckboxProps } from '../../contracts';
import { CHECKBOX_DEFAULTS, SIZE_MAP_NUMERIC } from '../../contracts';

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

/** Crisp checkmark -- 2px stroke, round caps, centered in a 12x12 viewBox. */
const CheckIcon = ({ size }: { size: number }) => {
  const svgSize = Math.max(10, Math.round(size * 0.6));
  return (
    <svg
      data-part="checkmark"
      width={svgSize}
      height={svgSize}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transition: 'transform var(--ds-motion-fast) ease-out',
      }}
    >
      <path
        d="M2.5 6.5L5 9L9.5 3.5"
        stroke="currentColor"
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
      data-part="checkmark"
      width={svgSize}
      height={svgSize}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transition: 'transform var(--ds-motion-fast) ease-out',
      }}
    >
      <path
        d="M3 6H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ModernCheckbox(props: CheckboxProps): React.ReactElement {
  const {
    size = CHECKBOX_DEFAULTS.size,
    color = CHECKBOX_DEFAULTS.color,
    radius = CHECKBOX_DEFAULTS.radius,
    labelPlacement = CHECKBOX_DEFAULTS.labelPlacement,
    label,
    description,
    checked: controlledChecked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled = CHECKBOX_DEFAULTS.disabled,
    required = CHECKBOX_DEFAULTS.required,
    error = CHECKBOX_DEFAULTS.error,
    onChange,
    children,
    name,
    value,
    id: providedId,
    autoFocus,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = providedId || `checkbox-modern-${generatedId.replace(/:/g, '')}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

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

  // Numeric fallback for SVG icon sizing (cannot use CSS vars in SVG attributes)
  const boxSizeNumeric = SIZE_MAP_NUMERIC[size] ?? SIZE_MAP_NUMERIC.md;

  const active = isChecked || indeterminate;
  const displayLabel = label || children;
  const isStandaloneIndicator = !displayLabel && !description;

  return (
    <div className={className} style={style}>
      <label
        className="ds-checkbox ds-checkbox--modern"
        data-part="root"
        data-size={size}
        data-color={color}
        data-radius={radius}
        data-checked={isChecked ? 'true' : 'false'}
        data-indeterminate={indeterminate ? 'true' : 'false'}
        data-active={active ? 'true' : 'false'}
        data-standalone={isStandaloneIndicator ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-label-placement={labelPlacement}
        htmlFor={inputId}
      >
        {/* Visually hidden native input: accessibility + form participation */}
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          aria-checked={indeterminate ? 'mixed' : isChecked}
          aria-invalid={error || undefined}
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
        <span data-part="box" aria-hidden="true">
          {active && (
            indeterminate
              ? <IndeterminateIcon size={boxSizeNumeric} />
              : <CheckIcon size={boxSizeNumeric} />
          )}
        </span>

        {(displayLabel || description) && (
          <span data-part="text">
            {displayLabel && (
              <span data-part="label">{displayLabel}</span>
            )}
            {description && (
              <span data-part="description">{description}</span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

ModernCheckbox.displayName = 'ModernCheckbox';
