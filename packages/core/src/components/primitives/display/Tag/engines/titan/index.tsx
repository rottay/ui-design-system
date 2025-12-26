/**
 * Tag - Titan Engine (Ant Design)
 *
 * @module Tag/engines/titan
 * @description Implements the Tag component using Ant Design's Tag component.
 * This engine provides full-featured tags with seamless Ant Design integration.
 */

'use client';

import React, { useCallback } from 'react';
import { Tag as AntTag } from 'antd';
import type { TagProps } from '../../types';
import { TAG_DEFAULTS } from '../../types';

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
 * Titan (Ant Design) implementation of the Tag component.
 *
 * Leverages Ant Design's Tag component while maintaining
 * the design system's API consistency.
 *
 * @param props - Tag component properties
 * @returns Ant Design Tag element
 *
 * @example
 * ```tsx
 * <TitanTag variant="primary" closable>
 *   Premium Feature
 * </TitanTag>
 * ```
 */
export default function TitanTag(props: TagProps): React.ReactElement {
  const {
    size = TAG_DEFAULTS.size,
    variant = TAG_DEFAULTS.variant,
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

  // Map variant to Ant Design color
  const antColor = color || VARIANT_TO_ANT_COLOR[variant];

  // Build additional styles
  const tagStyle: React.CSSProperties = {
    cursor: clickable ? 'pointer' : undefined,
    borderRadius: radius === 'full' ? '9999px' : undefined,
    ...style,
  };

  // Build class names
  const classNames = [
    'rottay-tag',
    `rottay-tag--${size}`,
    `rottay-tag--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

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

TitanTag.displayName = 'TitanTag';
