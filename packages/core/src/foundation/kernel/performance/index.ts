/**
 * @fileoverview Shallow props comparison utilities for React.memo optimization.
 *
 * Provides `arePropsEqual` for generic shallow comparison and
 * `createPropsComparator` for comparison that ignores specified keys
 * (useful for unstable callbacks or refs). These are best-effort
 * optimizations -- only use when a component measurably benefits.
 */

/**
 * Shallow compares two objects for equality.
 * Useful for React.memo comparisons to prevent unnecessary re-renders.
 *
 * @example
 * ```tsx
 * import { memo } from 'react';
 * import { arePropsEqual } from '@rottay/design-system';
 *
 * const MyComponent = memo(({ name, count }) => {
 *   return <div>{name}: {count}</div>;
 * }, arePropsEqual);
 * ```
 *
 * @param prevProps - Previous props object
 * @param nextProps - Next props object
 * @returns true if props are shallowly equal, false otherwise
 */
export function arePropsEqual<T extends Record<string, unknown>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  // Different key counts means props were added or removed.
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  // Strict identity check (===) per key. This intentionally does NOT
  // deep-compare objects/arrays -- that's the caller's responsibility
  // via memoization (useMemo/useCallback).
  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a custom comparison function that ignores specific props.
 * Useful when certain props (like callbacks or refs) should not trigger re-renders.
 *
 * @example
 * ```tsx
 * import { memo } from 'react';
 * import { createPropsComparator } from '@rottay/design-system';
 *
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 *   onHover?: () => void;
 * }
 *
 * // Ignore callback props that change on every render
 * const compareProps = createPropsComparator<ButtonProps>(['onClick', 'onHover']);
 *
 * const Button = memo(({ label, onClick }) => {
 *   return <button onClick={onClick}>{label}</button>;
 * }, compareProps);
 * ```
 *
 * @param keysToIgnore - Array of prop keys to exclude from comparison
 * @returns A comparison function compatible with React.memo
 */
export function createPropsComparator<T extends Record<string, unknown>>(
  keysToIgnore: (keyof T)[]
): (prevProps: T, nextProps: T) => boolean {
  // Returns a closure that captures keysToIgnore once, avoiding repeated
  // array allocation on every comparison call.
  return (prevProps: T, nextProps: T) => {
    // Ignored keys are excluded from both sides so unstable callbacks/refs
    // don't invalidate an otherwise stable render.
    const filteredPrevKeys = Object.keys(prevProps).filter(
      (key) => !keysToIgnore.includes(key as keyof T)
    );
    const filteredNextKeys = Object.keys(nextProps).filter(
      (key) => !keysToIgnore.includes(key as keyof T)
    );

    // Different remaining key counts means a non-ignored prop was added/removed.
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
