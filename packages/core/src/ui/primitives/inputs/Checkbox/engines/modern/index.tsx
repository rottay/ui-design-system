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
 * Group participation: inside `<Checkbox.Group>` children mode the control
 * derives checked/name/disabled from `useCheckboxGroup()` whenever it carries
 * a `value` and no explicit `checked` of its own; explicit props always win.
 * `aria-label` forwards to the native input (standalone indicators need it).
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
import { useCheckboxGroup } from '../../runtime/group-context';

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

/** Crisp checkmark -- 2px stroke, round caps, centered in a 12x12 viewBox.
 *  The constant viewBox keeps the stroke proportional at every rendered
 *  size; geometry and motion live in the skin (`data-part='checkmark'`). */
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
    size: sizeProp,
    color: colorProp,
    radius = CHECKBOX_DEFAULTS.radius,
    labelPlacement = CHECKBOX_DEFAULTS.labelPlacement,
    label,
    description,
    checked: controlledChecked,
    defaultChecked = CHECKBOX_DEFAULTS.defaultChecked,
    indeterminate = CHECKBOX_DEFAULTS.indeterminate,
    disabled: disabledProp = CHECKBOX_DEFAULTS.disabled,
    required = CHECKBOX_DEFAULTS.required,
    error = CHECKBOX_DEFAULTS.error,
    onChange,
    children,
    name: nameProp,
    value,
    id: providedId,
    autoFocus,
    className = '',
    style,
  } = props;
  const ariaLabel = props['aria-label'];

  // Group participation (children-mode `<Checkbox.Group>`): when the control
  // carries a `value` and no explicit checked state of its own, the group
  // context owns checked/name/disabled and receives the change notification.
  // Explicit props always win over context, so an option can still opt out.
  const group = useCheckboxGroup();
  const groupControlled =
    group != null && value !== undefined && controlledChecked === undefined;

  const generatedId = useId();
  const inputId = providedId || `checkbox-modern-${generatedId.replace(/:/g, '')}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = groupControlled
    ? group.value.includes(value)
    : isControlled
      ? controlledChecked
      : internalChecked;

  const size = sizeProp ?? group?.size ?? CHECKBOX_DEFAULTS.size;
  const color = colorProp ?? group?.color ?? CHECKBOX_DEFAULTS.color;
  // Group disabled cascades to every child; size/color inherit unless the
  // control sets its own. Checked/name flow only when group-controlled.
  const disabled = disabledProp || group?.disabled === true;
  const name = nameProp ?? (groupControlled ? group?.name : undefined);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (groupControlled && group) {
      group.onChange(value, newChecked);
    } else if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked, e);
  }, [groupControlled, group, value, isControlled, onChange]);

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
        {/* Visually hidden native input: accessibility + form participation.
            The clip idiom lives in the skin with every other visual decision. */}
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
          aria-label={ariaLabel}
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
