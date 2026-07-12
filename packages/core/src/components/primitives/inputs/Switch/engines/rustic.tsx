'use client';

/**
 * @fileoverview Switch Rustic Engine -- pure HTML/CSS with CSS variable theming.
 * Renders a custom toggle switch (track + sliding knob) using only inline
 * styles driven by `--ds-switch-*` design tokens. Includes a lightweight SVG
 * spinner for loading state and full ARIA `role="switch"` semantics.
 *
 * @example
 * ```tsx
 * <Switch engine="rustic" size="large" checkedChildren="On" unCheckedChildren="Off" />
 * ```
 *
 * @module RusticSwitch
 * @category Inputs
 * @package @rottay/design-system
 */

import React, { useState } from 'react';

import type { SwitchProps } from '../Switch.types';

/**
 * Size configuration using CSS variables for each switch variant.
 * The `translate` value is a CSS calc() that moves the thumb knob from
 * left edge to right edge, accounting for thumb size and internal offset.
 */
const SIZE_CONFIG: Record<string, { width: string; height: string; thumbSize: string; translate: string }> = {
  small: {
    width: 'var(--ds-switch-sm-width)',
    height: 'var(--ds-switch-sm-height)',
    thumbSize: 'var(--ds-switch-sm-thumb-size)',
    translate: 'calc(var(--ds-switch-sm-width) - var(--ds-switch-sm-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
  default: {
    width: 'var(--ds-switch-md-width)',
    height: 'var(--ds-switch-md-height)',
    thumbSize: 'var(--ds-switch-md-thumb-size)',
    translate: 'calc(var(--ds-switch-md-width) - var(--ds-switch-md-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
  large: {
    width: 'var(--ds-switch-lg-width)',
    height: 'var(--ds-switch-lg-height)',
    thumbSize: 'var(--ds-switch-lg-thumb-size)',
    translate: 'calc(var(--ds-switch-lg-width) - var(--ds-switch-lg-thumb-size) - var(--ds-switch-thumb-offset) * 2)',
  },
};

/**
 * Rustic engine Switch -- framework-free, CSS-variable-driven toggle.
 *
 * Uses a hidden native checkbox for accessibility while rendering a custom
 * track and sliding knob. The knob position is animated via CSS transition
 * and `translateX`, calculated from the size configuration CSS variables.
 * An inline `<style>` block injects the `@keyframes spin` animation for
 * the loading spinner SVG.
 *
 * @param props - {@link SwitchProps} unified switch props shared across engines.
 * @returns A ref-forwarding toggle switch with pure CSS variable styling.
 */
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

    // Controlled vs uncontrolled: external `checked` prop takes precedence
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    // Guard against state changes while disabled or loading
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || loading) return;
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    };

    // Propagate click with current checked state, matching AntD's callback signature
    const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
      if (disabled || loading) return;
      onClick?.(isChecked, e as unknown as React.MouseEvent);
    };

    // Fall back to 'default' if an unrecognised size string is passed
    const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.default;

    // BEM class names for external CSS targeting and state-driven modifiers
    const containerClasses = [
      'rottay-switch',
      'rottay-switch--rustic',
      'ds-switch',
      'ds-switch--rustic',
      `rottay-switch--${size}`,
      isChecked && 'rottay-switch--checked',
      disabled && 'rottay-switch--disabled',
      loading && 'rottay-switch--loading',
      className,
    ].filter(Boolean).join(' ');

    const wrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--ds-switch-label-gap)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--ds-font-family-base)',
      ...style,
    };

    const switchStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      width: sizeConfig.width,
      height: sizeConfig.height,
    };

    const inputStyle: React.CSSProperties = {
      opacity: 0,
      width: 0,
      height: 0,
      position: 'absolute',
    };

    // "Slider" here is the visible track background, not the component type
    const sliderStyle: React.CSSProperties = {
      position: 'absolute',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transition: 'var(--ds-switch-transition)',
      opacity: disabled || loading ? 0.5 : 1,
    };

    // Knob = the circular thumb that slides between checked/unchecked positions
    const knobStyle: React.CSSProperties = {
      position: 'absolute',
      height: sizeConfig.thumbSize,
      width: sizeConfig.thumbSize,
      left: 'var(--ds-switch-thumb-offset)',
      bottom: 'var(--ds-switch-thumb-offset)',
      transition: 'var(--ds-switch-transition)',
      ...({ '--ds-switch-thumb-x': isChecked ? sizeConfig.translate : '0' } as React.CSSProperties),
    };

    const labelStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-sm)',
      userSelect: 'none',
    };

    return (
      <label
        className={containerClasses}
        data-part="root"
        data-checked={isChecked ? 'true' : 'false'}
        data-disabled={disabled || loading ? 'true' : 'false'}
        style={wrapperStyle}
        onClick={handleClick}
      >
        {!isChecked && unCheckedChildren && (
          <span data-part="label" style={labelStyle}>{unCheckedChildren}</span>
        )}
        <span style={switchStyle}>
          <input
            ref={ref}
            type="checkbox"
            style={inputStyle}
            checked={isChecked}
            disabled={disabled || loading}
            onChange={handleChange}
            autoFocus={autoFocus}
            tabIndex={tabIndex}
            id={id}
            name={name}
            aria-checked={isChecked}
            role="switch"
          />
          <span data-part="track" style={sliderStyle}>
            <span data-part="thumb" style={knobStyle} />
          </span>
        </span>
        {isChecked && checkedChildren && (
          <span data-part="label" style={labelStyle}>{checkedChildren}</span>
        )}
        {/* Inline SVG spinner shown during async operations (e.g., saving state) */}
        {loading && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            style={{ marginLeft: '4px', animation: 'ds-switch-spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch.Rustic';

export default Switch;
