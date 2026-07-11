/**
 * @fileoverview InputPassword - Rottay Design System
 * @description Compound component providing a password input with an integrated
 * visibility toggle button for showing or hiding the entered text.
 *
 * @remarks
 * InputPassword wraps the BaseInput component, toggling between `type="password"`
 * and `type="text"` based on user interaction. It includes built-in eye/eye-off
 * SVG icons but supports custom icons via `visibleIcon` and `hiddenIcon` props.
 *
 * **Key Features:**
 * - Toggleable password visibility via suffix button
 * - Built-in accessible eye/eye-off SVG icons
 * - Custom icon override support
 * - Inherits all BaseInput props (size, variant, status, etc.)
 * - Toggle button uses `tabIndex={-1}` to keep focus on the input
 *
 * **Accessibility:**
 * - Toggle button includes `aria-label` ("Show password" / "Hide password")
 * - Toggle button is removed from tab order to avoid disrupting input flow
 *
 * @example Basic Usage
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Password placeholder="Enter your password" />
 * ```
 *
 * @example Without Visibility Toggle
 * ```tsx
 * <Input.Password
 *   placeholder="Enter your password"
 *   visibilityToggle={false}
 * />
 * ```
 *
 * @example Custom Toggle Icons
 * ```tsx
 * <Input.Password
 *   placeholder="Password"
 *   visibleIcon={<UnlockIcon />}
 *   hiddenIcon={<LockIcon />}
 * />
 * ```
 *
 * @see {@link Input} for the main input component
 * @see {@link BaseInput} for the underlying input implementation
 * @module InputPassword
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';

import { useState } from 'react';
import type { InputPasswordProps } from '../../Input.types';
import { BaseInput } from '../../base';

/** SVG icon representing an open eye (password visible state). */
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** SVG icon representing a crossed-out eye (password hidden state). */
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
  </svg>
);

/**
 * Password input with integrated visibility toggle.
 *
 * @description
 * Renders a BaseInput that switches between `type="password"` and `type="text"`
 * when the user clicks the visibility toggle button in the suffix slot.
 *
 * @param props - {@link InputPasswordProps} extending all standard input props
 * @returns A password input element with optional visibility toggle suffix
 *
 * @example
 * ```tsx
 * <InputPassword
 *   placeholder="Enter password"
 *   visibilityToggle
 *   onChange={(val) => setPassword(val)}
 * />
 * ```
 */
export const InputPassword = (props: InputPasswordProps) => {
  const {
    visibilityToggle = true,
    visibleIcon,
    hiddenIcon,
    ...inputProps
  } = props;

  const [visible, setVisible] = useState(false);

  const toggleButton = visibilityToggle ? (
    <button
      type="button"
      data-part="visibility-toggle"
      onClick={() => setVisible(!visible)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        color: 'var(--ds-input-addon-color)',
      }}
      aria-label={visible ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {visible ? (hiddenIcon || <EyeOffIcon />) : (visibleIcon || <EyeIcon />)}
    </button>
  ) : null;

  return (
    <BaseInput
      {...inputProps}
      type={visible ? 'text' : 'password'}
      suffix={toggleButton}
    />
  );
};

InputPassword.displayName = 'Input.Password';
