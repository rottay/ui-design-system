/**
 * @fileoverview Modern engine for Toggle - Rottay Design System
 * @description The one binary switch of the design system (D-16): a native
 * `<input type="checkbox" role="switch">` painted entirely by the modern skin.
 *
 * @remarks
 * Every visual decision lives in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/toggle/index.css`), keyed on
 * the anatomy this component stamps: `data-part`, the interaction `data-state`
 * decided by the behavior kernel, and `data-size`, `data-color`,
 * `data-checked`, `data-error`, `data-disabled`, `data-loading`,
 * `data-standalone` and `data-label-placement`.
 *
 * A busy toggle stays a tab stop: it is `aria-disabled` and `aria-busy`, and
 * an activation while busy is reverted and commits no value.
 *
 * @module ModernToggle
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useCallback, useId, useState } from 'react';

import { partAttributes, useInteractionState } from '../../../../../../foundation/behavior';
import type { ToggleProps } from '../../contracts';
import { TOGGLE_DEFAULTS } from '../../contracts';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { ActionConfirmIcon } from '@/graphics/icons/semantic/generated/roles/action-confirm';

const ModernToggle = forwardRef<HTMLInputElement, ToggleProps>((props, ref) => {
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
    tabIndex,
    engine: _engine,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;
  void _engine;

  const generatedId = useId();
  const inputId = providedId || `toggle-modern-${generatedId.replace(/:/g, '')}`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : internalChecked;
  const isInert = disabled || loading;

  const { state: interaction, handlers } = useInteractionState({ disabled: isInert });

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event.target.checked, event);
  }, [isControlled, loading, onChange]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    if (loading) event.preventDefault();
  }, [loading]);

  const pressKey = (event: React.KeyboardEvent<HTMLInputElement>, down: boolean) => {
    if (event.key !== ' ') return;
    if (down) handlers.onPointerDown(event as unknown as React.PointerEvent);
    else handlers.onPointerUp(event as unknown as React.PointerEvent);
  };

  const displayLabel = label || children;
  const stateLabel = isChecked ? checkedLabel : uncheckedLabel;
  const hasText = Boolean(displayLabel || description || stateLabel);
  const describedBy = Array.from(
    new Set(
      [
        description ? descriptionId : undefined,
        error && errorMessage ? errorId : undefined,
        !error && helperText ? helperId : undefined,
        ariaDescribedBy,
      ]
        .filter((token): token is string => Boolean(token))
        .flatMap((token) => token.split(/\s+/))
        .filter(Boolean),
    ),
  ).join(' ') || undefined;
  const callerNamed = ariaLabel !== undefined || ariaLabelledBy !== undefined;
  const labelledBy = ariaLabelledBy
    ?? (!callerNamed && displayLabel && description ? labelId : undefined);

  return (
    <div
      className={`ds-toggle-field ${className}`.trim()}
      data-part="field"
      style={style}
    >
      <label
        className="ds-toggle ds-toggle--modern"
        {...partAttributes('root', interaction)}
        data-size={size}
        data-color={color}
        data-checked={isChecked ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-disabled={isInert ? 'true' : 'false'}
        data-loading={loading ? 'true' : 'false'}
        data-standalone={displayLabel || description ? 'false' : 'true'}
        data-label-placement={labelPlacement}
        onPointerEnter={handlers.onPointerEnter}
        onPointerLeave={handlers.onPointerLeave}
        onPointerDown={handlers.onPointerDown}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerUp}
      >
        <input
          ref={ref}
          {...rest}
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          required={required}
          tabIndex={tabIndex}
          onChange={handleChange}
          onClick={handleClick}
          onFocus={handlers.onFocus}
          onBlur={handlers.onBlur}
          onKeyDown={(event) => pressKey(event, true)}
          onKeyUp={(event) => pressKey(event, false)}
          autoFocus={autoFocus}
          aria-checked={isChecked}
          aria-invalid={error || undefined}
          aria-required={required || undefined}
          aria-busy={loading || undefined}
          aria-disabled={loading || undefined}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        />
        <span data-part="track" aria-hidden="true">
          <span data-part="thumb">
            {loading && <span data-part="loading-indicator" />}
          </span>
          {!loading && (
            <span data-part="state-icon" data-on={isChecked ? 'true' : 'false'}>
              {isChecked ? <ActionConfirmIcon decorative /> : <ActionCloseIcon decorative />}
            </span>
          )}
        </span>
        {hasText && (
          <span data-part="text">
            {displayLabel && (
              <span id={labelId} data-part="label">{displayLabel}</span>
            )}
            {stateLabel && (
              <span data-part="state-label" aria-hidden="true">{stateLabel}</span>
            )}
            {description && (
              <span id={descriptionId} data-part="description">{description}</span>
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
});

ModernToggle.displayName = 'ModernToggle';

export default ModernToggle;
