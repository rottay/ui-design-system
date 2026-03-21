/**
 * @fileoverview Convenience hook for reading the active product profile.
 *
 * Re-exports `useProductProfileContext` under the shorter `useProductProfile`
 * name. This is the primary read API for components and hooks that need
 * profile-driven configuration without coupling to provider internals.
 */

export { useProductProfileContext as useProductProfile } from './ProductProfileProvider';
