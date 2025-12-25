/**
 * Carousel Component Types
 *
 * Unified type definitions for the Carousel component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Carousel Dot Position
 */
export type CarouselDotPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Carousel Effect
 */
export type CarouselEffect = 'scrollx' | 'fade';

/**
 * Carousel Ref Methods
 */
export interface CarouselRef {
  /** Go to specified slide */
  goTo: (slideNumber: number, dontAnimate?: boolean) => void;
  /** Go to next slide */
  next: () => void;
  /** Go to previous slide */
  prev: () => void;
}

/**
 * Carousel Props
 */
export interface CarouselProps {
  /** Carousel items/slides */
  children?: ReactNode;

  /** Whether to auto-scroll slides */
  autoplay?: boolean;

  /** Autoplay interval in ms */
  autoplaySpeed?: number;

  /** Show dot indicators */
  dots?: boolean | { className?: string };

  /** Position of dots */
  dotPosition?: CarouselDotPosition;

  /** Transition effect */
  effect?: CarouselEffect;

  /** Enable drag/swipe */
  draggable?: boolean;

  /** Fade slides when switching */
  fade?: boolean;

  /** Infinite loop */
  infinite?: boolean;

  /** Animation speed in ms */
  speed?: number;

  /** Pause autoplay on hover */
  pauseOnHover?: boolean;

  /** Pause autoplay on dots hover */
  pauseOnDotsHover?: boolean;

  /** Show prev/next arrows */
  arrows?: boolean;

  /** Custom prev arrow */
  prevArrow?: ReactNode;

  /** Custom next arrow */
  nextArrow?: ReactNode;

  /** Number of slides to show */
  slidesToShow?: number;

  /** Number of slides to scroll */
  slidesToScroll?: number;

  /** Callback before slide change */
  beforeChange?: (current: number, next: number) => void;

  /** Callback after slide change */
  afterChange?: (current: number) => void;

  /** Initial slide index */
  initialSlide?: number;

  /** Additional class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get next slide index with wrap-around
 */
export function getNextSlideIndex(
  current: number,
  total: number,
  infinite: boolean = true
): number {
  if (current >= total - 1) {
    return infinite ? 0 : current;
  }
  return current + 1;
}

/**
 * Get previous slide index with wrap-around
 */
export function getPrevSlideIndex(
  current: number,
  total: number,
  infinite: boolean = true
): number {
  if (current <= 0) {
    return infinite ? total - 1 : current;
  }
  return current - 1;
}

/**
 * Get dot position classes
 */
export function getDotPositionClasses(position?: CarouselDotPosition): string {
  switch (position) {
    case 'top':
      return 'top-2 left-1/2 -translate-x-1/2 flex-row';
    case 'bottom':
      return 'bottom-2 left-1/2 -translate-x-1/2 flex-row';
    case 'left':
      return 'left-2 top-1/2 -translate-y-1/2 flex-col';
    case 'right':
      return 'right-2 top-1/2 -translate-y-1/2 flex-col';
    default:
      return 'bottom-2 left-1/2 -translate-x-1/2 flex-row';
  }
}
