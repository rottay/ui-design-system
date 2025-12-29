/**
 * Z-Index Tokens - TypeScript Mirror
 *
 * TypeScript representation of z-index CSS custom properties.
 * Use these for type-safe z-index references in JavaScript/TypeScript.
 */

// Z-Index Scale - Layering System
export const zIndex = {
  base: 'var(--z-index-base)',
  dropdown: 'var(--z-index-dropdown)',
  sticky: 'var(--z-index-sticky)',
  fixed: 'var(--z-index-fixed)',
  overlay: 'var(--z-index-overlay)',
  drawer: 'var(--z-index-drawer)',
  modal: 'var(--z-index-modal)',
  popover: 'var(--z-index-popover)',
  tooltip: 'var(--z-index-tooltip)',
  notification: 'var(--z-index-notification)',
  max: 'var(--z-index-max)',
} as const;

// Component-Specific Z-Index
export const zIndexNavigation = {
  navbar: 'var(--z-index-navbar)',
  sidebar: 'var(--z-index-sidebar)',
  navbarDropdown: 'var(--z-index-navbar-dropdown)',
} as const;

export const zIndexMenu = {
  menu: 'var(--z-index-menu)',
  submenu: 'var(--z-index-submenu)',
  contextMenu: 'var(--z-index-context-menu)',
} as const;

export const zIndexOverlay = {
  modalBackdrop: 'var(--z-index-modal-backdrop)',
  modalContent: 'var(--z-index-modal-content)',
  drawerBackdrop: 'var(--z-index-drawer-backdrop)',
  drawerContent: 'var(--z-index-drawer-content)',
} as const;

export const zIndexFeedback = {
  toast: 'var(--z-index-toast)',
  alert: 'var(--z-index-alert)',
  banner: 'var(--z-index-banner)',
} as const;

export const zIndexForms = {
  selectDropdown: 'var(--z-index-select-dropdown)',
  datepicker: 'var(--z-index-datepicker)',
  autocomplete: 'var(--z-index-autocomplete)',
} as const;

export const zIndexUtility = {
  loadingOverlay: 'var(--z-index-loading-overlay)',
  skipLink: 'var(--z-index-skip-link)',
} as const;

// Relative Z-Index
export const zIndexRelative = {
  below: 'var(--z-index-relative-below)',
  base: 'var(--z-index-relative-base)',
  above: 'var(--z-index-relative-above)',
  top: 'var(--z-index-relative-top)',
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
