/**
 * @fileoverview Box Engine Implementations - Rottay Design System
 * @description Barrel export for all Box engine implementations.
 *
 * @remarks
 * Each engine provides a Box implementation optimized for its styling paradigm:
 * - **Titan**: Ant Design styling conventions with comprehensive CSS-in-JS
 * - **Hermes**: DaisyUI/Tailwind utility classes for utility-first development
 * - **Apollo**: Pure HTML/CSS for maximum compatibility and accessibility
 *
 * These exports are consumed by the engine factory for dynamic component resolution.
 *
 * @see {@link Box} - The main engine-aware component
 * @module Box/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
