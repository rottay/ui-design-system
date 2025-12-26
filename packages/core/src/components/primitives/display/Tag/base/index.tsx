/**
 * Tag - Base Component
 * Uses CSS variables from design tokens for consistent styling.
 *
 * @module Tag/base
 * @description The base Tag component provides a foundation for all engine
 * implementations. It uses CSS variables for theming and supports all common
 * Tag features including closable tags, icons, and semantic colors.
 */

'use client';

import React, { forwardRef, useCallback } from 'react';
import type { TagProps } from '../types';
import { TAG_DEFAULTS, SIZE_MAP, RADIUS_MAP, VARIANT_COLORS } from '../types';

/**
 * Close icon SVG component for closable tags.
 *
 * @returns SVG element for the close button
 */
const CloseIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 3L3 9M3 3L9 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Base Tag component for labels, categories, and status indicators.
 *
 * This component serves as the foundation for all engine-specific
 * implementations and can be used directly with the Apollo engine.
 *
 * @param props - Tag component properties
 * @param ref - Forwarded ref to the root span element
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BaseTag>New</BaseTag>
 *
 * // With variant and closable
 * <BaseTag variant="primary" closable onClose={() => console.log('closed')}>
 *   Premium
 * </BaseTag>
 *
 * // With icon
 * <BaseTag icon={<StarIcon />} variant="success">
 *   Featured
 * </BaseTag>
 * ```
 */
export const BaseTag = forwardRef<HTMLSpanElement, TagProps>(
  (props, ref) => {
    const {
      size = TAG_DEFAULTS.size,
      variant = TAG_DEFAULTS.variant,
      closable = TAG_DEFAULTS.closable,
      onClose,
      icon,
      children,
      bordered = TAG_DEFAULTS.bordered,
      radius = TAG_DEFAULTS.radius,
      color,
      outlined = TAG_DEFAULTS.outlined,
      clickable = TAG_DEFAULTS.clickable,
      onClick,
      className = '',
      style = {},
      ...restProps
    } = props;

    /**
     * Handles tag click events.
     * Only triggers callback if tag is clickable.
     */
    const handleClick = useCallback(() => {
      if (clickable && onClick) {
        onClick();
      }
    }, [clickable, onClick]);

    /**
     * Handles close button click.
     * Stops propagation to prevent triggering tag click.
     */
    const handleClose = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose?.();
      },
      [onClose]
    );

    // Determine the style type (solid, outline, or subtle)
    const styleType = outlined ? 'outline' : 'solid';

    // Get colors based on variant, with custom color override support
    const variantKey = (variant as keyof typeof VARIANT_COLORS) || 'default';
    const colors = VARIANT_COLORS[variantKey]?.[styleType] || VARIANT_COLORS.default[styleType];

    // Get size styles
    const sizeStyles = SIZE_MAP[size] || SIZE_MAP.md;

    // Build CSS variables for theming
    const tagVars: React.CSSProperties = {
      '--tag-bg': color || colors.bg,
      '--tag-color': colors.text,
      '--tag-border-color': bordered || outlined ? colors.border : 'transparent',
      '--tag-radius': RADIUS_MAP[radius] || RADIUS_MAP.md,
      '--tag-height': sizeStyles.height,
      '--tag-padding': sizeStyles.padding,
      '--tag-font-size': sizeStyles.fontSize,
    } as React.CSSProperties;

    // Computed container styles
    const containerStyle: React.CSSProperties = {
      ...tagVars,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      height: 'var(--tag-height)',
      padding: 'var(--tag-padding)',
      fontSize: 'var(--tag-font-size)',
      fontWeight: 500,
      lineHeight: 1,
      backgroundColor: 'var(--tag-bg)',
      color: 'var(--tag-color)',
      border: `1px solid var(--tag-border-color)`,
      borderRadius: 'var(--tag-radius)',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'all 0.2s ease-in-out',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ...style,
    };

    // Icon wrapper styles
    const iconStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    };

    // Close button styles
    const closeButtonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '0.125rem',
      padding: 0,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'inherit',
      opacity: 0.7,
      transition: 'opacity 0.2s ease-in-out',
    };

    // Build class names
    const classNames = [
      'rottay-tag',
      `rottay-tag--${size}`,
      `rottay-tag--${variant}`,
      outlined && 'rottay-tag--outlined',
      bordered && 'rottay-tag--bordered',
      clickable && 'rottay-tag--clickable',
      closable && 'rottay-tag--closable',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        ref={ref}
        className={classNames}
        style={containerStyle}
        onClick={handleClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...restProps}
      >
        {icon && (
          <span className="rottay-tag__icon" style={iconStyle}>
            {icon}
          </span>
        )}

        <span className="rottay-tag__content">{children}</span>

        {closable && (
          <button
            type="button"
            className="rottay-tag__close"
            onClick={handleClose}
            aria-label="Remove tag"
            style={closeButtonStyle}
          >
            <CloseIcon />
          </button>
        )}
      </span>
    );
  }
);

BaseTag.displayName = 'BaseTag';
