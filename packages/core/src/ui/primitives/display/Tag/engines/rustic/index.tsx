/**
 * @fileoverview Tag Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS tag implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free tag using semantic HTML,
 * structural inline layout, and the unlayered rustic skin.
 *
 * **Implementation Details:**
 * - Paint and interaction states live in the unlayered rustic skin
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
 * <Tag engine="rustic" variant="warning" icon={<AlertIcon />}>
 *   Attention
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @see {@link BaseTag} for CSS variable implementation
 * @module RusticTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import type { TagProps } from '../../contracts';
import { TAG_DEFAULTS, SIZE_MAP, TONE_TO_TAG_VARIANT } from '../../contracts';

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
 * Rustic (Pure HTML/CSS) implementation of the Tag component.
 *
 * Provides a fully accessible, dependency-free tag implementation using native
 * HTML, structural inline layout, and the unlayered rustic skin for paint.
 *
 * @param props - Tag component properties
 * @returns Pure HTML tag element
 *
 * @example
 * ```tsx
 * <RusticTag variant="warning" icon={<AlertIcon />}>
 *   Attention Required
 * </RusticTag>
 * ```
 */
export default function RusticTag(props: TagProps): React.ReactElement {
  const {
    size = TAG_DEFAULTS.size,
    tone,
    variant: variantProp = TAG_DEFAULTS.variant,
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

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_COLORS
  // below is keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_TAG_VARIANT[tone] : variantProp;

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

  // Size tokens (height, padding, fontSize) come from the shared SIZE_MAP
  // defined in Tag.types so all three engines share identical sizing.
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // The `color` prop is an arbitrary caller string, so it cannot be enumerated as a
  // CSS rule; it rides a custom property that tag.css's resting-fill rules read with
  // the variant's own token as the fallback. Outlined never reads it.
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
    cursor: clickable ? 'pointer' : 'default',
    transition: 'var(--ds-tag-transition, all 0.2s ease-in-out)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...(color ? ({ '--ds-tag-custom-bg': color } as React.CSSProperties) : {}),
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
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s ease-in-out',
  };

  // BEM-style class names are emitted so consumers can hook into them for global
  // overrides. `rottay-tag--rustic` is the engine anchor tag.css keys its rules on:
  // bare `rottay-tag` is shared with the classic engine and is painted by tenant
  // artifacts, so no rule here may rest on it alone.
  const classNames = [
    'rottay-tag',
    'rottay-tag--rustic',
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
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      data-outlined={outlined ? 'true' : undefined}
      data-bordered={bordered ? 'true' : undefined}
      data-clickable={clickable ? 'true' : undefined}
      style={containerStyle}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
    >
      {icon && (
        <span className="rottay-tag__icon" data-part="icon" style={iconStyle}>
          {icon}
        </span>
      )}

      <span className="rottay-tag__content" data-part="content">{children}</span>

      {closable && (
        <button
          type="button"
          className="rottay-tag__close"
          data-part="close"
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

RusticTag.displayName = 'RusticTag';
