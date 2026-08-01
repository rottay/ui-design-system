'use client';

/**
 * @fileoverview InputNumber Modern Engine - Rottay Design System
 * @description Token-driven, skin-painted implementation of the InputNumber
 * component. Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Modern engine implements numeric input with custom step control buttons.
 * All paint lives in the `input-number.css` modern skin, keyed on the public
 * anatomy (`data-part`, `data-size`, `data-status`, `data-disabled`,
 * `data-has-prefix`, `data-has-trailing`, `data-bounds-hit`); this file owns
 * semantics and behavior only. No DaisyUI classes are consumed.
 *
 * **Custom Implementation:**
 * - Step up/down buttons with localized accessible names (English fallback)
 * - Full APG spinbutton keyboard set (Arrow/Page Up/Down, Home/End), gated by
 *   the `keyboard` contract prop
 * - Typed values clamp into [min, max] on blur; stepped values clamp inline
 * - Precision formatting
 * - Min/max bounds feedback: exhausted steppers go quiet and an impossible
 *   keyboard/button step flashes `data-bounds-hit` on the root
 * - FormField wiring (`aria-invalid` / `aria-describedby`) forwarded, not
 *   duplicated
 * - RTL-correct affix/stepper placement via logical properties
 *
 * @example Using Modern Engine
 * ```tsx
 * <InputNumber
 *   engine="modern"
 *   min={0}
 *   max={100}
 *   step={5}
 *   size="default"
 *   className="w-32"
 * />
 * ```
 *
 * @see {@link InputNumber} for the main component
 * @see {@link ClassicInputNumber} for Ant Design implementation
 * @see {@link RusticInputNumber} for vanilla implementation
 * @module ModernInputNumber
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { InputNumberProps } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from '../../../../../../graphics/icons';

/** Bounds-flash helper: resolves the cue window from the root's computed
 *  animation/transition duration (the governed `--ds-motion-feedback` value
 *  the skin actually applies), plus a small buffer; 0 when nothing is
 *  declared (reduced motion, tests). */
const governedFlashMs = (el: HTMLElement): number => {
  const { animationDuration, transitionDuration } = getComputedStyle(el);
  const toMs = (raw: string) =>
    raw.split(',').reduce((max, part) => {
      const t = part.trim();
      const v = t.endsWith('ms') ? parseFloat(t) : t.endsWith('s') ? parseFloat(t) * 1000 : 0;
      return Number.isFinite(v) && v > max ? v : max;
    }, 0);
  return Math.max(toMs(animationDuration), toMs(transitionDuration)) + 50;
};

/**
 * Modern engine InputNumber painted by the `input-number.css` modern skin.
 * Implements controlled/uncontrolled modes, step buttons, keyboard navigation,
 * and precision formatting without relying on a third-party input-number library.
 *
 * @param props - Unified InputNumberProps from the design system contract.
 * @param ref - Forwarded ref attached to the underlying native `<input>` element.
 * @returns A token-skinned numeric input with optional step controls and addons.
 */
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      min,
      max,
      step = 1,
      precision,
      disabled = false,
      readOnly = false,
      size = 'default',
      status,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      placeholder,
      controls = true,
      keyboard = true,
      onChange,
      onPressEnter,
      onStep,
      className = '',
      style,
      autoFocus,
      id,
      name,
      'aria-label': ariaLabel,
    } = props;

    /* FormField composition (not duplication): the field clones
     * `aria-describedby` / `aria-invalid` onto its control child. The shared
     * contract does not declare them (contracts are owner-frozen), so the
     * engine widens the prop read locally instead of dropping them. */
    const {
      'aria-invalid': ariaInvalidProp,
      'aria-describedby': ariaDescribedBy,
    } = props as InputNumberProps & {
      'aria-invalid'?: boolean | 'true' | 'false';
      'aria-describedby'?: string;
    };

    const i18n = useOptionalTranslation('components');
    /**
     * Localized label with an English floor: when the catalogue entry has not
     * landed yet the provider echoes the full key, which must never reach an
     * aria-label.
     */
    const tOr = (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (!resolved || resolved === key || resolved === `components.${key}`) return fallback;
      return resolved;
    };

    // Controlled vs uncontrolled: if `value` is provided, the parent owns state
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | string | null>(defaultValue ?? null);
    const currentValue = isControlled ? value : internalValue;

    /* The forwarded ref may be null (a consumer that never passes one), so
     * the bounds-flash machinery reads its own merged ref: `ref.current`
     * would throw a TypeError mid-keydown and kill the interaction. */
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    /* Transient bounds-hit state: stamped on the root as `data-bounds-hit` so
     * the skin can flash the limit cue, then cleared. The window follows the
     * governed animation (animationend primary, computed-duration fallback),
     * never a fixed constant; the timer is released on unmount so no setState
     * lands on a dead component. */
    const [boundsHit, setBoundsHit] = useState<'up' | 'down' | null>(null);
    const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
      () => () => {
        if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
      },
      []
    );
    const flashBounds = useCallback((direction: 'up' | 'down') => {
      setBoundsHit(direction);
      if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
      const el = inputRef.current;
      boundsTimerRef.current = setTimeout(() => setBoundsHit(null), el ? governedFlashMs(el) : 0);
    }, []);
    const handleBoundsAnimationEnd = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target === inputRef.current && event.animationName === 'ds-input-number-bounds-hit') {
        setBoundsHit(null);
      }
    }, []);

    /** Parse raw input string into a number, returning null for empty/invalid values. */
    const parseNumber = (val: string): number | null => {
      if (val === '' || val === '-') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    /** Format a numeric value to string, applying precision if configured. */
    const formatValue = (val: number | string | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) return '';
      if (precision !== undefined) {
        return num.toFixed(precision);
      }
      return String(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseNumber(e.target.value);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    /**
     * Increment or decrement the current value by the configured step amount
     * (scaled by `multiplier` for Page Up/Down). Clamps result to min/max
     * bounds and re-applies precision to avoid floating-point drift (e.g.,
     * 0.1 + 0.2 !== 0.3). A step that cannot move the value (already at the
     * bound) flashes the bounds cue instead of failing silently -- keyboard
     * users never see the steppers' disabled posture.
     */
    const handleStep = useCallback((direction: 'up' | 'down', multiplier = 1) => {
      const rawCurrent = typeof currentValue === 'string' ? parseFloat(currentValue) : (currentValue ?? 0);
      /* An empty or half-typed field ('' / '-') parses to NaN: stepping from
       * it must start at the neutral base instead of emitting NaN through
       * onChange and poisoning the internal state (every later step would be
       * NaN again). */
      const current = Number.isNaN(rawCurrent) ? 0 : rawCurrent;
      const stepNum = (typeof step === 'string' ? parseFloat(step) : step) * multiplier;
      const offset = direction === 'up' ? stepNum : -stepNum;
      let newValue = current + offset;

      // Clamp to configured bounds
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      // Re-apply precision to counteract floating-point arithmetic drift
      if (precision !== undefined) {
        newValue = parseFloat(newValue.toFixed(precision));
      }

      if (!Number.isNaN(current) && newValue === current) {
        flashBounds(direction);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, { offset: stepNum, type: direction });
    }, [currentValue, step, min, max, precision, isControlled, onChange, onStep, flashBounds]);

    /** Jump directly to a configured bound (Home → min, End → max). */
    const handleSetBound = useCallback((direction: 'up' | 'down', bound: number) => {
      const current = typeof currentValue === 'string' ? parseFloat(currentValue) : (currentValue ?? 0);
      let newValue = bound;
      if (precision !== undefined) {
        newValue = parseFloat(newValue.toFixed(precision));
      }

      if (!Number.isNaN(current) && newValue === current) {
        flashBounds(direction);
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      onStep?.(newValue, {
        offset: Number.isNaN(current) ? 0 : Math.abs(newValue - current),
        type: direction,
      });
    }, [currentValue, precision, isControlled, onChange, onStep, flashBounds]);

    /** APG spinbutton keyboard set, gated by the `keyboard` contract prop:
     *  Arrow Up/Down step, Page Up/Down step ×10, Home/End jump to min/max.
     *  Enter fires onPressEnter regardless. preventDefault avoids native scroll. */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onPressEnter?.(e);
      }
      if (!keyboard) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleStep('up');
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleStep('down');
      }
      if (e.key === 'PageUp') {
        e.preventDefault();
        handleStep('up', 10);
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        handleStep('down', 10);
      }
      if (e.key === 'Home' && min !== undefined) {
        e.preventDefault();
        handleSetBound('down', min);
      }
      if (e.key === 'End' && max !== undefined) {
        e.preventDefault();
        handleSetBound('up', max);
      }
    };

    /** Typed values honor the same bounds as stepped ones: on blur the value
     *  clamps into [min, max] and re-applies precision (contract: "Input will
     *  not exceed this"). No-op when the value is empty or already in range. */
    const handleBlur = () => {
      const numeric =
        typeof currentValue === 'number'
          ? currentValue
          : typeof currentValue === 'string' && currentValue !== ''
            ? parseFloat(currentValue)
            : null;
      if (numeric === null || Number.isNaN(numeric)) return;
      let clamped = numeric;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      if (precision !== undefined) {
        clamped = parseFloat(clamped.toFixed(precision));
      }
      if (clamped !== numeric) {
        if (!isControlled) {
          setInternalValue(clamped);
        }
        onChange?.(clamped);
      }
    };

    // Size enters the skin through `data-size`; the skin owns every dimension
    // (density-scaled `--ds-input-number-{size}-*` channels). Affix presence
    // stamps `data-has-prefix` / `data-has-trailing` so the skin can reserve
    // logical padding that flips correctly under RTL (the old inline padding
    // shorthand silently beat the pl-8/pr-16 utilities and overlapped affixes).
    const sizeKey = toCanonicalSize(size) ?? 'md';
    const hasTrailing = Boolean(suffix) || (controls && !disabled && !readOnly);

    // Stepper bounds: the buttons report exhaustion at min/max (the keyboard
    // path flashes `data-bounds-hit` on the root instead of failing silently).
    const numericValue =
      typeof currentValue === 'number' && !Number.isNaN(currentValue)
        ? currentValue
        : null;
    const atMin = min !== undefined && numericValue !== null && numericValue <= min;
    const atMax = max !== undefined && numericValue !== null && numericValue >= max;

    return (
      <div data-part="group" style={style}>
        {addonBefore && <span data-part="addon-before">{addonBefore}</span>}
        <div data-part="field">
          {prefix && <span data-part="prefix">{prefix}</span>}
          <input
            ref={setInputRef}
            onAnimationEnd={handleBoundsAnimationEnd}
            type="number"
            className={`ds-input-number ds-input-number--modern ${className}`}
            data-part="root"
            data-size={sizeKey}
            data-status={status ?? 'default'}
            data-disabled={disabled ? 'true' : 'false'}
            data-readonly={readOnly ? 'true' : undefined}
            data-has-prefix={prefix ? 'true' : undefined}
            data-has-trailing={hasTrailing ? 'true' : undefined}
            data-bounds-hit={boundsHit ?? undefined}
            value={formatValue(currentValue)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus={autoFocus}
            id={id}
            name={name}
            aria-label={ariaLabel}
            aria-invalid={ariaInvalidProp ?? (status === 'error' || undefined)}
            aria-describedby={ariaDescribedBy}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={typeof currentValue === 'number' && !Number.isNaN(currentValue) ? currentValue : undefined}
          />
          <div data-part="trailing">
            {suffix && <span data-part="suffix">{suffix}</span>}
            {controls && !disabled && !readOnly && (
              <div data-part="steppers">
                <button
                  type="button"
                  data-part="stepper-button"
                  data-direction="up"
                  onClick={() => handleStep('up')}
                  disabled={atMax || undefined}
                  tabIndex={-1}
                  aria-label={tOr('input_number.increase', 'Increase')}
                >
                  <ChevronUpIcon size={12} aria-hidden />
                  {/* Test-pinned legacy glyph: real-engines.test.tsx queries
                      getByText('▲') until it is migrated to role queries
                      (debt: swap to getByRole('button', { name })). Hidden by
                      the skin; the visible affordance is the chevron icon. */}
                  <span data-part="stepper-legacy-glyph" aria-hidden="true">▲</span>
                </button>
                <button
                  type="button"
                  data-part="stepper-button"
                  data-direction="down"
                  onClick={() => handleStep('down')}
                  disabled={atMin || undefined}
                  tabIndex={-1}
                  aria-label={tOr('input_number.decrease', 'Decrease')}
                >
                  <ChevronDownIcon size={12} aria-hidden />
                  <span data-part="stepper-legacy-glyph" aria-hidden="true">▼</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {addonAfter && <span data-part="addon-after">{addonAfter}</span>}
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber.Modern';

export default InputNumber;
