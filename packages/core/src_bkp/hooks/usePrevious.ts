import { useRef, useEffect } from 'react';

/**
 * usePrevious Hook
 *
 * Stores and returns the previous value of a variable
 * Useful for comparing current vs previous values
 *
 * @param value - current value to track
 * @returns previous value
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * return (
 *   <div>
 *     <p>Current: {count}</p>
 *     <p>Previous: {prevCount}</p>
 *     <p>Changed by: {count - (prevCount ?? 0)}</p>
 *     <button onClick={() => setCount(count + 1)}>Increment</button>
 *   </div>
 * );
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
