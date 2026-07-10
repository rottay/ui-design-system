/**
 * @fileoverview Collapse Token Utilities - Rottay Design System
 * @description Internal helpers that generate CSS custom properties and
 * slot-level styles for the Collapse component. Runtime hooks
 * (`useCollapseTokens`) delegate to these functions so the logic is
 * testable outside of a React render cycle.
 *
 * @remarks
 * The public tokens mirror still exports Collapse token references for
 * consumers, but runtime code should read from this internal helper so the
 * public mirror remains a public API surface instead of an implementation
 * dependency.
 *
 * @module System/Hooks/Components/CollapseTokenUtils
 * @category System
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

/** Named slots within the Collapse component that receive distinct styling. */
export type CollapseSlot = 'root' | 'header' | 'content' | 'icon';

/** Visual variant of the Collapse component. */
export type CollapseVariant = 'default' | 'bordered' | 'ghost';

/**
 * Size preset controlling padding and font dimensions -- the legacy 'small' | 'middle' |
 * 'large' spelling this token generator keys its lookups by. The canonical, publicly-exported
 * Collapse size prop type is `CollapseSize` in
 * `components/primitives/layout/Collapse/Collapse.types.ts` (derived from the shared `Size`
 * union); `toLegacySize()` resolves either spelling to this one before it reaches
 * `useCollapseTokens`.
 */
export type CollapseSizeToken = 'small' | 'middle' | 'large';

/** Position of the expand/collapse icon relative to the header text. */
export type CollapseIconPosition = 'start' | 'end';

/** Options driving the collapse token generator. */
export interface CollapseTokenOptions {
  variant?: CollapseVariant;
  size?: CollapseSizeToken;
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

  // Ghost and bordered are convenience boolean props that override the
  // variant string, following the same precedence rules as the component API.
  const effectiveVariant: CollapseVariant = ghost ? 'ghost' : bordered ? 'bordered' : variant;

  // Each CSS custom property references a deeper design-token variable
  // scoped by variant and size (e.g. --ds-collapse-root-ghost-idle-bg).
  // This indirection lets the CSS token layer handle theming/tenant
  // overrides while this function only resolves which token to point at.
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

  // Each slot returns CSS properties referencing the appropriate state
  // token (idle, expanded, disabled). The cascading var() fallbacks
  // ensure graceful degradation when a state-specific token isn't defined
  // (e.g. falls back from expanded-bg to idle-bg).
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

    // Header slot: state-aware background and color with CSS var() fallback
    // chains. The expanded state takes priority over disabled because a
    // panel can be expanded AND disabled simultaneously.
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

    // Icon slot: uses transform for the expand/collapse rotation animation.
    // The transition property on the idle state enables smooth rotation
    // when expanded changes.
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
