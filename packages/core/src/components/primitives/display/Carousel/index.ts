/**
 * @fileoverview Carousel Component - Engine Router
 * @description Provides a responsive carousel/slider component for displaying
 * multiple content items with navigation controls. Supports multiple rendering
 * engines (Titan/Ant Design, Hermes/DaisyUI, Apollo/Vanilla).
 *
 * @module components/primitives/display/Carousel
 *
 * @example
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * // Basic usage with dots and arrows
 * <Carousel dots arrows>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 *   <div>Slide 3</div>
 * </Carousel>
 *
 * // Autoplay carousel
 * <Carousel autoplay autoplaySpeed={3000}>
 *   <img src="/image1.jpg" alt="Slide 1" />
 *   <img src="/image2.jpg" alt="Slide 2" />
 * </Carousel>
 *
 * // Using compound components
 * <Carousel>
 *   <Carousel.Item backgroundColor="#f0f0f0">
 *     <h2>Welcome</h2>
 *   </Carousel.Item>
 *   <Carousel.Item backgroundImage="/hero.jpg">
 *     <h2>Hero Section</h2>
 *   </Carousel.Item>
 * </Carousel>
 *
 * // With ref for programmatic control
 * const carouselRef = useRef<CarouselRef>(null);
 * <Carousel ref={carouselRef}>...</Carousel>
 * carouselRef.current?.next();
 * carouselRef.current?.goTo(2);
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CarouselProps } from './types';
import { CarouselItem } from './compound';

// Export types
export type {
  CarouselProps,
  CarouselRef,
  CarouselEffect,
  CarouselDotPosition,
  CarouselSize,
  CarouselItemProps,
} from './types';
export { CAROUSEL_DEFAULTS } from './types';

// Export compound components
export { CarouselItem };
export type { CarouselItemComponentProps } from './compound';

// Export base component for direct usage
export { BaseCarousel } from './base';

/**
 * Carousel Component
 *
 * A flexible, engine-aware carousel component for displaying slideshows,
 * image galleries, or any rotating content. Supports autoplay, navigation
 * dots and arrows, fade/slide transitions, and vertical mode.
 *
 * The component automatically selects the appropriate engine implementation
 * based on the EngineProvider context or the `engine` prop.
 *
 * @example
 * ```tsx
 * // Default engine (from context or Titan)
 * <Carousel autoplay dots>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 * </Carousel>
 *
 * // Specific engine
 * <Carousel engine="hermes" arrows>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 * </Carousel>
 * ```
 */
export const Carousel = Object.assign(
  createEngineComponent<CarouselProps>('Carousel', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Styled wrapper for carousel slides */
    Item: CarouselItem,
  }
);

export default Carousel;
