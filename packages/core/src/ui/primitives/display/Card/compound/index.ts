/**
 * @fileoverview Card Compound Components - Rottay Design System
 * @description Compound components for structured Card layouts.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports compound components that work together to create
 * structured card layouts with consistent spacing and styling.
 *
 * **CardHeader:**
 * Title area with optional subtitle, avatar, and extra content.
 *
 * **CardBody:**
 * Main content area with configurable padding.
 *
 * **CardFooter:**
 * Action area with buttons and flexible alignment.
 *
 * **CardImage:**
 * Cover image with overlay and gradient support.
 *
 * @example Structured Card
 * ```tsx
 * <Card>
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>Content goes here</Card.Body>
 *   <Card.Footer actions={[<Button>Action</Button>]} />
 * </Card>
 * ```
 *
 * @example Card with Image
 * ```tsx
 * <Card>
 *   <Card.Image src="/cover.jpg" overlay gradient />
 *   <Card.Body>Content with cover image</Card.Body>
 * </Card>
 * ```
 *
 * @see {@link Card} for the main component
 * @module CardCompound
 * @category Display
 * @package @rottay/design-system
 */

export { CardHeader } from './Header';
export { CardBody } from './Body';
export { CardFooter } from './Footer';
export { CardImage } from './Image';

export type { CardHeaderProps } from './Header';
export type { CardBodyProps } from './Body';
export type { CardFooterProps } from './Footer';
export type { CardImageProps } from '../contracts';
