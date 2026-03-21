'use client';

/**
 * @fileoverview Carousel - Responsive slideshow with navigation, autoplay, and transitions.
 * Supports dots, arrows, fade/slide effects, vertical mode, and programmatic
 * control via ref. `Carousel.Item` provides a styled slide wrapper.
 *
 * @example
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel autoplay dots arrows>
 *   <Carousel.Item backgroundImage="/hero.jpg">
 *     <h2>Welcome</h2>
 *   </Carousel.Item>
 *   <Carousel.Item>Slide 2</Carousel.Item>
 * </Carousel>
 * ```
 *
 * @module Carousel
 * @category Display
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { CarouselProps } from './Carousel.types';
import { CarouselItem } from './compound';

export type {
  CarouselProps,
  CarouselRef,
  CarouselEffect,
  CarouselDotPosition,
  CarouselSize,
  CarouselItemProps,
} from './Carousel.types';
export { CAROUSEL_DEFAULTS } from './Carousel.types';

export { CarouselItem };
export type { CarouselItemComponentProps } from './compound';

/**
 * Carousel with compound Item sub-component.
 * The Item wrapper adds background color/image and padding to individual slides,
 * which is useful for hero sections and styled content panels.
 */
export const Carousel = Object.assign(
  createEngineComponent<CarouselProps>('Carousel', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Styled slide wrapper with optional background color/image support. */
    Item: CarouselItem,
  }
);

export default Carousel;
