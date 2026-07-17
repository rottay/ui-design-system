"use client";

/**
 * Shared motion + reveal primitives for the commercial kit.
 *
 * Spec: commercial-surfaces/README.md section 6 (Motion law). One place enforces the two
 * non-negotiables: every reveal collapses to instant-and-visible under
 * `prefers-reduced-motion: reduce`, and nothing loops. Every animated kit component consumes
 * `useReveal` so the law cannot be forgotten per component.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/graphics/motion/react/runtime";

export interface UseRevealOptions {
  /** Fraction of the element visible before the one-shot reveal fires (default 0.35). */
  threshold?: number;
  /** Reveal immediately on mount instead of waiting for scroll (default false). */
  immediate?: boolean;
}

export interface UseRevealResult<T extends HTMLElement> {
  /** Attach to the element whose entrance triggers the reveal. */
  ref: React.RefObject<T | null>;
  /** True once the element has entered the viewport (or immediately under reduced motion). */
  revealed: boolean;
  /**
   * True when motion should actually animate. False under reduced motion — consumers must
   * render the final state instantly when this is false.
   */
  animate: boolean;
}

/**
 * One-shot scroll reveal, reduced-motion-aware.
 *
 * Fires exactly ONCE when the element scrolls into view (spec section 6: "once per element,
 * never looping"). Under `prefers-reduced-motion: reduce` — or when IntersectionObserver is
 * unavailable — it resolves to `revealed: true, animate: false` so the content is present
 * and legible with no animation.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  options: UseRevealOptions = {},
): UseRevealResult<T> {
  const { threshold = 0.35, immediate = false } = options;
  const reduced = useReducedMotion();
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(reduced);
  const resolvedStaticRef = useRef(reduced);

  useEffect(() => {
    if (reduced) {
      // SSR/hydration and live reduced-motion changes resolve to the final
      // visible state. Latch that decision for this mount so a later
      // non-reduced snapshot cannot animate content that was already shown.
      resolvedStaticRef.current = true;
      setRevealed(true);
      return;
    }
    if (resolvedStaticRef.current) return;
    if (immediate) {
      setRevealed(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      resolvedStaticRef.current = true;
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, immediate, threshold]);

  return {
    ref,
    revealed,
    animate: revealed && !reduced && !resolvedStaticRef.current,
  };
}
