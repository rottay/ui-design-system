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
 * | Titan | Ant Design | ~50KB | Enterprise apps |
 * | Hermes | DaisyUI | ~10KB | Tailwind projects |
 * | Apollo | Vanilla | ~2KB | Maximum control |
 *
 * **Engine Selection:**
 * - Default engine is determined by EngineProvider
 * - Can be overridden per-component via `engine` prop
 * - All engines share the same props interface
 *
 * @example Engine Override
 * ```tsx
 * // Use Hermes engine explicitly
 * <Breadcrumb engine="hermes" items={items} />
 *
 * // Use Apollo engine for lightweight rendering
 * <Breadcrumb engine="apollo" items={items} />
 * ```
 *
 * @see {@link TitanBreadcrumb} - Ant Design implementation
 * @see {@link HermesBreadcrumb} - DaisyUI implementation
 * @see {@link ApolloBreadcrumb} - Vanilla implementation
 * @module Breadcrumb/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with animations */
export { default as titan } from './titan';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as hermes } from './hermes';

/** Vanilla HTML/CSS implementation - zero dependencies */
export { default as apollo } from './apollo';
