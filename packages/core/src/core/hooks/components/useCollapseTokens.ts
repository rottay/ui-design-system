/**
 * @fileoverview useCollapseTokens Hook - Rottay Design System
 * @description React hook for generating Collapse component tokens based on
 * current props and context (tenant, theme, engine).
 *
 * @remarks
 * This hook is the primary way engines should obtain styling tokens:
 *
 * - **Context-aware**: Automatically merges tenant overrides
 * - **Slot-based**: Returns tokens organized by component slots
 * - **State-aware**: Handles disabled, expanded, and focus states
 * - **Size-aware**: Adjusts padding/font based on size prop
 *
 * @example Basic usage in engine component
 * ```tsx
 * function CollapseEngine(props: CollapseProps) {
 *   const { tokens, rootStyle, getSlotStyle } = useCollapseTokens(props);
 *
 *   return (
 *     <div className="ds-collapse" style={rootStyle}>
 *       <div className="ds-collapse-header" style={getSlotStyle('header')}>
 *         {props.header}
 *       </div>
 *       <div className="ds-collapse-content" style={getSlotStyle('content')}>
 *         {props.children}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link getCollapseTokens} - Underlying token generator
 * @module System/Hooks/Components/UseCollapseTokens
 * @category System
 * @package @rottay/design-system
 */

'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import {
  getCollapseTokens,
  getCollapseSlotTokens,
  type CollapseTokenOptions,
  type CollapseSlot,
} from './collapse-token-utils';

export interface UseCollapseTokensOptions extends CollapseTokenOptions {
  /** Additional className for the root element */
  className?: string;
  /** Additional inline styles for the root element */
  style?: CSSProperties;
}

export interface UseCollapseTokensResult {
  /**
   * Combined CSS custom properties to spread on the root wrapper.
   * These define all the dynamic token values for the component.
   */
  tokens: CSSProperties;

  /**
   * Pre-computed style object for the root element.
   * Combines token CSS variables with any custom styles passed in props.
   */
  rootStyle: CSSProperties;

  /**
   * Function to get style object for a specific slot.
   * @param slot - The slot name ('root' | 'header' | 'content' | 'icon')
   * @param overrides - Optional style overrides
   */
  getSlotStyle: (slot: CollapseSlot, overrides?: CSSProperties) => CSSProperties;

  /**
   * CSS class names for the component.
   * Includes base class and variant/state modifiers.
   */
  classNames: {
    root: string;
    header: string;
    content: string;
    icon: string;
  };
}

/**
 * React hook for generating Collapse component tokens.
 *
 * @param options - Token generation options
 * @returns Object containing tokens, styles, and slot helpers
 *
 * @example
 * ```tsx
 * function MyCollapse({ ghost, size, ...props }) {
 *   const { rootStyle, getSlotStyle, classNames } = useCollapseTokens({
 *     ghost,
 *     size,
 *   });
 *
 *   return (
 *     <div className={classNames.root} style={rootStyle}>
 *       <button className={classNames.header} style={getSlotStyle('header')}>
 *         Toggle
 *       </button>
 *       <div className={classNames.content} style={getSlotStyle('content')}>
 *         Content here
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCollapseTokens(
  options: UseCollapseTokensOptions = {}
): UseCollapseTokensResult {
  const {
    variant = 'default',
    size = 'middle',
    ghost = false,
    bordered = false,
    disabled = false,
    expanded = false,
    iconPosition = 'start',
    className,
    style,
  } = options;

  // Memoize token generation
  const tokens = useMemo(
    () =>
      getCollapseTokens({
        variant,
        size,
        ghost,
        bordered,
        disabled,
        expanded,
        iconPosition,
      }),
    [variant, size, ghost, bordered, disabled, expanded, iconPosition]
  );

  // Memoize root style
  const rootStyle = useMemo<CSSProperties>(
    () => ({
      ...tokens,
      ...style,
    }),
    [tokens, style]
  );

  // Memoize slot style getter
  const getSlotStyle = useMemo(
    () =>
      (slot: CollapseSlot, overrides?: CSSProperties): CSSProperties => {
        const slotTokens = getCollapseSlotTokens(slot, {
          variant,
          ghost,
          disabled,
          expanded,
        });
        return {
          ...slotTokens,
          ...overrides,
        };
      },
    [variant, ghost, disabled, expanded]
  );

  // Generate class names
  const effectiveVariant = ghost ? 'ghost' : bordered ? 'bordered' : variant;
  const classNames = useMemo(
    () => ({
      root: [
        'ds-collapse',
        `ds-collapse--${effectiveVariant}`,
        `ds-collapse--${size}`,
        disabled && 'ds-collapse--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      header: [
        'ds-collapse-header',
        expanded && 'ds-collapse-header--expanded',
        disabled && 'ds-collapse-header--disabled',
      ]
        .filter(Boolean)
        .join(' '),
      content: [
        'ds-collapse-content',
        expanded && 'ds-collapse-content--expanded',
      ]
        .filter(Boolean)
        .join(' '),
      icon: [
        'ds-collapse-icon',
        `ds-collapse-icon--${iconPosition}`,
        expanded && 'ds-collapse-icon--expanded',
        disabled && 'ds-collapse-icon--disabled',
      ]
        .filter(Boolean)
        .join(' '),
    }),
    [effectiveVariant, size, disabled, expanded, iconPosition, className]
  );

  return {
    tokens,
    rootStyle,
    getSlotStyle,
    classNames,
  };
}

export default useCollapseTokens;
