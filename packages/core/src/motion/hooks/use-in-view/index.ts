'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

export interface UseInViewResult {
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}

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
          if (once) observer.unobserve(element);
        } else if (!once) {
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
