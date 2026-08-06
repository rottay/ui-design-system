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
 * Group participation: inside `<Radio.Group>` children mode the control
 * derives checked/name/disabled from `useRadioGroup()` whenever it carries a
 * `value` and no explicit `checked` of its own; explicit props always win.
 * `aria-label` forwards to the native input (standalone indicators need it).
 *
 * @see {@link Radio} for the main component
 * @module ModernRadio
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useId, useCallback, useEffect, useRef } from 'react';
import type { RadioProps } from '../../contracts';
import { RADIO_DEFAULTS } from '../../contracts';
import { useRadioGroup } from '../../runtime/group-context';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ModernRadio(props: RadioProps): React.ReactElement {
  const {
    size: sizeProp,
    color: colorProp,
    labelPlacement = RADIO_DEFAULTS.labelPlacement,
    label,
    value,
    checked: controlledChecked,
    defaultChecked = RADIO_DEFAULTS.defaultChecked,
    disabled: disabledProp = RADIO_DEFAULTS.disabled,
    required = RADIO_DEFAULTS.required,
    error = RADIO_DEFAULTS.error,
    onChange,
    children,
    name: nameProp,
    description,
    id: providedId,
    autoFocus,
    className = '',
    style,
  } = props;
  const ariaLabel = props['aria-label'];

  // Group participation (children-mode `<Radio.Group>`): when the control
  // carries a `value` and no explicit checked state of its own, the group
  // context owns checked/name/disabled and receives the selection. Sharing
  // the group name is what gives the set its native APG arrow-key roving
  // keyboard behavior. Explicit props always win over context.
  const group = useRadioGroup();
  const groupControlled =
    group != null && value !== undefined && controlledChecked === undefined;

  const generatedId = useId();
  const inputId = providedId || `radio-modern-${generatedId.replace(/:/g, '')}`;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = groupControlled
    ? group.value === value
    : isControlled
      ? controlledChecked
      : internalChecked;

  const size = sizeProp ?? group?.size ?? RADIO_DEFAULTS.size;
  const color = colorProp ?? group?.color ?? RADIO_DEFAULTS.color;
  // Group disabled cascades to every child; size/color inherit unless the
  // control sets its own. Checked/name flow only when group-controlled.
  const disabled = disabledProp || group?.disabled === true;
  const name = nameProp ?? (groupControlled ? group?.name : undefined);

  // Self-managed radios let the native input own checkedness (no `checked`,
  // no aria-checked): a parallel React value drifts from the DOM the browser
  // silently updates. internalChecked then only drives the skin's data-checked.
  const selfManaged = !groupControlled && !isControlled;
  useEffect(() => {
    if (!selfManaged || !name) return;
    const syncFromNativeGroup = (event: Event) => {
      const self = inputRef.current;
      const target = event.target;
      if (!self || !(target instanceof HTMLInputElement) || target === self) return;
      if (target.type !== 'radio' || target.name !== name) return;
      if (target.form !== self.form) return;
      if (target.checked) setInternalChecked(false);
    };
    // click capture, not change: pre-click activation has already set the
    // sibling's checkedness, while React restores it before `change` arrives.
    document.addEventListener('click', syncFromNativeGroup, true);
    return () => document.removeEventListener('click', syncFromNativeGroup, true);
  }, [selfManaged, name]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (groupControlled && group) {
      if (e.target.checked) {
        group.onChange(value);
      }
    } else if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  }, [groupControlled, group, value, isControlled, onChange]);

  const displayLabel = label || children;
  // The description sits inside the <label>, so an explicit name source is
  // what keeps it out of the accessible name.
  const hasDescription = Boolean(description);
  const labelledBy =
    hasDescription && displayLabel && !ariaLabel ? labelId : undefined;

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
        {/* Visually hidden native input: accessibility + form participation.
            The clip geometry lives in the skin (single paint/layout owner). */}
        <input
          ref={inputRef}
          id={inputId}
          type="radio"
          name={name}
          value={value}
          {...(selfManaged
            ? { defaultChecked }
            : { checked: isChecked })}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          aria-invalid={error || undefined}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={hasDescription ? descriptionId : undefined}
        />

        {/* Custom visual indicator */}
        <span data-part="circle" aria-hidden="true">
          <span data-part="dot" />
        </span>

        {/* Label + optional description */}
        {(displayLabel || description) && (
          <span data-part="text">
            {displayLabel && (
              <span id={labelId} data-part="label">{displayLabel}</span>
            )}
            {description && (
              <span id={descriptionId} data-part="description">{description}</span>
            )}
          </span>
        )}
      </label>
    </div>
  );
}

ModernRadio.displayName = 'ModernRadio';
