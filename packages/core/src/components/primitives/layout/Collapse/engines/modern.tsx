'use client';

/**
 * @fileoverview Collapse Modern Engine - Rottay Design System.
 * Pure inline-style implementation using React Context for shared accordion
 * state between Collapse and Panel. No DaisyUI classes -- uses DS tokens,
 * inline styles, and a <style> block for the expand/collapse transition.
 *
 * @example
 * ```tsx
 * <Collapse engine="modern" accordion>
 *   <Collapse.Panel engine="modern" header="FAQ 1" panelKey="1">
 *     Answer to FAQ 1
 *   </Collapse.Panel>
 * </Collapse>
 * ```
 *
 * @module Collapse/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../Collapse.types';
import { COLLAPSE_DEFAULTS } from '../Collapse.types';

/**
 * Collapse expand/collapse transition, expressed on `grid-template-rows`
 * (0fr -> 1fr). The previous pixel-bound-height technique required an
 * arbitrary upper bound and animated a non-linear timing curve near that
 * bound (most of the transition duration spent animating pixels the content
 * never reaches); the fr-unit track animates uniformly regardless of content
 * height and needs no bound. The `.rottay-collapse-content` element is the
 * grid row track; its `.rottay-collapse-content-inner` child needs
 * `min-height:0` because grid items default to `min-height:auto`, which
 * would keep the inner content's intrinsic height as a floor and prevent the
 * track from ever reaching 0fr.
 */
const COLLAPSE_STYLES = `
.rottay-collapse-content{display:grid;transition:grid-template-rows var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out))}
.rottay-collapse-content-inner{min-height:0;overflow:hidden;transition:opacity var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out)),padding var(--ds-collapse-transition-duration,var(--ds-motion-normal)) var(--ds-collapse-transition-timing,var(--ds-motion-ease-out))}
.rottay-collapse-arrow{display:inline-block;transition:var(--ds-collapse-icon-default-idle-transition,transform var(--ds-motion-normal) var(--ds-motion-ease-out))}
@media (prefers-reduced-motion: reduce){.rottay-collapse-content,.rottay-collapse-content-inner,.rottay-collapse-arrow{transition:none}}
`.trim();

/** Shared state between Collapse and its Panel children via React Context */
interface CollapseContextValue {
  activeKeys: string[];
  toggleKey: (key: string) => void;
  accordion: boolean;
  expandIconPosition: 'start' | 'end';
  bordered: boolean;
  ghost: boolean;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

/**
 * Modern Collapse Panel.
 *
 * Reads shared state from CollapseContext to determine active/inactive status.
 * Uses inline styles with DS tokens and a CSS transition class for smooth
 * expand/collapse animations. The `index` prop is injected by the parent
 * Collapse via `cloneElement` to generate fallback keys.
 *
 * @param props - {@link CollapsePanelProps} with an optional injected `index`.
 * @returns A styled collapsible panel, or null if rendered outside a Collapse.
 */
export const Panel = React.forwardRef<HTMLDivElement, CollapsePanelProps & { index?: number }>(
  (props, ref) => {
    const {
      panelKey,
      header,
      disabled = false,
      showArrow = true,
      extra,
      children,
      className = '',
      style,
      index = 0,
    } = props;

    // Panel requires a parent Collapse to provide context; bail if orphaned
    const context = useContext(CollapseContext);
    if (!context) return null;

    // Use explicit panelKey when provided, otherwise derive from render index
    const key = panelKey ?? `panel-${index}`;
    const isActive = context.activeKeys.includes(key);

    const handleClick = () => {
      if (!disabled) {
        context.toggleKey(key);
      }
    };

    // Arrow indicator rotates 90deg when panel is expanded
    const arrowIcon = showArrow && (
      <span
        className="rottay-collapse-arrow"
        style={{
          transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: 12,
        }}
      >
        {'\u25B6'}
      </span>
    );

    return (
      <div
        ref={ref}
        className={className || undefined}
        style={{
          borderRadius: context.ghost
            ? 'var(--ds-collapse-root-ghost-idle-border-radius, 0)'
            : 'var(--ds-collapse-root-default-idle-border-radius, var(--ds-radius-md))',
          ...(context.bordered
            ? {
                border: 'var(--ds-collapse-root-default-idle-border-width, 1px) var(--ds-collapse-root-default-idle-border-style, solid) var(--ds-collapse-root-default-idle-border-color, var(--ds-color-border))',
              }
            : {}),
          ...(context.ghost
            ? { background: 'var(--ds-collapse-root-ghost-idle-bg, transparent)' }
            : { background: 'var(--ds-collapse-root-default-idle-bg, var(--ds-surface-card))' }),
          boxShadow: context.ghost
            ? 'var(--ds-collapse-root-ghost-idle-shadow, none)'
            : 'var(--ds-collapse-root-default-idle-shadow, none)',
          ...(disabled
            ? {
                opacity: 'var(--ds-collapse-header-default-disabled-opacity, 0.5)',
                cursor: 'var(--ds-collapse-header-default-disabled-cursor, not-allowed)',
              }
            : {}),
          ...style,
        }}
      >
        {/* Header row: icon position controlled by expandIconPosition context */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: context.ghost
              ? 'var(--ds-collapse-header-ghost-idle-padding-y, 8px) var(--ds-collapse-header-ghost-idle-padding-x, 12px)'
              : 'var(--ds-collapse-header-default-idle-padding-y, 12px) var(--ds-collapse-header-default-idle-padding-x, 16px)',
            cursor: disabled ? 'var(--ds-collapse-header-default-disabled-cursor, not-allowed)' : 'var(--ds-collapse-header-default-idle-cursor, pointer)',
            userSelect: 'none',
            fontSize: 'var(--ds-collapse-header-default-idle-font-size, inherit)',
            fontWeight: 'var(--ds-collapse-header-default-idle-font-weight, 500)',
            lineHeight: 'var(--ds-collapse-header-default-idle-line-height, normal)',
            color: disabled
              ? 'var(--ds-collapse-header-default-disabled-color, var(--ds-color-text-disabled))'
              : isActive
                ? 'var(--ds-collapse-header-default-expanded-color, var(--ds-color-primary))'
                : 'var(--ds-collapse-header-default-idle-color, inherit)',
            background: disabled
              ? 'var(--ds-collapse-header-default-disabled-bg, transparent)'
              : isActive
                ? 'var(--ds-collapse-header-default-expanded-bg, transparent)'
                : context.ghost
                  ? 'var(--ds-collapse-header-ghost-idle-bg, transparent)'
                  : 'var(--ds-collapse-header-default-idle-bg, transparent)',
          }}
          onClick={handleClick}
          role="button"
          aria-expanded={isActive}
        >
          {context.expandIconPosition === 'start' && arrowIcon}
          <span style={{ flex: 1 }}>{header}</span>
          {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
          {context.expandIconPosition === 'end' && arrowIcon}
        </div>
        {/* Content area: the outer element is the grid-template-rows track
            (0fr collapsed / 1fr expanded); the inner element carries
            min-height:0 (see COLLAPSE_STYLES) plus the opacity/padding fade
            so the whole reveal reads as one motion. */}
        <div
          className="rottay-collapse-content"
          style={{
            gridTemplateRows: isActive ? '1fr' : '0fr',
          }}
        >
          <div
            className="rottay-collapse-content-inner"
            style={{
              opacity: isActive ? 1 : 0,
              color: 'var(--ds-collapse-content-default-idle-color, inherit)',
              background: context.ghost
                ? 'var(--ds-collapse-content-ghost-idle-bg, transparent)'
                : 'var(--ds-collapse-content-default-idle-bg, transparent)',
              fontSize: 'var(--ds-collapse-content-default-idle-font-size, inherit)',
              lineHeight: 'var(--ds-collapse-content-default-idle-line-height, normal)',
              padding: isActive
                ? `0 var(--ds-collapse-content-default-idle-padding-x, 16px) var(--ds-collapse-content-default-idle-padding-y, 16px) var(--ds-collapse-content-default-idle-padding-x, 16px)`
                : '0 var(--ds-collapse-content-default-idle-padding-x, 16px)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Modern';

/**
 * Modern Collapse container.
 *
 * Manages accordion state (controlled or uncontrolled) and shares it with
 * Panel children via CollapseContext. Each child is cloned with an injected
 * `index` prop so panels without an explicit `panelKey` can derive one.
 *
 * @param props - {@link CollapseProps} with accordion, bordered, ghost, and onChange.
 * @returns A flex-column container providing collapse context to child panels.
 */
export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const {
      activeKey,
      defaultActiveKey,
      accordion = COLLAPSE_DEFAULTS.accordion,
      bordered = COLLAPSE_DEFAULTS.bordered,
      ghost = false,
      expandIconPosition = COLLAPSE_DEFAULTS.expandIconPosition,
      onChange,
      children,
      className = '',
      style,
    } = props;

    // Normalize single string keys to arrays for uniform handling
    const normalizeKeys = (keys: string | string[] | undefined): string[] => {
      if (!keys) return [];
      return Array.isArray(keys) ? keys : [keys];
    };

    // Internal state for uncontrolled mode; ignored when activeKey is provided
    const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
      normalizeKeys(defaultActiveKey)
    );

    // Controlled mode: use prop value; uncontrolled: use internal state
    const activeKeys = activeKey !== undefined ? normalizeKeys(activeKey) : internalActiveKeys;

    const toggleKey = (key: string) => {
      let newKeys: string[];

      // In accordion mode only one panel can be open at a time
      if (accordion) {
        newKeys = activeKeys.includes(key) ? [] : [key];
      } else {
        newKeys = activeKeys.includes(key)
          ? activeKeys.filter((k) => k !== key)
          : [...activeKeys, key];
      }

      // Only update internal state in uncontrolled mode
      if (activeKey === undefined) {
        setInternalActiveKeys(newKeys);
      }
      // Accordion mode reports a single string; multi mode reports an array
      onChange?.(accordion ? newKeys[0] ?? '' : newKeys);
    };

    const childArray = Children.toArray(children);

    return (
      <CollapseContext.Provider
        value={{ activeKeys, toggleKey, accordion, expandIconPosition, bordered, ghost }}
      >
        {/* Inject transition styles -- safe static string */}
        <style dangerouslySetInnerHTML={{ __html: COLLAPSE_STYLES }} />
        <div
          ref={ref}
          className={`rottay-collapse${ghost ? ' rottay-collapse--ghost' : ''}${!bordered ? ' rottay-collapse--borderless' : ''} ${className}`.trim() || undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-1, 4px)',
            ...style,
          }}
        >
          {/* Inject index into each Panel child for fallback key generation */}
          {childArray.map((child, index) =>
            isValidElement(child)
              ? cloneElement(child as React.ReactElement<CollapsePanelProps & { index?: number }>, { index })
              : child
          )}
        </div>
      </CollapseContext.Provider>
    );
  }
);
Collapse.displayName = 'Collapse.Modern';

export default Collapse;
