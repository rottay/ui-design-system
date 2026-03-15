'use client';

import { useState } from 'react';
import type { InputPasswordProps } from '../../Input.types';
import { BaseInput } from '../../base';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
  </svg>
);

/**
 * Input.Password compound component
 * Provides a password input with visibility toggle
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
