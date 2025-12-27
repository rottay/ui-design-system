/**
 * @fileoverview Pagination Engine Implementations - Rottay Design System
 * @description Barrel export for all Pagination engine implementations.
 * Provides Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) versions.
 *
 * @remarks
 * This module exports all three engine implementations of the Pagination component.
 * Each engine provides the same functionality with different underlying libraries:
 *
 * - **Titan**: Leverages Ant Design's Pagination with full features
 * - **Hermes**: Uses DaisyUI/Tailwind for utility-first styling
 * - **Apollo**: Pure HTML/CSS implementation with zero dependencies
 *
 * The engine selection is handled by the factory system based on the
 * EngineProvider context or per-component `engine` prop override.
 *
 * @example Engine Selection via Provider
 * ```tsx
 * import { EngineProvider, Pagination } from '@rottay/design-system';
 *
 * <EngineProvider engine="hermes">
 *   <Pagination current={1} total={100} /> {/* Uses HermesPagination *\/}
 * </EngineProvider>
 * ```
 *
 * @example Engine Override per Component
 * ```tsx
 * // Uses Apollo engine regardless of provider
 * <Pagination engine="apollo" current={1} total={100} />
 * ```
 *
 * @see {@link TitanPagination} for Ant Design implementation
 * @see {@link HermesPagination} for DaisyUI implementation
 * @see {@link ApolloPagination} for Vanilla implementation
 *
 * @module Pagination/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Titan engine implementation (Ant Design).
 * Full-featured pagination with advanced options.
 */
export { default as titan } from './titan';

/**
 * Hermes engine implementation (DaisyUI/Tailwind).
 * Utility-first styling with join components.
 */
export { default as hermes } from './hermes';

/**
 * Apollo engine implementation (Vanilla HTML/CSS).
 * Zero-dependency, accessible implementation.
 */
export { default as apollo } from './apollo';
