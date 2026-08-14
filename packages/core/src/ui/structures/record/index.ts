/**
 * @fileoverview Record group barrel — record-page building blocks
 * (summary strips, field grids, read fields, action bars, panels),
 * form-section containers, and single-surface edit-field chrome.
 *
 * @description
 * The five record blocks are five families, one folder each. They used to share
 * a single `content/index.tsx`, which made every one of them attribute all
 * fourteen of that file's exports: the taxonomy inventory could not say which
 * symbol belonged to which row, and the Showroom carried one `record` alias in
 * place of five entries. The split is source-bound — same components, same
 * public names, one owner per family.
 *
 * This file aggregates child owners and nothing else. It authors no component
 * and declares no alias: every symbol below resolves through the exact folder
 * that owns it.
 *
 * They ship alongside `form-sections` and `edit-fields` because consumers
 * compose them: a top-level summary strip, then a stack of form-sections, then
 * a read-field grid inside one of those sections, then an action bar at the
 * bottom.
 *
 * ANATOMY (Pass 1, documented): there are no tabs, collapsible sections,
 * main+aside layout, or skeleton loading in THIS family — those live in the
 * sibling `form-sections` / detail-panel grammars. The blocks here are the
 * summary strip, the read-field grid + field, the action bar and the panel.
 * Scroll ownership: the page scrolls; no block owns a scroll frame.
 *
 * SPECIFICITY HOOK: every block root stamps `data-structure='record'` as its
 * always-present attribute, so the skin can buy the (0,4,0) border floor
 * without ever repeating a class or an attribute. All static geometry lives in
 * `presentation/components/skin/record.css`.
 *
 * The family stays domain-agnostic. All labels, values, and helpers are
 * consumer-supplied; the components know nothing about tenants, users, or any
 * specific entity.
 */

export * from './summary-strip';
export * from './field-grid';
export * from './field';
export * from './action-bar';
export * from './panel';
export * from './form-sections';
export * from './edit-fields';
