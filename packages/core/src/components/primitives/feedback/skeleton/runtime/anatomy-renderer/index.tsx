'use client';

/**
 * Renders the component a loading state stands in for, reads its stamped `data-part`
 * anatomy and paints one bone per part, so the skeleton cannot drift from the component.
 */

import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { PROVIDER_PAINT_ATTRIBUTE_FILTER } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import { resolveSkeletonPersonalityDefaults } from '@/foundation/tokens/ts/runtime/personality';
import type { SkeletonAnimation } from '../../contracts';

/**
 * How a stamped part becomes part of the loading surface.
 *
 * | Role | Loading surface |
 * |------|-----------------|
 * | `frame` | the part's outline; its parts are read inside it |
 * | `pass` | nothing; its parts are read |
 * | `block` | one bone the size of the part |
 * | `line` | one text-height bone across the part |
 * | `round` | one circular bone |
 * | `omit` | nothing, and nothing inside it |
 */
export type SkeletonPartRole = 'frame' | 'pass' | 'block' | 'line' | 'round' | 'omit';

/**
 * The part vocabulary the renderer can draw. A family that stamps a part name
 * missing here fails the family-cut gate until the name is given a role.
 */
export const SKELETON_PART_ROLES: Readonly<Record<string, SkeletonPartRole>> = Object.freeze({
  // ---- the collection and board families (WO-FAM-08) ----
  // Adjudicated once per NAME, not per family: a name shared by five toolbars
  // means the same thing in all five, and a role that differed would be a
  // different part wearing a borrowed name.
  // Wrappers: they draw nothing of their own, and what they hold is drawn.
  'action-row': 'pass',
  'action-row-content': 'pass',
  'action-row-copy': 'pass',
  'action-row-main': 'pass',
  'action-section': 'pass',
  'action-section-copy': 'pass',
  'action-section-header': 'pass',
  'actions-content': 'pass',
  'active-card': 'pass',
  'active-card-actions': 'pass',
  'active-card-copy': 'pass',
  'active-card-lead': 'pass',
  board: 'pass',
  'body-row': 'pass',
  breadcrumb: 'pass',
  'bulk-bar': 'pass',
  'bulk-bar-actions': 'pass',
  card: 'pass',
  'card-list': 'pass',
  'card-move': 'pass',
  'card-shell': 'pass',
  catalog: 'pass',
  'catalog-grid': 'pass',
  'catalog-header': 'pass',
  'catalog-item': 'pass',
  'catalog-preview': 'pass',
  chips: 'pass',
  'chips-region': 'pass',
  column: 'pass',
  'column-body': 'pass',
  'column-header': 'pass',
  'column-header-content': 'pass',
  'column-title-row': 'pass',
  'create-form': 'pass',
  'editor-shell': 'pass',
  'expanded-row-content': 'pass',
  'field-row': 'pass',
  fields: 'pass',
  'filter-card': 'pass',
  'filter-card-copy': 'pass',
  'filter-card-head': 'pass',
  'filter-chips-strip': 'pass',
  'filter-menu': 'pass',
  'filter-rail': 'pass',
  filters: 'pass',
  'grid-card': 'pass',
  'grid-card-body': 'pass',
  'group-content': 'pass',
  'group-header-aggregate': 'pass',
  'group-header-content': 'pass',
  'group-header-row': 'pass',
  'header-copy': 'pass',
  'inline-edit-actions': 'pass',
  'item-copy': 'pass',
  'item-header': 'pass',
  // A widget card's heading row holds the card's icon and its copy block: the
  // parts inside it are drawn, the wrapper itself is not (WO-FAM-08 B8).
  'item-heading': 'pass',
  left: 'pass',
  'list-scroll': 'pass',
  'list-table': 'pass',
  'main-row': 'pass',
  'mobile-actions': 'pass',
  'mobile-bulk-actions': 'pass',
  'mobile-card-actions': 'pass',
  'mobile-card-custom': 'pass',
  'mobile-card-primary': 'pass',
  'mobile-card-selection': 'pass',
  'mobile-card-summary-row': 'pass',
  'mobile-header': 'pass',
  'mobile-layout': 'pass',
  'mobile-overflow-item': 'pass',
  'mobile-overflow-panel': 'pass',
  'mobile-pagination': 'pass',
  'mobile-pagination-actions': 'pass',
  'mobile-root': 'pass',
  'mobile-state-panel': 'pass',
  'mobile-toolbar': 'pass',
  'pagination-bar': 'pass',
  'pin-side': 'pass',
  'presets-region': 'pass',
  // The quick-slice lane inside that region: the pill and the chips it holds
  // are drawn, the wrapping lane itself is not (WO-FAM-08 B9).
  'presets-row': 'pass',
  rail: 'pass',
  'range-group': 'pass',
  'record-cards': 'pass',
  'record-list': 'pass',
  'record-list-item': 'pass',
  'record-meta': 'pass',
  'responsive-root': 'pass',
  'row-actions': 'pass',
  'row-actions-menu': 'pass',
  'row-content': 'pass',
  'row-copy': 'pass',
  'row-main': 'pass',
  'row-meta': 'pass',
  'saved-views': 'pass',
  scroll: 'pass',
  'scroll-region': 'pass',
  'search-section': 'pass',
  section: 'pass',
  'section-bar': 'pass',
  'section-header': 'pass',
  'settings-panel': 'pass',
  signals: 'pass',
  'table-head': 'pass',
  'title-group': 'pass',
  'title-section': 'pass',
  toolbar: 'pass',
  'toolbar-actions': 'pass',
  'toolbar-context': 'pass',
  'toolbar-copy': 'pass',
  'toolbar-stack': 'pass',
  'trigger-body': 'pass',
  'view-controls': 'pass',
  'view-item': 'pass',
  'view-item-copy': 'pass',
  'view-item-lead': 'pass',
  // Text: a line of copy, a label, a count read as words.
  'action-section-label': 'line',
  'active-card-description': 'line',
  'active-card-label': 'line',
  'bulk-bar-count': 'line',
  caption: 'line',
  'caption-text': 'line',
  'chip-label': 'line',
  'chip-value': 'line',
  'column-size': 'line',
  'column-title': 'line',
  'count-badge-text': 'line',
  'date-label': 'line',
  'field-label': 'line',
  'file-name': 'line',
  'filter-card-description': 'line',
  'filter-card-label': 'line',
  'filter-chip-label': 'line',
  'filter-chip-value': 'line',
  'filter-chips-count': 'line',
  'folder-link': 'line',
  'footer-hint': 'line',
  'group-toggle-label': 'line',
  'header-description': 'line',
  'header-label': 'line',
  'item-eyebrow': 'line',
  'item-name': 'line',
  'item-supporting': 'line',
  'item-title': 'line',
  'mobile-bulk-count': 'line',
  'mobile-card-summary-label': 'line',
  'mobile-card-summary-value': 'line',
  'mobile-card-title': 'line',
  'mobile-overflow-label': 'line',
  'mobile-pagination-range': 'line',
  'month-title': 'line',
  'pagination-ellipsis': 'line',
  'pill-label': 'line',
  'primary-action-mobile-label': 'line',
  'range-separator': 'line',
  'record-list-open': 'line',
  'record-meta-value': 'line',
  'signal-label': 'line',
  'state-description': 'line',
  'state-title': 'line',
  'toolbar-heading': 'line',
  'toolbar-title': 'line',
  'view-item-description': 'line',
  'view-item-label': 'line',
  weekday: 'line',
  // Controls and boxes with an area of their own: buttons, inputs, cells, icons.
  'action-button': 'block',
  'actions-cell': 'block',
  'add-filter': 'block',
  'add-item': 'block',
  apply: 'block',
  'apply-button': 'block',
  'bulk-bar-action': 'block',
  // A board card's body is the caller's slot: with no data there is nothing
  // inside it to draw, so the body itself is the bone the card stands behind.
  'card-content': 'block',
  'card-move-button': 'block',
  'catalog-search': 'block',
  'clear-all': 'block',
  'clear-filters': 'block',
  'collapse-toggle': 'block',
  'column-select': 'block',
  'create-button': 'block',
  'create-input': 'block',
  'data-cell': 'block',
  'date-cell': 'block',
  'day-cell': 'block',
  'default-star': 'block',
  delete: 'block',
  'density-option': 'block',
  'editor-checkbox': 'block',
  'editor-input': 'block',
  event: 'block',
  'field-control': 'block',
  'file-icon': 'block',
  'file-input': 'block',
  'filter-card-icon': 'block',
  'filter-checkmark': 'block',
  'filter-chips-icon': 'block',
  'filter-dropdown-item': 'block',
  'filter-trigger': 'block',
  'folder-icon': 'block',
  glyph: 'block',
  'group-header-cell': 'block',
  'group-header-chevron': 'block',
  'group-toggle': 'block',
  'hide-column-button': 'block',
  'icon-button': 'block',
  'image-frame': 'block',
  'image-placeholder': 'block',
  'image-placeholder-icon': 'block',
  'inline-edit-action': 'block',
  'item-accessory': 'block',
  'item-icon': 'block',
  'less-toggle': 'block',
  'menu-trigger': 'block',
  'mobile-pagination-page': 'block',
  'more-toggle': 'block',
  'name-cell': 'block',
  'pill-icon': 'block',
  'pill-select': 'block',
  'pin-toggle': 'block',
  'preset-chip-icon': 'block',
  'primary-action': 'block',
  'primary-action-mobile': 'block',
  'rename-input': 'block',
  reset: 'block',
  'reset-button': 'block',
  'row-actions-trigger': 'block',
  search: 'block',
  'search-field': 'block',
  signal: 'block',
  'size-cell': 'block',
  'sort-icon': 'block',
  'state-icon-tile': 'block',
  'title-icon': 'block',
  'toolbar-action': 'block',
  'toolbar-icon': 'block',
  'trigger-icon': 'block',
  'view-item-select': 'block',
  'view-select': 'block',
  'view-toggle': 'block',
  'width-input': 'block',
  // Pills, badges and dots: a corner that is always full.
  'active-count-badge': 'round',
  chip: 'round',
  'count-badge': 'round',
  'count-pill': 'round',
  counter: 'round',
  'filter-badge': 'round',
  'filter-chip': 'round',
  'group-header-count-pill': 'round',
  'option-icon-badge': 'round',
  'overflow-count': 'round',
  pill: 'round',
  'pin-badge': 'round',
  'preset-chip': 'round',
  'presets-pill': 'round',
  'status-pill': 'round',
  'title-pill': 'round',
  'unsaved-dot': 'round',
  'width-badge': 'round',
  'wip-badge': 'round',
  // Nothing to stand in for with no data: spacers, drag and resize affordances,
  // empty and error states, announcers, an overlay with nothing under it.
  'catalog-no-results': 'omit',
  // A board card's edit bar is drag and remove chrome: with no data there is
  // nothing to move or remove, exactly like the drag affordances beside it.
  'cell-controls': 'omit',
  'checkbox-overlay': 'omit',
  'drag-grip': 'omit',
  'drag-handle': 'omit',
  'editor-error': 'omit',
  'empty-board': 'omit',
  'empty-column': 'omit',
  'empty-state': 'omit',
  'empty-state-copy': 'omit',
  'empty-state-description': 'omit',
  'empty-state-icon': 'omit',
  'empty-state-title': 'omit',
  'error-state': 'omit',
  grip: 'omit',
  'group-header-aggregate-separator': 'omit',
  'move-announcer': 'omit',
  'resize-handle-bar': 'omit',
  sentinel: 'omit',
  'settings-empty': 'omit',
  spacer: 'omit',
  'swipe-actions': 'omit',
  'swipe-actions-bar': 'omit',
  'swipe-actions-toggle': 'omit',
  'swipe-record': 'omit',

  // ---- tree, list and descriptions anatomy (WO-FAM-06 tree/list/descriptions cut) ----
  // A node row and a descriptions body read their parts; the selection control
  // is a block; a drag affordance and a layout spacer mean nothing with no data.
  node: 'pass',
  rows: 'pass',
  checkbox: 'block',
  'drop-indicator': 'omit',
  'switcher-spacer': 'omit',
  // A list item's meta is the row the loading state stands in for: its wrappers
  // pass through and its two texts are the lines the bones draw.
  meta: 'pass',
  'meta-content': 'pass',
  'meta-avatar': 'round',
  'meta-title': 'line',
  'meta-description': 'line',
  // The item's own wrappers pass through; one action is a control-sized box;
  // the loading grid host is the stand-in itself, so it draws nothing.
  'item-content': 'pass',
  'item-extra': 'pass',
  'item-actions': 'pass',
  'item-action': 'block',
  'loading-grid': 'omit',
  // ---- badge, tag and avatar anatomy (WO-FAM-06 badge/tag/avatar cut) ----
  // A dismiss control is a pill; the avatar silhouette is the mask, measured
  // with its own corner so a rounded square stays square; what fills the
  // silhouette adds nothing over it.
  close: 'round',
  mask: 'block',
  fallback: 'omit',
  'status-dot': 'round',
  surplus: 'round',
  // ---- table anatomy (WO-FAM-06 table cut) ----
  // Containers read their parts; the header title is the only text line; the
  // affordances that mean nothing without data draw nothing.
  table: 'pass',
  'scroll-container': 'pass',
  'header-cell': 'pass',
  'header-content': 'pass',
  'header-title': 'line',
  'sort-indicator': 'omit',
  'resize-handle': 'omit',
  'filter-row': 'pass',
  'filter-cell': 'pass',
  'filter-spacer': 'omit',
  'expand-cell': 'pass',
  'expand-button': 'block',
  'expand-indicator': 'omit',
  'expanded-row': 'omit',
  'selection-cell': 'pass',
  'selection-control': 'block',
  'selection-hit': 'omit',
  'empty-cell': 'omit',
  'virtual-spacer': 'omit',
  pagination: 'pass',
  'pagination-button': 'block',
  root: 'frame',
  surface: 'frame',
  bubble: 'frame',
  group: 'pass',
  body: 'pass',
  header: 'pass',
  'header-main': 'pass',
  footer: 'pass',
  actions: 'pass',
  content: 'pass',
  'content-frame': 'pass',
  field: 'pass',
  row: 'pass',
  option: 'pass',
  extra: 'pass',
  'control-row': 'pass',
  'control-slot': 'pass',
  'label-wrap': 'pass',
  layout: 'pass',
  'message-region': 'pass',
  item: 'pass',
  'error-wrapper': 'pass',
  'error-list': 'pass',
  'strength-meter': 'pass',
  trailing: 'pass',
  'clear-field': 'pass',
  columns: 'pass',
  'extra-footer': 'pass',
  'format-field': 'pass',
  grid: 'pass',
  // A grid cell is a container: its children are drawn, it is not (WO-FAM-07).
  'grid-cell': 'pass',
  // A Box is a container: its children are drawn and it is not. Deliberately
  // NOT the `box` role above, which is checkbox's solid indicator square.
  'box-surface': 'pass',
  // ---- collapse anatomy (WO-FAM-07 L7) ----
  // A disclosure's header row and its content wrapper are containers: what they
  // hold is drawn, they are not.
  'header-row': 'pass',
  'content-inner': 'pass',
  'group-options': 'pass',
  'hex-field': 'pass',
  'input-wrapper': 'pass',
  'menu-column': 'pass',
  'nav-group': 'pass',
  operations: 'pass',
  'option-content': 'pass',
  'option-group': 'pass',
  'option-list': 'pass',
  'panel-header': 'pass',
  'panel-item': 'pass',
  'panel-list': 'pass',
  'panel-pagination': 'pass',
  'panel-search-field': 'pass',
  'preset-group': 'pass',
  'preset-row': 'pass',
  presets: 'pass',
  'search-input-wrapper': 'pass',
  'time-column': 'pass',
  'tree-list': 'pass',
  'tree-node-highlight': 'pass',
  'trigger-actions': 'pass',
  'virtual-track': 'pass',
  'virtual-window': 'pass',
  'week-row': 'pass',
  'weekday-row': 'pass',
  'heading-group': 'pass',
  'handle-area': 'pass',
  copy: 'pass',
  menu: 'pass',
  'item-shell': 'pass',
  'trigger-content': 'pass',
  'shortcut-row': 'pass',
  indicators: 'pass',
  stack: 'pass',
  'stack-item': 'pass',
  controls: 'pass',
  'tab-rail': 'pass',
  'tab-list': 'pass',
  'tab-panel': 'pass',
  navigation: 'pass',
  main: 'pass',
  'panel-body': 'pass',
  connector: 'block',
  list: 'pass',
  'pagination-controls': 'pass',
  'pagination-jumper': 'pass',
  'pagination-size-changer': 'pass',
  trigger: 'block',
  control: 'block',
  input: 'block',
  action: 'block',
  cover: 'block',
  'cover-image': 'block',
  img: 'block',
  image: 'block',
  media: 'block',
  box: 'block',
  track: 'block',
  'addon-before': 'block',
  'addon-after': 'block',
  'search-button': 'block',
  slot: 'block',
  'tag-chip': 'block',
  'strength-track': 'block',
  'format-select': 'block',
  'hex-input': 'block',
  'native-color-input': 'block',
  'panel-search': 'block',
  'search-input': 'block',
  tag: 'block',
  textarea: 'block',
  'time-select': 'block',
  'trigger-input': 'block',
  'tab-button': 'block',
  'tab-badge': 'block',
  'overflow-previous': 'block',
  'overflow-next': 'block',
  'overflow-more': 'block',
  crumb: 'block',
  'overflow-trigger': 'block',
  'pagination-nav-button': 'block',
  'pagination-page-button': 'block',
  'quick-jumper': 'block',
  'pagination-size-select': 'block',
  title: 'line',
  description: 'line',
  label: 'line',
  'trigger-label': 'line',
  'trigger-code': 'line',
  text: 'line',
  value: 'line',
  'option-label': 'line',
  'state-label': 'line',
  'helper-text': 'line',
  'error-message': 'line',
  cell: 'line',
  line: 'line',
  count: 'line',
  'error-text': 'line',
  'error-item': 'line',
  'extra-text': 'line',
  'help-text': 'line',
  'label-text': 'line',
  message: 'line',
  'strength-label': 'line',
  'column-label': 'line',
  'display-text': 'line',
  'group-label': 'line',
  'option-description': 'line',
  'pagination-status': 'line',
  'panel-count': 'line',
  'panel-item-label': 'line',
  'panel-title': 'line',
  placeholder: 'line',
  'preset-label': 'line',
  'tag-count': 'line',
  'tag-label': 'line',
  'tree-node-label': 'line',
  'trigger-value': 'line',
  'weekday-header': 'line',
  'action-label': 'line',
  'tab-label': 'line',
  'pagination-range': 'line',
  'pagination-simple-text': 'line',
  ellipsis: 'line',
  subtitle: 'line',
  eyebrow: 'line',
  icon: 'round',
  prefix: 'round',
  suffix: 'round',
  avatar: 'round',
  flag: 'round',
  circle: 'round',
  'affix-prefix': 'round',
  'affix-suffix': 'round',
  'error-icon': 'round',
  'feedback-icon': 'round',
  'tooltip-icon': 'round',
  'visibility-toggle': 'round',
  'arrow-icon': 'round',
  'calendar-icon': 'round',
  chevron: 'round',
  'clock-icon': 'round',
  'option-icon': 'round',
  'panel-item-checkbox': 'round',
  'panel-search-icon': 'round',
  'panel-select-all': 'round',
  'preset-swatch': 'round',
  'search-icon': 'round',
  swatch: 'round',
  'tree-node-toggle': 'round',
  'close-button': 'round',
  'header-icon': 'round',
  spinner: 'omit',
  checkmark: 'omit',
  dot: 'omit',
  thumb: 'omit',
  'state-icon': 'omit',
  'loading-indicator': 'omit',
  'spinner-track': 'omit',
  'spinner-indicator': 'omit',
  'busy-content': 'omit',
  'accessible-label': 'omit',
  'loading-content': 'omit',
  'loading-overlay': 'omit',
  gradient: 'omit',
  overlay: 'omit',
  panel: 'omit',
  'clear-button': 'omit',
  anchor: 'omit',
  backdrop: 'omit',
  handle: 'omit',
  // ---- splitter anatomy (WO-FAM-07 layout cut) ----
  // A resize boundary is an affordance, not content: with no panels to move it
  // means nothing, exactly like the `handle` above.
  gutter: 'omit',
  arrow: 'omit',
  divider: 'omit',
  // ---- divider anatomy (WO-FAM-07 layout cut) ----
  // The two rule segments around a label are hairlines: a skeleton draws no
  // bone for a mark that carries no content.
  'line-before': 'omit',
  'line-after': 'omit',
  submenu: 'omit',
  'selection-indicator': 'omit',
  'submenu-indicator': 'omit',
  'shortcut-chips': 'omit',
  'shortcut-key': 'omit',
  spotlight: 'omit',
  progress: 'omit',
  indicator: 'round',
  'pagination-size-icon': 'round',
  'dot-slot': 'round',
  'status-name': 'omit',
  'caps-lock-hint': 'omit',
  'required-mark': 'omit',
  steppers: 'omit',
  'stepper-button': 'omit',
  'strength-fill': 'omit',
  'strength-segment': 'omit',
  'column-divider': 'omit',
  'double-nav-icon': 'omit',
  dropdown: 'omit',
  empty: 'omit',
  'hex-error': 'omit',
  'label-separator': 'omit',
  'leaf-spacer': 'omit',
  loading: 'omit',
  'loading-label': 'omit',
  'loading-spinner': 'omit',
  'loading-state': 'omit',
  'loading-state-label': 'omit',
  'loading-status': 'omit',
  'native-arrow': 'omit',
  'option-check': 'omit',
  'option-checkbox': 'omit',
  'panel-empty': 'omit',
  'panel-empty-icon': 'omit',
  popup: 'omit',
  separator: 'omit',
  'tag-remove': 'omit',
  'time-separator': 'omit',
  'trigger-loading': 'omit',

  // ---- the page headers, record and the form surfaces (WO-FAM-10) ----
  // Adjudicated once per NAME, as the WO-FAM-08 block above: a name shared by
  // three headers means the same thing in all three. The evidence is the
  // stamped anatomy plus the Modern skin: an owner that holds stamped parts is
  // a container, a leaf that the skin sizes as a glyph or a full-radius mark is
  // round, a leaf the skin gives its own tile surface is a block, and an owner
  // that only exists once there is data has nothing to stand in for.
  // Wrappers and slots: they draw nothing, and what they hold is drawn. A slot
  // that holds a caller's node delegates to that node's own anatomy -- a ghost
  // `Button` inside `back` stamps `trigger`, so the bone is the button's.
  'action-bar': 'pass',
  'action-bar-actions': 'pass',
  'action-bar-meta': 'pass',
  back: 'pass',
  'back-button': 'pass',
  banner: 'pass',
  bar: 'pass',
  'breadcrumb-trail': 'pass',
  'card-grid': 'pass',
  center: 'pass',
  'change-indicator': 'pass',
  'change-row': 'pass',
  'content-body': 'pass',
  'context-card': 'pass',
  'context-card-children': 'pass',
  'context-rail': 'pass',
  'crumb-item': 'pass',
  'crumb-list': 'pass',
  'dirty-chip': 'pass',
  'draft-recovery-actions': 'pass',
  'draft-recovery-copy': 'pass',
  'draft-status': 'pass',
  editor: 'pass',
  'editor-actions': 'pass',
  'editor-copy': 'pass',
  'editor-header': 'pass',
  'editor-lead': 'pass',
  'facts-card': 'pass',
  'facts-card-body': 'pass',
  'facts-card-item': 'pass',
  'facts-card-item-copy': 'pass',
  'facts-card-items': 'pass',
  'field-body': 'pass',
  'field-error-row': 'pass',
  'field-grid': 'pass',
  'field-label-row': 'pass',
  'field-link-body': 'pass',
  'field-requirement': 'pass',
  'footer-actions': 'pass',
  'footer-impact-preview': 'pass',
  'footer-support': 'pass',
  'hero-cluster': 'pass',
  'hero-copy': 'pass',
  'hero-panel': 'pass',
  'hero-row': 'pass',
  identity: 'pass',
  'label-row': 'pass',
  lead: 'pass',
  'metadata-card': 'pass',
  'metadata-card-children': 'pass',
  'metadata-chip': 'pass',
  'metric-chip': 'pass',
  'metric-chip-readout': 'pass',
  'metrics-row': 'pass',
  'quick-actions': 'pass',
  right: 'pass',
  'secondary-rail': 'pass',
  'section-actions': 'pass',
  'section-card-header': 'pass',
  'section-chip': 'pass',
  'section-clip': 'pass',
  'section-content': 'pass',
  'section-copy': 'pass',
  'section-disclosure': 'pass',
  'section-error': 'pass',
  'section-grid': 'pass',
  'section-lead': 'pass',
  'section-nav': 'pass',
  'section-nav-item-main': 'pass',
  'section-nav-item-row': 'pass',
  'section-nav-list': 'pass',
  'section-nav-select': 'pass',
  'section-summary': 'pass',
  'section-trailing': 'pass',
  'shortcuts-label': 'pass',
  'spark-dots': 'pass',
  'stat-card': 'pass',
  'stat-top': 'pass',
  statistic: 'pass',
  'status-list': 'pass',
  'submit-bar': 'pass',
  'submit-bar-actions': 'pass',
  'submit-bar-panel': 'pass',
  'submit-bar-secondary': 'pass',
  'subtitle-row': 'pass',
  'summary-grid': 'pass',
  'summary-item': 'pass',
  'summary-strip': 'pass',
  tab: 'pass',
  'tab-strip': 'pass',
  tabs: 'pass',
  'template-picker': 'pass',
  'time-range': 'pass',
  'title-bar': 'pass',
  'title-copy': 'pass',
  'title-row': 'pass',
  titles: 'pass',
  toggle: 'pass',
  'top-bar': 'pass',
  'validation-issue': 'pass',
  'validation-issue-list': 'pass',
  'validation-summary-header': 'pass',
  // Copy: one text-height bone across the part. A pill that carries its own
  // text (`entity-id`, `meta-item`, `status`) reads as the text it shows, not
  // as a circle the width of its shortest side; a short status row with a
  // leading glyph (`section-card-complete`) is still one line of copy.
  'action-bar-meta-label': 'line',
  'action-bar-meta-text': 'line',
  'avatar-initials': 'line',
  'back-label': 'line',
  'breadcrumb-item': 'line',
  'breadcrumb-link': 'line',
  'change-period': 'line',
  'change-value': 'line',
  'dirty-label': 'line',
  'draft-recovery-description': 'line',
  'draft-recovery-title': 'line',
  'draft-status-label': 'line',
  'editor-description': 'line',
  'editor-eyebrow': 'line',
  'editor-title': 'line',
  'entity-id': 'line',
  'facts-card-description': 'line',
  'facts-card-eyebrow': 'line',
  'facts-card-item-helper': 'line',
  'facts-card-item-label': 'line',
  'facts-card-item-value': 'line',
  'facts-card-title': 'line',
  'field-error': 'line',
  'field-helper': 'line',
  'field-hint': 'line',
  'field-number': 'line',
  'field-requirement-copy': 'line',
  'field-value': 'line',
  'footer-hidden-summary': 'line',
  'footer-note': 'line',
  'footer-summary': 'line',
  index: 'line',
  'meta-item': 'line',
  'metadata-chip-label': 'line',
  'metadata-chip-value': 'line',
  'metric-chip-change': 'line',
  'metric-chip-label': 'line',
  'metric-chip-value': 'line',
  'progress-count': 'line',
  'section-card-complete': 'line',
  'section-card-description': 'line',
  'section-card-errors': 'line',
  'section-card-title': 'line',
  'section-chip-label': 'line',
  'section-description': 'line',
  'section-error-copy': 'line',
  'section-nav-item-label': 'line',
  'section-nav-label': 'line',
  'section-number': 'line',
  'section-summary-text': 'line',
  'section-title': 'line',
  'stat-insight': 'line',
  status: 'line',
  'status-dot-text': 'line',
  'status-pill-text': 'line',
  'submit-bar-progress': 'line',
  'summary-item-helper': 'line',
  'summary-item-label': 'line',
  'summary-item-value': 'line',
  'tab-count-text': 'line',
  'template-card-description': 'line',
  'template-card-title': 'line',
  'validation-issue-field': 'line',
  'validation-issue-message': 'line',
  'validation-issue-overflow': 'line',
  'validation-summary-title': 'line',
  // Tiles and controls: the part's own box, at the corner the skin gives it.
  'draft-recovery-icon': 'block',
  'editor-icon': 'block',
  'field-copy': 'block',
  'icon-badge': 'block',
  'metric-chip-icon': 'block',
  'section-index': 'block',
  'section-toggle': 'block',
  'shortcut-pill': 'block',
  // Glyphs, dots and count badges: a corner that is always full.
  'action-icon': 'round',
  'back-icon': 'round',
  'dirty-dot': 'round',
  'draft-status-dot': 'round',
  exception: 'round',
  'field-error-icon': 'round',
  'field-icon': 'round',
  'field-link-icon': 'round',
  'field-requirement-dot': 'round',
  'icon-badge-glyph': 'round',
  'metadata-chip-icon': 'round',
  'metric-chip-trend': 'round',
  'quick-action-icon': 'round',
  'section-card-icon': 'round',
  'section-error-icon': 'round',
  'section-icon': 'round',
  'section-nav-item-error-dot': 'round',
  'section-nav-item-icon': 'round',
  'section-toggle-icon': 'round',
  'shortcuts-label-icon': 'round',
  'spark-dot': 'round',
  'stat-icon': 'round',
  'status-dot-glyph': 'round',
  'tab-count': 'round',
  'tab-icon': 'round',
  'template-card-icon': 'round',
  'validation-issue-dot': 'round',
  // Nothing to stand in for with no data: hairlines and rules, a decorative
  // glow or spine, a scroll sentinel, a visually-hidden ordinal, an empty
  // placeholder, a progress meter with nothing to report, and a surface error
  // banner -- the same adjudication `error-state` already carries.
  'action-divider': 'omit',
  'breadcrumb-divider': 'omit',
  'breadcrumb-separator': 'omit',
  'card-glow': 'omit',
  dash: 'omit',
  'editorial-tech-rule': 'omit',
  'error-banner': 'omit',
  'hero-spine': 'omit',
  'index-label': 'omit',
  'progress-bar': 'omit',
  'stat-progress': 'omit',
  'sticky-sentinel': 'omit',
  'submit-bar-progress-placeholder': 'omit',
  'subtitle-divider': 'omit',

  // ---- the shell, command and search families (WO-FAM-11 repair) ----
  // Adjudicated once per NAME, on the same evidence the two blocks above use:
  // the stamped anatomy plus the Modern skin. An owner that holds stamped
  // parts is a container; a leaf the skin gives its own control box is a
  // block; a leaf the skin sizes as a circle is round; a leaf the skin gives
  // only type is a line; an owner that is decoration, a transient overlay, or
  // only exists once there is data has nothing to stand in for.
  // Wrappers and slots: they draw nothing, and what they hold is drawn. A
  // slot that holds a caller's node delegates to that node's own anatomy --
  // the `kbd` and `shortcut` wrappers hold a ghost `Kbd`, `argument-chip`
  // holds a `Tag`, and each of those stamps its own root.
  'actions-slot': 'pass',
  'argument-chip': 'pass',
  'argument-panel': 'pass',
  'bar-row': 'pass',
  'category-row': 'pass',
  chord: 'pass',
  // The shortcuts-overlay card. A container by the rule above, as `stat-card`
  // and `facts-card` already are: `frame` stays the outermost silhouette
  // owners (`root`, `surface`, `bubble`), not every surface below them.
  dialog: 'pass',
  // The search bar's stacking wrapper: `position: relative; z-index: 1` and
  // nothing else.
  frame: 'pass',
  'header-actions': 'pass',
  'header-center': 'pass',
  'header-left': 'pass',
  'header-right': 'pass',
  'input-column': 'pass',
  // The command row's two layout owners. This is the pair the command-palette
  // cut suite routed here: both resolved to the unknown-part `block`, so the
  // palette's own loading footprint painted a slab over the row and a second
  // one over its text column, and the `label`/`description` lines under them
  // were never reached. NOTE the divergence: the unrostered insights activity
  // lane stamps `item-text` on a `Text` leaf instead of a column. The live
  // renderer consumer is the palette, and a container that paints nothing is
  // the lesser error against a slab over two lines of copy.
  'item-main': 'pass',
  'item-text': 'pass',
  kbd: 'pass',
  'main-area': 'pass',
  // The navigation column and the three regions inside it. Each one is the
  // whole strip -- the logo header is 6.5rem tall and the full column wide,
  // the body is everything left of the footer -- so the caller's mark, nav and
  // footer inside them are what the bones draw, never the strip itself.
  'navigation-body': 'pass',
  'navigation-drawer-header': 'pass',
  'navigation-footer': 'pass',
  'navigation-logo': 'pass',
  'navigation-sidebar': 'pass',
  recent: 'pass',
  'search-shell': 'pass',
  'side-cluster': 'pass',
  'status-row': 'pass',
  suggestions: 'pass',
  'top-rail': 'pass',
  'voice-badge': 'pass',
  'voice-controls': 'pass',
  // Copy: one text-height bone across the part.
  'category-label': 'line',
  'section-label': 'line',
  // The shortcut hint on a command row. Two of its three families stamp it on
  // the hint text itself (`context-menu`, `collection-workspace`); the
  // palette's wrapper boxes a ghost `Kbd` exactly, so a text-height bone lands
  // on the hint either way.
  shortcut: 'line',
  'suggestions-label': 'line',
  'voice-badge-label': 'line',
  'argument-prompt': 'line',
  // Controls with a box of their own, drawn at the corner the skin measures.
  // The two shell actions are 44px squares at `--ds-radius-md`, so a circle
  // would round a square plate; the suggestion chip is a `shape='round'`
  // Button -- full radius, no `aspect-ratio`, so it is a wide pill and a
  // circle the width of its shortest side would be a dot at its start edge.
  'navigation-close': 'block',
  'navigation-trigger': 'block',
  'suggestion-chip': 'block',
  // A circle by measurement, not by resemblance: `shape='circle'` resolves
  // `aspect-ratio: 1` with `--ds-radius-full`.
  'voice-toggle': 'round',
  // Nothing to stand in for. The skip link is 1px and clipped until it takes
  // focus; the static particle field is decoration (`inset: 0`,
  // `pointer-events: none`, a masked ramp) that would paint over the whole
  // shell; the voice-help drawer is a transient permission overlay on the
  // `popup`/`dropdown` adjudication, floating below the bar -- its subtree
  // goes with it, exactly as `empty-state-*` goes with `empty-state`; the
  // clear control exists only once the query does, which is the reading
  // `clear-button` already carries; and an error region only exists once
  // there is an error, as `error-state` and `editor-error` already do.
  clear: 'omit',
  error: 'omit',
  'argument-error': 'omit',
  'particle-field-static-fallback': 'omit',
  'skip-link': 'omit',
  'voice-help': 'omit',
  'voice-help-actions': 'omit',
  'voice-help-cancel': 'omit',
  'voice-help-copy': 'omit',
  'voice-help-description': 'omit',
  'voice-help-footer': 'omit',
  'voice-help-hint': 'omit',
  'voice-help-list': 'omit',
  'voice-help-step': 'omit',
  'voice-help-title': 'omit',
});

/** A part the renderer has no role for still shows as its own box. */
const UNKNOWN_PART_ROLE: SkeletonPartRole = 'block';

export function resolvePartRole(part: string): SkeletonPartRole {
  return SKELETON_PART_ROLES[part] ?? UNKNOWN_PART_ROLE;
}

/** One painted bone, positioned against the source layer's box. */
export interface AnatomyBone {
  part: string;
  role: Exclude<SkeletonPartRole, 'pass' | 'omit'>;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: string;
}

/** One traversal: the bones to paint, and every element whose box produced them. */
interface AnatomyReading {
  bones: AnatomyBone[];
  /** The elements the traversal read, so their size can be watched for drift. */
  measured: Element[];
}

/**
 * Reads the stamped anatomy under `source`, in document order.
 * Elements without a `data-part` are transparent: their parts are still read.
 */
function readAnatomy(source: HTMLElement): AnatomyReading {
  const origin = source.getBoundingClientRect();
  const view = source.ownerDocument.defaultView;
  const bones: AnatomyBone[] = [];
  const measured: Element[] = [];

  const visit = (element: Element) => {
    const part = element.getAttribute('data-part');
    const role = part === null ? 'pass' : resolvePartRole(part);
    if (role === 'omit') return;
    measured.push(element);
    if (part !== null && role !== 'pass') {
      const rect = element.getBoundingClientRect();
      const radius = view?.getComputedStyle(element).borderRadius;
      bones.push({
        part,
        role,
        x: rect.left - origin.left,
        y: rect.top - origin.top,
        width: rect.width,
        height: rect.height,
        radius: radius && radius !== '0px' ? radius : undefined,
      });
      if (role !== 'frame') return;
    }
    for (const child of Array.from(element.children)) visit(child);
  };

  for (const child of Array.from(source.children)) visit(child);
  return { bones, measured };
}

/** The bones of the stamped anatomy under `source`, in document order. */
export function readAnatomyBones(source: HTMLElement): AnatomyBone[] {
  return readAnatomy(source).bones;
}

/**
 * Ancestor attributes whose change re-reads every bone: the paint-owner surface plus `dir`.
 * A stylesheet-only move with no attribute and no box change has no DOM signal, so it is not covered.
 */
export const SKELETON_ANCESTOR_INVALIDATION_ATTRIBUTES: readonly string[] = Object.freeze([
  ...PROVIDER_PAINT_ATTRIBUTE_FILTER,
  'dir',
]);

const sameBones = (left: AnatomyBone[], right: AnatomyBone[]) =>
  left.length === right.length
  && left.every((bone, index) => {
    const other = right[index];
    return bone.part === other.part && bone.role === other.role && bone.x === other.x
      && bone.y === other.y && bone.width === other.width && bone.height === other.height
      && bone.radius === other.radius;
  });

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * React 18 drops an unknown boolean attribute and React 19 drops the empty string,
 * so the presence form is the only `inert` both supported peer majors serialize.
 */
const INERT: Readonly<Record<string, string>> = { inert: 'inert' };
const INTERACTIVE: Readonly<Record<string, string>> = {};

/**
 * Where the skeleton hosts itself. `block` is the wrapper every consumer has
 * today. `table-rows` renders `tr`/`td` placeholder rows for a loading state
 * that must live inside a `tbody`, where a wrapper element is not valid HTML.
 */
export type AnatomySkeletonMode = 'block' | 'table-rows';

/** One cell of a `table-rows` placeholder row. */
export interface AnatomySkeletonCell {
  /** Stamped as `data-kind`, so a control well can paint narrower than a data cell. */
  readonly kind?: string;
  /** A stable React key; the index is used when absent. */
  readonly key?: string;
}

export interface AnatomySkeletonProps {
  /** While true the component is replaced by the skeleton built from its anatomy. @default true */
  loading?: boolean;
  /** The component the loading state stands in for; its `data-part` anatomy shapes the bones. */
  children?: ReactNode;
  /** Overrides the tenant `skeletonStyle`; `false` holds a static surface. */
  animation?: SkeletonAnimation;
  /** Stamps `aria-busy` while loading. `false` when the host already announces
   * its own loading state, so the surface keeps a single announcement. @default true */
  busy?: boolean;
  /** @default 'block' */
  mode?: AnatomySkeletonMode;
  /** `table-rows` only: how many placeholder rows to draw. @default 4 */
  rowCount?: number;
  /** `table-rows` only: one entry per cell of every placeholder row. */
  cells?: readonly AnatomySkeletonCell[];
  className?: string;
  style?: CSSProperties;
}

export const AnatomySkeleton = forwardRef<HTMLDivElement, AnatomySkeletonProps>(
  (
    { loading = true, busy = true, children, animation, mode = 'block', rowCount = 4, cells, className, style },
    ref,
  ) => {
    const tokens = useOptionalTokens();
    const sourceRef = useRef<HTMLDivElement>(null);
    const [bones, setBones] = useState<AnatomyBone[] | null>(null);

    const resolvedAnimation = animation ?? (tokens ? resolveSkeletonPersonalityDefaults(tokens).animation : 'wave');
    const animationStyle = resolvedAnimation === false ? undefined : resolvedAnimation === 'pulse' ? 'pulse' : 'shimmer';

    const geometryRef = useRef<{ resize: ResizeObserver | null; observed: Set<Element> }>({
      resize: null,
      observed: new Set(),
    });

    const measure = useCallback(() => {
      const source = sourceRef.current;
      if (!source) return;
      const { bones: next, measured } = readAnatomy(source);
      const geometry = geometryRef.current;
      if (geometry.resize) {
        const live = new Set<Element>(measured);
        live.add(source);
        for (const element of geometry.observed) {
          if (live.has(element)) continue;
          geometry.resize.unobserve(element);
          geometry.observed.delete(element);
        }
        for (const element of live) {
          if (geometry.observed.has(element)) continue;
          geometry.observed.add(element);
          geometry.resize.observe(element);
        }
      }
      setBones((current) => (current && sameBones(current, next) ? current : next));
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (loading) measure();
    });

    useEffect(() => {
      const source = sourceRef.current;
      if (!loading || !source) return undefined;
      const owner = source.ownerDocument;
      const geometry = geometryRef.current;
      geometry.resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      const mutation = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(measure);
      // Any attribute can move a part through an attribute selector and any text edit can
      // reflow a line, so the whole source subtree is watched, not `data-part` alone.
      mutation?.observe(source, { childList: true, subtree: true, attributes: true, characterData: true });
      // A provider root, a scoped `dir` or an inherited custom property lands on an ancestor's own
      // attributes, so each ancestor is watched by itself; the document is never watched as a subtree.
      const ancestorWatch = { attributes: true, attributeFilter: [...SKELETON_ANCESTOR_INVALIDATION_ATTRIBUTES] };
      for (let ancestor = source.parentElement; ancestor; ancestor = ancestor.parentElement) {
        mutation?.observe(ancestor, ancestorWatch);
      }
      mutation?.observe(owner.documentElement, ancestorWatch);
      const fonts: FontFaceSet | undefined = owner.fonts;
      let watching = true;
      const remeasure = () => {
        if (watching) measure();
      };
      fonts?.addEventListener?.('loadingdone', remeasure);
      void fonts?.ready?.then(remeasure, () => undefined);
      // Seeds the resize targets: the layout effect above measured before this observer existed.
      measure();
      return () => {
        watching = false;
        fonts?.removeEventListener?.('loadingdone', remeasure);
        geometry.resize?.disconnect();
        geometry.resize = null;
        geometry.observed.clear();
        mutation?.disconnect();
      };
    }, [loading, measure]);

    if (mode === 'table-rows') {
      // A `tbody` admits no wrapper element, so the rows ARE the skeleton. They
      // carry no `aria-busy`: the host that owns the loading state keeps the
      // single one, and every row is hidden so the placeholder count is never
      // announced as data.
      const row = cells ?? [{}];
      return (
        <>
          {Array.from({ length: rowCount }, (_, index) => (
            <tr
              key={index}
              className={['ds-skeleton-anatomy-rows', className].filter(Boolean).join(' ')}
              data-part="skeleton-row"
              data-loading={loading ? 'true' : 'false'}
              data-animation={animationStyle}
              aria-hidden="true"
              style={style}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cell.key ?? cellIndex}
                  data-part="skeleton-cell"
                  {...(cell.kind ? { 'data-kind': cell.kind } : {})}
                >
                  <span data-part="skeleton-bar" data-bone="line" />
                </td>
              ))}
            </tr>
          ))}
        </>
      );
    }

    return (
      <div
        ref={ref}
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-measured={bones ? 'true' : 'false'}
        data-animation={animationStyle}
        aria-busy={(busy && loading) || undefined}
        className={['ds-skeleton-anatomy', className].filter(Boolean).join(' ')}
        style={style}
      >
        <div
          ref={sourceRef}
          data-part="source"
          aria-hidden={loading || undefined}
          {...(loading ? INERT : INTERACTIVE)}
        >
          {children}
        </div>
        {bones && (
          <div data-part="bones" aria-hidden="true">
            {bones.map((bone, index) => (
              <span
                key={`${bone.part}-${index}`}
                data-part="bone"
                data-bone={bone.role}
                data-source-part={bone.part}
                style={{
                  '--ds-skeleton-bone-x': `${bone.x}px`,
                  '--ds-skeleton-bone-y': `${bone.y}px`,
                  '--ds-skeleton-bone-width': `${bone.width}px`,
                  '--ds-skeleton-bone-height': `${bone.height}px`,
                  ...(bone.radius ? { '--ds-skeleton-bone-radius': bone.radius } : {}),
                } as CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

AnatomySkeleton.displayName = 'AnatomySkeleton';

export default AnatomySkeleton;
