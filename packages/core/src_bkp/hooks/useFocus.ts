import { useState, useRef, useEffect, RefObject } from 'react';

/**
 * useFocus Hook
 *
 * Detects when an element has focus
 *
 * @returns [ref, isFocused] tuple
 *
 * @example
 * ```tsx
 * const [inputRef, isFocused] = useFocus<HTMLInputElement>();
 *
 * return (
 *   <div>
 *     <input
 *       ref={inputRef}
 *       placeholder="Focus me"
 *       style={{ borderColor: isFocused ? 'blue' : 'gray' }}
 *     />
 *     {isFocused && <HelpText>You can type here!</HelpText>}
 *   </div>
 * );
 * ```
 */
export function useFocus<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  boolean
] {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);

    return () => {
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, []);

  return [ref, isFocused];
}
