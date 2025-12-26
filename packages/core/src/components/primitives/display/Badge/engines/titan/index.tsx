/**
 * Badge - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Badge as AntBadge } from 'antd';
import type { BadgeProps } from '../../types';
import { BADGE_DEFAULTS, VARIANT_COLOR_MAP, SIZE_MAP } from '../../types';

/**
 * Format count for display
 */
function formatCount(count: number | string | undefined, max: number): number | string | undefined {
  if (count === undefined) return undefined;
  if (typeof count === 'string') return count;
  return count > max ? max : count;
}

export default function TitanBadge(props: BadgeProps): React.ReactElement {
  const {
    children,
    content,
    count,
    dot = BADGE_DEFAULTS.dot,
    showZero = BADGE_DEFAULTS.showZero,
    max = BADGE_DEFAULTS.overflowCount,
    variant = BADGE_DEFAULTS.variant,
    size = BADGE_DEFAULTS.size,
    // visible - handled via count/dot display logic
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

  // Get display value
  const displayValue = content !== undefined ? content : count;

  // Map variant to color
  const color = VARIANT_COLOR_MAP[variant!] || VARIANT_COLOR_MAP.default;

  // Map size to Ant size
  const antSize = size === 'sm' || size === 'xs' ? 'small' : 'default';

  // Map position to offset
  const offsetMap: Record<string, [number, number]> = {
    'top-right': [0, 0],
    'top-left': [-100, 0],
    'bottom-right': [0, 100],
    'bottom-left': [-100, 100],
  };
  const offset = offsetMap[position!] || [0, 0];

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  // Build custom styles
  const badgeStyle: React.CSSProperties = {
    cursor: clickable || onClick ? 'pointer' : undefined,
    ...style,
  };

  // Processing animation status
  const status = pulse ? 'processing' : undefined;

  // If no children and no count, render as standalone badge (like a tag)
  if (!children && displayValue === undefined && !dot) {
    const sizeValues = SIZE_MAP[size!] || SIZE_MAP.md;
    const standaloneStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      color: '#fff',
      borderRadius: '10px',
      padding: '0 8px',
      fontSize: sizeValues.fontSize,
      height: sizeValues.height,
      fontWeight: 500,
      border: bordered ? '2px solid #fff' : undefined,
      boxShadow: bordered ? `0 0 0 1px ${color}` : undefined,
      cursor: clickable || onClick ? 'pointer' : undefined,
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

  // Render Ant Badge
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

TitanBadge.displayName = 'TitanBadge';
