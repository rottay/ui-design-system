/**
 * @fileoverview Menu Engine Implementations - Rottay Design System
 * @description Barrel export for Menu engine implementations providing
 * framework-specific rendering for Titan, Hermes, and Apollo engines.
 *
 * @remarks
 * Each engine provides an optimized implementation of the Menu component:
 *
 * - **Titan**: Ant Design-based implementation with full-featured animations,
 *   transitions, and advanced interactions. Best for enterprise applications.
 *
 * - **Hermes**: DaisyUI/Tailwind-based implementation with utility-first
 *   styling. Ideal for rapid development and lightweight applications.
 *
 * - **Apollo**: Vanilla HTML/CSS implementation with zero dependencies
 *   and comprehensive keyboard navigation. Perfect for maximum accessibility
 *   and custom styling requirements.
 *
 * @example Engine Selection
 * ```tsx
 * // Default engine (Titan)
 * <Menu items={items} mode="vertical" />
 *
 * // Force Hermes engine
 * <Menu engine="hermes" items={items} mode="vertical" />
 *
 * // Force Apollo engine
 * <Menu engine="apollo" items={items} mode="vertical" />
 *
 * // Global engine via Provider
 * <EngineProvider engine="apollo">
 *   <Menu items={items} mode="vertical" />
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanMenu} for Ant Design implementation
 * @see {@link HermesMenu} for DaisyUI implementation
 * @see {@link ApolloMenu} for Vanilla implementation
 *
 * @module Menu/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/** Ant Design implementation - full-featured with rich animations */
export { default as titan } from './titan';

/** DaisyUI/Tailwind implementation - utility-first styling */
export { default as hermes } from './hermes';

/** Vanilla HTML/CSS implementation - zero dependencies, full a11y */
export { default as apollo } from './apollo';
