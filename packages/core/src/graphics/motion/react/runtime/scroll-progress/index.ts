'use client';

/**
 * @fileoverview useScrollProgress hook - Rottay Design System
 *
 * Returns a normalized `0..1` value representing how far the user has
 * scrolled within either a specific scrollable container or the full page.
 * Useful for driving scroll-linked progress bars, reading indicators,
 * and parallax intensity calculations.
 *
 * @example
 * ```ts
 * // Track window scroll
 * const progress = useScrollProgress();
 *
 * // Track a scrollable container
 * const containerRef = useRef<HTMLDivElement>(null);
 * const progress = useScrollProgress(containerRef);
 * ```
 */

import { useEffect, useState, type RefObject } from 'react';

/**
 * Return a normalized `0..1` scroll progress value for the target
 * container or the window.
 *
 * The scroll listener is registered with `{ passive: true }` to avoid
 * blocking the browser's scroll compositor thread, which is critical for
 * maintaining 60 fps during scroll-linked animations.
 *
 * @param target - Optional ref to a scrollable container. When omitted, the hook tracks `window` scroll.
 * @returns A number between `0` (top) and `1` (fully scrolled).
 */
export function useScrollProgress(target?: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = target?.current;

    const handleScroll = () => {
      if (element) {
        // For element-level scroll, the scrollable range is the difference
        // between the total content height and the visible client height.
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const scrolled = element.scrollTop;
        setProgress(scrollHeight > 0 ? Math.min(Math.max(scrolled / scrollHeight, 0), 1) : 0);
      } else {
        // Fall back to window-level progress when no specific target is supplied.
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        setProgress(windowHeight > 0 ? Math.min(Math.max(scrolled / windowHeight, 0), 1) : 0);
      }
    };

    // Attach to either the specific element or window. The `passive` flag
    // tells the browser this handler will never call `preventDefault()`,
    // enabling scroll-performance optimizations.
    if (element) element.addEventListener('scroll', handleScroll, { passive: true });
    else window.addEventListener('scroll', handleScroll, { passive: true });

    // Calculate initial progress in case the page loads mid-scroll
    // (e.g. browser back-navigation or anchor links).
    handleScroll();

    return () => {
      if (element) element.removeEventListener('scroll', handleScroll);
      else window.removeEventListener('scroll', handleScroll);
    };
  }, [target]);

  return progress;
}
