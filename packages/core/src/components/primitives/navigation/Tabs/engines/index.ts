/**
 * @fileoverview Tabs Engine Implementations - Rottay Design System
 * @description Barrel export for all Tabs engine implementations.
 * Provides access to Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) engines.
 *
 * @remarks
 * Each engine provides the same functionality with different underlying implementations:
 * - **Titan**: Built on Ant Design - full-featured with rich animations
 * - **Hermes**: Built on DaisyUI/Tailwind - utility-first, lightweight
 * - **Apollo**: Pure HTML/CSS - zero dependencies, maximum accessibility
 *
 * Engine selection is handled automatically by the main Tabs component
 * based on the current EngineProvider context or per-component override.
 *
 * @example Engine Override
 * ```tsx
 * // Use specific engine for this instance
 * <Tabs engine="hermes" items={items} />
 * ```
 *
 * @example Global Engine Setting
 * ```tsx
 * <EngineProvider engine="apollo">
 *   <App /> {/* All Tabs will use Apollo engine *\/}
 * </EngineProvider>
 * ```
 *
 * @see {@link TitanTabs} for Ant Design implementation
 * @see {@link HermesTabs} for DaisyUI implementation
 * @see {@link ApolloTabs} for Vanilla implementation
 *
 * @module Tabs/Engines
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
