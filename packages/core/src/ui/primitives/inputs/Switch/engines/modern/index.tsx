/**
 * @fileoverview Switch Modern Engine - Rottay Design System
 * @description Premium toggle switch with precise, calm styling.
 * Inspired by Linear/Vercel design language -- smooth thumb slide, subtle shadows.
 *
 * @remarks
 * Uses a visually hidden native checkbox (`role="switch"`) for accessibility
 * and form participation, plus a custom track + thumb. Every visual decision
 * lives in the modern skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/switch.css`), keyed on
 * the `data-*` contract this component stamps: `data-size`, `data-checked`,
 * `data-disabled`, and `data-loading`. Geometry consumes the
 * `--ds-switch-{size}-*` channels multiplied by the three-plane density
 * channel `--ds-density-effective-scale`; the thumb travel is a pure CSS
 * `calc()` flipped under `:dir(rtl)`, so RTL needs no runtime branch.
 *
 * @see {@link Switch} for the main component
 * @module ModernSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useCallback } from 'react';
import type { SwitchProps } from '../../contracts';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (props, ref) => {
    const {
      checked,
      defaultChecked = false,
      disabled = false,
      loading = false,
      size = 'default',
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className = '',
      style,
      autoFocus,
      tabIndex,
      id,
      name,
    } = props;

    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const isDisabled = disabled || loading;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    }, [isControlled, onChange]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    }, [isChecked, onClick]);

    const sizeKey = toCanonicalSize(size) ?? 'md';

    return (
      <label
        className={`ds-switch ds-switch--modern ${className}`.trim()}
        data-part="root"
        data-size={sizeKey}
        data-checked={isChecked ? 'true' : 'false'}
        data-disabled={isDisabled ? 'true' : 'false'}
        data-loading={loading ? 'true' : 'false'}
        style={style}
      >
        {/* Unchecked label (before track) */}
        {!isChecked && unCheckedChildren && (
          <span data-part="label">{unCheckedChildren}</span>
        )}

        {/* Visually hidden native input: accessibility + form participation */}
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          onClick={handleClick}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          id={id}
          name={name}
          role="switch"
          aria-checked={isChecked}
          aria-busy={loading || undefined}
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

        {/* Custom visual track + thumb */}
        <span data-part="track" aria-hidden="true">
          <span data-part="thumb" />
        </span>

        {/* Checked label (after track) */}
        {isChecked && checkedChildren && (
          <span data-part="label">{checkedChildren}</span>
        )}

        {/* Loading indicator */}
        {loading && (
          <span data-part="loading-indicator" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                data-part="loading-track"
                cx="7"
                cy="7"
                r="5.5"
                strokeWidth="1.5"
              />
              <path
                data-part="loading-arc"
                d="M12.5 7A5.5 5.5 0 0 0 7 1.5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Modern';

export default Switch;
