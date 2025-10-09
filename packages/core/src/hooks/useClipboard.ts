import { useState, useCallback } from 'react';

export interface UseClipboardReturn {
  /** Current clipboard value */
  value: string;
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Whether the last copy was successful */
  copied: boolean;
  /** Error from last copy attempt */
  error: Error | null;
  /** Reset copied and error states */
  reset: () => void;
}

/**
 * useClipboard Hook
 *
 * Copy text to clipboard with success/error states
 *
 * @param timeout - time in ms before resetting copied state (default: 2000)
 * @returns clipboard utilities
 *
 * @example
 * ```tsx
 * const { copy, copied, error } = useClipboard(2000);
 *
 * return (
 *   <div>
 *     <input id="code" value="ABC123" readOnly />
 *     <button onClick={() => copy('ABC123')}>
 *       {copied ? '✓ Copied!' : 'Copy Code'}
 *     </button>
 *     {error && <p>Failed to copy</p>}
 *   </div>
 * );
 * ```
 */
export function useClipboard(timeout: number = 2000): UseClipboardReturn {
  const [value, setValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      // Reset states
      setCopied(false);
      setError(null);

      try {
        // Modern clipboard API
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setValue(text);
          setCopied(true);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();

          const success = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (success) {
            setValue(text);
            setCopied(true);
          } else {
            throw new Error('Copy command failed');
          }
        }

        // Reset copied state after timeout
        if (timeout) {
          setTimeout(() => {
            setCopied(false);
          }, timeout);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy');
        setError(error);
        console.warn('Copy to clipboard failed:', error);
      }
    },
    [timeout]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { value, copy, copied, error, reset };
}
