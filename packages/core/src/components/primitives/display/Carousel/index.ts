/**
 * @fileoverview Carousel Component - Rottay Design System
 * @description Responsive slideshow with navigation, autoplay, and transitions.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The Carousel component displays rotating content with navigation controls,
 * autoplay, fade/slide transitions, and vertical mode support.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Ant Design Carousel with full feature support
 * - **Hermes**: DaisyUI-styled carousel with Tailwind utilities
 * - **Apollo**: Pure HTML/CSS with maximum accessibility
 *
 * **Key Features:**
 * - Autoplay with configurable speed
 * - Navigation dots and arrows
 * - Fade and slide transitions
 * - Vertical carousel mode
 * - Touch/swipe support
 * - Infinite loop mode
 * - Programmatic control via ref
 * - ARIA-compliant accessibility
 *
 * **Compound Components:**
 * - `Carousel.Item` - Styled slide wrapper with background support
 *
 * **CSS Custom Properties:**
 * - `--carousel-speed` - Transition duration
 * - `--carousel-height` - Carousel height
 * - `--carousel-arrow-bg` - Arrow background
 * - `--carousel-arrow-size` - Arrow dimensions
 * - `--carousel-dot-bg` - Inactive dot color
 * - `--carousel-dot-active-bg` - Active dot color
 * - `--carousel-dots-gap` - Spacing between dots
 *
 * @example Basic Usage
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel dots arrows>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 * </Carousel>
 * ```
 *
 * @example Autoplay
 * ```tsx
 * <Carousel autoplay autoplaySpeed={3000}>
 *   <img src="/image1.jpg" alt="Slide 1" />
 *   <img src="/image2.jpg" alt="Slide 2" />
 * </Carousel>
 * ```
 *
 * @example Compound Components
 * ```tsx
 * <Carousel>
 *   <Carousel.Item backgroundColor="#f0f0f0">
 *     <h2>Welcome</h2>
 *   </Carousel.Item>
 *   <Carousel.Item backgroundImage="/hero.jpg">
 *     <h2>Hero Section</h2>
 *   </Carousel.Item>
 * </Carousel>
 * ```
 *
 * @example Programmatic Control
 * ```tsx
 * const carouselRef = useRef<CarouselRef>(null);
 * <Carousel ref={carouselRef}>...</Carousel>
 * carouselRef.current?.next();
 * carouselRef.current?.goTo(2);
 * ```
 *
 * @see {@link CarouselProps} for component props
 * @see {@link CarouselRef} for ref methods
 * @module Carousel
 * @category Display
 * @package @rottay/design-system
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
