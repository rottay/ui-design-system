'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Particle-specific viewport gate.
 *
 * Unlike entrance-motion hooks, this continuous-work boundary cannot assume
 * IntersectionObserver exists. Missing API support is deliberately static.
 */
export function useParticleInView(
  ref: RefObject<Element | null>,
  rootMargin = '200px',
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    setInView(false);
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;

    let mounted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (mounted) setInView(entry?.isIntersecting === true);
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(element);

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return inView;
}
