/**
 * @fileoverview Carousel Component Type Definitions
 * @description Re-exports carousel-related types from centralized type system
 * and provides component-specific default values.
 * @module components/primitives/display/Carousel/types
 */

export type {
  CarouselProps,
  CarouselEffect,
  CarouselDotPosition,
  CarouselSize,
  CarouselItemProps,
  CarouselRef,
} from '../../../../../types/primitives/display/Carousel';

/**
 * Default configuration values for the Carousel component.
 * These values are used when props are not explicitly provided.
 *
 * @constant
 * @property {boolean} autoplay - Whether to automatically cycle through slides (default: false)
 * @property {number} autoplaySpeed - Duration between auto-advances in milliseconds (default: 3000)
 * @property {boolean} dots - Whether to show navigation dots (default: true)
 * @property {string} dotPosition - Position of navigation dots (default: 'bottom')
 * @property {boolean} arrows - Whether to show prev/next arrows (default: false)
 * @property {string} effect - Slide transition effect (default: 'scrollx')
 * @property {number} slidesToShow - Number of slides visible at once (default: 1)
 * @property {number} slidesToScroll - Number of slides to scroll per action (default: 1)
 * @property {boolean} infinite - Whether to loop infinitely (default: true)
 * @property {number} speed - Transition animation duration in milliseconds (default: 500)
 * @property {number} initialSlide - Starting slide index (default: 0)
 * @property {boolean} pauseOnHover - Pause autoplay on mouse hover (default: true)
 * @property {boolean} pauseOnDotsHover - Pause autoplay when hovering dots (default: false)
 * @property {boolean} swipe - Enable touch/swipe navigation (default: true)
 * @property {boolean} vertical - Enable vertical carousel mode (default: false)
 * @property {boolean} fade - Use fade transition instead of slide (default: false)
 */
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
