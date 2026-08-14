/**
 * @fileoverview data patterns group barrel.
 * Data display patterns: tables, grid views, gallery views, detail panels, list toolbars, column settings, saved views, stat grids.
 */

export * from './data-table';
export * from './virtual-list';
export * from './grid-view';
export * from './gallery-view';
export * from './detail-panel';
export * from './file-manager';
export * from './list-toolbar';
export * from './column-settings';
export * from './saved-views';
export * from './stats-grid';
export * from './bulk-select-toggle';
export * from './status-filter-pills';
export * from './decision-comparison';
export * from './decision-panorama';
export * from './record-facts';
export * from './widget-board';
export * from './mono-stat';
// `cellRenderers` is support, not a product: a record of render functions for
// building table columns. It moved to `patterns/runtime/cell-renderers` when
// its catalog row was retired (owner ruling, 2026-08-12) -- a support path
// cannot own a family row, and this one never named a renderable component.
// The public name stays here so callers building data columns keep one import.
export { cellRenderers } from '../runtime/cell-renderers';
// `CellRenderers` is a type alias (`typeof cellRenderers`), not a component --
// nothing can render it. It stays scoped to the cell-renderers folder instead
// of flowing to the package root, so it can no longer be mistaken for a
// public component family. Import it from `patterns/runtime/cell-renderers` directly if an
// internal consumer needs the type.
export type { AvatarNameOptions, MonospaceOptions, IconTextOptions, TagsOptions, ScoreOptions, CellBadgeVariant } from '../runtime/cell-renderers';
