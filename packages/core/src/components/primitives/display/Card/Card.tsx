'use client';

/**
 * @fileoverview Card - Container for grouping related content and actions.
 * Provides Header, Body, Footer, and Image compound sub-components for
 * structured layouts with configurable variants, padding, and interactions.
 *
 * @example
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card variant="elevated" padding="md">
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>Content here</Card.Body>
 *   <Card.Footer actions={[<Button>Save</Button>]} />
 * </Card>
 * ```
 *
 * @module Card
 * @category Display
 */

import { createElement, forwardRef } from 'react';

import { createEngineComponent } from '../../../../engines/factory';
import { useOptionalTokens } from '../../../../hooks';
import {
  mergePersonalityStyle,
  resolveCardPersonalityDefaults,
} from '../../../../personality/primitives';
import type { CardProps } from './Card.types';
import { CardHeader, CardBody, CardFooter, CardImage } from './compound';

export type {
  CardProps,
  CardVariant,
  CardColorVariant,
  CardSize,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardImageProps,
} from './Card.types';

export { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from './Card.types';

export { CardHeader, CardBody, CardFooter, CardImage };

/** Engine-routed base -- consumers use the public `Card` export below. */
const CardBase = createEngineComponent<CardProps>('Card', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  });

/**
 * Personality wrapper for Card.
 *
 * Resolves structural defaults (border, hover, padding) from the tenant's
 * personality tokens so every Card in the app shares a consistent feel
 * without explicit overrides. Explicit props always win over defaults.
 */
const CardComponent = forwardRef<any, CardProps>((props, ref) => {
  const tokens = useOptionalTokens();
  const defaults = tokens ? resolveCardPersonalityDefaults(tokens) : null;
  const {
    padding,
    bordered,
    hoverable,
    style,
    ...rest
  } = props;

  return createElement(CardBase, {
    ref,
    ...rest,
    // Personality defaults stay opt-in: explicit props from consumers always win.
    padding: padding ?? defaults?.padding,
    bordered: bordered ?? defaults?.bordered,
    hoverable: hoverable ?? defaults?.hoverable,
    style: mergePersonalityStyle(style, undefined),
  });
});

CardComponent.displayName = 'Card';

/**
 * Public Card with compound sub-components attached.
 * Each sub-component handles a discrete section of the card layout.
 */
export const Card = Object.assign(
  CardComponent,
  {
    /** Title area with optional subtitle, avatar, and extra content slot. */
    Header: CardHeader,
    /** Primary content region with configurable internal padding. */
    Body: CardBody,
    /** Bottom section for actions, typically buttons with alignment options. */
    Footer: CardFooter,
    /** Cover image with optional gradient overlay and positioning. */
    Image: CardImage,
  }
);
