/**
 * @fileoverview Card Component - Engine Router
 * @description Main entry point for the Card component with engine-aware routing.
 * Automatically selects the appropriate engine implementation based on context or props.
 *
 * @module Card
 * @package @es-rottay/designsystem-core
 *
 * @example
 * // Basic usage (uses default engine from context)
 * import { Card } from '@es-rottay/designsystem-core';
 *
 * <Card variant="elevated" padding="md">
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>
 *     <p>Card content goes here</p>
 *   </Card.Body>
 *   <Card.Footer actions={[<Button>Action</Button>]} />
 * </Card>
 *
 * @example
 * // With specific engine override
 * <Card engine="hermes" hoverable clickable>
 *   <p>Hermes-styled card</p>
 * </Card>
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CardProps } from './types';
import { CardHeader, CardBody, CardFooter, CardImage } from './compound';

// Export types
export type {
  CardProps,
  CardVariant,
  CardSize,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardImageProps,
} from './types';

export { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from './types';

// Export compound components
export { CardHeader, CardBody, CardFooter, CardImage };

// Export base component
export { BaseCard } from './base';

/**
 * Card component with engine-aware routing.
 *
 * The Card component automatically selects the appropriate rendering engine
 * (Titan, Hermes, or Apollo) based on the application's EngineProvider context
 * or an explicit `engine` prop.
 *
 * Available compound components:
 * - `Card.Header` - Header section with title, subtitle, avatar, and extra content
 * - `Card.Body` - Main content area with configurable padding
 * - `Card.Footer` - Footer section with actions and alignment options
 * - `Card.Image` - Image section with overlay and gradient support
 *
 * @component
 * @see {@link CardHeader} for header configuration
 * @see {@link CardBody} for body configuration
 * @see {@link CardFooter} for footer configuration
 * @see {@link CardImage} for image configuration
 */
export const Card = Object.assign(
  createEngineComponent<CardProps>('Card', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Header compound component for card title area */
    Header: CardHeader,
    /** Body compound component for main content */
    Body: CardBody,
    /** Footer compound component for actions */
    Footer: CardFooter,
    /** Image compound component for media content */
    Image: CardImage,
  }
);
