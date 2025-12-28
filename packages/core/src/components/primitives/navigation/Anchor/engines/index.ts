/**
 * @fileoverview Anchor Engine Exports - Rottay Design System
 * @description Barrel file exporting all Anchor engine implementations.
 * Provides access to Titan, Hermes, and Apollo engines.
 *
 * @remarks
 * This module provides direct access to individual engine implementations
 * of the Anchor component. While the main `Anchor` export handles engine
 * selection automatically, these exports allow:
 * - Direct engine imports for testing
 * - Tree-shaking optimization when using a single engine
 * - Type-safe access to engine-specific components
 *
 * **Available Engines:**
 *
 * | Engine | Library | Best For |
 * |--------|---------|----------|
 * | Titan | Ant Design | Enterprise apps, full features |
 * | Hermes | DaisyUI/Tailwind | Tailwind projects, smaller bundle |
 * | Apollo | Vanilla HTML/CSS | Maximum control, accessibility |
 *
 * **Recommended Usage:**
 * For most cases, use the main Anchor export which automatically
 * selects the appropriate engine based on context:
 *
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * <Anchor>
 *   <Anchor.Link href="#section" title="Section" />
 * </Anchor>
 * ```
 *
 * @example Direct Engine Import
 * ```tsx
 * // For testing or when you need a specific engine
 * import { TitanAnchor, TitanLink } from '@rottay/design-system/components/primitives/navigation/Anchor/engines';
 *
 * <TitanAnchor>
 *   <TitanLink href="#section" title="Section" />
 * </TitanAnchor>
 * ```
 *
 * @example Tree-Shaking Optimization
 * ```tsx
 * // Import only the engine you need
 * import { HermesAnchor, HermesLink } from '@rottay/design-system/components/primitives/navigation/Anchor/engines/hermes';
 *
 * <HermesAnchor direction="horizontal">
 *   <HermesLink href="#tab1" title="Tab 1" />
 *   <HermesLink href="#tab2" title="Tab 2" />
 * </HermesAnchor>
 * ```
 *
 * @see {@link TitanAnchor} - Ant Design implementation
 * @see {@link HermesAnchor} - DaisyUI implementation
 * @see {@link ApolloAnchor} - Vanilla implementation
 * @module Anchor/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Titan Engine Exports
// ============================================================================

/**
 * Titan (Ant Design) engine exports.
 * Full-featured implementation with ink indicator and animations.
 */
export { default as titan, Anchor as TitanAnchor, Link as TitanLink } from './titan';

// ============================================================================
// Hermes Engine Exports
// ============================================================================

/**
 * Hermes (DaisyUI/Tailwind) engine exports.
 * Utility-first implementation with semantic color classes.
 */
export { default as hermes, Anchor as HermesAnchor, Link as HermesLink } from './hermes';

// ============================================================================
// Apollo Engine Exports
// ============================================================================

/**
 * Apollo (Vanilla HTML/CSS) engine exports.
 * Zero-dependency implementation with inline styles.
 */
export { default as apollo, Anchor as ApolloAnchor, Link as ApolloLink } from './apollo';
