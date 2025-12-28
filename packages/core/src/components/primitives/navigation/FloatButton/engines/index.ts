/**
 * @fileoverview FloatButton Engine Exports - Rottay Design System
 * @description Barrel exports for all FloatButton engine implementations.
 * Provides access to Titan, Hermes, and Apollo engine components.
 *
 * @remarks
 * This module exports all three engine implementations of the FloatButton
 * component family. Each engine provides the same API but with different
 * underlying implementations:
 *
 * - **Titan**: Ant Design implementation - full-featured with rich animations
 * - **Hermes**: DaisyUI/Tailwind implementation - utility-first styling
 * - **Apollo**: Vanilla HTML/CSS implementation - zero dependencies
 *
 * The engine factory in the main index.ts uses these exports for dynamic
 * loading based on the active engine context.
 *
 * @example Importing specific engine
 * ```tsx
 * import { TitanFloatButton, HermesGroup, ApolloBackTop } from './engines';
 *
 * // Direct engine usage (advanced)
 * <TitanFloatButton icon={<PlusOutlined />} />
 * ```
 *
 * @example Dynamic engine loading
 * ```tsx
 * // The main FloatButton component uses these exports internally
 * const FloatButtonBase = createEngineComponent('FloatButton', {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 * });
 * ```
 *
 * @see {@link FloatButton} for main component with automatic engine selection
 * @see {@link TitanFloatButton} for Ant Design implementation
 * @see {@link HermesFloatButton} for DaisyUI implementation
 * @see {@link ApolloFloatButton} for Vanilla implementation
 *
 * @module FloatButton/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Titan Engine Exports (Ant Design)
// ============================================================================

export {
  /** Default export from Titan engine */
  default as titan,
  /** Titan FloatButton component */
  FloatButton as TitanFloatButton,
  /** Titan FloatButton.Group component */
  Group as TitanGroup,
  /** Titan FloatButton.BackTop component */
  BackTop as TitanBackTop,
} from './titan';

// ============================================================================
// Hermes Engine Exports (DaisyUI/Tailwind)
// ============================================================================

export {
  /** Default export from Hermes engine */
  default as hermes,
  /** Hermes FloatButton component */
  FloatButton as HermesFloatButton,
  /** Hermes FloatButton.Group component */
  Group as HermesGroup,
  /** Hermes FloatButton.BackTop component */
  BackTop as HermesBackTop,
} from './hermes';

// ============================================================================
// Apollo Engine Exports (Vanilla HTML/CSS)
// ============================================================================

export {
  /** Default export from Apollo engine */
  default as apollo,
  /** Apollo FloatButton component */
  FloatButton as ApolloFloatButton,
  /** Apollo FloatButton.Group component */
  Group as ApolloGroup,
  /** Apollo FloatButton.BackTop component */
  BackTop as ApolloBackTop,
} from './apollo';
