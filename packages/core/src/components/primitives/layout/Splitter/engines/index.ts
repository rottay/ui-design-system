/**
 * @fileoverview Splitter Engine Exports - Rottay Design System
 * @description Barrel export for all Splitter engine implementations.
 * Provides Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) engines
 * with Splitter and Panel sub-components.
 *
 * @module Splitter/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as classic, Splitter as ClassicSplitter, Panel as ClassicPanel } from './classic';
export { default as modern, Splitter as ModernSplitter, Panel as ModernPanel } from './modern';
export { default as rustic, Splitter as RusticSplitter, Panel as RusticPanel } from './rustic';
