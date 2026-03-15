/**
 * @fileoverview Badge Classic Engine - Rottay Design System
 * @description Ant Design-based badge with animation and status support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Badge component to provide full-featured
 * badge functionality with processing animations and ribbon support.
 *
 * **Implementation Details:**
 * - Uses `antd/Badge` for core rendering
 * - Maps pulse prop to Ant Design's processing status
 * - Maps size variants to Ant Design's small/default sizes
 * - Applies variant colors via inline styles
 *
 * **Size Mapping:**
 * - `xs`, `sm` → Ant Design `small`
 * - `md`, `lg`, `xl` → Ant Design `default`
 *
 * **Position Offsets:**
 * Position prop is mapped to [x, y] offset arrays for Ant Design.
 *
 * @example Basic Usage
 * ```tsx
 * import { Badge } from '@rottay/design-system';
 *
 * <Badge engine="classic" count={5} variant="primary">
 *   <Avatar />
 * </Badge>
 * ```
 *
 * @example Processing Animation
 * ```tsx
 * <Badge engine="classic" dot pulse variant="error">
 *   <NotificationIcon />
 * </Badge>
 * ```
 *
 * @see {@link Badge} for the main component
 * @see {@link https://ant.design/components/badge} Ant Design Badge
 * @module ClassicBadge
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Badge as AntBadge } from 'antd';
import type { BadgeProps } from '../Badge.types';
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP, SIZE_MAP } from '../Badge.types';

/**
 * Formats a numeric count value for display with overflow handling.
 * @param count - The count value to format
 * @param max - Maximum value before showing overflow
 * @returns The formatted count or undefined
 */
function formatCount(count: number | string | undefined, max: number): number | string | undefined {
  if (count === undefined) return undefined;
  if (typeof count === 'string') return count;
  return count > max ? max : count;
}

/**
 * Classic (Ant Design) implementation of the Badge component.
 *
 * This engine provides the full feature set of Ant Design's Badge component,
 * including animation support, status indicators, and ribbon variants.
 * It maps the design system's unified prop interface to Ant Design's API.
 *
 * @component
 * @example
 * // Basic usage with count
 * <ClassicBadge count={5} variant="primary">
 *   <Avatar />
 * </ClassicBadge>
 *
 * @example
 * // Dot indicator with pulse animation
 * <ClassicBadge dot pulse variant="error">
 *   <NotificationIcon />
 * </ClassicBadge>
 *
 * @param props - Badge component props
 * @returns React element with Ant Design Badge
 */
export default function ClassicBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    variant = BADGE_DEFAULTS.variant,
    size = BADGE_DEFAULTS.size,
    pulse,
    position = BADGE_DEFAULTS.position,
    icon,
    closable,
    onClose,
    clickable,
    onClick,
    bordered,
    className,
    style,
  } = props;

  // Determine display value (content takes precedence)
  const displayValue = content !== undefined ? content : count;

  // Map variant to Ant Design color
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  // Map size to Ant Design size prop
  const antSize = size === 'sm' || size === 'xs' ? 'small' : 'default';

  /**
   * Position offset mapping for badge placement.
   * Ant Design uses [x, y] offset from default position.
   */
  const offsetMap: Record<string, [number, number]> = {
    'top-right': [0, 0],
    'top-left': [-100, 0],
    'bottom-right': [0, 100],
    'bottom-left': [-100, 100],
  };
  const offset = offsetMap[position!] || [0, 0];

  /**
   * Handles badge click events with propagation control.
   * @param e - Mouse event
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  // Build custom style object
  const badgeStyle: React.CSSProperties = {
    cursor: clickable || onClick ? 'pointer' : undefined,
    ...style,
  };

  // Map pulse to Ant Design processing status
  const status = pulse ? 'processing' : undefined;

  // Handle standalone badge (no children, no count)
  if (!children && displayValue === undefined && !dot) {
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;

    const standaloneStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      color: 'var(--ds-badge-text-color, #fff)',
      borderRadius: 'var(--ds-badge-border-radius, 10px)',
      padding: 'var(--ds-badge-padding, 0 8px)',
      fontSize: sizeValues.fontSize,
      height: sizeValues.height,
      minWidth: sizeValues.minWidth,
      fontWeight: 500,
      border: bordered ? 'var(--ds-badge-border-width, 2px) solid var(--ds-badge-border-color, #fff)' : undefined,
      boxShadow: bordered ? `0 0 0 1px ${color}` : undefined,
      cursor: clickable || onClick ? 'pointer' : undefined,
      transition: 'var(--ds-badge-transition, all 0.2s ease-in-out)',
      ...style,
    };

    return (
      <span
        className={className}
        style={standaloneStyle}
        onClick={clickable || onClick ? handleClick : undefined}
      >
        {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
        {props.children}
        {closable && (
          <span
            style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.7 }}
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            aria-label="Close badge"
          >
            x
          </span>
        )}
      </span>
    );
  }

  // Render standard Ant Design Badge
  return (
    <AntBadge
      count={typeof displayValue === 'string' ? displayValue : formatCount(displayValue as number, max!)}
      dot={dot}
      color={color}
      size={antSize}
      showZero={showZero}
      overflowCount={max}
      offset={offset}
      status={status}
      className={className}
      style={badgeStyle}
      onClick={clickable || onClick ? handleClick : undefined}
    >
      {children}
    </AntBadge>
  );
}

ClassicBadge.displayName = 'ClassicBadge';
