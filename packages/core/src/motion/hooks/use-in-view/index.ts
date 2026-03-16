'use client';

/**
 * @fileoverview useInView hook - Rottay Design System
 *
 * A lightweight IntersectionObserver wrapper used by motion primitives and
 * other viewport-aware UI components. Provides a boolean `inView` flag and
 * the raw `IntersectionObserverEntry` for advanced consumers that need
 * intersection ratios or bounding-rect data.
 *
 * @example
 * ```ts
 * const ref = useRef<HTMLDivElement>(null);
 * const { inView } = useInView(ref, { threshold: 0.5, once: true });
 * ```
 */

import { useEffect, useState, type RefObject } from 'react';

/**
 * Configuration options for the {@link useInView} hook.
 */
export interface UseInViewOptions {
  /** Visibility ratio(s) at which the observer fires. Defaults to `0`. */
  threshold?: number | number[];
  /** CSS-style margin around the root, e.g. `"-100px"`. Defaults to `'0px'`. */
  rootMargin?: string;
  /** When `true`, the observer disconnects after the first intersection. */
  once?: boolean;
}

/**
 * Return type of the {@link useInView} hook.
 */
export interface UseInViewResult {
  /** Whether the observed element is currently intersecting the viewport. */
  inView: boolean;
  /** The latest raw observer entry, or `null` before the first observation. */
  entry: IntersectionObserverEntry | null;
}

/**
 * Observe whether the provided element is currently in the viewport.
 *
 * Internally creates a single `IntersectionObserver` per hook instance and
 * cleans it up on unmount. When `once` is `true`, the observer automatically
 * unobserves after the first intersection, freeing browser resources for
 * entrance-animation use cases.
 *
 * @param ref - React ref pointing to the DOM element to observe.
 * @param options - {@link UseInViewOptions} controlling threshold, margin, and one-shot behavior.
 * @returns {@link UseInViewResult} with the current visibility state.
 */
export function useInView(
  ref: RefObject<Element | null>,
  options: UseInViewOptions = {}
): UseInViewResult {
  const { threshold = 0, rootMargin = '0px', once = false } = options;
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);

        if (observerEntry.isIntersecting) {
          setInView(true);
          // `once` is useful for entrance animations that should not replay.
          // Unobserving immediately avoids unnecessary future callbacks.
          if (once) observer.unobserve(element);
        } else if (!once) {
          // Only reset to false when not in one-shot mode, so the
          // `inView` flag stays true permanently after the first trigger.
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref, threshold, rootMargin, once]);

  return { inView, entry };
}
