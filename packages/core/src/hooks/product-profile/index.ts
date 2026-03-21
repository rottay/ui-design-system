/**
 * @fileoverview Product Profile Hook - Rottay Design System
 * @description Re-exports the product profile context hook, keeping consumers
 * decoupled from the provider's internal module structure. The resolved
 * profile controls engine selection, token overrides, and personality
 * defaults for the current product vertical.
 *
 * Product profiles define how an entire product vertical (e.g. BitHire,
 * Evnto, Platform Admin) looks and behaves. The hook provides access to
 * the resolved profile so components can adapt to the current vertical
 * without prop-drilling.
 *
 * @example Reading the current product profile
 * ```tsx
 * import { useProductProfile } from '@rottay/design-system';
 *
 * function VerticalBanner() {
 *   const profile = useProductProfile();
 *   return <Text>{profile.displayName} Dashboard</Text>;
 * }
 * ```
 *
 * @module System/Hooks/ProductProfile
 * @category System
 * @package @rottay/design-system
 */

// Re-exported with a shorter alias (`useProductProfile` vs `useProductProfileContext`)
// to provide a cleaner public API. The canonical context hook lives inside the
// product-profiles module; this barrel avoids exposing that internal path.
export { useProductProfileContext as useProductProfile } from '../../runtime/product-profiles';
