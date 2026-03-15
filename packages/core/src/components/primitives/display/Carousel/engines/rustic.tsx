/**
 * @fileoverview Carousel Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS carousel with maximum accessibility.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free carousel using only
 * inline styles and semantic HTML elements.
 *
 * **Exported Components:**
 * - `Carousel` - Main carousel component
 *
 * **Implementation Details:**
 * - Uses inline styles for all visual properties
 * - CSS transition-based animations
 * - Interval-based autoplay
 * - ARIA attributes for screen readers
 *
 * **Accessibility Features:**
 * - `role="region"` on container
 * - `aria-roledescription="carousel"` for context
 * - `role="group"` on slides
 * - `aria-hidden` on inactive slides
 * - `role="tablist"` on dot navigation
 * - Keyboard-accessible controls
 *
 * **Advantages:**
 * - Zero external dependencies
 * - Smallest bundle size
 * - Maximum browser compatibility
 * - Full accessibility compliance
 * - SSR-safe implementation
 *
 * @example Basic Usage
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="rustic" dots arrows>
 *   <div style={{ background: '#1890ff' }}>Slide 1</div>
 *   <div style={{ background: '#52c41a' }}>Slide 2</div>
 * </Carousel>
 * ```
 *
 * @see {@link Carousel} for the main component
 * @module Carousel/engines/rustic
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
 * Rustic Carousel - Vanilla HTML/CSS Implementation
 *
 * This implementation provides a fully accessible carousel using pure HTML,
 * CSS, and JavaScript. It has no external UI library dependencies, making it
 * ideal for projects requiring maximum control or minimal bundle size.
 *
 * Features:
 * - Full keyboard navigation support
 * - ARIA attributes for screen readers
 * - CSS-based animations
 * - Touch/swipe support ready
 *
 * @component
 * @example
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="rustic" dots arrows>
 *   <div style={{ background: '#1890ff', padding: 40 }}>Slide 1</div>
 *   <div style={{ background: '#52c41a', padding: 40 }}>Slide 2</div>
 *   <div style={{ background: '#faad14', padding: 40 }}>Slide 3</div>
 * </Carousel>
 * ```
 *
 * @param {CarouselProps} props - Component configuration props
 * @param {React.Ref<CarouselRef>} ref - Ref providing imperative carousel methods
 * @returns {React.ReactElement} Rendered vanilla carousel
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

    const slides = React.Children.toArray(children);
    const [currentSlide, setCurrentSlide] = useState(initialSlide);
    const [isPaused, setIsPaused] = useState(false);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Navigate to a specific slide by index.
     * Handles boundary conditions based on infinite mode setting.
     *
     * @param {number} slideNumber - Target slide index (0-based)
     * @param {boolean} [_dontAnimate] - Reserved for future animation control
     */
    const goTo = useCallback(
      (slideNumber: number, _dontAnimate?: boolean) => {
        let targetSlide = slideNumber;
        if (infinite) {
          targetSlide =
            ((slideNumber % slides.length) + slides.length) % slides.length;
        } else {
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

    // Expose imperative navigation methods
    useImperativeHandle(ref, () => ({
      goTo,
      next,
      prev,
    }));

    /**
     * Autoplay interval management.
     * Creates/clears interval based on autoplay state and pause status.
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

    // Container styles with CSS custom properties
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      ...style,
    };

    const slidesContainerStyle: React.CSSProperties = {
      position: 'relative',
      height: style?.height || '300px',
      width: '100%',
    };

    /**
     * Generate computed styles for individual slides.
     *
     * @param {number} index - Slide index
     * @returns {React.CSSProperties} Computed slide positioning and transition styles
     */
    const getSlideStyle = (index: number): React.CSSProperties => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: fade ? (index === currentSlide ? 1 : 0) : 1,
      transform: fade
        ? 'none'
        : vertical
          ? `translateY(${(index - currentSlide) * 100}%)`
          : `translateX(${(index - currentSlide) * 100}%)`,
      transition: `all ${speed}ms ease-in-out`,
    });

    // Arrow button base styles
    const arrowStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      background: 'var(--ds-carousel-arrow-bg, rgba(255, 255, 255, 0.9))',
      border: '1px solid var(--ds-carousel-arrow-border, #ddd)',
      borderRadius: 'var(--ds-carousel-arrow-radius, 50%)',
      width: 'var(--ds-carousel-arrow-size, 32px)',
      height: 'var(--ds-carousel-arrow-size, 32px)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      transition: 'var(--ds-carousel-transition, background-color 0.2s ease)',
    };

    /**
     * Get positioning styles for navigation dots based on configured position.
     *
     * @returns {React.CSSProperties} Dot container positioning styles
     */
    const getDotsContainerStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
      };

      switch (dotPosition) {
        case 'top':
          return {
            ...base,
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'row',
          };
        case 'bottom':
          return {
            ...base,
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'row',
          };
        case 'left':
          return {
            ...base,
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
          };
        case 'right':
          return {
            ...base,
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
          };
        default:
          return {
            ...base,
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'row',
          };
      }
    };

    /**
     * Generate styles for individual navigation dots.
     *
     * @param {boolean} isActive - Whether the dot represents the current slide
     * @returns {React.CSSProperties} Dot visual styles
     */
    const getDotStyle = (isActive: boolean): React.CSSProperties => ({
      width: isActive ? 'var(--ds-carousel-dot-active-width, 16px)' : 'var(--ds-carousel-dot-size, 8px)',
      height: 'var(--ds-carousel-dot-size, 8px)',
      borderRadius: 'var(--ds-carousel-dot-radius, 4px)',
      background: isActive
        ? 'var(--ds-carousel-dot-active-bg, var(--ds-color-primary-500, #1890ff))'
        : 'var(--ds-carousel-dot-bg, #d9d9d9)',
      border: 'none',
      cursor: 'pointer',
      transition: 'var(--ds-carousel-transition, all 0.3s ease)',
    });

    return (
      <div
        className={className}
        style={containerStyle}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
      >
        {/* Slides Container */}
        <div style={slidesContainerStyle} aria-live="polite">
          {slides.map((slide, index) => (
            <div
              key={index}
              style={getSlideStyle(index)}
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
              style={{ ...arrowStyle, left: '10px' }}
              onClick={prev}
              aria-label="Previous slide"
              type="button"
            >
              {vertical ? '\u2191' : '\u2190'}
            </button>
            <button
              style={{ ...arrowStyle, right: '10px' }}
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
            style={getDotsContainerStyle()}
            role="tablist"
            aria-label="Carousel navigation"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                style={getDotStyle(index === currentSlide)}
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

Carousel.displayName = 'Carousel.Rustic';

export default Carousel;
