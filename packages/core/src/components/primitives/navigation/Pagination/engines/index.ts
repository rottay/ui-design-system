/**
 * @fileoverview Pagination Engine Implementations - Rottay Design System
 * @description Barrel export for all Pagination engine implementations.
 * Provides Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) versions.
 *
 * @remarks
 * This module exports all three engine implementations of the Pagination component.
 * Each engine provides the same functionality with different underlying libraries:
 *
 * - **Classic**: Leverages Ant Design's Pagination with full features
 * - **Modern**: Uses DaisyUI/Tailwind for utility-first styling
 * - **Rustic**: Pure HTML/CSS implementation with zero dependencies
 *
 * The engine selection is handled by the factory system based on the
 * EngineProvider context or per-component `engine` prop override.
 *
 * @example Engine Selection via Provider
 * ```tsx
 * import { EngineProvider, Pagination } from '@rottay/design-system';
 *
 * <EngineProvider engine="modern">
 *   <Pagination current={1} total={100} /> {/* Uses ModernPagination *\/}
 * </EngineProvider>
 * ```
 *
 * @example Engine Override per Component
 * ```tsx
 * // Uses Rustic engine regardless of provider
 * <Pagination engine="rustic" current={1} total={100} />
 * ```
 *
 * @see {@link ClassicPagination} for Ant Design implementation
 * @see {@link ModernPagination} for DaisyUI implementation
 * @see {@link RusticPagination} for Vanilla implementation
 *
 * @module Pagination/Engines
 * @category Navigation
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Classic engine implementation (Ant Design).
 * Full-featured pagination with advanced options.
 */
export { default as classic } from './classic';

/**
 * Modern engine implementation (DaisyUI/Tailwind).
 * Utility-first styling with join components.
 */
export { default as modern } from './modern';

/**
 * Rustic engine implementation (Vanilla HTML/CSS).
 * Zero-dependency, accessible implementation.
 */
export { default as rustic } from './rustic';
