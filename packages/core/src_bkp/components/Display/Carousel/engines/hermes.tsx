'use client';

/**
 * Hermes Carousel Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Children,
  isValidElement,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { CarouselProps, CarouselRef } from '../types';
import { getNextSlideIndex, getPrevSlideIndex } from '../../../../types/components/carousel';

/**
 * Hermes Carousel Component
 *
 * DaisyUI-styled carousel display.
 */
const HermesCarousel = forwardRef<CarouselRef, CarouselProps>(function HermesCarousel(props, ref) {
  const {
    children,
    autoplay = false,
    autoplaySpeed = 3000,
    dots = true,
    dotPosition = 'bottom',
    infinite = true,
    speed = 500,
    pauseOnHover = true,
    arrows = false,
    beforeChange,
    afterChange,
    initialSlide = 0,
    className = '',
    style,
  } = props;

  const slides = Children.toArray(children).filter(isValidElement);
  const totalSlides = slides.length;

  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Navigate to specific slide
  const goTo = useCallback((index: number, dontAnimate?: boolean) => {
    if (index < 0 || index >= totalSlides) return;
    beforeChange?.(currentSlide, index);
    setCurrentSlide(index);
    afterChange?.(index);
  }, [currentSlide, totalSlides, beforeChange, afterChange]);

  // Navigate to next slide
  const next = useCallback(() => {
    const nextIndex = getNextSlideIndex(currentSlide, totalSlides, infinite);
    if (nextIndex !== currentSlide) {
      goTo(nextIndex);
    }
  }, [currentSlide, totalSlides, infinite, goTo]);

  // Navigate to previous slide
  const prev = useCallback(() => {
    const prevIndex = getPrevSlideIndex(currentSlide, totalSlides, infinite);
    if (prevIndex !== currentSlide) {
      goTo(prevIndex);
    }
  }, [currentSlide, totalSlides, infinite, goTo]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    goTo,
    next,
    prev,
  }), [goTo, next, prev]);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && !isPaused && totalSlides > 1) {
      autoplayRef.current = setInterval(next, autoplaySpeed);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, autoplaySpeed, isPaused, next, totalSlides]);

  // Handle mouse events for pause on hover
  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  // Determine dot position classes for DaisyUI
  const isVerticalDots = dotPosition === 'left' || dotPosition === 'right';
  const dotsContainerClass = isVerticalDots ? 'flex flex-col' : 'flex';

  return (
    <div
      className={`carousel w-full relative ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`carousel-item w-full transition-opacity duration-${speed} ${
            index === currentSlide ? 'block' : 'hidden'
          }`}
        >
          {slide}
        </div>
      ))}

      {/* Navigation Arrows */}
      {arrows && totalSlides > 1 && (
        <>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 z-10"
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 z-10"
            onClick={next}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {dots && totalSlides > 1 && (
        <div
          className={`absolute ${
            dotPosition === 'top' ? 'top-2' :
            dotPosition === 'bottom' ? 'bottom-2' :
            dotPosition === 'left' ? 'left-2' :
            'right-2'
          } ${
            isVerticalDots
              ? 'top-1/2 -translate-y-1/2'
              : 'left-1/2 -translate-x-1/2'
          } ${dotsContainerClass} gap-2 z-10`}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide
                  ? 'bg-primary'
                  : 'bg-base-content/30 hover:bg-base-content/50'
              }`}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default HermesCarousel;
