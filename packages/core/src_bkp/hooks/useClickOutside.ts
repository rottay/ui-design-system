import { useEffect, RefObject } from 'react';

/**
 * useClickOutside Hook
 *
 * Detects clicks outside of a referenced element
 * Useful for closing dropdowns, modals, and popovers
 *
 * @param ref - React ref to the element
 * @param callback - function to call when clicking outside
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const menuRef = useRef<HTMLDivElement>(null);
 *
 * useClickOutside(menuRef, () => setIsOpen(false));
 *
 * return (
 *   <div ref={menuRef}>
 *     <button onClick={() => setIsOpen(true)}>Open Menu</button>
 *     {isOpen && <Menu />}
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Check if click is outside the element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, callback]);
}
