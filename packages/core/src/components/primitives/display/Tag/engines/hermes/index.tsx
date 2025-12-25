'use client';

import React, { forwardRef } from 'react';
import type { TagProps } from '../../types';

/**
 * Hermes (DaisyUI/Tailwind) implementation of Tag component.
 *
 * Uses DaisyUI badge component with Tailwind classes.
 */
export const HermesTag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      size = 'md',
      variant = 'solid',
      color = 'default',
      closable = false,
      onClose,
      icon,
      children,
      rounded = false,
      bordered = false,
      disabled = false,
      clickable = false,
      onClick,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'badge-sm text-xs',
      md: 'badge-md text-sm',
      lg: 'badge-lg text-base',
    };

    const colorClasses = {
      default: variant === 'outline' ? 'badge-outline' : 'badge-ghost',
      primary: variant === 'outline' ? 'badge-primary badge-outline' : 'badge-primary',
      secondary: variant === 'outline' ? 'badge-secondary badge-outline' : 'badge-secondary',
      success: variant === 'outline' ? 'badge-success badge-outline' : 'badge-success',
      warning: variant === 'outline' ? 'badge-warning badge-outline' : 'badge-warning',
      error: variant === 'outline' ? 'badge-error badge-outline' : 'badge-error',
    };

    const classes = [
      'badge',
      'inline-flex',
      'items-center',
      'gap-1',
      sizeClasses[size],
      colorClasses[color],
      clickable && !disabled ? 'cursor-pointer hover:opacity-80' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = () => {
      if (clickable && !disabled && onClick) {
        onClick();
      }
    };

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled && onClose) {
        onClose();
      }
    };

    return (
      <span
        ref={ref}
        className={classes}
        style={style}
        onClick={handleClick}
        {...props}
      >
        {icon && <span>{icon}</span>}
        <span>{children}</span>
        {closable && (
          <button
            type="button"
            onClick={handleClose}
            className="ml-1 hover:opacity-70"
            aria-label="Close tag"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

HermesTag.displayName = 'HermesTag';
