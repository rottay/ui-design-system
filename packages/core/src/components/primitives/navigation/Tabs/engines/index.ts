/**
 * @fileoverview Tabs Engine Implementations - Rottay Design System
 * @description Barrel export for all Tabs engine implementations.
 * Provides access to Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) engines.
 *
 * @remarks
 * Each engine provides the same functionality with different underlying implementations:
 * - **Classic**: Built on Ant Design - full-featured with rich animations
 * - **Modern**: Built on DaisyUI/Tailwind - utility-first, lightweight
 * - **Rustic**: Pure HTML/CSS - zero dependencies, maximum accessibility
 *
 * Engine selection is handled automatically by the main Tabs component
 * based on the current EngineProvider context or per-component override.
 *
 * @example Engine Override
 * ```tsx
 * // Use specific engine for this instance
 * <Tabs engine="modern" items={items} />
 * ```
 *
 * @example Global Engine Setting
 * ```tsx
 * <EngineProvider engine="rustic">
 *   <App /> {/* All Tabs will use Rustic engine *\/}
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicTabs} for Ant Design implementation
 * @see {@link ModernTabs} for DaisyUI implementation
 * @see {@link RusticTabs} for Vanilla implementation
 *
 * @module Tabs/Engines
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
