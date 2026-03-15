/**
 * @fileoverview FloatButton Compound Components - Rottay Design System
 * @description Re-exports for FloatButton's compound subcomponents (Group, BackTop).
 * These components are typically accessed via FloatButton.Group and FloatButton.BackTop.
 *
 * @remarks
 * Compound components allow for a more declarative API pattern where related
 * components are namespaced under the main component. This follows React's
 * compound component pattern for better developer experience.
 *
 * @example Using compound components
 * ```tsx
 * import { FloatButton } from '@rottay/design-system';
 *
 * // Via compound pattern (recommended)
 * <FloatButton.Group trigger="click">
 *   <FloatButton icon={<EditIcon />} />
 *   <FloatButton icon={<ShareIcon />} />
 * </FloatButton.Group>
 *
 * <FloatButton.BackTop visibilityHeight={200} />
 * ```
 *
 * @example Direct import (alternative)
 * ```tsx
 * import { FloatButtonGroup, FloatButtonBackTop } from '@rottay/design-system';
 *
 * <FloatButtonGroup trigger="hover">
 *   <FloatButton icon={<PlusIcon />} />
 * </FloatButtonGroup>
 *
 * <FloatButtonBackTop />
 * ```
 *
 * @see {@link FloatButton} for main component documentation
 * @see {@link FloatButtonGroupProps} for group props
 * @see {@link FloatButtonBackTopProps} for back-to-top props
 *
 * @module FloatButton/Compound
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Compound Component Exports
// ============================================================================

// ============================================================================
// Type Exports
// ============================================================================

export type { FloatButtonGroupProps, FloatButtonBackTopProps } from '../FloatButton.types';

// Note: FloatButtonGroup and FloatButtonBackTop are implemented as compound components
// on the main FloatButton export via the engine factory pattern.
// See ../index.ts for FloatButton.Group and FloatButton.BackTop implementations.
