/**
 * @fileoverview Tag Apollo Engine - Rottay Design System
 * @description Pure HTML/CSS tag implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free tag using only
 * inline styles and semantic HTML elements.
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - Uses semantic span element with role attributes
 * - Handles close button with accessibility
 * - Full keyboard navigation support
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility
 *
 * @example Basic Usage
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag engine="apollo" variant="warning" icon={<AlertIcon />}>
 *   Attention
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @see {@link BaseTag} for CSS variable implementation
 * @module ApolloTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import type { TagProps } from '../../types';
import { TAG_DEFAULTS, SIZE_MAP, RADIUS_MAP } from '../../types';

/**
 * Close icon SVG component for closable tags.
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
 * Color configuration for each variant.
 */
const VARIANT_COLORS = {
  default: { bg: '#f0f0f0', text: '#333333', border: '#d9d9d9' },
  primary: { bg: '#e6f7ff', text: '#0066cc', border: '#91d5ff' },
  secondary: { bg: '#f0f0ff', text: '#6b6bd4', border: '#d3adf7' },
  success: { bg: '#f6ffed', text: '#22c55e', border: '#b7eb8f' },
  warning: { bg: '#fffbe6', text: '#faad14', border: '#ffe58f' },
  error: { bg: '#fff1f0', text: '#ef4444', border: '#ffa39e' },
};

/**
 * Apollo (Pure HTML/CSS) implementation of the Tag component.
 *
 * Provides a fully accessible, dependency-free tag implementation
 * using only native HTML elements and inline CSS.
 *
 * @param props - Tag component properties
 * @returns Pure HTML tag element
 *
 * @example
 * ```tsx
 * <ApolloTag variant="warning" icon={<AlertIcon />}>
 *   Attention Required
 * </ApolloTag>
 * ```
 */
export default function ApolloTag(props: TagProps): React.ReactElement {
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
   * Handles tag click events when clickable.
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

  // Get variant colors
  const variantKey = (variant as keyof typeof VARIANT_COLORS) || 'default';
  const colors = VARIANT_COLORS[variantKey] || VARIANT_COLORS.default;

  // Get size configuration
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Compute styles based on props
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    height: sizeConfig.height,
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    fontWeight: 500,
    lineHeight: 1,
    backgroundColor: outlined ? 'transparent' : (color || colors.bg),
    color: colors.text,
    border: bordered || outlined ? `1px solid ${colors.border}` : '1px solid transparent',
    borderRadius: RADIUS_MAP[radius] || RADIUS_MAP.md,
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
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
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

ApolloTag.displayName = 'ApolloTag';
