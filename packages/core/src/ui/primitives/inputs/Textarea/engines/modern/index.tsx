/**
 * @fileoverview Modern engine for Textarea - Rottay Design System
 * @description Premium textarea implementation painted entirely by the modern
 * skin (`foundation/tokens/css/runtime/engines/modern/skin/textarea.css`),
 * keyed on the `data-*` contract this component stamps: `data-variant`,
 * `data-size`, `data-status`, `data-disabled`, `data-readonly`, and
 * `data-filled`.
 *
 * @remarks
 * Geometry consumes the canonical `--ds-textarea-{size}-*` channels multiplied
 * by the three-plane density channel `--ds-density-effective-scale`; every
 * state (hover, focus, status, disabled, read-only) is skin paint on the
 * `data-*` contract, never an inline literal. The optional clear action and
 * character count reach contract parity with the other field primitives and
 * are labeled from the i18n catalog.
 *
 * @example
 * ```tsx
 * <Textarea engine="modern" placeholder="Enter description..." rows={4} variant="outlined" />
 * ```
 *
 * @module ModernTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback, useRef, useId, useEffect, useLayoutEffect } from 'react';
import type { TextareaProps } from '../../contracts';
import { TEXTAREA_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Modern (pure DS tokens) implementation of Textarea.
 *
 * The `<textarea>` itself is the paint root; paint and every interaction
 * state live in the modern skin. The onChange signature is normalized to
 * `(value, event)` for DS consistency.
 *
 * @param props - Standard TextareaProps shared across all engines.
 * @returns A styled native textarea element with optional count and clear anatomy.
 */
export default function ModernTextarea(props: TextareaProps): React.ReactElement {
  const {
    size = TEXTAREA_DEFAULTS.size,
    variant = TEXTAREA_DEFAULTS.variant,
    status = TEXTAREA_DEFAULTS.status,
    placeholder,
    value: controlledValue,
    defaultValue,
    disabled,
    readOnly,
    required,
    maxLength,
    showCount = TEXTAREA_DEFAULTS.showCount,
    rows = TEXTAREA_DEFAULTS.rows,
    autoSize,
    allowClear = TEXTAREA_DEFAULTS.allowClear,
    onChange,
    onFocus,
    onBlur,
    onClear,
    onPressEnter,
    onResize,
    className,
    style,
    name,
    id,
    autoComplete,
    autoFocus,
    'data-testid': dataTestId,
    ...rest
  } = props;

  const translation = useOptionalTranslation('common');
  const generatedId = useId();
  const controlId = id || `textarea-modern-${generatedId.replace(/:/g, '')}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Controlled/uncontrolled tracking so count and clear see the live value.
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = controlledValue !== undefined;
  const currentValue = String(isControlled ? controlledValue : internalValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e.target.value, e);
  }, [isControlled, onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    onBlur?.(e);
  }, [onBlur]);

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    onClear?.();
    onChange?.('', { target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>);
    textareaRef.current?.focus();
  }, [isControlled, onChange, onClear]);

  const statusKey = status || 'default';
  const isError = statusKey === 'error';
  const isFilled = currentValue.length > 0;
  const showClearButton = Boolean(allowClear && isFilled && !disabled && !readOnly);
  const countState = !maxLength
    ? undefined
    : isError
      ? 'error'
      : currentValue.length >= maxLength
        ? 'limit'
        : currentValue.length / maxLength >= 0.9
          ? 'warning'
          : undefined;

  // autoSize: grow with the content and cap at maxRows (contract: true |
  // {minRows,maxRows}). Runtime-measured geometry is the one sanctioned
  // inline mechanism; the no-autoSize path keeps the root style-free
  // (pinned by Textarea.modern-engine). minRows rides the native `rows`
  // attribute, which the browser already enforces as the floor.
  const autoSizeMaxRows = typeof autoSize === 'object' ? autoSize.maxRows : undefined;
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!autoSize) {
      // Toggled off after measuring: hand geometry back to the skin/rows.
      if (el.style.blockSize) el.style.blockSize = '';
      if (el.style.overflowY) el.style.overflowY = '';
      return;
    }
    el.style.blockSize = 'auto';
    const computed = getComputedStyle(el);
    const borderBlock =
      (parseFloat(computed.borderBlockStartWidth) || 0) +
      (parseFloat(computed.borderBlockEndWidth) || 0);
    let next = el.scrollHeight + borderBlock;
    let overflowY = 'hidden';
    if (autoSizeMaxRows) {
      const lineHeight = parseFloat(computed.lineHeight) || 20;
      const paddingBlock =
        (parseFloat(computed.paddingBlockStart) || 0) +
        (parseFloat(computed.paddingBlockEnd) || 0);
      const max = Math.ceil(lineHeight * autoSizeMaxRows + paddingBlock + borderBlock);
      if (next > max) {
        next = max;
        overflowY = 'auto';
      }
    }
    el.style.blockSize = `${next}px`;
    el.style.overflowY = overflowY;
  }, [currentValue, autoSize, autoSizeMaxRows]);

  // onResize reports both autoSize-driven growth and manual drag resizes from
  // a single source (the observer fires on mount with the initial geometry).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !onResize || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      onResize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onResize]);

  return (
    <div
      className={`ds-textarea-field ${className || ''}`.trim()}
      data-part="field"
      data-has-clear={showClearButton ? 'true' : undefined}
      data-testid={dataTestId}
      style={style}
    >
      <textarea
        ref={textareaRef}
        id={controlId}
        className="ds-textarea ds-textarea--modern"
        data-part="root"
        data-variant={variant}
        data-size={size}
        data-status={statusKey}
        data-disabled={disabled ? 'true' : 'false'}
        data-readonly={readOnly ? 'true' : 'false'}
        data-filled={isFilled ? 'true' : 'false'}
        placeholder={placeholder}
        value={currentValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
        rows={typeof autoSize === 'object' ? (autoSize.minRows ?? rows) : autoSize ? 1 : rows}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onPressEnter?.();
        }}
        name={name}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={isError || undefined}
        aria-required={required || undefined}
        {...rest}
      />

      {showClearButton && (
        <button
          type="button"
          data-part="clear-button"
          onClick={handleClear}
          onPointerDown={(event) => event.preventDefault()}
          aria-label={translation?.t('clear') ?? 'Clear'}
        >
          <ActionCloseIcon decorative size="sm" />
        </button>
      )}

      {showCount && (
        <div
          data-part="count"
          data-count-state={countState}
          aria-live="polite"
        >
          {currentValue.length}
          {maxLength ? `/${maxLength}` : ''}
        </div>
      )}
    </div>
  );
}
