'use client';

/**
 * @fileoverview useMediaQuery Hook - Rottay Design System
 * @description SSR-safe React hook for subscribing to CSS media queries,
 * enabling reactive responsive behavior in components.
 *
 * @remarks
 * Supports all valid CSS media queries:
 * - Viewport: `(min-width: 768px)`, `(max-width: 1024px)`
 * - Preference: `(prefers-color-scheme: dark)`, `(prefers-reduced-motion)`
 * - Device: `(hover: none)`, `(pointer: coarse)`
 * - Combined: `(min-width: 640px) and (orientation: landscape)`
 *
 * @example Dark mode detection
 * ```tsx
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 *
 * @example Custom breakpoint
 * ```tsx
 * const isWide = useMediaQuery('(min-width: 1400px)');
 * ```
 *
 * @module System/Hooks/Responsive/useMediaQuery
 * @category System
 * @package @rottay/design-system
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect CSS media queries in React.
 *
 * Provides reactive media query detection with automatic updates when the
 * viewport changes. SSR-safe: returns false on the server to prevent
 * hydration mismatches.
 *
 * Supports all valid CSS media query strings including:
 * - Viewport queries: `(min-width: 640px)`, `(max-width: 1024px)`
 * - Feature queries: `(prefers-color-scheme: dark)`, `(prefers-reduced-motion: reduce)`
 * - Device queries: `(hover: none)`, `(pointer: coarse)`
 * - Combined queries: `(min-width: 640px) and (max-width: 1023px)`
 *
 * @example
 * ```tsx
 * import { useMediaQuery } from '@rottay/design-system';
 *
 * function AdaptiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 639px)');
 *   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 *   const isLandscape = useMediaQuery('(orientation: landscape)');
 *
 *   return (
 *     <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *       {isLandscape && <LandscapeOptimizedContent />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @param query - A valid CSS media query string (e.g., '(min-width: 640px)')
 * @returns {boolean} True if the media query matches, false otherwise (or on server)
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
