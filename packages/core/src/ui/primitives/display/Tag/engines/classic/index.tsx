/**
 * @fileoverview Tag Classic Engine - Rottay Design System
 * @description Ant Design-based tag with preset color support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Tag component to provide full-featured
 * tag functionality with built-in color presets.
 *
 * **Implementation Details:**
 * - Uses `antd/Tag` for core rendering
 * - Maps variants to Ant Design color presets
 * - Supports built-in close functionality
 * - Handles icon placement
 *
 * **Variant Mapping:**
 * - `primary` → Ant Design `blue`
 * - `secondary` → Ant Design `purple`
 * - `success` → Ant Design `success`
 * - `warning` → Ant Design `warning`
 * - `error` → Ant Design `error`
 *
 * @example Basic Usage
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag engine="classic" variant="primary" closable>
 *   Premium
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @see {@link https://ant.design/components/tag} Ant Design Tag
 * @module ClassicTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import { Tag as AntTag } from 'antd';
import type { TagProps } from '../../contracts';
import { TAG_DEFAULTS, TONE_TO_TAG_VARIANT } from '../../contracts';

/**
 * Maps design system variants to Ant Design color presets.
 */
const VARIANT_TO_ANT_COLOR: Record<string, string | undefined> = {
  default: undefined,
  primary: 'blue',
  secondary: 'purple',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

/**
 * Classic (Ant Design) implementation of the Tag component.
 *
 * Leverages Ant Design's Tag component while maintaining
 * the design system's API consistency.
 *
 * @param props - Tag component properties
 * @returns Ant Design Tag element
 *
 * @example
 * ```tsx
 * <ClassicTag variant="primary" closable>
 *   Premium Feature
 * </ClassicTag>
 * ```
 */
export default function ClassicTag(props: TagProps): React.ReactElement {
  const {
    size = TAG_DEFAULTS.size,
    tone,
    variant: variantProp = TAG_DEFAULTS.variant,
    closable = TAG_DEFAULTS.closable,
    onClose,
    icon,
    children,
    bordered = TAG_DEFAULTS.bordered,
    radius,
    color,
    outlined = TAG_DEFAULTS.outlined,
    clickable = TAG_DEFAULTS.clickable,
    onClick,
    className = '',
    style = {},
    ...restProps
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_TO_ANT_COLOR
  // below is keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_TAG_VARIANT[tone] : variantProp;

  /**
   * Handles close events with proper callback invocation.
   */
  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClose?.();
    },
    [onClose]
  );

  /**
   * Handles click events when tag is clickable.
   */
  const handleClick = useCallback(() => {
    if (clickable && onClick) {
      onClick();
    }
  }, [clickable, onClick]);

  // Explicit color prop takes precedence over variant-based mapping,
  // allowing consumers to use custom Ant Design color presets or hex values.
  const antColor = color || VARIANT_TO_ANT_COLOR[variant];

  // Radius uses CSS variables so the design token layer can override defaults.
  // 'full' maps to 9999px for pill-shaped tags.
  const tagStyle: React.CSSProperties = {
    cursor: clickable ? 'pointer' : undefined,
    borderRadius: radius === 'full' ? 'var(--ds-tag-radius-full, 9999px)' :
                  radius ? `var(--ds-tag-radius-${radius})` : undefined,
    transition: 'var(--ds-tag-transition)',
    ...style,
  };

  // BEM-style class names enable external CSS overrides while keeping
  // the component's own styling self-contained via Ant Design.
  const classNames = [
    'rottay-tag',
    `rottay-tag--${size}`,
    `rottay-tag--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // bordered and outlined are merged into Ant's single bordered prop --
  // both DS props produce the same visual effect in the classic engine.
  return (
    <AntTag
      color={antColor}
      closable={closable}
      onClose={handleClose}
      icon={icon}
      bordered={bordered || outlined}
      className={classNames}
      style={tagStyle}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </AntTag>
  );
}

ClassicTag.displayName = 'ClassicTag';
