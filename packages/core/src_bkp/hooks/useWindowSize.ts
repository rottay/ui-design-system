import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * useWindowSize Hook
 *
 * Tracks the current window dimensions
 * Updates on resize with debouncing for performance
 *
 * @returns { width, height } object with current window dimensions
 *
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 *
 * const columns = width > 1200 ? 4 : width > 768 ? 2 : 1;
 *
 * return (
 *   <div>
 *     <p>Window: {width}x{height}</p>
 *     <Grid columns={columns}>...</Grid>
 *   </div>
 * );
 * ```
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // Debounce resize events for performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}
