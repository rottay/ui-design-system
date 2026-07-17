/**
 * @fileoverview Card Classic Engine - Rottay Design System
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
 * <Card engine="classic" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 * ```
 *
 * @example With Cover and Actions
 * ```tsx
 * <Card
 *   engine="classic"
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
 * @module ClassicCard
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useId } from 'react';
import { Card as AntCard, Skeleton } from 'antd';
import type { CardProps } from '../../contracts';
import { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from '../../contracts';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '@/infrastructure/runtime/responsive/runtime/style-properties';

/**
 * Classic engine Card component using Ant Design.
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
 * // Basic card with Classic engine
 * <Card engine="classic" title="Card Title">
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Card with cover and actions
 * <Card
 *   engine="classic"
 *   title="Product"
 *   cover="/product.jpg"
 *   actions={[<Button>Buy</Button>]}
 * >
 *   <p>Product description</p>
 * </Card>
 *
 * @param {CardProps} props - Component properties
 * @returns {React.ReactElement} The rendered Classic Card component
 */
export default function ClassicCard(props: CardProps): React.ReactElement {
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
    padding: paddingProp = CARD_DEFAULTS.padding,
    divider,
    onClick,
    className = '',
    style,
  } = props;

  // Responsive padding handling
  const reactId = useId();
  const responsiveEntries: ResponsivePropEntry<any>[] = [];
  const paddingIsResponsive = isResponsiveValue(paddingProp);

  if (paddingIsResponsive) {
    responsiveEntries.push({
      cssProperty: 'padding',
      value: paddingProp,
      resolve: (v: string) => `${PADDING_MAP[v] || PADDING_MAP.md} !important`,
    } as ResponsivePropEntry<any>);
  }

  const needsResponsiveCSS = responsiveEntries.length > 0;
  const elementId = needsResponsiveCSS ? `card-${reactId.replace(/:/g, '')}` : '';
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const padding = paddingIsResponsive ? CARD_DEFAULTS.padding : (paddingProp as string);

  // AntD 5.x replaced the `bordered` boolean with a `variant` prop.
  // We pass `undefined` (the AntD default, which renders borders) when our DS
  // variant is "outlined" or the consumer explicitly wants a border; otherwise
  // we opt into "borderless" so elevated/filled/ghost cards stay clean.
  const antVariant = (variant === 'outlined' || bordered) ? undefined : 'borderless';

  // Color variants (e.g. "info", "success") add a tinted left border + bg.
  // We resolve once here so the same object is reused in both the style
  // spread and the hasColorVariant guard below.
  const colorStyles = COLOR_VARIANT_MAP[colorVariant] || COLOR_VARIANT_MAP.default;
  const hasColorVariant = colorVariant && colorVariant !== 'default';

  // Body padding is consumer-configurable; the "filled" variant also needs a
  // subtle neutral background since AntD does not provide one by default.
  const bodyStyle: React.CSSProperties = {
    padding: PADDING_MAP[padding] || PADDING_MAP.md,
    ...(variant === 'filled' && { backgroundColor: 'var(--ds-color-neutral-50, #fafafa)' }),
  };

  // AntD Card accepts a single `title` ReactNode. When a description is also
  // provided we compose both into a stacked layout so the subtitle sits
  // directly beneath the title without needing AntD's Meta sub-component.
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

  // Elevated cards need a visible drop-shadow to communicate depth;
  // ghost cards explicitly suppress both shadow and background so they
  // blend into any container. Other variants inherit AntD defaults.
  const shadowStyle = variant === 'elevated' || shadowed
    ? { boxShadow: SHADOW_MAP.md }
    : variant === 'ghost'
    ? { boxShadow: 'none', backgroundColor: 'transparent' }
    : {};

  // AntD expects a full ReactElement for its `cover` prop, not a URL string.
  // We convert the URL here so consumers can pass a simple string instead.
  const coverElement = cover ? (
    <img
      alt={typeof title === 'string' ? title : 'Card cover'}
      src={cover}
      style={{ width: '100%', objectFit: 'cover' }}
    />
  ) : undefined;

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      <AntCard
        title={cardTitle}
        extra={extra}
        cover={coverElement}
        actions={actions}
        variant={antVariant}
        hoverable={hoverable || clickable}
        loading={loading}
        onClick={onClick}
        className={`rottay-card rottay-card--classic ${className}`}
        styles={{
          body: bodyStyle,
          // By default we hide the header divider to match the DS spec;
          // it only appears when the consumer explicitly sets `divider`.
          header: divider ? undefined : { borderBottom: 'none' },
        }}
        style={{
          borderRadius: RADIUS_MAP[radius] || RADIUS_MAP.md,
          cursor: clickable || onClick ? 'pointer' : undefined,
          ...shadowStyle,
          // Color variant tints the whole card frame; tenants can override
          // this without inheriting hard-coded side rails.
          ...(hasColorVariant && {
            borderColor: colorStyles.borderColor,
            backgroundColor: colorStyles.background,
          }),
          ...style,
        }}
        {...(responsive ? responsive.attrs : {})}
      >
        {/* When loading we render AntD Skeleton instead of children so the card
            maintains its approximate dimensions while content is being fetched. */}
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          children
        )}
      </AntCard>
    </>
  );
}

ClassicCard.displayName = 'ClassicCard';
