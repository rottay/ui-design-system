/**
 * @fileoverview Pattern Components barrel — Tier 2 of the design system.
 * Engine-agnostic, composable task-level components organized by product
 * capability. Shared pure recipes live in `foundation/`; stateful composition
 * helpers live in `runtime/`. Private engine styles and Storybook catalogs
 * also have explicit owners instead of catch-all `misc` or `_internal` trees.
 */

// === Groups ===
export * from './data';
export * from './forms';
export * from './visualization';
export * from './communication';
export * from './workflow';
export * from './navigation';
export * from './commerce';
export * from './customization';
export * from './feedback';
export * from './identity';
export * from './shell';

// === Shared contracts, pure recipes, and stateful composition ===
export * from '../../foundation/contracts/runtime/components/patterns/core';
export * from './foundation';
export * from './runtime';
