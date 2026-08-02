/**
 * @fileoverview Modern engine for Toggle - Rottay Design System
 * @description Premium toggle painted entirely by the modern skin, with a
 * native `<input type="checkbox" role="switch">` for accessibility and form
 * participation.
 *
 * @remarks
 * Every visual decision lives in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/toggle.css`), keyed on
 * the `data-*` contract this component stamps: `data-size`, `data-color`,
 * `data-checked`, `data-error`, `data-disabled`, `data-loading`, and
 * `data-label-placement`. Geometry consumes the canonical
 * `--ds-toggle-{size}-*` channels multiplied by the three-plane density
 * channel `--ds-density-effective-scale`; the thumb travel is a pure CSS
 * `calc()` flipped under `:dir(rtl)`, so RTL needs no runtime branch.
 *
 * State never reads through track color alone (Phase B law): the thumb
 * travels AND a governed state glyph (`action.confirm` / `action.close` from
 * the icon facade, `decorative`, skin-sized via the
 * `--_ds-toggle-state-icon-size` proto) docks on the side opposite the
 * thumb. The busy state is the governed border-spinner idiom
 * (`ds-foundation-spin`, skin-painted) docked inside the thumb -- the raw
 * inline SVG is gone. The contract's switch semantics (`role="switch"`,
 * `aria-checked`) are pinned by tests and stay untouched.
 *
 * @example
 * ```tsx
 * <Toggle engine="modern" color="primary" size="lg" label="Enable feature" />
 * ```
 *
 * @module ModernToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useId } from 'react';
import type { ToggleProps } from '../../contracts';
import { TOGGLE_DEFAULTS } from '../../contracts';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { ActionConfirmIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-confirm';

/**
 * Modern (pure DS tokens) implementation of Toggle.
 *
 * Supports controlled and uncontrolled modes, label placement (start/end), a
 * description line beneath the label, helper and error text anatomy, state
 * labels, and a loading indicator. The error state repaints the track through
 * `data-error` and wires `aria-describedby`, never through inline paint.
 *
 * @param props - Standard ToggleProps shared across all engines.
 * @returns A field wrapper containing the labeled switch anatomy.
 */
export default function ModernToggle(props: ToggleProps): React.ReactElement {
  const {
    size = TOGGLE_DEFAULTS.size,
    color = TOGGLE_DEFAULTS.color,
    labelPlacement = TOGGLE_DEFAULTS.labelPlacement,
    label,
    checkedLabel,
    uncheckedLabel,
    description,
    helperText,
    checked: controlledChecked,
    defaultChecked = false,
    disabled = TOGGLE_DEFAULTS.disabled,
    required = TOGGLE_DEFAULTS.required,
    loading = TOGGLE_DEFAULTS.loading,
    error = TOGGLE_DEFAULTS.error,
    errorMessage,
    onChange,
    children,
    className = '',
    style,
    name,
    id: providedId,
    value,
    autoFocus,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = providedId || `toggle-modern-${generatedId.replace(/:/g, '')}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  // Dual-mode state: controlled when `checked` prop is provided, uncontrolled otherwise
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;
  const isDisabled = disabled || loading;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked, e);
  }, [isControlled, onChange]);

  const displayLabel = label || children;
  const stateLabel = isChecked ? checkedLabel : uncheckedLabel;
  const hasText = Boolean(displayLabel || description || stateLabel);
  const describedBy = [
    error && errorMessage ? errorId : undefined,
    !error && helperText ? helperId : undefined,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={`ds-toggle-field ${className}`.trim()}
      data-part="field"
      style={style}
    >
      <label
        className="ds-toggle ds-toggle--modern"
        data-part="root"
        data-size={size}
        data-color={color}
        data-checked={isChecked ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-disabled={isDisabled ? 'true' : 'false'}
        data-loading={loading ? 'true' : 'false'}
        data-label-placement={labelPlacement}
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          required={required}
          onChange={handleChange}
          autoFocus={autoFocus}
          aria-checked={isChecked}
          aria-invalid={error || undefined}
          aria-required={required || undefined}
          aria-busy={loading || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        <span data-part="track" aria-hidden="true">
          <span data-part="thumb">
            {/* Loading: the governed border-spinner idiom (ds-foundation-spin,
                skin-painted -- the raw inline SVG is gone). It docks INSIDE the
                thumb so the busy state stays physically attached to the moving
                part and the track geometry never shifts. */}
            {loading && <span data-part="loading-indicator" />}
          </span>
          {/* State icon (Phase B): checked/unchecked reads unmistakably through
              position + governed glyph, never track color alone. The skin
              docks it on the side opposite the thumb, scales it with the size
              channel and hides it at xs where no glyph stays legible. */}
          {!loading && (
            <span data-part="state-icon" data-on={isChecked ? 'true' : 'false'}>
              {isChecked ? (
                <ActionConfirmIcon decorative size={10} />
              ) : (
                <ActionCloseIcon decorative size={10} />
              )}
            </span>
          )}
        </span>
        {hasText && (
          <span data-part="text">
            {displayLabel && (
              <span data-part="label">{displayLabel}</span>
            )}
            {stateLabel && (
              <span data-part="state-label">{stateLabel}</span>
            )}
            {description && (
              <span data-part="description">{description}</span>
            )}
          </span>
        )}
      </label>

      {error && errorMessage && (
        <p id={errorId} data-part="error-message" role="alert">
          {errorMessage}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} data-part="helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
}

ModernToggle.displayName = 'ModernToggle';
