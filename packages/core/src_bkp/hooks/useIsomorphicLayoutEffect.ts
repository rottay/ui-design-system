import { useEffect, useLayoutEffect } from 'react';

/**
 * useIsomorphicLayoutEffect Hook
 *
 * Uses useLayoutEffect on client, useEffect on server (SSR-safe)
 * Prevents warnings in Next.js and other SSR frameworks
 *
 * @example
 * ```tsx
 * function Component() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [height, setHeight] = useState(0);
 *
 *   // ❌ This causes warnings in Next.js
 *   // useLayoutEffect(() => {
 *   //   setHeight(ref.current?.offsetHeight ?? 0);
 *   // }, []);
 *
 *   // ✅ This works in both CSR and SSR
 *   useIsomorphicLayoutEffect(() => {
 *     setHeight(ref.current?.offsetHeight ?? 0);
 *   }, []);
 *
 *   return <div ref={ref}>Height: {height}px</div>;
 * }
 * ```
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
