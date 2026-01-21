/**
 * @fileoverview Card Titan Engine - Rottay Design System
 * @description Ant Design-based card with skeleton loading support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Card component to provide full-featured
 * card functionality with built-in skeleton loading and cover support.
 *
 * **Implementation Details:**
 * - Uses `antd/Card` for core rendering
 * - Uses `antd/Skeleton` for loading state
 * - Maps variants to Ant Design border/shadow styles
 * - Supports cover images via Card's cover prop
 *
 * **Variant Mapping:**
 * - `elevated` - Card with shadow
 * - `outlined` - Bordered card
 * - `filled` - Gray background
 * - `ghost` - Transparent background
 *
 * @example Basic Usage
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card engine="titan" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 * ```
 *
 * @example With Cover and Actions
 * ```tsx
 * <Card
 *   engine="titan"
 *   title="Product"
 *   cover="/product.jpg"
 *   actions={[<Button>Buy</Button>]}
 * >
 *   <p>Product description</p>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @see {@link https://ant.design/components/card} Ant Design Card
 * @module TitanCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Card as AntCard, Skeleton } from 'antd';
import type { CardProps } from '../../types';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from '../../types';

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
    colorVariant = CARD_DEFAULTS.colorVariant,
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

  // Determine Ant Design variant based on our variant prop
  // AntD 5.x uses variant="borderless" instead of bordered={false}
  const antVariant = (variant === 'outlined' || bordered) ? undefined : 'borderless';

  // Get color variant styles
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  // Build body style
  const bodyStyle: React.CSSProperties = {
    padding: PADDING_MAP[padding] || PADDING_MAP.md,
    ...(variant === 'filled' && { backgroundColor: 'var(--ds-color-neutral-50, #fafafa)' }),
  };

  // Build card title with description
  const cardTitle = description ? (
    <div>
      <div>{title}</div>
      <div style={{ fontSize: '14px', color: 'var(--ds-card-subtitle-color, #8c8c8c)', fontWeight: 'normal' }}>
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
      variant={antVariant}
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
        // Apply color variant styles
        ...(hasColorVariant && {
          borderLeft: `4px solid ${colorStyles.borderColor}`,
          backgroundColor: colorStyles.background,
        }),
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
