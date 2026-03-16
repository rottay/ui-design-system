/**
 * @fileoverview Feature Hooks Compatibility Shim - Rottay Design System
 * @description Re-exports feature hooks from their canonical location at
 * `features/useFeatures`. Kept for backward compatibility while consumers
 * migrate to `import { useFeatures } from '@rottay/design-system'`.
 *
 * @deprecated Import from `features/` directly instead.
 *
 * @module System/Hooks/Features
 * @category System
 * @package @rottay/design-system
 */
// Re-export from the canonical location. This barrel exists because early
// consumers imported from `hooks/features` -- removing it would be a
// breaking change. New code should import directly from `features/`.
export { useFeatures, useHasFeature, useFeatureContext } from '../../features/useFeatures';
