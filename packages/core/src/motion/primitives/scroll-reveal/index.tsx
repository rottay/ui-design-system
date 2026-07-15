'use client';

/**
 * @fileoverview ScrollReveal motion primitive - Rottay Design System
 *
 * A viewport-triggered reveal component that fades and optionally slides
 * content upward as it scrolls into view. Unlike `FadeIn`, ScrollReveal
 * exposes IntersectionObserver-level controls (`threshold`, `rootMargin`)
 * for fine-grained trigger tuning within long scrollable pages.
 *
 * @example
 * ```tsx
 * <ScrollReveal threshold={0.25} rootMargin="-50px">
 *   <FeatureSection />
 * </ScrollReveal>
 * ```
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { ScrollRevealProps } from '../../types';
import { useMotionPersonality } from '../../hooks';

/** True when the browser can drive reveals from the scroll timeline via CSS. */
function supportsScrollTimeline(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'view()')
  );
}

/**
 * Reveal content when it enters the viewport, with configurable intersection thresholds.
 *
 * The component delegates entrance style (fade, slide, spring, bounce) to the
 * active motion personality and passes `threshold` and `rootMargin` straight
 * through to Motion's `viewport` option, which maps to IntersectionObserver.
 *
 * @param props - {@link ScrollRevealProps}
 * @param props.children - Content to reveal on scroll.
 * @param props.threshold - Fraction of the element that must be visible to trigger. Defaults to `0.1`.
 * @param props.rootMargin - CSS margin string applied to the intersection root (e.g. `"-100px"`).
 * @param props.once - When `true` (default), the animation plays only on first intersection.
 * @param props.className - CSS class applied to the motion wrapper.
 * @param props.style - Inline styles applied to the motion wrapper.
 * @returns A `motion.div` that animates into view based on scroll position.
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, threshold = 0.1, rootMargin, once = true, className, style }, ref) => {
    const motionPersonality = useMotionPersonality();
    const shouldReduceMotion = motionPersonality.shouldReduceMotion;

    // Feature detection is deferred to mount so the server render and the first
    // client render agree (a synchronous probe would diverge and trip
    // hydration). Until then the Motion fallback path renders.
    const [useCssTimeline, setUseCssTimeline] = useState(false);
    useEffect(() => {
      if (supportsScrollTimeline()) {
        setUseCssTimeline(true);
      }
    }, []);

    // CSS-first path: when the browser supports scroll-driven animation, the
    // reveal is owned entirely by the `ds-scroll-reveal` class (see
    // transitions.css). The wrapper carries no Motion animation props,
    // so no JavaScript-driven animation runs; the CSS `view()` timeline is the
    // sole animator. `threshold` and `rootMargin` describe an
    // IntersectionObserver contract that the `view()` timeline approximates
    // rather than honors literally; they remain in the public API for the
    // fallback path below. Reduced-motion is handled by the guarded media block
    // in transitions.css.
    if (useCssTimeline) {
      return (
        <motion.div
          ref={ref}
          className={['ds-scroll-reveal', className].filter(Boolean).join(' ')}
          style={style}
        >
          {children}
        </motion.div>
      );
    }

    // Two easing curves tuned for perceptual smoothness: `slideEase` has a
    // sharper initial acceleration for positional movement, while `fadeEase`
    // is gentler and better suited for pure opacity transitions.
    const slideEase = [0.22, 1, 0.36, 1] as const;
    const fadeEase = [0.16, 1, 0.3, 1] as const;

    // -- Transition selection -------------------------------------------------
    // Floor the tween duration at 0.2s so the entrance is always perceptible
    // even if the personality configures a very short default.
    const transition = shouldReduceMotion || motionPersonality.entrance === 'none'
      ? { duration: 0 }
      : motionPersonality.entrance === 'spring' || motionPersonality.entrance === 'bounce' || motionPersonality.useSpring
        ? {
            type: 'spring' as const,
            stiffness: motionPersonality.springTension,
            damping: motionPersonality.springFriction,
            bounce: motionPersonality.entrance === 'bounce' ? 0.28 : 0.14,
          }
        : {
            duration: Math.max(motionPersonality.durationSeconds, 0.2),
            ease: motionPersonality.entrance === 'slideUp' ? slideEase : fadeEase,
          };

    // -- Initial state --------------------------------------------------------
    // `fade` entrance omits the vertical offset for a clean crossfade; all
    // other modes use the personality's `offsetDistance` for the upward slide.
    const initial =
      shouldReduceMotion || motionPersonality.entrance === 'none'
        ? { opacity: 1, y: 0 }
        : motionPersonality.entrance === 'fade'
          ? { opacity: 0, y: 0 }
          : { opacity: 0, y: motionPersonality.offsetDistance };

    return (
      <motion.div
        ref={ref}
        initial={initial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once, amount: threshold, margin: rootMargin }}
        transition={transition}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';
