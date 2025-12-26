/**
 * @fileoverview Carousel Base Component
 * @description Provides the foundational carousel implementation using CSS variables
 * from design tokens. This base component is extended by engine-specific implementations.
 * @module components/primitives/display/Carousel/base
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
import type { CarouselProps, CarouselRef } from '../types';
import { CAROUSEL_DEFAULTS } from '../types';

/**
 * Base Carousel component using CSS variables for styling.
 * This component provides a foundation for engine-specific implementations
 * and can be used directly for simple carousel needs.
 *
 * @component
 * @example
 * ```tsx
 * <BaseCarousel autoplay dots>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 *   <div>Slide 3</div>
 * </BaseCarousel>
 * ```
 *
 * @param {CarouselProps} props - Component props
 * @param {React.Ref<CarouselRef>} ref - Forwarded ref providing imperative methods
 * @returns {React.ReactElement} Rendered carousel component
 */
export const BaseCarousel = forwardRef<CarouselRef, CarouselProps>(
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
     *
     * @param {number} slideNumber - Target slide index
     * @param {boolean} [_dontAnimate] - Whether to skip animation (reserved for future use)
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

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      goTo,
      next,
      prev,
    }));

    // Handle autoplay functionality
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
     * Pause autoplay on mouse enter.
     */
    const handleMouseEnter = () => {
      if (pauseOnHover) setIsPaused(true);
    };

    /**
     * Resume autoplay on mouse leave.
     */
    const handleMouseLeave = () => {
      if (pauseOnHover) setIsPaused(false);
    };

    // Build CSS variables for carousel styling
    const carouselVars: React.CSSProperties = {
      '--carousel-speed': `${speed}ms`,
      '--carousel-height': style?.height || '300px',
    } as React.CSSProperties;

    const containerStyle: React.CSSProperties = {
      ...carouselVars,
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      ...style,
    };

    const slidesContainerStyle: React.CSSProperties = {
      position: 'relative',
      height: 'var(--carousel-height)',
      width: '100%',
    };

    /**
     * Generate styles for individual slides.
     *
     * @param {number} index - Slide index
     * @returns {React.CSSProperties} Computed slide styles
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
      transition: `all var(--carousel-speed) ease-in-out`,
    });

    const arrowStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      background: 'var(--carousel-arrow-bg, rgba(255, 255, 255, 0.9))',
      border: 'var(--carousel-arrow-border, 1px solid #ddd)',
      borderRadius: 'var(--carousel-arrow-radius, 50%)',
      width: 'var(--carousel-arrow-size, 32px)',
      height: 'var(--carousel-arrow-size, 32px)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
    };

    /**
     * Get container styles for navigation dots based on position.
     *
     * @returns {React.CSSProperties} Computed dot container styles
     */
    const getDotsContainerStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        gap: 'var(--carousel-dots-gap, 6px)',
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
     * Get styles for individual navigation dots.
     *
     * @param {boolean} isActive - Whether the dot represents the current slide
     * @returns {React.CSSProperties} Computed dot styles
     */
    const getDotStyle = (isActive: boolean): React.CSSProperties => ({
      width: isActive
        ? 'var(--carousel-dot-active-width, 16px)'
        : 'var(--carousel-dot-width, 8px)',
      height: 'var(--carousel-dot-height, 8px)',
      borderRadius: 'var(--carousel-dot-radius, 4px)',
      background: isActive
        ? 'var(--carousel-dot-active-bg, #1890ff)'
        : 'var(--carousel-dot-bg, #d9d9d9)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    });

    return (
      <div
        className={`rottay-carousel ${className}`}
        style={containerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
      >
        {/* Slides Container */}
        <div
          className="rottay-carousel__slides"
          style={slidesContainerStyle}
          aria-live="polite"
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="rottay-carousel__slide"
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
              className="rottay-carousel__arrow rottay-carousel__arrow--prev"
              style={{ ...arrowStyle, left: '10px' }}
              onClick={prev}
              aria-label="Previous slide"
              type="button"
            >
              {vertical ? '\u2191' : '\u2190'}
            </button>
            <button
              className="rottay-carousel__arrow rottay-carousel__arrow--next"
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
            className="rottay-carousel__dots"
            style={getDotsContainerStyle()}
            role="tablist"
            aria-label="Carousel navigation"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                className="rottay-carousel__dot"
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

BaseCarousel.displayName = 'BaseCarousel';
