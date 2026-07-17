/**
 * @fileoverview Tag Modern Engine - Rottay Design System
 * @description Token-driven tag painted by the unlayered modern skin.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses the modern Tag skin for paint and DS tokens for theming.
 * No DaisyUI badge classes are used.
 *
 * **Implementation Details:**
 * - Inline pill styles for the container (display, border-radius, etc.)
 * - SIZE_STYLES map for size variants via CSSProperties
 * - Skin-owned color variants via --ds-color-* custom properties
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
import type { TagProps } from '../../contracts';
import { TAG_DEFAULTS, TONE_TO_TAG_VARIANT } from '../../contracts';

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
 * Modern (token-driven) implementation of the Tag component.
 *
 * Uses the token-driven modern skin for a lightweight, customizable tag
 * implementation.
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

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_STYLES
  // below is keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_TAG_VARIANT[tone] : variantProp;

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

  // The `color` prop is an arbitrary caller string, so it cannot be enumerated as a
  // CSS rule; it rides a custom property that every resting-fill rule in tag.css
  // reads with the variant's own token as the fallback.
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
    ...(SIZE_STYLES[size] || SIZE_STYLES.md),
    ...(color ? ({ '--ds-tag-custom-bg': color } as React.CSSProperties) : {}),
    ...(clickable && { cursor: 'pointer' }),
    ...style,
  };

  // Conditionally add button semantics so keyboard users can activate
  // clickable tags via Enter/Space without extra JS key handlers.
  return (
    <span
      className={`rottay-tag-shell rottay-tag-shell--modern ${className}`.trim()}
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      data-outlined={outlined ? 'true' : undefined}
      data-bordered={bordered ? 'true' : undefined}
      data-clickable={clickable ? 'true' : undefined}
      style={tagStyle}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
    >
      {icon && <span data-part="icon" style={{ flexShrink: 0 }}>{icon}</span>}

      <span data-part="content">{children}</span>

      {closable && (
        <button
          type="button"
          data-part="close"
          onClick={handleClose}
          style={{ marginLeft: 'var(--ds-tag-close-gap, 2px)', padding: 0, cursor: 'pointer', display: 'inline-flex' }}
          aria-label="Remove tag"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
}

ModernTag.displayName = 'ModernTag';
