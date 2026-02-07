/**
 * @fileoverview Collapse Engine Exports - Rottay Design System
 * @description Barrel export for all Collapse engine implementations.
 * Provides Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) engines
 * with Collapse and Panel sub-components.
 *
 * @module Collapse/Engines
 * @category Layout
 * @package @rottay/design-system
 */

export { default as classic, Collapse as ClassicCollapse, Panel as ClassicPanel } from './classic';
export { default as modern, Collapse as ModernCollapse, Panel as ModernPanel } from './modern';
export { default as rustic, Collapse as RusticCollapse, Panel as RusticPanel } from './rustic';
