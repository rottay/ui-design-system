/**
 * @fileoverview Stack Engine Implementations - Rottay Design System
 * @description Barrel export for all Stack engine implementations.
 *
 * @remarks
 * Each engine provides a Stack implementation optimized for its styling paradigm:
 * - **Classic**: Ant Design styling conventions with CSS flexbox
 * - **Modern**: DaisyUI/Tailwind utility classes (flex, gap-*, items-*, justify-*)
 * - **Rustic**: Pure HTML/CSS with inline flexbox styles
 *
 * These exports are consumed by the engine factory for dynamic component resolution.
 *
 * @see {@link Stack} - The main engine-aware component
 * @module Stack/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
