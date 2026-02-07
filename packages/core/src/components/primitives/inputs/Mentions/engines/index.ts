/**
 * @fileoverview Mentions Engine Exports - Rottay Design System
 * @description Barrel exports for all Mentions engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design Mentions with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS mentions
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
 * import { classic, modern, rustic } from './engines';
 *
 * // Component automatically selects engine
 * <Mentions engine="modern" options={users} prefix="@" />
 * ```
 *
 * @see {@link Mentions} - Main component with engine switching
 * @module Mentions/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
