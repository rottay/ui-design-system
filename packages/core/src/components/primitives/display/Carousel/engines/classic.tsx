/**
 * @fileoverview Carousel Classic Engine - Rottay Design System
 * @description Ant Design-based carousel with slick.js foundation.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Carousel component to provide
 * full-featured slider functionality with smooth animations.
 *
 * **Exported Components:**
 * - `Carousel` - Main carousel wrapper
 *
 * **Implementation Details:**
 * - Uses `antd/Carousel` (slick.js-based) for core rendering
 * - Full imperative API via ref (goTo, next, prev)
 * - Supports custom prev/next arrows
 * - Touch/swipe support built-in
 *
 * **Ant Design Features:**
 * - Smooth CSS transitions
 * - Touch/swipe gestures
 * - Custom arrow components
 * - Responsive breakpoints
 * - Theme token integration
 *
 * @example Basic Usage
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="classic" autoplay dots>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 * </Carousel>
 * ```
 *
 * @example With Custom Arrows
 * ```tsx
 * <Carousel
 *   engine="classic"
 *   arrows
 *   prevArrow={<LeftOutlined />}
 *   nextArrow={<RightOutlined />}
 * >
 *   <div>Slide 1</div>
 * </Carousel>
 * ```
 *
 * @see {@link Carousel} for the main component
 * @see {@link https://ant.design/components/carousel} Ant Design Carousel
 * @module Carousel/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Carousel as AntCarousel } from 'antd';
import type { CarouselRef as AntCarouselRef } from 'antd/es/carousel';
import type { CarouselProps, CarouselRef } from '../Carousel.types';
import { CAROUSEL_DEFAULTS } from '../Carousel.types';

/**
 * Classic Carousel - Ant Design Implementation
 *
 * This implementation wraps the Ant Design Carousel component, providing
 * a full-featured carousel with smooth animations, touch support, and
 * comprehensive configuration options.
 *
 * @component
 * @example
 * ```tsx
 * import { Carousel } from '@rottay/design-system';
 *
 * <Carousel engine="classic" autoplay dots>
 *   <div>Slide 1</div>
 *   <div>Slide 2</div>
 *   <div>Slide 3</div>
 * </Carousel>
 * ```
 *
 * @param {CarouselProps} props - Component configuration props
 * @param {React.Ref<CarouselRef>} ref - Ref providing imperative carousel methods
 * @returns {React.ReactElement} Rendered Ant Design carousel
 *
 * @see {@link https://ant.design/components/carousel Ant Design Carousel}
 */
export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (props, ref) => {
    const {
      autoplay = CAROUSEL_DEFAULTS.autoplay,
      autoplaySpeed = CAROUSEL_DEFAULTS.autoplaySpeed,
      dots = CAROUSEL_DEFAULTS.dots,
      dotPosition = CAROUSEL_DEFAULTS.dotPosition,
      arrows = CAROUSEL_DEFAULTS.arrows,
      effect = CAROUSEL_DEFAULTS.effect,
      slidesToShow = CAROUSEL_DEFAULTS.slidesToShow,
      slidesToScroll = CAROUSEL_DEFAULTS.slidesToScroll,
      infinite = CAROUSEL_DEFAULTS.infinite,
      speed = CAROUSEL_DEFAULTS.speed,
      initialSlide = CAROUSEL_DEFAULTS.initialSlide,
      beforeChange,
      afterChange,
      pauseOnHover = CAROUSEL_DEFAULTS.pauseOnHover,
      pauseOnDotsHover = CAROUSEL_DEFAULTS.pauseOnDotsHover,
      swipe = CAROUSEL_DEFAULTS.swipe,
      vertical = CAROUSEL_DEFAULTS.vertical,
      fade = CAROUSEL_DEFAULTS.fade,
      prevArrow,
      nextArrow,
      children,
      className,
      style,
    } = props;

    const carouselRef = useRef<AntCarouselRef>(null);

    /**
     * Expose imperative carousel control methods via ref.
     * Allows parent components to programmatically control navigation.
     */
    useImperativeHandle(ref, () => ({
      /**
       * Navigate to a specific slide.
       * @param slideNumber - Target slide index (0-based)
       * @param dontAnimate - If true, skip transition animation
       */
      goTo: (slideNumber: number, dontAnimate?: boolean) => {
        carouselRef.current?.goTo(slideNumber, dontAnimate);
      },
      /**
       * Advance to the next slide.
       */
      next: () => {
        carouselRef.current?.next();
      },
      /**
       * Return to the previous slide.
       */
      prev: () => {
        carouselRef.current?.prev();
      },
    }));

    return (
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay}
        autoplaySpeed={autoplaySpeed}
        dots={dots}
        dotPosition={dotPosition}
        arrows={arrows}
        effect={fade ? 'fade' : effect}
        slidesToShow={slidesToShow}
        slidesToScroll={slidesToScroll}
        infinite={infinite}
        speed={speed}
        initialSlide={initialSlide}
        beforeChange={beforeChange}
        afterChange={afterChange}
        pauseOnHover={pauseOnHover}
        pauseOnDotsHover={pauseOnDotsHover}
        swipe={swipe}
        vertical={vertical}
        prevArrow={prevArrow as React.ReactElement}
        nextArrow={nextArrow as React.ReactElement}
        className={className}
        style={style}
      >
        {children}
      </AntCarousel>
    );
  }
);

Carousel.displayName = 'Carousel.Classic';

export default Carousel;
