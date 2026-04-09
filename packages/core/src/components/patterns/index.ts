/**
 * @fileoverview Pattern Components barrel — Tier 2 of the design system.
 * Engine-agnostic, composable task-level components organized into 7
 * groups: data, forms, visualization, communication, workflow,
 * navigation, misc.
 *
 * The `_internal/` barrel exports shared infrastructure (types, hooks,
 * header-actions, domain-kits) that patterns consume but that also
 * reaches the public API through compat shims at the patterns root.
 * Those shims are scheduled for cleanup in Checkpoint F.
 */

// === Groups ===
export * from './data';
export * from './forms';
export * from './visualization';
export * from './communication';
export * from './workflow';
export * from './navigation';
export * from './misc';

// === Shared infrastructure (via compat shims at root) ===
// These re-export from _internal/ and reach the public API.
// Checkpoint F will decide whether to promote them to visible
// namespaces or keep the shim arrangement.
export * from './types';
export * from './domain-kits';
export * from './hooks';
export * from './header-actions';
