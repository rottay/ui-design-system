/**
 * Card - Apollo Engine (Pure HTML/CSS)
 */

import React from 'react';
import type { CardProps } from '../types';
import { CARD_DEFAULTS, PADDING_MAP } from '../types';

export default function ApolloCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    subtitle,
    variant = CARD_DEFAULTS.variant,
    hoverable = CARD_DEFAULTS.hoverable,
    padding = CARD_DEFAULTS.padding,
    onClick,
    className,
    style,
  } = props;

  const paddingValue = PADDING_MAP[padding!];

  const variantStyles: Record<string, React.CSSProperties> = {
    elevated: {
      backgroundColor: '#fff',
      border: 'none',
      boxShadow:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    outlined: {
      backgroundColor: '#fff',
      border: '1px solid var(--color-neutral-200, #e5e5e5)',
      boxShadow: 'none',
    },
    filled: {
      backgroundColor: 'var(--color-neutral-100, #f5f5f5)',
      border: 'none',
      boxShadow: 'none',
    },
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '8px',
    overflow: 'hidden',
    transition: hoverable ? 'box-shadow 0.3s ease' : undefined,
    cursor: onClick ? 'pointer' : undefined,
    ...variantStyles[variant!],
    ...style,
  };

  const hoverStyle: React.CSSProperties = hoverable
    ? {
        boxShadow:
          '0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.05), 0 4px 8px 0 rgba(0, 0, 0, 0.05)',
      }
    : {};

  const [isHovered, setIsHovered] = React.useState(false);

  const finalStyle = isHovered ? { ...cardStyle, ...hoverStyle } : cardStyle;

  return (
    <div
      className={className}
      style={finalStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(title || subtitle) && (
        <div style={{ padding: paddingValue, borderBottom: '1px solid var(--color-neutral-200, #e5e5e5)' }}>
          {title && (
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: subtitle ? '4px' : 0 }}>
              {title}
            </div>
          )}
          {subtitle && (
            <div style={{ fontSize: '14px', color: 'var(--color-neutral-500, #8c8c8c)' }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: paddingValue }}>{children}</div>
    </div>
  );
}
