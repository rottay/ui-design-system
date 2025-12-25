import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para detectar media queries en React.
 * SSR-safe: retorna false en el servidor.
 *
 * @param query - Media query string (ej: '(min-width: 640px)')
 * @returns boolean - true si la media query coincide
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 639px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe: default to false on server
  const [matches, setMatches] = useState<boolean>(false);

  // Memoize callback to avoid recreating on every render
  const updateMatches = useCallback((e: MediaQueryListEvent | MediaQueryList) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener that works with both event and object
    const listener = (e: MediaQueryListEvent) => updateMatches(e);

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    // Legacy support (Safari < 14)
    if ('addListener' in mediaQuery && typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener as any);
      return () => {
        if ('removeListener' in mediaQuery && typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(listener as any);
        }
      };
    }

    // No listener support - just set initial value
    return undefined;
  }, [query, updateMatches]);

  return matches;
}
