/**
 * Button.Icon - Compound Component
 * Icon-only button variant
 */

'use client';

import React, { forwardRef, useState } from 'react';
import type { ReactNode, CSSProperties, MouseEvent } from 'react';
import type { ButtonSize, ButtonVariant } from '../../types';
import { SIZE_MAP, VARIANT_MAP, SHAPE_MAP } from '../../types';

export interface ButtonIconProps {
  /** Icon to display */
  icon: ReactNode;
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Button size */
  size?: ButtonSize;
  /** Button variant */
  variant?: ButtonVariant;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  loading?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessibility label (required) */
  'aria-label': string;
  /** Tooltip text */
  tooltip?: string;
}

/**
 * Loading spinner for icon button
 */
const LoadingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size * 0.5}
    height={size * 0.5}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: 'rottay-button-spin 1s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="25"
    />
  </svg>
);

/**
 * Icon-only button component
 */
export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      icon,
      onClick,
      size = 'md',
      variant = 'default',
      disabled = false,
      loading = false,
      className = '',
      style,
      'aria-label': ariaLabel,
      tooltip,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Get size configuration
    const sizeConfig = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;
    const buttonSize = sizeConfig.height;

    // Get variant colors
    const variantConfig = VARIANT_MAP[variant as keyof typeof VARIANT_MAP] || VARIANT_MAP.default;

    // Compute effective background with hover state
    const effectiveBg = isHovered && !disabled && !loading
      ? variantConfig.hoverBg
      : variantConfig.bg;

    const buttonStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: buttonSize,
      height: buttonSize,
      minWidth: buttonSize,
      padding: 0,
      borderRadius: SHAPE_MAP.default,
      border: variant === 'ghost' || variant === 'text' || variant === 'link'
        ? 'none'
        : `1px solid ${variantConfig.borderColor}`,
      background: effectiveBg,
      color: variantConfig.color,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      outline: 'none',
      transform: isActive && !disabled && !loading ? 'scale(0.95)' : 'scale(1)',
      ...style,
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`rottay-button-icon rottay-button-icon--${size} rottay-button-icon--${variant} ${className}`}
        style={buttonStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        title={tooltip}
      >
        {loading ? <LoadingSpinner size={buttonSize} /> : icon}
      </button>
    );
  }
);

ButtonIcon.displayName = 'Button.Icon';
