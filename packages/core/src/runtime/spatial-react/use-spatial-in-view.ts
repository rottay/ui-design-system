'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Continuous GPU work is denied when viewport evidence is unavailable. */
export function useSpatialInView(
  ref: RefObject<Element | null>,
  rootMargin = '160px',
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    setInView(false);
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;

    let mounted = true;
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (mounted) setInView(entry?.isIntersecting === true);
        },
        { rootMargin, threshold: 0 },
      );
      observer.observe(element);
    } catch {
      mounted = false;
      try {
        observer?.disconnect();
      } catch {
        // Hostile/partial observers must fail closed without breaking the host.
      }
      return undefined;
    }

    return () => {
      mounted = false;
      try {
        observer?.disconnect();
      } catch {
        // Teardown is best-effort and must remain safe during rapid unmounts.
      }
    };
  }, [ref, rootMargin]);

  return inView;
}
