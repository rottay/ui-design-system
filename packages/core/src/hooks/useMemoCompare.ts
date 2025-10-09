import { useRef, useEffect } from 'react';

/**
 * useMemoCompare Hook
 *
 * Memoizes a value with custom comparison function
 * Only updates when the custom compare function returns true
 *
 * @param value - value to memoize
 * @param compare - function that returns true if values should be considered equal
 * @returns memoized value
 *
 * @example
 * ```tsx
 * const user = { id: 1, name: 'John', timestamp: Date.now() };
 *
 * // Only re-render if id or name changes, ignore timestamp
 * const memoizedUser = useMemoCompare(user, (prev, next) =>
 *   prev?.id === next.id && prev?.name === next.name
 * );
 *
 * // Deep comparison for objects
 * const config = { theme: 'dark', lang: 'en' };
 * const memoizedConfig = useMemoCompare(config, (prev, next) =>
 *   JSON.stringify(prev) === JSON.stringify(next)
 * );
 * ```
 */
export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const ref = useRef<T>();

  useEffect(() => {
    // Only update if compare function returns false (values are different)
    if (!compare(ref.current, value)) {
      ref.current = value;
    }
  });

  return ref.current ?? value;
}
