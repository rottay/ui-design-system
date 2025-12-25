import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 *
 * Delays updating a value until after a specified delay has elapsed
 * Useful for search inputs, API calls, and expensive operations
 *
 * @param value - value to debounce
 * @param delay - delay in milliseconds
 * @returns debounced value
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // Make API call only after user stops typing for 500ms
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 *
 * return (
 *   <input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes (also on unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
