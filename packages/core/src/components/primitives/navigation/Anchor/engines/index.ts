/**
 * @fileoverview Anchor Engine Exports - Rottay Design System
 * @description Barrel file exporting all Anchor engine implementations.
 * Provides access to Classic, Modern, and Rustic engines.
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
 * | Classic | Ant Design | Enterprise apps, full features |
 * | Modern | DaisyUI/Tailwind | Tailwind projects, smaller bundle |
 * | Rustic | Vanilla HTML/CSS | Maximum control, accessibility |
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
 * import { ClassicAnchor, ClassicLink } from '@rottay/design-system/components/primitives/navigation/Anchor/engines';
 *
 * <ClassicAnchor>
 *   <ClassicLink href="#section" title="Section" />
 * </ClassicAnchor>
 * ```
 *
 * @example Tree-Shaking Optimization
 * ```tsx
 * // Import only the engine you need
 * import { ModernAnchor, ModernLink } from '@rottay/design-system/components/primitives/navigation/Anchor/engines/modern';
 *
 * <ModernAnchor direction="horizontal">
 *   <ModernLink href="#tab1" title="Tab 1" />
 *   <ModernLink href="#tab2" title="Tab 2" />
 * </ModernAnchor>
 * ```
 *
 * @see {@link ClassicAnchor} - Ant Design implementation
 * @see {@link ModernAnchor} - DaisyUI implementation
 * @see {@link RusticAnchor} - Vanilla implementation
 * @module Anchor/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Classic Engine Exports
// ============================================================================

/**
 * Classic (Ant Design) engine exports.
 * Full-featured implementation with ink indicator and animations.
 */
export { default as classic, Anchor as ClassicAnchor, Link as ClassicLink } from './classic';

// ============================================================================
// Modern Engine Exports
// ============================================================================

/**
 * Modern (DaisyUI/Tailwind) engine exports.
 * Utility-first implementation with semantic color classes.
 */
export { default as modern, Anchor as ModernAnchor, Link as ModernLink } from './modern';

// ============================================================================
// Rustic Engine Exports
// ============================================================================

/**
 * Rustic (Vanilla HTML/CSS) engine exports.
 * Zero-dependency implementation with inline styles.
 */
export { default as rustic, Anchor as RusticAnchor, Link as RusticLink } from './rustic';
