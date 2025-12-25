import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

/**
 * useUpdateEffect Hook
 *
 * Like useEffect but skips the first mount
 * Only runs on updates, not on initial render
 *
 * @param effect - effect callback
 * @param deps - dependency array
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 *
 * // This runs on mount AND updates
 * useEffect(() => {
 *   console.log('Runs on mount and updates:', count);
 * }, [count]);
 *
 * // This ONLY runs on updates, NOT on mount
 * useUpdateEffect(() => {
 *   console.log('Only runs on updates:', count);
 * }, [count]);
 *
 * return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
 * ```
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}
