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
 * the arrow glyphs are governed `navigation.*` icons whose horizontal roles
 * auto-mirror through the icon facade, and the horizontal slide offset
 * multiplies by `--ds-carousel-rtl-factor` (1 in LTR, -1 under `:dir(rtl)`)
 * so the travel direction mirrors too. The `left-1/2` horizontal centring of
 * top/bottom dot rows is deliberately PHYSICAL: it is direction-invariant,
 * and a logical `start-1/2` would break the centre in RTL.
 *
 * Phase B additions: the contract's `swipe` and `pauseOnDotsHover` props are
 * now honored (touch swipe with a dominant-axis deliberate-gesture threshold,
 * dots-only autoplay pause); autoplay is OFF and slide transitions are
 * removed under reduced motion; non-current slides are `inert` so focus can
 * never land inside an `aria-hidden` slide.
 *
 * Phase B second pass (P2): the remaining contract slots are honored too —
 * `prevArrow`/`nextArrow` replace the default governed glyph (caller
 * composition, the Tree `switcherIcon` idiom), `dotsClass` rides the dots
 * container, and `effect='fade'` merges with the `fade` boolean into one
 * crossfade mode. `slidesToShow`/`slidesToScroll` stay unhonored: multi-slide
 * track geometry is a feature, not a prop alias (documented debt).
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
import { VisuallyHidden } from '../../../../foundation';
import { CAROUSEL_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useMotionPolicy } from '@/infrastructure/runtime/motion';
import { NavigationBackIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-back';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';
import { NavigationUpIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-up';
import { NavigationDownIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-down';

/**
 * Deliberate-gesture floor for swipe navigation: below this the pointer was
 * scrolling or drifting, not turning a page. Not a visual axis — a JS
 * behavior constant, so it stays a module literal (no token).
 */
const SWIPE_THRESHOLD_PX = 40;

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
      pauseOnDotsHover = CAROUSEL_DEFAULTS.pauseOnDotsHover,
      swipe = CAROUSEL_DEFAULTS.swipe,
      vertical = CAROUSEL_DEFAULTS.vertical,
      fade = CAROUSEL_DEFAULTS.fade,
      effect = CAROUSEL_DEFAULTS.effect,
      prevArrow,
      nextArrow,
      dotsClass,
      children,
      className = '',
      style,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = props;

    // The contract carries BOTH `effect` (Ant API) and the `fade` boolean:
    // `effect='fade'` is the same crossfade request, so they merge into one
    // mode flag. `slidesToShow`/`slidesToScroll` stay unhonored (multi-slide
    // track geometry is a feature, not a prop alias -- documented debt).
    const fadeEffect = fade || effect === 'fade';

    // Reduced-motion law: autoplay is continuous motion and must be OFF when
    // the user (or the tenant motion policy) asks for reduction, and slide
    // transitions land directly in the final state. `useMotionPolicy` is the
    // provider-free bridge (OS store fallback), unlike useMotionPersonality
    // which requires the tenant provider tree.
    const { reduce: reduceMotion } = useMotionPolicy();

    // Flatten children into an array so we can index into individual slides
    // and derive the total count for boundary checks and dot rendering.
    const slides = React.Children.toArray(children);
    const [currentSlide, setCurrentSlide] = useState(initialSlide);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // Autoplay timer ref is stored outside state to avoid triggering
    // re-renders when the interval is created or cleared.
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);
    // Swipe start point (touch pointer only); null outside an active gesture.
    const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);

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
     * Autoplay is continuous motion: reduced-motion turns it OFF entirely
     * (WCAG 2.2.2 — the user navigates manually instead).
     */
    useEffect(() => {
      if (autoplay && !isPaused && !reduceMotion) {
        autoplayRef.current = setInterval(next, autoplaySpeed);
      }
      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }, [autoplay, autoplaySpeed, isPaused, next, reduceMotion]);

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

    /**
     * Touch swipe navigation (the contract's `swipe` prop, now actually
     * honored by this engine). Pointer Events with a touch filter: mouse
     * drags keep their selection semantics. The dominant axis decides — a
     * mostly-vertical gesture on a horizontal carousel is the page scroll the
     * skin's `touch-action: pan-y` already allowed, so it is ignored here.
     * RTL mirrors the slide travel (the skin's `--ds-carousel-rtl-factor`),
     * so the gesture-to-direction mapping mirrors with it (same `closest
     * [dir]` idiom as the keyboard handler).
     */
    const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!swipe || event.pointerType !== 'touch' || !event.isPrimary) return;
      swipeStartRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    };
    const handleTrackPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!start || start.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (vertical) {
        if (Math.abs(deltaY) < SWIPE_THRESHOLD_PX || Math.abs(deltaY) <= Math.abs(deltaX)) return;
        if (deltaY < 0) next(); else prev();
        return;
      }
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      const isRtl = event.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';
      const towardNext = isRtl ? deltaX > 0 : deltaX < 0;
      if (towardNext) next(); else prev();
    };
    const handleTrackPointerCancel = () => {
      swipeStartRef.current = null;
    };

    /**
     * Dots-only pause contract: with `pauseOnHover` off, hovering the dots
     * can still pause autoplay (the Ant parity prop, previously unwired).
     */
    const handleDotsMouseEnter = () => {
      if (pauseOnDotsHover) setIsPaused(true);
    };
    const handleDotsMouseLeave = () => {
      if (pauseOnDotsHover) setIsPaused(false);
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

    // Boundary law: with `infinite` off, the edge arrow is a dead control —
    // expose the real disabled state instead of a silent no-op click.
    const prevDisabled = !infinite && currentSlide === 0;
    const nextDisabled = !infinite && currentSlide === slides.length - 1;

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
        data-fade={fadeEffect ? 'true' : undefined}
        data-swipe={swipe ? 'true' : undefined}
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
          onPointerDown={handleTrackPointerDown}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerCancel}
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
                // direction mirrors in RTL. Reduced motion lands in the final
                // state with NO transition (compositor-safe transform/opacity
                // either way).
                opacity: fadeEffect ? (index === currentSlide ? 1 : 0) : 1,
                '--ds-carousel-slide-transform': fadeEffect
                  ? 'none'
                  : vertical
                    ? `translateY(${(index - currentSlide) * 100}%)`
                    : `translateX(calc(${(index - currentSlide) * 100}% * var(--ds-carousel-rtl-factor, 1)))`,
                transition: reduceMotion
                  ? 'none'
                  : `transform ${speed}ms var(--ds-motion-ease-out), opacity ${speed}ms var(--ds-motion-ease-out)`,
              } as React.CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={carouselLabel('carousel.slideOf', `Slide ${index + 1} of ${slides.length}`, { index: index + 1, total: slides.length })}
              aria-hidden={index !== currentSlide}
              inert={index !== currentSlide ? true : undefined}
            >
              {slide}
            </div>
          ))}
        </div>

        {/* Navigation Arrows — `start-2`/`end-2` are LOGICAL (inset-inline-*):
            both buttons mirror sides under RTL. The default glyphs are GOVERNED
            icons: navigation.back/forward auto-mirror through the icon facade
            (no skin flip), navigation.up/down are direction-invariant. The
            contract's `prevArrow`/`nextArrow` slots replace the default glyph
            wholesale (caller composition, the Tree `switcherIcon` idiom). The
            vertical defaults keep their legacy text glyph as a visually-hidden
            landing hook — the K4-C engine test pins `textContent` `↑`/`↓`
            verbatim; the SVG contributes none. The positional utilities stay
            inline on purpose (same test-pin law) — paint and geometry live in
            the skin regardless. */}
        {arrows && (
          <>
            <button
              className="absolute start-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="prev"
              onClick={prev}
              disabled={prevDisabled}
              aria-label={carouselLabel('carousel.previousSlide', 'Previous slide')}
              type="button"
            >
              {prevArrow ?? (vertical ? (
                <>
                  <NavigationUpIcon decorative size={16} />
                  <VisuallyHidden>{'↑'}</VisuallyHidden>
                </>
              ) : (
                <NavigationBackIcon decorative size={16} />
              ))}
            </button>
            <button
              className="absolute end-2 top-1/2 -translate-y-1/2 z-10"
              data-part="arrow"
              data-direction="next"
              onClick={next}
              disabled={nextDisabled}
              aria-label={carouselLabel('carousel.nextSlide', 'Next slide')}
              type="button"
            >
              {nextArrow ?? (vertical ? (
                <>
                  <NavigationDownIcon decorative size={16} />
                  <VisuallyHidden>{'↓'}</VisuallyHidden>
                </>
              ) : (
                <NavigationForwardIcon decorative size={16} />
              ))}
            </button>
          </>
        )}

        {/* Navigation Dots — placement utilities stay inline for the same
            test-pin reason; size/shape/rhythm are skin-owned. The current dot
            reads through SHAPE (the elongation), never color alone. The
            contract's `dotsClass` rides the container as a caller hook. */}
        {dots && (
          <div
            className={`${dotsPositionClass}${dotsClass ? ` ${dotsClass}` : ''}`}
            data-part="dots"
            data-dots-position={dotPosition}
            role="tablist"
            aria-label={carouselLabel('carousel.navigation', 'Carousel navigation')}
            onMouseEnter={handleDotsMouseEnter}
            onMouseLeave={handleDotsMouseLeave}
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
