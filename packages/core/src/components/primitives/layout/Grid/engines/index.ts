/**
 * @fileoverview Grid Engine Implementations - Rottay Design System
 * @description Barrel export for all Grid engine implementations.
 *
 * @remarks
 * Each engine provides Grid and GridItem implementations optimized for its styling paradigm:
 * - **Classic**: Ant Design styling conventions with inline CSS Grid properties
 * - **Modern**: DaisyUI/Tailwind utility classes (grid, grid-cols-*, gap-*, col-span-*)
 * - **Rustic**: Pure HTML/CSS with inline grid styles and data attributes
 *
 * These exports are consumed by the engine factory for dynamic component resolution.
 *
 * @see {@link Grid} - The main engine-aware component
 * @see {@link GridItem} - The compound component for grid items
 * @module Grid/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as classic, ClassicGrid, ClassicGridItem } from './classic';
export { default as modern, ModernGrid, ModernGridItem } from './modern';
export { default as rustic, RusticGrid, RusticGridItem } from './rustic';
