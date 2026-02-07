/**
 * @fileoverview Box Engine Implementations - Rottay Design System
 * @description Barrel export for all Box engine implementations.
 *
 * @remarks
 * Each engine provides a Box implementation optimized for its styling paradigm:
 * - **Classic**: Ant Design styling conventions with comprehensive CSS-in-JS
 * - **Modern**: DaisyUI/Tailwind utility classes for utility-first development
 * - **Rustic**: Pure HTML/CSS for maximum compatibility and accessibility
 *
 * These exports are consumed by the engine factory for dynamic component resolution.
 *
 * @see {@link Box} - The main engine-aware component
 * @module Box/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
