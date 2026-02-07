/**
 * @fileoverview Menu Engine Implementations - Rottay Design System
 * @description Barrel export for Menu engine implementations providing
 * framework-specific rendering for Classic, Modern, and Rustic engines.
 *
 * @remarks
 * Each engine provides an optimized implementation of the Menu component:
 *
 * - **Classic**: Ant Design-based implementation with full-featured animations,
 *   transitions, and advanced interactions. Best for enterprise applications.
 *
 * - **Modern**: DaisyUI/Tailwind-based implementation with utility-first
 *   styling. Ideal for rapid development and lightweight applications.
 *
 * - **Rustic**: Vanilla HTML/CSS implementation with zero dependencies
 *   and comprehensive keyboard navigation. Perfect for maximum accessibility
 *   and custom styling requirements.
 *
 * @example Engine Selection
 * ```tsx
 * // Default engine (Classic)
 * <Menu items={items} mode="vertical" />
 *
 * // Force Modern engine
 * <Menu engine="modern" items={items} mode="vertical" />
 *
 * // Force Rustic engine
 * <Menu engine="rustic" items={items} mode="vertical" />
 *
 * // Global engine via Provider
 * <EngineProvider engine="rustic">
 *   <Menu items={items} mode="vertical" />
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicMenu} for Ant Design implementation
 * @see {@link ModernMenu} for DaisyUI implementation
 * @see {@link RusticMenu} for Vanilla implementation
 *
 * @module Menu/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with rich animations */
export { default as classic } from './classic';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as modern } from './modern';

/** Vanilla HTML/CSS implementation - zero dependencies, full a11y */
export { default as rustic } from './rustic';
