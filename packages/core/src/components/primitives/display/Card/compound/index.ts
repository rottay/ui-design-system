/**
 * @fileoverview Card Compound Components
 * @description Exports all compound components for the Card component.
 * These components are designed to work together to create structured card layouts.
 *
 * @module Card/compound
 * @package @es-rottay/designsystem-core
 *
 * @example
 * // Using compound components
 * <Card>
 *   <Card.Header title="Card Title" subtitle="Subtitle" />
 *   <Card.Body>Content goes here</Card.Body>
 *   <Card.Footer actions={[<Button>Action</Button>]} />
 * </Card>
 */

export { CardHeader } from './Header';
export { CardBody } from './Body';
export { CardFooter } from './Footer';
export { CardImage } from './Image';

export type { CardHeaderProps } from './Header';
export type { CardBodyProps } from './Body';
export type { CardFooterProps } from './Footer';
export type { CardImageProps } from '../types';
