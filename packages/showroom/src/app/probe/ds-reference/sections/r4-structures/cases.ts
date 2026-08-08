/* Server-readable case list: a 'use client' module's exports reach a server
   component as client references, so the route cannot read them as an array. */

export type R4Case = string;

export const R4_CASES: R4Case[] = [
  'collection-header',
  'dashboard-header',
  'detail-header',
  'edit-header',
  'form-header',
  'mobile-header',
  'action-dock',
  'active-filters-bar',
  'column-menu',
  'connected-command-palette',
  'search-command-bar',
  'export-button',
  'field-filters-panel',
  'saved-views-menu',
  'scope-switcher',
  'selection-preview-rail',
  'table-toolbar',
  'view-mode-switcher',
  'record-content',
  'form-sections',
  'edit-fields',
  'stats-header',
  'data-terminal-card',
  'dashboard-insights',
  'loading-overlay',
  'app-shell',
  'bottom-tab-bar'
];
