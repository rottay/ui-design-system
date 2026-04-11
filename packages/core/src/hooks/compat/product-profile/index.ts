/**
 * @fileoverview Product Profile Hook Compatibility Shim - Rottay Design System
 * @description Re-exports the product profile context hook from its canonical
 * location at `runtime/product-profiles/`. Kept for backward compatibility
 * while consumers migrate to `import { useProductProfile } from '@rottay/design-system'`.
 *
 * @deprecated Import `useProductProfile` from `@rottay/design-system` directly. Moved to hooks/compat/ in R4.
 *
 * @module System/Hooks/ProductProfile
 * @category System
 * @package @rottay/design-system
 */

// Canonical source: runtime/product-profiles/ProductProfileProvider.tsx
export { useProductProfileContext as useProductProfile } from '../../../runtime/product-profiles';
