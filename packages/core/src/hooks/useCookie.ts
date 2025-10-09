import { useState, useCallback } from 'react';

export interface CookieOptions {
  /** Cookie expiration in days */
  days?: number;
  /** Cookie path */
  path?: string;
  /** Cookie domain */
  domain?: string;
  /** Secure flag */
  secure?: boolean;
  /** SameSite attribute */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * useCookie Hook
 *
 * Manages browser cookies with get/set/remove functionality
 *
 * @param key - cookie name
 * @param initialValue - initial value if cookie doesn't exist
 * @param options - cookie options (days, path, domain, etc.)
 * @returns [value, setValue, removeValue] tuple
 *
 * @example
 * ```tsx
 * const [consent, setConsent, removeConsent] = useCookie('cookie-consent', false, {
 *   days: 365,
 *   path: '/',
 *   sameSite: 'strict'
 * });
 *
 * return (
 *   <div>
 *     {!consent && (
 *       <CookieBanner>
 *         <button onClick={() => setConsent(true)}>Accept</button>
 *       </CookieBanner>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useCookie<T>(
  key: string,
  initialValue: T,
  options: CookieOptions = {}
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    // SSR safety check
    if (typeof document === 'undefined') {
      return initialValue;
    }

    try {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${key}=`));

      if (cookie) {
        const cookieValue = cookie.split('=')[1];
        return JSON.parse(decodeURIComponent(cookieValue));
      }
    } catch (error) {
      console.warn(`Error reading cookie "${key}":`, error);
    }

    return initialValue;
  });

  const updateCookie = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue);

        if (typeof document === 'undefined') {
          return;
        }

        const {
          days = 365,
          path = '/',
          domain,
          secure,
          sameSite = 'lax',
        } = options;

        let cookieString = `${key}=${encodeURIComponent(JSON.stringify(newValue))}`;

        if (days) {
          const date = new Date();
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
          cookieString += `; expires=${date.toUTCString()}`;
        }

        cookieString += `; path=${path}`;

        if (domain) {
          cookieString += `; domain=${domain}`;
        }

        if (secure) {
          cookieString += '; secure';
        }

        cookieString += `; samesite=${sameSite}`;

        document.cookie = cookieString;
      } catch (error) {
        console.warn(`Error setting cookie "${key}":`, error);
      }
    },
    [key, options]
  );

  const removeCookie = useCallback(() => {
    try {
      setValue(initialValue);

      if (typeof document === 'undefined') {
        return;
      }

      const { path = '/', domain } = options;
      let cookieString = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

      if (domain) {
        cookieString += `; domain=${domain}`;
      }

      document.cookie = cookieString;
    } catch (error) {
      console.warn(`Error removing cookie "${key}":`, error);
    }
  }, [key, initialValue, options]);

  return [value, updateCookie, removeCookie];
}
