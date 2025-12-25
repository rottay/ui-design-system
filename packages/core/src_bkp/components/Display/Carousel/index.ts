/**
 * Carousel Component Exports
 */

export { Carousel } from './Carousel';

export type {
  CarouselDotPosition,
  CarouselEffect,
  CarouselRef,
  CarouselProps,
} from './types';

export {
  getNextSlideIndex,
  getPrevSlideIndex,
  getDotPositionClasses,
} from './types';

// Engine exports for direct usage
export { default as TitanCarousel } from './engines/titan';
export { default as HermesCarousel } from './engines/hermes';
export { default as ApolloCarousel } from './engines/apollo';
export { default as AthenaCarousel } from './engines/athena';
