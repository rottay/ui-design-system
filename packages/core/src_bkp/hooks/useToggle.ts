import { useState, useCallback } from 'react';

/**
 * useToggle Hook
 *
 * Simplifies managing boolean state with toggle functionality
 *
 * @param initialValue - initial boolean value (default: false)
 * @returns [value, toggle, setValue] tuple
 *
 * @example
 * ```tsx
 * const [isOpen, toggleOpen, setIsOpen] = useToggle(false);
 * const [isDarkMode, toggleDarkMode] = useToggle(true);
 *
 * return (
 *   <>
 *     <button onClick={toggleOpen}>
 *       {isOpen ? 'Close' : 'Open'}
 *     </button>
 *     <button onClick={() => setIsOpen(true)}>Force Open</button>
 *     <Modal open={isOpen} onClose={toggleOpen} />
 *   </>
 * );
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  // Toggle function with useCallback to prevent unnecessary re-renders
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
