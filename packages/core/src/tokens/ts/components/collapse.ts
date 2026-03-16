/**
 * @fileoverview Collapse/accordion component token mirrors.
 *
 * Uses a slot-based architecture (root, header, content, icon) with variant
 * support (default, bordered, ghost) and full state coverage (idle, hover,
 * focus, active, disabled, expanded).
 *
 * CSS variable naming: `--ds-collapse-{slot}-{variant}-{state}-{property}`
 *
 * Also re-exports `getCollapseTokens` and `getCollapseSlotTokens` helper
 * functions for programmatic token resolution at runtime.
 */

import type { CSSProperties } from 'react';
import {
  getCollapseSlotTokens,
  getCollapseTokens,
  type CollapseIconPosition,
  type CollapseSize,
  type CollapseSlot,
  type CollapseTokenOptions,
  type CollapseVariant,
} from '../../../hooks/components/collapse-token-utils';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type CollapseState = 'idle' | 'hover' | 'focus' | 'active' | 'disabled' | 'expanded';

export interface CollapseSlotTokens {
  root: CSSProperties;
  header: CSSProperties;
  content: CSSProperties;
  icon: CSSProperties;
}

// =============================================================================
// ROOT SLOT TOKENS
// =============================================================================

export const collapseRootTokens = {
  default: {
    idle: {
      background: 'var(--ds-collapse-root-default-idle-bg)',
      borderColor: 'var(--ds-collapse-root-default-idle-border-color)',
      borderWidth: 'var(--ds-collapse-root-default-idle-border-width)',
      borderStyle: 'var(--ds-collapse-root-default-idle-border-style)',
      borderRadius: 'var(--ds-collapse-root-default-idle-border-radius)',
      boxShadow: 'var(--ds-collapse-root-default-idle-shadow)',
    },
  },
  bordered: {
    idle: {
      background: 'var(--ds-collapse-root-bordered-idle-bg)',
      borderColor: 'var(--ds-collapse-root-bordered-idle-border-color)',
      borderWidth: 'var(--ds-collapse-root-bordered-idle-border-width)',
      borderStyle: 'var(--ds-collapse-root-bordered-idle-border-style)',
      borderRadius: 'var(--ds-collapse-root-bordered-idle-border-radius)',
      boxShadow: 'var(--ds-collapse-root-bordered-idle-shadow)',
    },
  },
  ghost: {
    idle: {
      background: 'var(--ds-collapse-root-ghost-idle-bg)',
      borderColor: 'var(--ds-collapse-root-ghost-idle-border-color)',
      borderWidth: 'var(--ds-collapse-root-ghost-idle-border-width)',
      borderStyle: 'var(--ds-collapse-root-ghost-idle-border-style)',
      borderRadius: 'var(--ds-collapse-root-ghost-idle-border-radius)',
      boxShadow: 'var(--ds-collapse-root-ghost-idle-shadow)',
    },
  },
} as const;

// =============================================================================
// HEADER SLOT TOKENS
// =============================================================================

export const collapseHeaderTokens = {
  default: {
    idle: {
      background: 'var(--ds-collapse-header-default-idle-bg)',
      color: 'var(--ds-collapse-header-default-idle-color)',
      borderColor: 'var(--ds-collapse-header-default-idle-border-color)',
      borderWidth: 'var(--ds-collapse-header-default-idle-border-width)',
      paddingLeft: 'var(--ds-collapse-header-default-idle-padding-x)',
      paddingRight: 'var(--ds-collapse-header-default-idle-padding-x)',
      paddingTop: 'var(--ds-collapse-header-default-idle-padding-y)',
      paddingBottom: 'var(--ds-collapse-header-default-idle-padding-y)',
      fontSize: 'var(--ds-collapse-header-default-idle-font-size)',
      fontWeight: 'var(--ds-collapse-header-default-idle-font-weight)',
      lineHeight: 'var(--ds-collapse-header-default-idle-line-height)',
      cursor: 'var(--ds-collapse-header-default-idle-cursor)',
    },
    hover: {
      background: 'var(--ds-collapse-header-default-hover-bg)',
      color: 'var(--ds-collapse-header-default-hover-color)',
    },
    focus: {
      outline: 'var(--ds-collapse-header-default-focus-outline)',
      outlineOffset: 'var(--ds-collapse-header-default-focus-outline-offset)',
    },
    active: {
      background: 'var(--ds-collapse-header-default-active-bg)',
    },
    disabled: {
      background: 'var(--ds-collapse-header-default-disabled-bg)',
      color: 'var(--ds-collapse-header-default-disabled-color)',
      cursor: 'var(--ds-collapse-header-default-disabled-cursor)',
      opacity: 'var(--ds-collapse-header-default-disabled-opacity)',
    },
    expanded: {
      background: 'var(--ds-collapse-header-default-expanded-bg)',
      color: 'var(--ds-collapse-header-default-expanded-color)',
      borderColor: 'var(--ds-collapse-header-default-expanded-border-color)',
    },
  },
  ghost: {
    idle: {
      background: 'var(--ds-collapse-header-ghost-idle-bg)',
      color: 'var(--ds-collapse-header-ghost-idle-color)',
      borderColor: 'var(--ds-collapse-header-ghost-idle-border-color)',
      borderWidth: 'var(--ds-collapse-header-ghost-idle-border-width)',
      paddingLeft: 'var(--ds-collapse-header-ghost-idle-padding-x)',
      paddingRight: 'var(--ds-collapse-header-ghost-idle-padding-x)',
      paddingTop: 'var(--ds-collapse-header-ghost-idle-padding-y)',
      paddingBottom: 'var(--ds-collapse-header-ghost-idle-padding-y)',
    },
    hover: {
      background: 'var(--ds-collapse-header-ghost-hover-bg)',
      color: 'var(--ds-collapse-header-ghost-hover-color)',
    },
  },
} as const;

// =============================================================================
// CONTENT SLOT TOKENS
// =============================================================================

export const collapseContentTokens = {
  default: {
    idle: {
      background: 'var(--ds-collapse-content-default-idle-bg)',
      color: 'var(--ds-collapse-content-default-idle-color)',
      borderColor: 'var(--ds-collapse-content-default-idle-border-color)',
      borderWidth: 'var(--ds-collapse-content-default-idle-border-width)',
      paddingLeft: 'var(--ds-collapse-content-default-idle-padding-x)',
      paddingRight: 'var(--ds-collapse-content-default-idle-padding-x)',
      paddingTop: 'var(--ds-collapse-content-default-idle-padding-y)',
      paddingBottom: 'var(--ds-collapse-content-default-idle-padding-y)',
      fontSize: 'var(--ds-collapse-content-default-idle-font-size)',
      lineHeight: 'var(--ds-collapse-content-default-idle-line-height)',
    },
  },
  ghost: {
    idle: {
      background: 'var(--ds-collapse-content-ghost-idle-bg)',
      color: 'var(--ds-collapse-content-ghost-idle-color)',
      borderColor: 'var(--ds-collapse-content-ghost-idle-border-color)',
      borderWidth: 'var(--ds-collapse-content-ghost-idle-border-width)',
      paddingLeft: 'var(--ds-collapse-content-ghost-idle-padding-x)',
      paddingRight: 'var(--ds-collapse-content-ghost-idle-padding-x)',
      paddingTop: 'var(--ds-collapse-content-ghost-idle-padding-y)',
      paddingBottom: 'var(--ds-collapse-content-ghost-idle-padding-y)',
    },
  },
} as const;

// =============================================================================
// ICON SLOT TOKENS
// =============================================================================

export const collapseIconTokens = {
  default: {
    idle: {
      width: 'var(--ds-collapse-icon-default-idle-size)',
      height: 'var(--ds-collapse-icon-default-idle-size)',
      color: 'var(--ds-collapse-icon-default-idle-color)',
      marginRight: 'var(--ds-collapse-icon-default-idle-margin-right)',
      transform: 'var(--ds-collapse-icon-default-idle-transform)',
      transition: 'var(--ds-collapse-icon-default-idle-transition)',
    },
    hover: {
      color: 'var(--ds-collapse-icon-default-hover-color)',
    },
    disabled: {
      color: 'var(--ds-collapse-icon-default-disabled-color)',
    },
    expanded: {
      transform: 'var(--ds-collapse-icon-default-expanded-transform)',
      color: 'var(--ds-collapse-icon-default-expanded-color)',
    },
  },
  position: {
    start: {
      order: 'var(--ds-collapse-icon-position-start-order)',
    },
    end: {
      order: 'var(--ds-collapse-icon-position-end-order)',
      marginLeft: 'var(--ds-collapse-icon-position-end-margin-left)',
      marginRight: 'var(--ds-collapse-icon-position-end-margin-right)',
    },
  },
} as const;

// =============================================================================
// SIZE TOKENS
// =============================================================================

export const collapseSizeTokens = {
  small: {
    header: {
      paddingLeft: 'var(--ds-collapse-size-small-header-padding-x)',
      paddingRight: 'var(--ds-collapse-size-small-header-padding-x)',
      paddingTop: 'var(--ds-collapse-size-small-header-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-small-header-padding-y)',
      fontSize: 'var(--ds-collapse-size-small-header-font-size)',
    },
    content: {
      paddingLeft: 'var(--ds-collapse-size-small-content-padding-x)',
      paddingRight: 'var(--ds-collapse-size-small-content-padding-x)',
      paddingTop: 'var(--ds-collapse-size-small-content-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-small-content-padding-y)',
    },
    icon: {
      width: 'var(--ds-collapse-size-small-icon-size)',
      height: 'var(--ds-collapse-size-small-icon-size)',
    },
  },
  middle: {
    header: {
      paddingLeft: 'var(--ds-collapse-size-middle-header-padding-x)',
      paddingRight: 'var(--ds-collapse-size-middle-header-padding-x)',
      paddingTop: 'var(--ds-collapse-size-middle-header-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-middle-header-padding-y)',
      fontSize: 'var(--ds-collapse-size-middle-header-font-size)',
    },
    content: {
      paddingLeft: 'var(--ds-collapse-size-middle-content-padding-x)',
      paddingRight: 'var(--ds-collapse-size-middle-content-padding-x)',
      paddingTop: 'var(--ds-collapse-size-middle-content-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-middle-content-padding-y)',
    },
    icon: {
      width: 'var(--ds-collapse-size-middle-icon-size)',
      height: 'var(--ds-collapse-size-middle-icon-size)',
    },
  },
  large: {
    header: {
      paddingLeft: 'var(--ds-collapse-size-large-header-padding-x)',
      paddingRight: 'var(--ds-collapse-size-large-header-padding-x)',
      paddingTop: 'var(--ds-collapse-size-large-header-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-large-header-padding-y)',
      fontSize: 'var(--ds-collapse-size-large-header-font-size)',
    },
    content: {
      paddingLeft: 'var(--ds-collapse-size-large-content-padding-x)',
      paddingRight: 'var(--ds-collapse-size-large-content-padding-x)',
      paddingTop: 'var(--ds-collapse-size-large-content-padding-y)',
      paddingBottom: 'var(--ds-collapse-size-large-content-padding-y)',
    },
    icon: {
      width: 'var(--ds-collapse-size-large-icon-size)',
      height: 'var(--ds-collapse-size-large-icon-size)',
    },
  },
} as const;

// =============================================================================
// TRANSITION TOKENS
// =============================================================================

export const collapseTransitionTokens = {
  duration: 'var(--ds-collapse-transition-duration)',
  timing: 'var(--ds-collapse-transition-timing)',
  all: 'var(--ds-collapse-transition)',
  content: 'var(--ds-collapse-content-transition)',
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const collapseTokens = {
  root: collapseRootTokens,
  header: collapseHeaderTokens,
  content: collapseContentTokens,
  icon: collapseIconTokens,
  size: collapseSizeTokens,
  transition: collapseTransitionTokens,
  getTokens: getCollapseTokens,
  getSlotTokens: getCollapseSlotTokens,
} as const;
