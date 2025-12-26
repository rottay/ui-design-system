/**
 * Performance utility for shallow comparison of props
 * Used with React.memo to prevent unnecessary re-renders
 */

/**
 * Shallow compares two objects for equality
 * @param prevProps - Previous props object
 * @param nextProps - Next props object
 * @returns true if props are equal, false otherwise
 */
export function arePropsEqual<T extends Record<string, unknown>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a custom comparison function that ignores specific props
 * @param keysToIgnore - Array of prop keys to ignore in comparison
 * @returns A comparison function for React.memo
 */
export function createPropsComparator<T extends Record<string, unknown>>(
  keysToIgnore: (keyof T)[]
): (prevProps: T, nextProps: T) => boolean {
  return (prevProps: T, nextProps: T) => {
    const filteredPrevKeys = Object.keys(prevProps).filter(
      (key) => !keysToIgnore.includes(key as keyof T)
    );
    const filteredNextKeys = Object.keys(nextProps).filter(
      (key) => !keysToIgnore.includes(key as keyof T)
    );

    if (filteredPrevKeys.length !== filteredNextKeys.length) {
      return false;
    }

    for (const key of filteredPrevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }

    return true;
  };
}
