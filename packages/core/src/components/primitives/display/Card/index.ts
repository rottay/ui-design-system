/**
 * Card - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CardProps } from './types';
import { CardHeader, CardBody, CardFooter } from './compound';

export { type CardProps, type CardVariant, CARD_DEFAULTS } from './types';

// Export compound components
export { CardHeader, CardBody, CardFooter };
export type { CardHeaderProps, CardBodyProps, CardFooterProps } from './compound';

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
  }
);
