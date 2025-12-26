/**
 * Card - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CardProps } from './types';
import { CardHeader, CardBody, CardFooter, CardImage } from './compound';

// Export types
export type { CardProps, CardVariant, CardSize, CardHeaderProps, CardBodyProps, CardFooterProps, CardImageProps } from './types';
export { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP } from './types';

// Export compound components
export { CardHeader, CardBody, CardFooter, CardImage };

// Export base component
export { BaseCard } from './base';

// Create engine-aware Card component with compound components attached
export const Card = Object.assign(
  createEngineComponent<CardProps>('Card', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
    Image: CardImage,
  }
);
