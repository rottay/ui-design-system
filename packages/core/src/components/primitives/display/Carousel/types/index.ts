/**
 * Carousel - Core Interface
 * Re-exports from centralized types
 */

export type {
  CarouselProps,
  CarouselEffect,
  CarouselDotPosition,
  CarouselSize,
  CarouselItemProps,
  CarouselRef,
} from '../../../../../types/primitives/display/Carousel';

// Default values
export const CAROUSEL_DEFAULTS = {
  autoplay: false,
  autoplaySpeed: 3000,
  dots: true,
  dotPosition: 'bottom' as const,
  arrows: false,
  effect: 'scrollx' as const,
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: true,
  speed: 500,
  initialSlide: 0,
  pauseOnHover: true,
  pauseOnDotsHover: false,
  swipe: true,
  vertical: false,
  fade: false,
};
