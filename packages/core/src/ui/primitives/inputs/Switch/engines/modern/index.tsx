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
 * Composition notes (Phase B):
 * - The loading state composes the canonical `Spinner` primitive (Modern
 *   engine) inside the pinned `loading-indicator` slot -- no private loading
 *   glyph. The spinner keeps its `role="status"` announcement; the input
 *   carries `aria-busy`.
 * - The state label (`checkedChildren`/`unCheckedChildren`) renders in ONE
 *   stable slot after the track: swapping states never moves geometry.
 * - The hidden input's clip idiom lives in the skin with every other visual
 *   decision (zero inline paint), and `aria-label` forwards to the input --
 *   the primary accessible-name path when no state label is rendered.
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
import { LoadingIndicator } from '../../../../foundation/loading-indicator';

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
    const ariaLabel = props['aria-label'];

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

    // One stable label slot: the active state's content always renders after
    // the track, so toggling never relocates the label across the control.
    const stateLabel = isChecked ? checkedChildren : unCheckedChildren;

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
        {/* Visually hidden native input: accessibility + form participation.
            The clip idiom lives in the skin (single paint/layout owner). */}
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
          aria-label={ariaLabel}
        />

        {/* Custom visual track + thumb */}
        <span data-part="track" aria-hidden="true">
          <span data-part="thumb" />
        </span>

        {/* Active state label (stable slot after the track) */}
        {stateLabel && (
          <span data-part="label">{stateLabel}</span>
        )}

        {/* Loading state composes the canonical Spinner primitive (its
            role="status" announces the busy state; the input carries
            aria-busy). The slot wrapper keeps the pinned anatomy hook. */}
        {loading && (
          <span data-part="loading-indicator">
            <LoadingIndicator size="sm" />
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Modern';

export default Switch;
