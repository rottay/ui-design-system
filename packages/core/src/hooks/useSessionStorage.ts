import { useState, useCallback } from 'react';

/**
 * useSessionStorage Hook
 *
 * Persists state in sessionStorage (cleared when tab closes)
 * Similar to useLocalStorage but data doesn't persist across sessions
 *
 * @param key - sessionStorage key
 * @param initialValue - initial value if key doesn't exist
 * @returns [value, setValue, removeValue] tuple
 *
 * @example
 * ```tsx
 * const [wizardStep, setWizardStep] = useSessionStorage('wizard-step', 1);
 * const [formData, setFormData] = useSessionStorage('form-draft', {});
 *
 * // Value persists on refresh but cleared when tab closes
 * setWizardStep(2);
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
