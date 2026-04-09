/**
 * @fileoverview Chrome tier barrel — Tier 2.5 of the design system.
 *
 * The `chrome` tier sits between `patterns` (engine-agnostic compositions)
 * and `surfaces` (page-level config objects). It hosts page-chrome
 * families: headers, toolbars, record panels, loading overlays, and
 * similar structural widgets that wrap or accompany patterns but are
 * more specific than primitives.
 *
 * The tier is editorial structure for the source tree, not part of the
 * published API surface. Every identifier below is re-exported by the
 * root barrel (`@rottay/design-system`) alongside primitives, patterns,
 * and surfaces — consumers never see a `chrome/` path in their import
 * statements.
 *
 * See `ARCHITECTURE.md` for the full tier model and the rules for what
 * belongs in chrome vs pattern vs surface.
 */

// Straight moves from patterns/ (Checkpoint C, first batch)
export * from './detail-header';
export * from './edit-header';
export * from './form-header';
export * from './table-toolbar';
export * from './loading-overlay';
export * from './stats-header';
export * from './data-terminal-card';

// Moved + renamed (identifier renames deferred to Checkpoint D)
export * from './form-sections';   // was patterns/premium-form-sections
export * from './record-chrome';   // was patterns/surface-primitives
