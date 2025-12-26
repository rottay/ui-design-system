/**
 * Card - Titan Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Card as AntCard, Skeleton } from 'antd';
import type { CardProps } from '../../types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from '../../types';

export default function TitanCard(props: CardProps): React.ReactElement {
  const {
    children,
    title,
    description,
    cover,
    extra,
    actions,
    variant = CARD_DEFAULTS.variant,
    size: _size = CARD_DEFAULTS.size,
    hoverable = CARD_DEFAULTS.hoverable,
    clickable = CARD_DEFAULTS.clickable,
    loading = CARD_DEFAULTS.loading,
    bordered = CARD_DEFAULTS.bordered,
    shadowed,
    radius = CARD_DEFAULTS.radius,
    padding = CARD_DEFAULTS.padding,
    divider,
    onClick,
    className = '',
    style,
  } = props;

  // Determine border based on variant
  const showBorder = variant === 'outlined' || bordered;

  // Build body style
  const bodyStyle: React.CSSProperties = {
    padding: PADDING_MAP[padding] || PADDING_MAP.md,
    ...(variant === 'filled' && { backgroundColor: '#fafafa' }),
  };

  // Build card title with description
  const cardTitle = description ? (
    <div>
      <div>{title}</div>
      <div style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 'normal' }}>
        {description}
      </div>
    </div>
  ) : (
    title
  );

  // Build shadow style
  const shadowStyle = variant === 'elevated' || shadowed
    ? { boxShadow: SHADOW_MAP.md }
    : variant === 'ghost'
    ? { boxShadow: 'none', backgroundColor: 'transparent' }
    : {};

  // Build cover element
  const coverElement = cover ? (
    <img
      alt={typeof title === 'string' ? title : 'Card cover'}
      src={cover}
      style={{ width: '100%', objectFit: 'cover' }}
    />
  ) : undefined;

  return (
    <AntCard
      title={cardTitle}
      extra={extra}
      cover={coverElement}
      actions={actions}
      bordered={showBorder}
      hoverable={hoverable || clickable}
      loading={loading}
      onClick={onClick}
      className={`rottay-card rottay-card--titan ${className}`}
      styles={{
        body: bodyStyle,
        header: divider ? undefined : { borderBottom: 'none' },
      }}
      style={{
        borderRadius: RADIUS_MAP[radius] || RADIUS_MAP.md,
        cursor: clickable || onClick ? 'pointer' : undefined,
        ...shadowStyle,
        ...style,
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        children
      )}
    </AntCard>
  );
}

TitanCard.displayName = 'TitanCard';
