import { useRef, useCallback, useEffect } from 'react';

/**
 * useThrottle Hook
 *
 * Limits the rate at which a function can fire
 * Useful for scroll handlers, resize events, and rate limiting
 *
 * @param callback - function to throttle
 * @param delay - minimum time between calls in milliseconds
 * @returns throttled function
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll event - fires max once per 100ms');
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRan = now - lastRan.current;

      if (timeSinceLastRan >= delay) {
        // Enough time has passed, execute immediately
        callback(...args);
        lastRan.current = now;
      } else {
        // Not enough time has passed, schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRan.current = Date.now();
          },
          delay - timeSinceLastRan
        );
      }
    },
    [callback, delay]
  );
}
