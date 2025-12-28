/**
 * @fileoverview Mentions Engine Exports - Rottay Design System
 * @description Barrel exports for all Mentions engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design Mentions with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS mentions
 *
 * All engines implement:
 * - @mention trigger with dropdown suggestions
 * - Custom prefix support (@, #, etc.)
 * - Async search callback
 * - Auto-sizing textarea
 * - Keyboard navigation
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { titan, hermes, apollo } from './engines';
 *
 * // Component automatically selects engine
 * <Mentions engine="hermes" options={users} prefix="@" />
 * ```
 *
 * @see {@link Mentions} - Main component with engine switching
 * @module Mentions/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
