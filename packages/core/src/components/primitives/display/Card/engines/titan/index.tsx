/**
 * Card - Titan Engine (Ant Design)
 */

import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps } from '../types';
import { CARD_DEFAULTS, PADDING_MAP } from '../types';

export default function TitanCard(props: CardProps): React.ReactElement {
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

  const bordered = variant === 'outlined';
  const bodyStyle = {
    padding: PADDING_MAP[padding!],
    ...(variant === 'filled' && { backgroundColor: '#fafafa' }),
  };

  const cardTitle = subtitle ? (
    <div>
      <div>{title}</div>
      <div style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 'normal' }}>
        {subtitle}
      </div>
    </div>
  ) : (
    title
  );

  return (
    <AntCard
      title={cardTitle}
      bordered={bordered}
      hoverable={hoverable}
      onClick={onClick}
      bodyStyle={bodyStyle}
      className={className}
      style={{
        ...(variant === 'elevated' && {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        }),
        ...style,
      }}
    >
      {children}
    </AntCard>
  );
}
