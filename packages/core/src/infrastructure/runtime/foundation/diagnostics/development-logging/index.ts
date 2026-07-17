/**
 * @fileoverview Development-only logging helpers with deduplication.
 *
 * All log functions are no-ops in production builds (`NODE_ENV === 'production'`).
 * `warnOnceInDev` additionally deduplicates by a caller-provided key so that
 * repeated warnings during React re-renders are collapsed into a single message.
 */

/**
 * Module-level set that persists for the lifetime of the JS context.
 * Keys added here suppress future calls to warnOnceInDev with the same key,
 * preventing duplicate warnings across React re-renders and hot-reloads.
 */
const warnedMessages = new Set<string>();

/**
 * Gate that tree-shakers and bundlers can use to DCE (dead-code-eliminate)
 * all logging calls in production builds.
 */
function shouldLog(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Logs a warning to the console in non-production environments.
 *
 * @param message - Warning message
 * @param args    - Additional console.warn arguments
 */
export function warnInDev(message: string, ...args: unknown[]): void {
  if (!shouldLog()) {
    return;
  }

  console.warn(message, ...args);
}

/**
 * Logs a warning only once per unique key across the application lifetime.
 * Prevents noisy repeated warnings during React re-renders or polling flows.
 *
 * @param key     - Deduplication key (e.g. 'i18n:missing:es:some.key')
 * @param message - Warning message
 * @param args    - Additional console.warn arguments
 */
export function warnOnceInDev(key: string, message: string, ...args: unknown[]): void {
  if (!shouldLog() || warnedMessages.has(key)) {
    return;
  }

  // Keyed warnings prevent noisy repeated logs during rerenders or polling flows.
  warnedMessages.add(key);
  console.warn(message, ...args);
}

/**
 * Logs an error to the console in non-production environments.
 *
 * @param message - Error message
 * @param args    - Additional console.error arguments
 */
export function errorInDev(message: string, ...args: unknown[]): void {
  if (!shouldLog()) {
    return;
  }

  console.error(message, ...args);
}
