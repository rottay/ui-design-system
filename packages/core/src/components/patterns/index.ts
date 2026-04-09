/**
 * @fileoverview Pattern Components barrel — Tier 2 of the design system.
 * Engine-agnostic, composable task-level components organized into 7
 * groups: data, forms, visualization, communication, workflow,
 * navigation, misc.
 *
 * Shared infrastructure (types, hooks, header-actions, domain-kits)
 * lives in `foundation/` — publicly exported, no longer hidden behind
 * an `_internal/` prefix. `_internal/` now contains only truly private
 * implementation: test helpers, engine-specific styles, and story data.
 */

// === Groups ===
export * from './data';
export * from './forms';
export * from './visualization';
export * from './communication';
export * from './workflow';
export * from './navigation';
export * from './misc';

// === Foundation (shared types, hooks, utilities) ===
export * from './foundation/types';
export * from './foundation/domain-kits';
export * from './foundation/hooks';
export * from './foundation/header-actions';
