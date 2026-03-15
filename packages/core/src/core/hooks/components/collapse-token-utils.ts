import type { CSSProperties } from 'react';

/**
 * Internal collapse token helpers used by runtime hooks.
 *
 * The public tokens mirror still exports Collapse token references for
 * consumers, but runtime code should read from this internal helper so the
 * public mirror remains a public API surface instead of an implementation
 * dependency.
 */

export type CollapseSlot = 'root' | 'header' | 'content' | 'icon';
export type CollapseVariant = 'default' | 'bordered' | 'ghost';
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

/**
 * Generates the CSS custom properties that drive the collapse runtime.
 *
 * These variables act as the small computed layer between generic props and the
 * large CSS token matrix defined in `tokens/css/components/collapse.css`.
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

  const effectiveVariant: CollapseVariant = ghost ? 'ghost' : bordered ? 'bordered' : variant;

  return {
    '--ds-collapse-variant': effectiveVariant,
    '--ds-collapse-size': size,
    '--ds-collapse-icon-position': iconPosition,
    '--ds-collapse-disabled': disabled ? '1' : '0',
    '--ds-collapse-expanded': expanded ? '1' : '0',
    '--ds-collapse-root-bg': `var(--ds-collapse-root-${effectiveVariant}-idle-bg)`,
    '--ds-collapse-root-border-color': `var(--ds-collapse-root-${effectiveVariant}-idle-border-color)`,
    '--ds-collapse-root-border-width': `var(--ds-collapse-root-${effectiveVariant}-idle-border-width)`,
    '--ds-collapse-root-border-radius': `var(--ds-collapse-root-${effectiveVariant}-idle-border-radius)`,
    '--ds-collapse-root-shadow': `var(--ds-collapse-root-${effectiveVariant}-idle-shadow)`,
    '--ds-collapse-header-padding-x': `var(--ds-collapse-size-${size}-header-padding-x)`,
    '--ds-collapse-header-padding-y': `var(--ds-collapse-size-${size}-header-padding-y)`,
    '--ds-collapse-header-font-size': `var(--ds-collapse-size-${size}-header-font-size)`,
    '--ds-collapse-content-padding-x': `var(--ds-collapse-size-${size}-content-padding-x)`,
    '--ds-collapse-content-padding-y': `var(--ds-collapse-size-${size}-content-padding-y)`,
    '--ds-collapse-icon-size': `var(--ds-collapse-size-${size}-icon-size)`,
  } as CSSProperties;
}

/**
 * Resolves slot-level styles from the computed collapse state.
 *
 * Keeping this logic in one place makes the engines and hooks share the same
 * semantics for disabled/expanded states instead of hand-rolling styles.
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
