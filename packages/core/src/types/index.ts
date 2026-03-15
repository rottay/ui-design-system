/**
 * Backward-compatibility proxy.
 * Canonical types live in contracts/. This barrel re-exports them so that
 * existing imports from '../types' continue to resolve.
 */
export * from '../contracts';
