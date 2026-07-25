/**
 * @fileoverview Radio Modern Engine - Rottay Design System
 * @description Premium radio button with precise, calm styling.
 * Inspired by Linear/Vercel design language -- crisp circle, smooth dot scale-in.
 *
 * @remarks
 * Uses a visually hidden native input for accessibility and form participation
 * plus a custom visual indicator. Every visual decision lives in the modern
 * skin (`foundation/tokens/css/runtime/engines/modern/skin/radio.css`), keyed
 * on the `data-*` contract this component stamps: `data-size`, `data-color`,
 * `data-checked`, `data-error`, `data-disabled`, and `data-label-placement`.
 * Geometry consumes the canonical `--ds-radio-{size}-*` channels multiplied
 * by the three-plane density channel `--ds-density-effective-scale`.
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
    labelPlacement = RADIO_DEFAULTS.labelPlacement,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = RADIO_DEFAULTS.defaultChecked,
    disabled = RADIO_DEFAULTS.disabled,
    required = RADIO_DEFAULTS.required,
    error = RADIO_DEFAULTS.error,
    onChange,
    children,
    name,
    description,
    id: providedId,
    autoFocus,
    className = '',
    style,
  } = props;

  const generatedId = useId();
  const inputId = providedId || `radio-modern-${generatedId.replace(/:/g, '')}`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [isControlled, onChange]);

  const displayLabel = label || children;

  return (
    <div className={className} style={style}>
      <label
        className="ds-radio ds-radio--modern"
        data-part="root"
        data-size={size}
        data-color={color}
        data-checked={isChecked ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-label-placement={labelPlacement}
        htmlFor={inputId}
      >
        {/* Visually hidden native input: accessibility + form participation */}
        <input
          id={inputId}
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          aria-checked={isChecked}
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
        <span data-part="circle" aria-hidden="true">
          <span data-part="dot" />
        </span>

        {/* Label + optional description */}
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

ModernRadio.displayName = 'ModernRadio';
