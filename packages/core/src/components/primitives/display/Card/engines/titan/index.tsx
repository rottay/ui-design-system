/**
 * @fileoverview Card - Titan Engine Implementation
 * @description Ant Design-based implementation of the Card component.
 * Leverages Ant Design's Card component while maintaining consistent API.
 *
 * @module Card/engines/titan
 * @package @es-rottay/designsystem-core
 */

'use client';

import React from 'react';
import { Card as AntCard, Skeleton } from 'antd';
import type { CardProps } from '../../types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from '../../types';

/**
 * Titan engine Card component using Ant Design.
 * Provides a feature-rich card implementation with built-in loading states,
 * cover images, and action slots.
 *
 * Features:
 * - Native Ant Design Card integration
 * - Built-in skeleton loading state
 * - Cover image support
 * - Header with title, description, and extra content
 * - Action slot for buttons/links
 * - Multiple visual variants
 *
 * @component
 * @example
 * // Basic card with Titan engine
 * <Card engine="titan" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Card with cover and actions
 * <Card
 *   engine="titan"
 *   title="Product"
 *   cover="/product.jpg"
 *   actions={[<Button>Buy</Button>]}
 * >
 *   <p>Product description</p>
 * </Card>
 *
 * @param {CardProps} props - Component properties
 * @returns {React.ReactElement} The rendered Titan Card component
 */
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

  // Build shadow style based on variant
  const shadowStyle = variant === 'elevated' || shadowed
    ? { boxShadow: SHADOW_MAP.md }
    : variant === 'ghost'
    ? { boxShadow: 'none', backgroundColor: 'transparent' }
    : {};

  // Build cover element if cover URL is provided
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
