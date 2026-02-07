'use client';

/**
 * @fileoverview Card - Rottay Design System
 * @description Container component for grouping related content and actions.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Card component provides a flexible container for displaying content
 * with optional header, body, footer, and cover image sections.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Ant Design Card with skeleton loading
 * - **Modern**: DaisyUI card classes with Tailwind utilities
 * - **Rustic**: Pure CSS implementation with zero dependencies
 *
 * **Key Features:**
 * - Multiple variants (elevated, outlined, filled, ghost)
 * - Configurable padding, radius, and shadow
 * - Cover image with top/bottom positioning
 * - Loading state with skeleton/spinner
 * - Hoverable and clickable interactions
 * - Action slots for buttons
 *
 * **Compound Components:**
 * - `Card.Header` - Title, subtitle, and extra content
 * - `Card.Body` - Main content area
 * - `Card.Footer` - Actions and alignment options
 * - `Card.Image` - Cover image with overlay support
 *
 * **CSS Custom Properties:**
 * - `--card-{variant}-bg` - Background color per variant
 * - `--card-{size}-padding` - Content padding
 * - `--card-{size}-shadow` - Shadow elevation
 * - `--card-border-default` - Border color
 *
 * @example Basic Card
 * ```tsx
 * import { Card } from '@rottay/design-system';
 *
 * <Card variant="elevated" padding="md">
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>
 *     <p>Card content goes here</p>
 *   </Card.Body>
 *   <Card.Footer actions={[<Button>Action</Button>]} />
 * </Card>
 * ```
 *
 * @example Clickable Card
 * ```tsx
 * <Card hoverable clickable onClick={handleClick}>
 *   <Card.Body>Click me!</Card.Body>
 * </Card>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * <Card engine="modern" variant="outlined">
 *   <p>DaisyUI styled card</p>
 * </Card>
 * ```
 *
 * @see {@link CardProps} for available props
 * @see {@link CardHeader} for header configuration
 * @see {@link CardBody} for body configuration
 * @module Card
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { CardProps } from './types';
import { CardHeader, CardBody, CardFooter, CardImage } from './compound';

// Export types
export type {
  CardProps,
  CardVariant,
  CardColorVariant,
  CardSize,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardImageProps,
} from './types';

export { CARD_DEFAULTS, PADDING_MAP, SHADOW_MAP, RADIUS_MAP, COLOR_VARIANT_MAP } from './types';

// Export compound components
export { CardHeader, CardBody, CardFooter, CardImage };

// Export base component

/**
 * Card component with engine-aware routing.
 *
 * The Card component automatically selects the appropriate rendering engine
 * (Classic, Modern, or Rustic) based on the application's EngineProvider context
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
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
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
