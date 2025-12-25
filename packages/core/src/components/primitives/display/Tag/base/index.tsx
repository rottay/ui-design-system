'use client';

import React, { forwardRef } from 'react';
import type { TagProps } from '../types';

/**
 * Base Tag component for labels and categories.
 *
 * Features:
 * - Multiple sizes and variants
 * - Semantic colors
 * - Closable with callback
 * - Icon support
 * - Clickable state
 */
export const BaseTag = forwardRef<HTMLSpanElement, TagProps>(
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
    const sizeStyles = {
      sm: {
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
      },
      md: {
        padding: '0.25rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
      },
      lg: {
        padding: '0.375rem 1rem',
        fontSize: '1rem',
        lineHeight: '1.5rem',
      },
    };

    const colorMap = {
      default: {
        solid: { bg: 'var(--color-neutral-200)', color: 'var(--color-neutral-700)' },
        outline: { bg: 'transparent', color: 'var(--color-neutral-700)', border: 'var(--color-neutral-400)' },
        subtle: { bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)' },
      },
      primary: {
        solid: { bg: 'var(--color-primary)', color: 'white' },
        outline: { bg: 'transparent', color: 'var(--color-primary)', border: 'var(--color-primary)' },
        subtle: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
      },
      secondary: {
        solid: { bg: 'var(--color-secondary)', color: 'white' },
        outline: { bg: 'transparent', color: 'var(--color-secondary)', border: 'var(--color-secondary)' },
        subtle: { bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)' },
      },
      success: {
        solid: { bg: 'var(--color-success)', color: 'white' },
        outline: { bg: 'transparent', color: 'var(--color-success)', border: 'var(--color-success)' },
        subtle: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
      },
      warning: {
        solid: { bg: 'var(--color-warning)', color: 'white' },
        outline: { bg: 'transparent', color: 'var(--color-warning)', border: 'var(--color-warning)' },
        subtle: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
      },
      error: {
        solid: { bg: 'var(--color-error)', color: 'white' },
        outline: { bg: 'transparent', color: 'var(--color-error)', border: 'var(--color-error)' },
        subtle: { bg: 'var(--color-error-light)', color: 'var(--color-error)' },
      },
    };

    const colorStyles = colorMap[color][variant];

    const tagStyles: React.CSSProperties = {
      ...sizeStyles[size],
      backgroundColor: colorStyles.bg,
      color: colorStyles.color,
      border: bordered || variant === 'outline' ? `1px solid ${colorStyles.border || colorStyles.bg}` : 'none',
      borderRadius: rounded ? '9999px' : '0.25rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontWeight: 500,
      cursor: clickable && !disabled ? 'pointer' : 'default',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: 'all 0.2s ease',
      ...style,
    };

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
        className={`rottay-tag rottay-tag--${size} rottay-tag--${variant} rottay-tag--${color} ${className || ''}`}
        style={tagStyles}
        onClick={handleClick}
        {...props}
      >
        {icon && <span className="rottay-tag__icon">{icon}</span>}
        <span className="rottay-tag__content">{children}</span>
        {closable && (
          <button
            type="button"
            className="rottay-tag__close"
            onClick={handleClose}
            aria-label="Close tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginLeft: '0.125rem',
              display: 'flex',
              alignItems: 'center',
            }}
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

BaseTag.displayName = 'BaseTag';
