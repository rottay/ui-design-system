import { useDebugValue as useReactDebugValue } from 'react';

/**
 * useDebugValue Hook
 *
 * Displays a label for custom hooks in React DevTools
 * Helpful for debugging custom hooks
 *
 * @param value - value to display in DevTools
 * @param formatter - optional formatter function
 *
 * @example
 * ```tsx
 * function useAuth() {
 *   const user = getCurrentUser();
 *
 *   // Shows "Auth: Logged in" or "Auth: Logged out" in DevTools
 *   useDebugValue(user, user => user ? 'Logged in' : 'Logged out');
 *
 *   return user;
 * }
 *
 * function useOnlineStatus() {
 *   const isOnline = checkOnlineStatus();
 *
 *   // Shows "OnlineStatus: true" or "OnlineStatus: false" in DevTools
 *   useDebugValue(isOnline);
 *
 *   return isOnline;
 * }
 * ```
 */
export function useDebugValue<T>(
  value: T,
  formatter?: (value: T) => string | number
): void {
  useReactDebugValue(value, formatter);
}
