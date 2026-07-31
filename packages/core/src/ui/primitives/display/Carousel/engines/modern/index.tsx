/**
 * @fileoverview Carousel Modern Engine - Rottay Design System
 * @description Token-driven carousel with transform-based navigation.
 *
 * @remarks
 * All visual styling uses DS token CSS custom properties (`--ds-*`).
 * The unlayered modern skin (`skin/carousel.css`) is the SINGLE paint owner
 * for every part (root frame, arrows, dots, slide transform). K4-C Pass 1
 * drained the four DaisyUI literals (`carousel`, `carousel-vertical`,
 * `carousel-inner`, `carousel-item`): they were never structural here — the
 * engine positions slides by inline transform, not scroll-snap — and the
 * `theme.css` `.carousel` bridge they enabled co-painted the root frame,
 * violating single-owner paint. The skin now owns that frame.
 *
 * RTL: arrow and dot placement uses LOGICAL utilities (`start-2`/`end-2`),
 * horizontal arrow glyphs mirror via a `:dir(rtl)` rule in the skin, and the
 * horizontal slide offset multiplies by `--ds-carousel-rtl-factor` (1 in LTR,
 * -1 under `:dir(rtl)`) so the travel direction mirrors too. The `left-1/2`
 * horizontal centring of top/bottom dot rows is deliberately PHYSICAL: it is
 * direction-invariant, and a logical `start-1/2` would break the centre in
 * RTL.
 *
 * Landmark law (axe landmark-unique; W8 remediation, mirror of the ScrollArea
 * K3-C fix): the root is promoted to a named `role="region"` +
 * `aria-roledescription="carousel"` landmark ONLY when the consumer supplies
 * a meaningful, unique accessible name via `aria-label`/`aria-labelledby`.
 * An unnamed carousel is NOT a landmark (plain div, no role, no
 * roledescription — `aria-roledescription` is invalid on a generic), so the
 * four gallery cells no longer collide as indistinguishable region
 * landmarks.
 *
 * **Features:**
 * - Transform-based slide navigation
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
import type { CarouselProps, CarouselRef } from '../../contracts';
import { CAROUSEL_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/**
 * Modern Carousel - Token-driven Tailwind Implementation
 *
 * This implementation provides a carousel using structural utilities and the token-driven modern skin.
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
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
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

    // Accessibility labels: translated when an I18nProvider is mounted, with
    // the documented English fallbacks otherwise (a missing catalog key
    // echoes the raw key back, which the endsWith guard detects — K4-C wires
    // the channel ahead of the locale JSONs, so behavior is byte-identical
    // until they land).
    const i18n = useOptionalTranslation('components');
    const carouselLabel = (
      key: string,
      fallback: string,
      params?: Record<string, string | number>
    ): string => {
      const translated = i18n?.t(key, params);
      return translated && !translated.endsWith(key) ? translated : fallback;
    };

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

    /**
     * Keyboard parity for the hover pause (WCAG 2.2.1, the Toast precedent):
     * autoplay must not advance while the user is focused inside the
     * carousel. The blur only resumes when focus leaves the root entirely.
     */
    const handleFocus = () => {
      if (pauseOnHover) setIsPaused(true);
    };
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (pauseOnHover && (!next || !event.currentTarget.contains(next))) {
        setIsPaused(false);
      }
    };

    /**
     * Arrow-key slide navigation (APG carousel): Left/Right move between
     * slides in horizontal mode (mirrored under RTL — ArrowLeft means "the
     * logical previous page"), Up/Down in vertical mode, Home/End jump to
     * the edges. Keys originating inside a form control keep their native
     * behavior (an input inside a slide wins).
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]')) return;

      const isRtl = event.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';
      switch (event.key) {
        case 'ArrowLeft':
          if (vertical) return;
          event.preventDefault();
          if (isRtl) next(); else prev();
          return;
        case 'ArrowRight':
          if (vertical) return;
          event.preventDefault();
          if (isRtl) prev(); else next();
          return;
        case 'ArrowUp':
          if (!vertical) return;
          event.preventDefault();
          prev();
          return;
        case 'ArrowDown':
          if (!vertical) return;
          event.preventDefault();
          next();
          return;
        case 'Home':
          event.preventDefault();
          goTo(0);
          return;
        case 'End':
          event.preventDefault();
          goTo(slides.length - 1);
          return;
        default:
          return;
      }
    };

    // Pre-compute the positional Tailwind classes for the dot container.
    // Each position needs both placement and centering plus a flex direction
    // for the dot row/column. `start-2`/`end-2` are LOGICAL (inset-inline-*),
    // so the lateral positions mirror under RTL. The top/bottom `left-1/2`
    // horizontal centring is deliberately physical: it is direction-invariant
    // and a logical `start-1/2` would break the centre in RTL.
    const dotsPositionClass = {
      top: 'top-2 left-1/2 -translate-x-1/2 flex-row',
      bottom: 'bottom-2 left-1/2 -translate-x-1/2 flex-row',
      left: 'start-2 top-1/2 -translate-y-1/2 flex-col',
      right: 'end-2 top-1/2 -translate-y-1/2 flex-col',
    }[dotPosition];

    // A blank/whitespace-only name is not meaningful: the root stays a plain
    // (non-landmark) div and the naming attribute is dropped. Only a named
    // carousel is a `region` landmark (axe landmark-unique; W8, mirror of
    // the ScrollArea K3-C law).
    const hasLandmarkName = Boolean(ariaLabel?.trim()) || Boolean(ariaLabelledBy?.trim());
    const landmarkProps = hasLandmarkName
      ? {
          role: 'region' as const,
          'aria-roledescription': 'carousel' as const,
          ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
          ...(ariaLabelledBy !== undefined ? { 'aria-labelledby': ariaLabelledBy } : {}),
        }
      : {};

    return (
      <div
        ref={containerRef}
        className={`rottay-carousel rottay-carousel--modern ${className}`}
        data-part="root"
        data-vertical={vertical ? 'true' : undefined}
        data-fade={fade ? 'true' : undefined}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...landmarkProps}
      >
        {/* Slides Container */}
        <div
          data-part="track"
          style={{ height: style?.height || 'var(--ds-carousel-height, 300px)' }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              data-part="slide"
              data-selected={index === currentSlide ? 'true' : 'false'}
              style={{
                // Fade mode: toggle opacity only, no translation needed.
                // Slide mode: offset each slide by its distance from current,
                // using translateX for horizontal or translateY for vertical.
                // The offset is arithmetic over the live index, so carousel.css
                // consumes it as a custom property rather than enumerating it.
                // The horizontal offset rides `--ds-carousel-rtl-factor` (1 in
                // LTR, -1 under `:dir(rtl)` from the skin) so the travel
                // direction mirrors in RTL.
                opacity: fade ? (index === currentSlide ? 1 : 0) : 1,
                '--ds-carousel-slide-transform': fade
                  ? 'none'
                  : vertical
                    ? `translateY(${(index - currentSlide) * 100}%)`
                    : `translateX(calc(${(index - currentSlide) * 100}% * var(--ds-carousel-rtl-factor, 1)))`,
                transition: `transform ${speed}ms var(--ds-motion-ease-out), opacity ${speed}ms var(--ds-motion-ease-out)`,
              } as React.CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={carouselLabel('carousel.slideOf', `Slide ${index + 1} of ${slides.length}`, { index: index + 1, total: slides.length })}
              aria-hidden={index !== currentSlide}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Navigation Arrows — `start-2`/`end-2` are LOGICAL (inset-inline-*):
            both buttons mirror sides under RTL, and the skin flips the
            horizontal glyphs via `:dir(rtl) scaleX(-1)`. The positional
            utilities stay inline on purpose: the engine tests pin them
            (`start-2`/`end-2` present, never `left-2`/`right-2`) — paint and
            geometry live in the skin regardless. */}
        {arrows && (
          <>
            <button
              className="absolute start-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="prev"
              onClick={prev}
              aria-label={carouselLabel('carousel.previousSlide', 'Previous slide')}
              type="button"
            >
              {vertical ? '\u2191' : '\u2190'}
            </button>
            <button
              className="absolute end-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="next"
              onClick={next}
              aria-label={carouselLabel('carousel.nextSlide', 'Next slide')}
              type="button"
            >
              {vertical ? '\u2193' : '\u2192'}
            </button>
          </>
        )}

        {/* Navigation Dots — placement utilities stay inline for the same
            test-pin reason; size/shape/rhythm are skin-owned. */}
        {dots && (
          <div
            className={dotsPositionClass}
            data-part="dots"
            data-dots-position={dotPosition}
            role="tablist"
            aria-label={carouselLabel('carousel.navigation', 'Carousel navigation')}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                data-part="dot"
                data-selected={index === currentSlide ? 'true' : 'false'}
                onClick={() => goTo(index)}
                aria-label={carouselLabel('carousel.goToSlide', `Go to slide ${index + 1}`, { index: index + 1 })}
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
