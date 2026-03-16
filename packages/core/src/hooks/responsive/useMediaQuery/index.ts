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
  // Initialize to false for SSR safety. During server rendering, there is no
  // viewport, so returning false avoids hydration mismatches. The real value
  // is set once the effect runs client-side.
  const [matches, setMatches] = useState<boolean>(false);

  // Memoize the callback with an empty dependency array so the listener
  // reference stays stable across renders. Without this, the effect would
  // re-subscribe on every render since the inline function identity changes.
  const updateMatches = useCallback((e: MediaQueryListEvent | MediaQueryList) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    // Guard against SSR and environments without matchMedia (e.g. jsdom).
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Synchronously set the initial value so the first paint reflects
    // the actual viewport rather than the false default.
    setMatches(mediaQuery.matches);

    // Wrap the memoized updater to satisfy the MediaQueryListEvent signature.
    const listener = (e: MediaQueryListEvent) => updateMatches(e);

    // Modern browsers (Chrome 39+, Firefox 55+, Safari 14+) support the
    // standard EventTarget API on MediaQueryList.
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    // Legacy fallback for Safari < 14 which only supports the deprecated
    // addListener/removeListener API. The `as any` cast is intentional
    // because the legacy API expects a slightly different callback shape.
    if ('addListener' in mediaQuery && typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener as any);
      return () => {
        if ('removeListener' in mediaQuery && typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(listener as any);
        }
      };
    }

    // Extremely old environments with no listener support at all.
    // The initial value was already set above; no cleanup needed.
    return undefined;
  }, [query, updateMatches]);
  // Re-subscribe whenever the query string changes or the callback reference
  // updates (which is never, due to the empty deps on useCallback).

  return matches;
}
