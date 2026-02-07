/**
 * @fileoverview Breadcrumb Engine Implementations - Rottay Design System
 * @description Barrel export for all Breadcrumb engine implementations.
 *
 * @remarks
 * This module re-exports all engine-specific implementations of the
 * Breadcrumb component. Each engine provides the same API but renders
 * using different underlying technologies:
 *
 * **Available Engines:**
 *
 * | Engine | Library | Bundle Size | Best For |
 * |--------|---------|-------------|----------|
 * | Classic | Ant Design | ~50KB | Enterprise apps |
 * | Modern | DaisyUI | ~10KB | Tailwind projects |
 * | Rustic | Vanilla | ~2KB | Maximum control |
 *
 * **Engine Selection:**
 * - Default engine is determined by EngineProvider
 * - Can be overridden per-component via `engine` prop
 * - All engines share the same props interface
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern engine explicitly
 * <Breadcrumb engine="modern" items={items} />
 *
 * // Use Rustic engine for lightweight rendering
 * <Breadcrumb engine="rustic" items={items} />
 * ```
 *
 * @see {@link ClassicBreadcrumb} - Ant Design implementation
 * @see {@link ModernBreadcrumb} - DaisyUI implementation
 * @see {@link RusticBreadcrumb} - Vanilla implementation
 * @module Breadcrumb/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with animations */
export { default as classic } from './classic';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as modern } from './modern';

/** Vanilla HTML/CSS implementation - zero dependencies */
export { default as rustic } from './rustic';
