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

// Moved from patterns/ in Checkpoint C (first batch — folder-only moves)
export * from './detail-header';
export * from './edit-header';
export * from './form-header';
export * from './table-toolbar';
export * from './loading-overlay';
export * from './stats-header';
export * from './data-terminal-card';

// Moved + folder-renamed in C, identifier-renamed in D (with compat aliases)
export * from './form-sections';   // was patterns/premium-form-sections
export * from './record-chrome';   // was patterns/surface-primitives

// Moved + folder-renamed + identifier-renamed in Checkpoint D.
// The 8 workspace families keep compat aliases exporting the old
// Workspace* identifiers. dashboard-insight-variants only had its
// folder (+ subfolders) renamed — the Metrics*/Activity* component
// identifiers were already declarative and did not need renaming.
export * from './collection-header';       // was patterns/workspace-header
export * from './search-command-bar';      // was patterns/workspace-command-bar
export * from './active-filters-bar';      // was patterns/workspace-filter-rail
export * from './field-filters-panel';     // was patterns/workspace-advanced-filters
export * from './column-menu';             // was patterns/workspace-columns-menu
export * from './saved-views-menu';        // was patterns/workspace-views-menu
export * from './selection-preview-rail';  // was patterns/workspace-preview-rail
export * from './scope-switcher';          // was patterns/workspace-scopes
export * from './dashboard-insight-variants'; // was patterns/command-header-variants
