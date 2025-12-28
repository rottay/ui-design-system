/**
 * @fileoverview Tag Hermes Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based tag with badge classes.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's badge component classes with Tailwind utilities
 * for lightweight, utility-first tag rendering.
 *
 * **Implementation Details:**
 * - Uses DaisyUI `badge` class for container
 * - Uses `badge-{size}` for size variants
 * - Uses `badge-{variant}` for color variants
 * - Uses `badge-outline` for outlined style
 *
 * **Class Mappings:**
 * - `badge-primary`, `badge-secondary`, etc. for variants
 * - `badge-xs`, `badge-sm`, `badge-md`, `badge-lg` for sizes
 * - `rounded-*` for border radius
 *
 * @example Basic Usage
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag engine="hermes" variant="success" closable>
 *   Completed
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @see {@link https://daisyui.com/components/badge/} DaisyUI Badge
 * @module HermesTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import type { TagProps } from '../../types';
import { TAG_DEFAULTS } from '../../types';

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
 * Maps size prop to DaisyUI badge size classes.
 */
const SIZE_CLASSES: Record<string, string> = {
  xs: 'badge-xs text-xs',
  sm: 'badge-sm text-xs',
  md: 'badge-md text-sm',
  lg: 'badge-lg text-base',
  xl: 'badge-lg text-lg',
};

/**
 * Maps variant prop to DaisyUI badge color classes.
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: 'badge-ghost',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

/**
 * Maps radius prop to Tailwind border-radius classes.
 */
const RADIUS_CLASSES: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Hermes (DaisyUI/Tailwind) implementation of the Tag component.
 *
 * Uses DaisyUI's badge component with Tailwind utility classes
 * for a lightweight, customizable tag implementation.
 *
 * @param props - Tag component properties
 * @returns DaisyUI badge element
 *
 * @example
 * ```tsx
 * <HermesTag variant="success" closable>
 *   Completed
 * </HermesTag>
 * ```
 */
export default function HermesTag(props: TagProps): React.ReactElement {
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

  // Build class list
  const classNames = [
    'badge',
    'inline-flex',
    'items-center',
    'gap-1',
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.default,
    outlined && 'badge-outline',
    RADIUS_CLASSES[radius] || RADIUS_CLASSES.md,
    bordered && 'ring-1 ring-base-300',
    clickable && 'cursor-pointer hover:opacity-80 active:scale-95',
    'transition-all duration-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build custom styles
  const tagStyle: React.CSSProperties = {
    ...(color && { backgroundColor: color }),
    ...style,
  };

  return (
    <span
      className={classNames}
      style={tagStyle}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}

      <span>{children}</span>

      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className="ml-0.5 hover:opacity-70 focus:outline-none"
          aria-label="Remove tag"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  );
}

HermesTag.displayName = 'HermesTag';
