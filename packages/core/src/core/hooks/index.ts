/**
 * Backward-compatibility proxy.
 * Canonical hooks live in src/hooks/. This barrel re-exports them so that
 * existing imports from 'core/hooks' continue to resolve.
 */
export * from '../../hooks';
