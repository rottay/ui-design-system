/**
 * @fileoverview Carousel Compound Components - Rottay Design System
 * @description Compound components for the Carousel component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module exports all compound components for the Carousel component.
 *
 * **Available Compounds:**
 * - `CarouselItem` - Styled slide wrapper with background support
 *
 * @example Compound Usage
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel>
 *   <Carousel.Item backgroundColor="#f0f0f0" align="center">
 *     <h2>Slide Content</h2>
 *   </Carousel.Item>
 *   <Carousel.Item backgroundImage="/hero.jpg">
 *     <h2>Hero Section</h2>
 *   </Carousel.Item>
 * </Carousel>
 * ```
 *
 * @see {@link Carousel} for main component
 * @see {@link CarouselItem} for item implementation
 * @module Carousel/compound
 * @category Display
 * @package @rottay/design-system
 */

export { CarouselItem } from './Item';
export type { CarouselItemComponentProps } from './Item';
