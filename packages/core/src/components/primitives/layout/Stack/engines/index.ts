/**
 * @fileoverview Stack Engine Implementations - Rottay Design System
 * @description Barrel export for all Stack engine implementations.
 *
 * @remarks
 * Each engine provides a Stack implementation optimized for its styling paradigm:
 * - **Titan**: Ant Design styling conventions with CSS flexbox
 * - **Hermes**: DaisyUI/Tailwind utility classes (flex, gap-*, items-*, justify-*)
 * - **Apollo**: Pure HTML/CSS with inline flexbox styles
 *
 * These exports are consumed by the engine factory for dynamic component resolution.
 *
 * @see {@link Stack} - The main engine-aware component
 * @module Stack/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
