/**
 * @fileoverview Carousel Modern Engine - Rottay Design System
 * @description DS token inline-styled carousel with scroll-snap navigation.
 *
 * @remarks
 * All visual styling uses DS token CSS custom properties (`--ds-*`).
 * Arrow buttons and dot indicators use inline styles, not DaisyUI classes.
 *
 * **Features:**
 * - Scroll-snap based navigation
 * - Interval-based autoplay
 * - Imperative ref methods
 * - DS token theme adaptation
 * - Responsive-friendly
 *
 * @example Basic Usage
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="modern" autoplay arrows>
 *   <div className="bg-primary p-8">Slide 1</div>
 *   <div className="bg-secondary p-8">Slide 2</div>
 * </Carousel>
 * ```
 *
 * @see {@link Carousel} for the main component
 * @see {@link Carousel} for the main component
 * @module Carousel/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import type { CarouselProps, CarouselRef } from '../Carousel.types';
import { CAROUSEL_DEFAULTS } from '../Carousel.types';

/**
 * Modern Carousel - Token-driven Tailwind Implementation
 *
 * This implementation provides a carousel using Tailwind CSS utilities and DS token inline styles.
 * It offers a lightweight alternative with full customization through utility classes.
 *
 * @component
 * @example
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="modern" autoplay arrows>
 *   <div className="bg-primary p-8">Slide 1</div>
 *   <div className="bg-secondary p-8">Slide 2</div>
 *   <div className="bg-accent p-8">Slide 3</div>
 * </Carousel>
 * ```
 *
 * @param {CarouselProps} props - Component configuration props
 * @param {React.Ref<CarouselRef>} ref - Ref providing imperative carousel methods
 * @returns {React.ReactElement} Rendered Modern carousel
 */
export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (props, ref) => {
    const {
      autoplay = CAROUSEL_DEFAULTS.autoplay,
      autoplaySpeed = CAROUSEL_DEFAULTS.autoplaySpeed,
      dots = CAROUSEL_DEFAULTS.dots,
      dotPosition = CAROUSEL_DEFAULTS.dotPosition,
      arrows = CAROUSEL_DEFAULTS.arrows,
      infinite = CAROUSEL_DEFAULTS.infinite,
      speed = CAROUSEL_DEFAULTS.speed,
      initialSlide = CAROUSEL_DEFAULTS.initialSlide,
      beforeChange,
      afterChange,
      pauseOnHover = CAROUSEL_DEFAULTS.pauseOnHover,
      vertical = CAROUSEL_DEFAULTS.vertical,
      fade = CAROUSEL_DEFAULTS.fade,
      children,
      className = '',
      style,
    } = props;

    // Flatten children into an array so we can index into individual slides
    // and derive the total count for boundary checks and dot rendering.
    const slides = React.Children.toArray(children);
    const [currentSlide, setCurrentSlide] = useState(initialSlide);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // Autoplay timer ref is stored outside state to avoid triggering
    // re-renders when the interval is created or cleared.
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Navigate to a specific slide by index.
     * Handles infinite loop wrapping when enabled.
     *
     * @param {number} slideNumber - Target slide index
     * @param {boolean} [_dontAnimate] - Reserved for animation control
     */
    const goTo = useCallback(
      (slideNumber: number, _dontAnimate?: boolean) => {
        let targetSlide = slideNumber;
        if (infinite) {
          // Double-modulo trick handles negative indices correctly, so
          // navigating "prev" from slide 0 wraps to the last slide.
          targetSlide =
            ((slideNumber % slides.length) + slides.length) % slides.length;
        } else {
          // Clamp within bounds when infinite loop is disabled.
          targetSlide = Math.max(0, Math.min(slideNumber, slides.length - 1));
        }

        beforeChange?.(currentSlide, targetSlide);
        setCurrentSlide(targetSlide);
        afterChange?.(targetSlide);
      },
      [currentSlide, slides.length, infinite, beforeChange, afterChange]
    );

    /**
     * Navigate to the next slide.
     */
    const next = useCallback(() => {
      goTo(currentSlide + 1);
    }, [currentSlide, goTo]);

    /**
     * Navigate to the previous slide.
     */
    const prev = useCallback(() => {
      goTo(currentSlide - 1);
    }, [currentSlide, goTo]);

    // Expose imperative methods to parent components
    useImperativeHandle(ref, () => ({
      goTo,
      next,
      prev,
    }));

    /**
     * Autoplay interval management.
     * Automatically advances slides at specified interval unless paused.
     */
    useEffect(() => {
      if (autoplay && !isPaused) {
        autoplayRef.current = setInterval(next, autoplaySpeed);
      }
      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }, [autoplay, autoplaySpeed, isPaused, next]);

    /**
     * Pause autoplay on mouse hover.
     */
    const handleMouseEnter = () => {
      if (pauseOnHover) setIsPaused(true);
    };

    /**
     * Resume autoplay when mouse leaves.
     */
    const handleMouseLeave = () => {
      if (pauseOnHover) setIsPaused(false);
    };

    // Pre-compute the positional Tailwind classes for the dot container.
    // Each position needs both placement (top/bottom/left/right) and
    // centering (translate) plus a flex direction for the dot row/column.
    const dotsPositionClass = {
      top: 'top-2 left-1/2 -translate-x-1/2 flex-row',
      bottom: 'bottom-2 left-1/2 -translate-x-1/2 flex-row',
      left: 'left-2 top-1/2 -translate-y-1/2 flex-col',
      right: 'right-2 top-1/2 -translate-y-1/2 flex-col',
    }[dotPosition];

    const carouselClass = vertical ? 'carousel-vertical' : '';

    return (
      <div
        ref={containerRef}
        className={`rottay-carousel rottay-carousel--modern carousel w-full relative ${carouselClass} ${className}`}
        data-part="root"
        data-vertical={vertical ? 'true' : undefined}
        data-fade={fade ? 'true' : undefined}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-roledescription="carousel"
      >
        {/* Slides Container */}
        <div
          className="carousel-inner relative w-full overflow-hidden"
          data-part="track"
          style={{ height: style?.height || 'var(--ds-carousel-height, 300px)' }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="carousel-item absolute w-full h-full"
              data-part="slide"
              data-selected={index === currentSlide ? 'true' : 'false'}
              style={{
                // Fade mode: toggle opacity only, no translation needed.
                // Slide mode: offset each slide by its distance from current,
                // using translateX for horizontal or translateY for vertical.
                // The offset is arithmetic over the live index, so carousel.css
                // consumes it as a custom property rather than enumerating it.
                opacity: fade ? (index === currentSlide ? 1 : 0) : 1,
                '--ds-carousel-slide-transform': fade
                  ? 'none'
                  : vertical
                    ? `translateY(${(index - currentSlide) * 100}%)`
                    : `translateX(${(index - currentSlide) * 100}%)`,
                transition: `all ${speed}ms var(--ds-motion-ease-out)`,
              } as React.CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              aria-hidden={index !== currentSlide}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {arrows && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="prev"
              style={{ width: 'var(--ds-carousel-arrow-size, 32px)', height: 'var(--ds-carousel-arrow-size, 32px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)' }}
              onClick={prev}
              aria-label="Previous slide"
              type="button"
            >
              {vertical ? '\u2191' : '\u2190'}
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="next"
              style={{ width: 'var(--ds-carousel-arrow-size, 32px)', height: 'var(--ds-carousel-arrow-size, 32px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 'var(--ds-font-size-xs, 12px)' }}
              onClick={next}
              aria-label="Next slide"
              type="button"
            >
              {vertical ? '\u2193' : '\u2192'}
            </button>
          </>
        )}

        {/* Navigation Dots */}
        {dots && (
          <div
            className={`absolute flex gap-1 z-10 ${dotsPositionClass}`}
            data-part="dots"
            role="tablist"
            aria-label="Carousel navigation"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-4' : ''
                }`}
                data-part="dot"
                data-selected={index === currentSlide ? 'true' : 'false'}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === currentSlide}
                role="tab"
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Carousel.displayName = 'Carousel.Modern';

export default Carousel;
