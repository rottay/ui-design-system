'use client';

/**
 * @fileoverview useMousePosition hook - Rottay Design System
 *
 * Tracks mouse coordinates relative to a specific DOM element, returning
 * element-local x/y values and a boolean indicating whether the pointer
 * is currently inside. Commonly used by the `Magnetic` and `Spotlight`
 * motion primitives to drive cursor-reactive visual effects.
 *
 * @example
 * ```ts
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { x, y, isInside } = useMousePosition(containerRef);
 * ```
 */

import { useEffect, useState, type RefObject } from 'react';

/**
 * Shape returned by the {@link useMousePosition} hook.
 */
export interface MousePosition {
  /** Horizontal offset in pixels from the element's left edge. */
  x: number;
  /** Vertical offset in pixels from the element's top edge. */
  y: number;
  /** `true` while the cursor is inside the observed element's bounding box. */
  isInside: boolean;
}

/**
 * Return element-local mouse coordinates plus whether the pointer is
 * currently inside the observed element.
 *
 * Attaches native `mousemove` and `mouseleave` listeners directly to the
 * target element (not `window`) so the hook only fires when the pointer
 * interacts with the specific UI region, minimizing unnecessary state updates.
 *
 * @param ref - React ref pointing to the element to track.
 * @returns {@link MousePosition} with element-relative coordinates.
 */
export function useMousePosition(ref: RefObject<HTMLElement | null>): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    isInside: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Convert viewport coordinates into element-local coordinates by
      // subtracting the element's bounding rect origin. This makes the
      // values immediately usable for CSS transforms or canvas drawing
      // without further math at the call site.
      const rect = element.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        isInside: true,
      });
    };

    // On leave, preserve the last known x/y so effects can animate out
    // from the exit position rather than snapping to (0, 0).
    const handleMouseLeave = () => {
      setMousePosition((prev) => ({ ...prev, isInside: false }));
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return mousePosition;
}
