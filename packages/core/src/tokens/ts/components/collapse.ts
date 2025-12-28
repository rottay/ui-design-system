/**
 * Collapse Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Collapse CSS custom properties.
 * Provides type-safe token access and hook-based token generation.
 *
 * Architecture:
 * - Slot-based structure (root, header, content, icon)
 * - Variant support (default, bordered, ghost)
 * - State-aware (idle, hover, focus, active, disabled, expanded)
 *
 * Naming Convention: --ds-collapse-{slot}-{variant}-{state}-{property}
 */

import type { CSSProperties } from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type CollapseSlot = 'root' | 'header' | 'content' | 'icon';
export type CollapseVariant = 'default' | 'bordered' | 'ghost';
export type CollapseState = 'idle' | 'hover' | 'focus' | 'active' | 'disabled' | 'expanded';
export type CollapseSize = 'small' | 'middle' | 'large';
export type CollapseIconPosition = 'start' | 'end';

export interface CollapseTokenOptions {
  variant?: CollapseVariant;
  size?: CollapseSize;
  ghost?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  iconPosition?: CollapseIconPosition;
}

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
// TOKEN GENERATOR FUNCTION
// =============================================================================

/**
 * Generates CSS custom properties for a Collapse component based on options.
 * This is the main function components use to get their styling tokens.
 *
 * @param options - Configuration options for the Collapse component
 * @returns CSS properties object to spread on the wrapper element
 *
 * @example
 * ```tsx
 * const style = getCollapseTokens({ variant: 'bordered', size: 'large' });
 * return <div className="ds-collapse" style={style}>...</div>;
 * ```
 */
export function getCollapseTokens(options: CollapseTokenOptions = {}): CSSProperties {
  const {
    variant = 'default',
    size = 'middle',
    ghost = false,
    bordered = false,
    disabled = false,
    expanded = false,
    iconPosition = 'start',
  } = options;

  // Determine the effective variant
  const effectiveVariant: CollapseVariant = ghost ? 'ghost' : bordered ? 'bordered' : variant;

  // Build CSS custom property overrides
  const tokens: Record<string, string> = {
    // Active variant indicator (for CSS selectors)
    '--ds-collapse-variant': effectiveVariant,
    '--ds-collapse-size': size,
    '--ds-collapse-icon-position': iconPosition,
    '--ds-collapse-disabled': disabled ? '1' : '0',
    '--ds-collapse-expanded': expanded ? '1' : '0',

    // Computed tokens based on current state
    '--ds-collapse-root-bg': `var(--ds-collapse-root-${effectiveVariant}-idle-bg)`,
    '--ds-collapse-root-border-color': `var(--ds-collapse-root-${effectiveVariant}-idle-border-color)`,
    '--ds-collapse-root-border-width': `var(--ds-collapse-root-${effectiveVariant}-idle-border-width)`,
    '--ds-collapse-root-border-radius': `var(--ds-collapse-root-${effectiveVariant}-idle-border-radius)`,
    '--ds-collapse-root-shadow': `var(--ds-collapse-root-${effectiveVariant}-idle-shadow)`,

    // Header computed tokens
    '--ds-collapse-header-padding-x': `var(--ds-collapse-size-${size}-header-padding-x)`,
    '--ds-collapse-header-padding-y': `var(--ds-collapse-size-${size}-header-padding-y)`,
    '--ds-collapse-header-font-size': `var(--ds-collapse-size-${size}-header-font-size)`,

    // Content computed tokens
    '--ds-collapse-content-padding-x': `var(--ds-collapse-size-${size}-content-padding-x)`,
    '--ds-collapse-content-padding-y': `var(--ds-collapse-size-${size}-content-padding-y)`,

    // Icon computed tokens
    '--ds-collapse-icon-size': `var(--ds-collapse-size-${size}-icon-size)`,
  };

  return tokens as CSSProperties;
}

/**
 * Gets tokens for a specific slot within the Collapse component.
 *
 * @param slot - The slot to get tokens for
 * @param options - Configuration options
 * @returns CSS properties for the specified slot
 */
export function getCollapseSlotTokens(
  slot: CollapseSlot,
  options: CollapseTokenOptions = {}
): CSSProperties {
  const { variant = 'default', ghost = false, disabled = false, expanded = false } = options;
  const effectiveVariant = ghost ? 'ghost' : variant;

  switch (slot) {
    case 'root':
      return {
        background: `var(--ds-collapse-root-${effectiveVariant}-idle-bg)`,
        borderColor: `var(--ds-collapse-root-${effectiveVariant}-idle-border-color)`,
        borderWidth: `var(--ds-collapse-root-${effectiveVariant}-idle-border-width)`,
        borderStyle: `var(--ds-collapse-root-${effectiveVariant}-idle-border-style)`,
        borderRadius: `var(--ds-collapse-root-${effectiveVariant}-idle-border-radius)`,
        boxShadow: `var(--ds-collapse-root-${effectiveVariant}-idle-shadow)`,
      };

    case 'header':
      return {
        background: expanded
          ? `var(--ds-collapse-header-${effectiveVariant}-expanded-bg, var(--ds-collapse-header-${effectiveVariant}-idle-bg))`
          : disabled
            ? `var(--ds-collapse-header-${effectiveVariant}-disabled-bg, var(--ds-collapse-header-${effectiveVariant}-idle-bg))`
            : `var(--ds-collapse-header-${effectiveVariant}-idle-bg)`,
        color: expanded
          ? `var(--ds-collapse-header-${effectiveVariant}-expanded-color, var(--ds-collapse-header-${effectiveVariant}-idle-color))`
          : disabled
            ? `var(--ds-collapse-header-${effectiveVariant}-disabled-color, var(--ds-collapse-header-${effectiveVariant}-idle-color))`
            : `var(--ds-collapse-header-${effectiveVariant}-idle-color)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? `var(--ds-collapse-header-${effectiveVariant}-disabled-opacity, 0.6)` : undefined,
        paddingLeft: 'var(--ds-collapse-header-padding-x)',
        paddingRight: 'var(--ds-collapse-header-padding-x)',
        paddingTop: 'var(--ds-collapse-header-padding-y)',
        paddingBottom: 'var(--ds-collapse-header-padding-y)',
        fontSize: 'var(--ds-collapse-header-font-size)',
      };

    case 'content':
      return {
        background: `var(--ds-collapse-content-${effectiveVariant}-idle-bg)`,
        color: `var(--ds-collapse-content-${effectiveVariant}-idle-color)`,
        paddingLeft: 'var(--ds-collapse-content-padding-x)',
        paddingRight: 'var(--ds-collapse-content-padding-x)',
        paddingTop: 'var(--ds-collapse-content-padding-y)',
        paddingBottom: 'var(--ds-collapse-content-padding-y)',
      };

    case 'icon':
      return {
        width: 'var(--ds-collapse-icon-size)',
        height: 'var(--ds-collapse-icon-size)',
        color: expanded
          ? 'var(--ds-collapse-icon-default-expanded-color)'
          : disabled
            ? 'var(--ds-collapse-icon-default-disabled-color)'
            : 'var(--ds-collapse-icon-default-idle-color)',
        transform: expanded
          ? 'var(--ds-collapse-icon-default-expanded-transform)'
          : 'var(--ds-collapse-icon-default-idle-transform)',
        transition: 'var(--ds-collapse-icon-default-idle-transition)',
      };

    default:
      return {};
  }
}

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
