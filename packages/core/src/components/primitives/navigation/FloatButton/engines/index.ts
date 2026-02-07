'use client';

/**
 * @fileoverview FloatButton Engine Exports - Rottay Design System
 * @description Barrel exports for all FloatButton engine implementations.
 * Provides access to Classic, Modern, and Rustic engine components.
 *
 * @remarks
 * This module exports all three engine implementations of the FloatButton
 * component family. Each engine provides the same API but with different
 * underlying implementations:
 *
 * - **Classic**: Ant Design implementation - full-featured with rich animations
 * - **Modern**: DaisyUI/Tailwind implementation - utility-first styling
 * - **Rustic**: Vanilla HTML/CSS implementation - zero dependencies
 *
 * The engine factory in the main index.ts uses these exports for dynamic
 * loading based on the active engine context.
 *
 * @example Importing specific engine
 * ```tsx
 * import { ClassicFloatButton, ModernGroup, RusticBackTop } from './engines';
 *
 * // Direct engine usage (advanced)
 * <ClassicFloatButton icon={<PlusOutlined />} />
 * ```
 *
 * @example Dynamic engine loading
 * ```tsx
 * // The main FloatButton component uses these exports internally
 * const FloatButtonBase = createEngineComponent('FloatButton', {
 *   classic: () => import('./engines/classic'),
 *   modern: () => import('./engines/modern'),
 *   rustic: () => import('./engines/rustic'),
 * });
 * ```
 *
 * @see {@link FloatButton} for main component with automatic engine selection
 * @see {@link ClassicFloatButton} for Ant Design implementation
 * @see {@link ModernFloatButton} for DaisyUI implementation
 * @see {@link RusticFloatButton} for Vanilla implementation
 *
 * @module FloatButton/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Classic Engine Exports (Ant Design)
// ============================================================================

export {
  /** Default export from Classic engine */
  default as classic,
  /** Classic FloatButton component */
  FloatButton as ClassicFloatButton,
  /** Classic FloatButton.Group component */
  Group as ClassicGroup,
  /** Classic FloatButton.BackTop component */
  BackTop as ClassicBackTop,
} from './classic';

// ============================================================================
// Modern Engine Exports (DaisyUI/Tailwind)
// ============================================================================

export {
  /** Default export from Modern engine */
  default as modern,
  /** Modern FloatButton component */
  FloatButton as ModernFloatButton,
  /** Modern FloatButton.Group component */
  Group as ModernGroup,
  /** Modern FloatButton.BackTop component */
  BackTop as ModernBackTop,
} from './modern';

// ============================================================================
// Rustic Engine Exports (Vanilla HTML/CSS)
// ============================================================================

export {
  /** Default export from Rustic engine */
  default as rustic,
  /** Rustic FloatButton component */
  FloatButton as RusticFloatButton,
  /** Rustic FloatButton.Group component */
  Group as RusticGroup,
  /** Rustic FloatButton.BackTop component */
  BackTop as RusticBackTop,
} from './rustic';
