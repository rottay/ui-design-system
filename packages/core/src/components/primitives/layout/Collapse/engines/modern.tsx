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
import React, { useState, useRef, useEffect, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../Collapse.types';
import { COLLAPSE_DEFAULTS } from '../Collapse.types';

/** Keyframes for collapse content transition */
const COLLAPSE_STYLES = `
.rottay-collapse-content{overflow:hidden;transition:max-height 0.2s ease,opacity 0.2s ease,padding 0.2s ease}
.rottay-collapse-arrow{display:inline-block;transition:transform 0.2s ease}
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

    // Measure content height for smooth max-height transition
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    useEffect(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    }, [children, isActive]);

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
          borderRadius: 'var(--ds-radius-md)',
          ...(context.bordered ? { border: '1px solid var(--ds-color-border)' } : {}),
          ...(context.ghost ? {} : { background: 'var(--ds-surface-card)' }),
          ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          ...style,
        }}
      >
        {/* Header row: icon position controlled by expandIconPosition context */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            fontWeight: 500,
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
        {/* Content area animated via max-height transition */}
        <div
          ref={contentRef}
          className="rottay-collapse-content"
          style={{
            maxHeight: isActive ? contentHeight || 9999 : 0,
            opacity: isActive ? 1 : 0,
            padding: isActive ? '0 16px 16px 16px' : '0 16px',
          }}
        >
          {children}
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
          className={className || undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
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
