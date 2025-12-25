'use client';

/**
 * Apollo Carousel Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
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
import {
  getNextSlideIndex,
  getPrevSlideIndex,
  getDotPositionClasses,
} from '../../../../types/components/carousel';

/**
 * Apollo Carousel Component
 *
 * Pure Tailwind-styled carousel display.
 */
const ApolloCarousel = forwardRef<CarouselRef, CarouselProps>(function ApolloCarousel(props, ref) {
  const {
    children,
    autoplay = false,
    autoplaySpeed = 3000,
    dots = true,
    dotPosition = 'bottom',
    effect = 'scrollx',
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigate to specific slide
  const goTo = useCallback((index: number, dontAnimate?: boolean) => {
    if (index < 0 || index >= totalSlides || isTransitioning) return;

    setIsTransitioning(true);
    beforeChange?.(currentSlide, index);
    setCurrentSlide(index);

    setTimeout(() => {
      setIsTransitioning(false);
      afterChange?.(index);
    }, dontAnimate ? 0 : speed);
  }, [currentSlide, totalSlides, isTransitioning, speed, beforeChange, afterChange]);

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

  // Fade effect rendering
  if (effect === 'fade') {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides with fade effect */}
        <div className="relative w-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`w-full transition-opacity ${
                index === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
              }`}
              style={{ transitionDuration: `${speed}ms` }}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Arrows */}
        {renderArrows()}

        {/* Dots */}
        {renderDots()}
      </div>
    );
  }

  // Scroll effect rendering (default)
  function renderArrows() {
    if (!arrows || totalSlides <= 1) return null;

    return (
      <>
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          onClick={prev}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md transition-colors"
          onClick={next}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </>
    );
  }

  function renderDots() {
    if (!dots || totalSlides <= 1) return null;

    const positionClasses = getDotPositionClasses(dotPosition);

    return (
      <div className={`absolute flex gap-2 z-10 ${positionClasses}`}>
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide
                ? 'bg-blue-500'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides container with scroll effect */}
      <div
        className="flex transition-transform"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transitionDuration: `${speed}ms`,
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {slide}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {renderArrows()}

      {/* Dots */}
      {renderDots()}
    </div>
  );
});

export default ApolloCarousel;
