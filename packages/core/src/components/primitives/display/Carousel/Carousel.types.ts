/**
 * @fileoverview Carousel Types - Rottay Design System
 * @description Type definitions and constants for the Carousel component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module re-exports types from the centralized type system and provides
 * default configuration values for the Carousel component.
 *
 * **Exported Types:**
 * - `CarouselProps` - Main component properties
 * - `CarouselRef` - Imperative handle methods (goTo, next, prev)
 * - `CarouselEffect` - Transition effects ('scrollx' | 'fade')
 * - `CarouselDotPosition` - Dot positions ('top' | 'bottom' | 'left' | 'right')
 * - `CarouselSize` - Component sizes
 * - `CarouselItemProps` - Slide item properties
 *
 * **Exported Constants:**
 * - `CAROUSEL_DEFAULTS` - Default configuration values
 *
 * @example Type Usage
 * ```tsx
 * import type { CarouselProps, CarouselRef } from '@rottay/design-system';
 *
 * const carouselRef = useRef<CarouselRef>(null);
 * const props: CarouselProps = {
 *   autoplay: true,
 *   autoplaySpeed: 3000,
 *   dots: true,
 * };
 * ```
 *
 * @see {@link Carousel} for component implementation
 * @module Carousel/types
 * @category Display
 * @package @rottay/design-system
 */

export type {
  CarouselProps,
  CarouselEffect,
  CarouselDotPosition,
  CarouselSize,
  CarouselItemProps,
  CarouselRef,
} from '../../../../contracts/primitives/display/Carousel';

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
