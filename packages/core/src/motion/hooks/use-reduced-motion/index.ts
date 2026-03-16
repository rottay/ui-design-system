'use client';

/**
 * @fileoverview useReducedMotion - Rottay Design System
 * @description Lightweight hook for the browser's `prefers-reduced-motion` setting.
 */

import { useEffect, useState } from 'react';

/** Track the user's reduced-motion preference using `matchMedia`. */
export function useReducedMotion(): boolean {
  // Default to false (motion enabled) during SSR and initial hydration.
  // This prevents a flash of no-animation on the first render in browsers
  // that do not have reduced motion enabled.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Synchronize immediately on mount because the initial useState(false)
    // may not match the actual OS preference.
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
