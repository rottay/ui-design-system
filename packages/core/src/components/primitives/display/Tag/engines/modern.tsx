/**
 * @fileoverview Tag Modern Engine - Rottay Design System
 * @description Token-driven tag with DS token inline styles only.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DS token inline styles exclusively for rendering.
 * No DaisyUI badge classes are used.
 *
 * **Implementation Details:**
 * - Inline pill styles for the container (display, border-radius, etc.)
 * - SIZE_STYLES map for size variants via CSSProperties
 * - DS token inline styles for color variants via --ds-color-*
 * - Outline variant uses transparent background with border
 *
 * @example Basic Usage
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag engine="modern" variant="success" closable>
 *   Completed
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @module ModernTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import type { TagProps } from '../Tag.types';
import { TAG_DEFAULTS } from '../Tag.types';

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
 * Maps size prop to inline CSSProperties for the tag pill.
 */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  xs: { height: 'var(--ds-tag-xs-height, 16px)', padding: 'var(--ds-tag-xs-padding, 0 4px)', fontSize: 'var(--ds-tag-xs-font-size, 11px)' },
  sm: { height: 'var(--ds-tag-sm-height, 20px)', padding: 'var(--ds-tag-sm-padding, 0 6px)', fontSize: 'var(--ds-tag-sm-font-size, 12px)' },
  md: { height: 'var(--ds-tag-md-height, var(--ds-tag-default-height, 26px))', padding: 'var(--ds-tag-md-padding, var(--ds-tag-default-padding, 0 8px))', fontSize: 'var(--ds-tag-md-font-size, var(--ds-tag-default-font-size, 12px))' },
  lg: { height: 'var(--ds-tag-lg-height, 28px)', padding: 'var(--ds-tag-lg-padding, 0 10px)', fontSize: 'var(--ds-tag-lg-font-size, 14px)' },
  xl: { height: 'var(--ds-tag-xl-height, 32px)', padding: 'var(--ds-tag-xl-padding, 0 10px)', fontSize: 'var(--ds-tag-xl-font-size, 16px)' },
};

/**
 * Maps variant prop to DS token inline styles.
 */
const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: { background: 'var(--ds-color-alpha-black-100)', color: 'var(--ds-color-text-primary)' },
  primary: { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' },
  secondary: { background: 'var(--ds-color-secondary)', color: 'var(--ds-color-text-on-primary)' },
  success: { background: 'var(--ds-color-success)', color: 'var(--ds-color-text-on-primary)' },
  warning: { background: 'var(--ds-color-warning)', color: 'var(--ds-color-text-on-primary)' },
  error: { background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)' },
};

/**
 * Maps radius prop to inline borderRadius values.
 */
const RADIUS_STYLES: Record<string, string | number> = {
  none: 'var(--ds-tag-radius-none, 0)',
  sm: 'var(--ds-tag-radius-sm, 3px)',
  md: 'var(--ds-tag-radius-md, var(--ds-tag-default-radius, var(--ds-radius-md)))',
  lg: 'var(--ds-tag-radius-lg, var(--ds-radius-lg))',
  full: 'var(--ds-tag-radius-full, 9999px)',
};

/**
 * Modern (token-driven) implementation of the Tag component.
 *
 * Uses DS token inline styles exclusively
 * for a lightweight, customizable tag implementation.
 *
 * @param props - Tag component properties
 * @returns DS token-styled tag element
 *
 * @example
 * ```tsx
 * <ModernTag variant="success" closable>
 *   Completed
 * </ModernTag>
 * ```
 */
export default function ModernTag(props: TagProps): React.ReactElement {
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

  /**
   * Handles tag click events when clickable.
   */
  const handleClick = useCallback(() => {
    if (clickable && onClick) {
      onClick();
    }
  }, [clickable, onClick]);

  // Build variant/color styles
  const variantStyles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const outlinedOverrides: React.CSSProperties = outlined
    ? { background: 'transparent', border: `1px solid ${variantStyles.background}`, color: variantStyles.background as string }
    : {};

  // Assemble all inline styles: base pill -> size -> radius -> variant -> outlined -> bordered -> clickable -> user
  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--ds-tag-icon-gap, 4px)',
    lineHeight: 'var(--ds-tag-line-height, 1)',
    fontWeight: 'var(--ds-tag-font-weight, 500)',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
    transition: 'var(--ds-tag-transition, all var(--ds-motion-normal))',
    borderRadius: RADIUS_STYLES[radius] ?? RADIUS_STYLES.md,
    ...(SIZE_STYLES[size] || SIZE_STYLES.md),
    ...variantStyles,
    ...outlinedOverrides,
    ...(color && { backgroundColor: color }),
    ...(bordered && { boxShadow: 'inset 0 0 0 var(--ds-tag-border-width, 1px) var(--ds-color-border)' }),
    ...(clickable && { cursor: 'pointer' }),
    ...style,
  };

  // Conditionally add button semantics so keyboard users can activate
  // clickable tags via Enter/Space without extra JS key handlers.
  return (
    <span
      className={className || undefined}
      style={tagStyle}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
    >
      {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}

      <span>{children}</span>

      {closable && (
        <button
          type="button"
          onClick={handleClose}
          style={{ marginLeft: 'var(--ds-tag-close-gap, 2px)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', display: 'inline-flex' }}
          aria-label="Remove tag"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
}

ModernTag.displayName = 'ModernTag';
