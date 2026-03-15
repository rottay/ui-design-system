/**
 * Z-Index Tokens - TypeScript Mirror
 *
 * TypeScript representation of z-index CSS custom properties.
 * Use these for type-safe z-index references in JavaScript/TypeScript.
 */

// Z-Index Scale - Layering System
export const zIndex = {
  base: 'var(--ds-z-index-base)',
  dropdown: 'var(--ds-z-index-dropdown)',
  sticky: 'var(--ds-z-index-sticky)',
  fixed: 'var(--ds-z-index-fixed)',
  overlay: 'var(--ds-z-index-overlay)',
  drawer: 'var(--ds-z-index-drawer)',
  modal: 'var(--ds-z-index-modal)',
  popover: 'var(--ds-z-index-popover)',
  tooltip: 'var(--ds-z-index-tooltip)',
  notification: 'var(--ds-z-index-notification)',
  max: 'var(--ds-z-index-max)',
} as const;

// Component-Specific Z-Index
export const zIndexNavigation = {
  navbar: 'var(--ds-z-index-navbar)',
  sidebar: 'var(--ds-z-index-sidebar)',
  navbarDropdown: 'var(--ds-z-index-navbar-dropdown)',
} as const;

export const zIndexMenu = {
  menu: 'var(--ds-z-index-menu)',
  submenu: 'var(--ds-z-index-submenu)',
  contextMenu: 'var(--ds-z-index-context-menu)',
} as const;

export const zIndexOverlay = {
  modalBackdrop: 'var(--ds-z-index-modal-backdrop)',
  modalContent: 'var(--ds-z-index-modal-content)',
  drawerBackdrop: 'var(--ds-z-index-drawer-backdrop)',
  drawerContent: 'var(--ds-z-index-drawer-content)',
} as const;

export const zIndexFeedback = {
  toast: 'var(--ds-z-index-toast)',
  alert: 'var(--ds-z-index-alert)',
  banner: 'var(--ds-z-index-banner)',
} as const;

export const zIndexForms = {
  selectDropdown: 'var(--ds-z-index-select-dropdown)',
  datepicker: 'var(--ds-z-index-datepicker)',
  autocomplete: 'var(--ds-z-index-autocomplete)',
} as const;

export const zIndexUtility = {
  loadingOverlay: 'var(--ds-z-index-loading-overlay)',
  skipLink: 'var(--ds-z-index-skip-link)',
} as const;

// Relative Z-Index
export const zIndexRelative = {
  below: 'var(--ds-z-index-relative-below)',
  base: 'var(--ds-z-index-relative-base)',
  above: 'var(--ds-z-index-relative-above)',
  top: 'var(--ds-z-index-relative-top)',
} as const;

// Combined z-index export
export const zIndices = {
  scale: zIndex,
  navigation: zIndexNavigation,
  menu: zIndexMenu,
  overlay: zIndexOverlay,
  feedback: zIndexFeedback,
  forms: zIndexForms,
  utility: zIndexUtility,
  relative: zIndexRelative,
} as const;

// Type exports
export type ZIndexKey = keyof typeof zIndex;
export type ZIndexLayer = 'base' | 'dropdown' | 'sticky' | 'fixed' | 'overlay' | 'drawer' | 'modal' | 'popover' | 'tooltip' | 'notification' | 'max';
